<?php

namespace LazytasksWhiteboard\Controller;

use WP_REST_Request;
use WP_REST_Response;

class Lazytasks_Whiteboard_Controller {
    public function getWhiteboardContentByProjectId(WP_REST_Request $request)
	{
		global $wpdb;
		$projectId = $request->get_param('id');

		if (!$projectId) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project ID is required', 'data' => null], 200);
		}

		$projectsTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$whiteboardTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'boards';

		// Check if project exists
		$projectExists = $wpdb->get_var($wpdb->prepare(
			"SELECT COUNT(*) FROM {$projectsTable} WHERE id = %d AND deleted_at IS NULL",
			$projectId
		));

		if (!$projectExists) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project not found', 'data' => null], 200);
		}

		$whiteboardContent = $wpdb->get_row($wpdb->prepare(
			"SELECT data FROM {$whiteboardTable} WHERE project_id = %d",
			$projectId
		), ARRAY_A);

		if ($whiteboardContent && isset($whiteboardContent['data'])) {
			$whiteboardContent['data'] = json_decode($whiteboardContent['data'], true);
			return new WP_REST_Response(['status' => 200, 'message' => 'Whiteboard content retrieved successfully', 'data' => $whiteboardContent['data']], 200);
		}

		$wpdb->insert($whiteboardTable, [
			'project_id' => $projectId,
			'created_by' => get_current_user_id(),
			'data' => json_encode([]),
			'created_at' => current_time('mysql'),
			'updated_at' => current_time('mysql'),
			'deleted_at' => null
		]);

		return new WP_REST_Response(['status' => 404, 'message' => 'No whiteboard content found for this project', 'data' => null], 200);
	}

	public function updateWhiteboardContentByProjectId(WP_REST_Request $request)
	{
		global $wpdb;
		$whiteboardTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'boards';
		$projectsTable = LAZYTASK_TABLE_PREFIX . 'projects';
		$projectId = $request->get_param('id');

		if (!$projectId) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project ID is required', 'data' => null], 200);
		}

		// Check if project exists
		$projectExists = $wpdb->get_var($wpdb->prepare(
			"SELECT COUNT(*) FROM {$projectsTable} WHERE id = %d AND deleted_at IS NULL",
			$projectId
		));

		if (!$projectExists) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project not found', 'data' => null], 200);
		}
		
		$requestData = $request->get_json_params();
		$data = isset($requestData) ? json_encode($requestData) : null;
		
		$exists = $wpdb->get_var($wpdb->prepare(
			"SELECT COUNT(*) FROM {$whiteboardTable} WHERE project_id = %d",
			$projectId
		));

		if ($exists) {
			$wpdb->update(
				$whiteboardTable,
				['data' => $data],
				['project_id' => $projectId]
			);
		} else {
			$wpdb->insert(
				$whiteboardTable,
				[
					'project_id' => $projectId,
					'data' => $data,
				]
			);
		}

		$whiteboardContent = $wpdb->get_row($wpdb->prepare(
			"SELECT data FROM {$whiteboardTable} WHERE project_id = %d",
			$projectId
		), ARRAY_A);

		if ($whiteboardContent && isset($whiteboardContent['data'])) {
			$whiteboardContent['data'] = json_decode($whiteboardContent['data'], true);
			return new WP_REST_Response(['status' => 200, 'message' => 'Whiteboard content saved successfully', 'data' => $whiteboardContent['data']], 200);
		}
		return new WP_REST_Response(['status' => 500, 'message' => 'Failed to update whiteboard content', 'data' => null], 500);

	}

	public static function getUserAvatar($userId){
		$user = get_userdata( $userId );
		$profile_photo_id = get_user_meta($userId, 'profile_photo_id', true);
		if($profile_photo_id){
			$attachment = wp_get_attachment_image_src($profile_photo_id, 'thumbnail');
			if($attachment){
				return $attachment[0];
			}
		}

		/*if($user){
			return get_avatar_url($user->ID);
		}*/
		return '';

	}

	private function getFormattedWhiteboardComments($projectId, $whiteboardCommentsTable) 
	{
		global $wpdb;
		$data = $wpdb->get_results($wpdb->prepare(
			"SELECT * FROM {$whiteboardCommentsTable} WHERE deleted_at IS NULL AND project_id = %d ORDER BY created_at ASC",
			$projectId
		), ARRAY_A);

		if (!$data) {
			return null;
		}

		// Add user info
		foreach ($data as &$item) {
			$user = get_userdata($item['created_by']);
			$item['user_name'] = $user ? $user->display_name : 'Unknown User';
			$item['timestamp'] = date('Y-m-d H:i:s', strtotime($item['created_at']));
			$item['avatar'] = self::getUserAvatar($item['created_by']);
			$item['time_duration'] = human_time_diff(strtotime($item['created_at']), current_time('timestamp'));
			$item['children'] = [];
		}
		unset($item);

		// Build a map of id => comment
		$map = [];
		foreach ($data as &$item) {
			$map[$item['id']] = &$item;
		}
		unset($item);

		// Build the tree
		$tree = [];
		foreach ($data as &$item) {
			if (!empty($item['parent_id']) && isset($map[$item['parent_id']])) {
				$map[$item['parent_id']]['children'][] = &$item;
			} else {
				$tree[] = &$item;
			}
		}
		unset($item);

		return $tree;
	}

	public function addWhiteboardComment(WP_REST_Request $request)
	{
		global $wpdb;
		$whiteboardTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'boards';
		$whiteboardCommentsTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'comments';
		$projectId = $request->get_param('id');

		if (!$projectId) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project ID is required', 'data' => null], 200);
		}

		$requestData = $request->get_json_params();
		$comment = isset($requestData['comment']) ? sanitize_text_field($requestData['comment']) : null;
		$comments_coordinates = isset($requestData['comments_coordinates']) ? $requestData['comments_coordinates'] : null;
		$created_by = isset($requestData['created_by']) ? (int)$requestData['created_by'] : null;
		$parentId = isset($requestData['parent_id']) ? (int)$requestData['parent_id'] : null;
		$created_at = current_time('mysql');
		$updated_at = current_time('mysql');

		if (!$comment || !$created_by) {
			return new WP_REST_Response(['status' => 400, 'message' => 'Comment and user ID are required', 'data' => null], 200);
		}

		// Insert comment into the whiteboard data
		$whiteboardContent = $wpdb->get_row($wpdb->prepare(
			"SELECT id FROM {$whiteboardTable} WHERE project_id = %d",
			$projectId
		), ARRAY_A);

		if ($whiteboardContent) {

			$commentData = [
				'parent_id' => $parentId,
				'project_id' => $projectId,
				'whiteboard_id' => $whiteboardContent['id'],
				'created_by' => $created_by,
				'comments_coordinates' => json_encode($comments_coordinates),
				'comment' => $comment,
				'created_at' => $created_at,
				'updated_at' => $updated_at,
			];

			$wpdb->insert($whiteboardCommentsTable, $commentData);
			$commentId = $wpdb->insert_id;

			if (!$commentId) {
				return new WP_REST_Response(['status' => 500, 'message' => 'Failed to add comment', 'data' => null], 500);
			}

			// Fetch updated comments
			$tree = $this->getFormattedWhiteboardComments($projectId, $whiteboardCommentsTable);
			if ($tree !== null) {
				return new WP_REST_Response(['status' => 200, 'message' => 'Comments added successfully', 'data' => $tree], 200);
			}
			return new WP_REST_Response(['status' => 404, 'message' => 'No whiteboard content found for this project', 'data' => null], 200);
		}

		return new WP_REST_Response(['status' => 404, 'message' => 'No whiteboard content found for this project', 'data' => null], 200);

	}

	public function getwhiteboardComments(WP_REST_Request $request)
	{
		global $wpdb;
		$whiteboardTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'boards';
		$whiteboardCommentsTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'comments';
		$projectId = $request->get_param('id');

		if (!$projectId) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project ID is required', 'data' => null], 200);
		}

		$tree = $this->getFormattedWhiteboardComments($projectId, $whiteboardCommentsTable);
		if ($tree !== null) {
			return new WP_REST_Response(['status' => 200, 'message' => 'Comments retrieved successfully', 'data' => $tree], 200);
		}
		return new WP_REST_Response(['status' => 404, 'message' => 'No comments found for this project', 'data' => null], 200);
	}

	public function deleteWhiteboardComment(WP_REST_Request $request)
	{
		global $wpdb;
		$whiteboardCommentsTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'comments';
		$projectId = $request->get_param('id');

		if (!$projectId) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project ID is required', 'data' => null], 200);
		}

		$requestData = $request->get_json_params();
		$commentId = isset($requestData['comment_id']) ? (int)$requestData['comment_id'] : null;
		$deletedBy = isset($requestData['deleted_by']) ? (int)$requestData['deleted_by'] : null;
		$type = isset($requestData['type']) ? $requestData['type'] : null;
		
		if (!$commentId) {
			return new WP_REST_Response(['status' => 400, 'message' => 'Comment ID required', 'data' => null], 200);
		}

		if($type === 'comment'){
			$childComments = $wpdb->get_results($wpdb->prepare(
				"SELECT id FROM {$whiteboardCommentsTable} WHERE parent_id = %d AND project_id = %d",
				$commentId,
				$projectId
			), ARRAY_A);
	
			foreach ($childComments as $child) {
				// Soft delete child comments
				$wpdb->update(
					$whiteboardCommentsTable,
					[
						'deleted_at' => current_time('mysql'),
					],
					['id' => $child['id']]
				);
			}
		}

		$deleted = $wpdb->update(
			$whiteboardCommentsTable,
			[
				'deleted_at' => current_time('mysql'),
			],
			['id' => $commentId]
		);

		$tree = $this->getFormattedWhiteboardComments($projectId, $whiteboardCommentsTable);
		if ($tree !== null) {
			return new WP_REST_Response(['status' => 200, 'message' => 'Comments deleted successfully', 'data' => $tree], 200);
		}
		return new WP_REST_Response(['status' => 404, 'message' => 'Comment not found', 'data' => null], 200);
	}

	public function editWhiteboardComment(WP_REST_Request $request)
	{
		global $wpdb;
		$whiteboardCommentsTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'comments';
		$projectId = $request->get_param('id');

		if (!$projectId) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project ID is required', 'data' => null], 200);
		}

		$requestData = $request->get_json_params();
		$commentId = isset($requestData['comment_id']) ? (int)$requestData['comment_id'] : null;
		$updatedBy = isset($requestData['updated_by']) ? (int)$requestData['updated_by'] : null;
		$type = isset($requestData['type']) ? $requestData['type'] : null;
		$comment = isset($requestData['comment']) ? sanitize_text_field($requestData['comment']) : null;
		$comments_coordinates = isset($requestData['comments_coordinates']) ? $requestData['comments_coordinates'] : null;

		if (!$commentId || !$updatedBy) {
			return new WP_REST_Response(['status' => 400, 'message' => 'Comment ID, updated by and comment text are required', 'data' => null], 200);
		}

		// Build update data only with non-null values
		$updateData = [
			'updated_at' => current_time('mysql'),
		];
		if ($comment !== null) {
			$updateData['comment'] = $comment;
		}
		if ($comments_coordinates !== null) {
			$updateData['comments_coordinates'] = json_encode($comments_coordinates);
		}

		if (count($updateData) === 1) { // Only updated_at present, nothing to update
			return new WP_REST_Response(['status' => 400, 'message' => 'Nothing to update', 'data' => null], 200);
		}

		$updated = $wpdb->update(
			$whiteboardCommentsTable,
			$updateData,
			['id' => $commentId]
		);

		$tree = $this->getFormattedWhiteboardComments($projectId, $whiteboardCommentsTable);
		if ($tree !== null) {
			return new WP_REST_Response(['status' => 200, 'message' => 'Comments updated/deleted successfully', 'data' => $tree], 200);
		}
		return new WP_REST_Response(['status' => 404, 'message' => 'Comment not found', 'data' => null], 200);
		
	}

	public static function deleteWhiteboardAllComment(WP_REST_Request $request)
	{
		global $wpdb;
		$whiteboardCommentsTable = LAZYTASKS_WHITEBOARD_TABLE_PREFIX . 'comments';
		$projectId = $request->get_param('id');

		if (!$projectId) {
			return new WP_REST_Response(['status' => 404, 'message' => 'Project ID is required', 'data' => null], 200);
		}

		$requestData = $request->get_json_params();
		$deletedBy = isset($requestData['deleted_by']) ? (int)$requestData['deleted_by'] : null;

		$deleted = $wpdb->update(
			$whiteboardCommentsTable,
			[
				'deleted_at' => current_time('mysql'),
			],
			['project_id' => $projectId]
		);

		if ($deleted !== false) {
			return new WP_REST_Response(['status' => 200, 'message' => 'All comments deleted successfully', 'data' => null], 200);
		}
		return new WP_REST_Response(['status' => 500, 'message' => 'Failed to delete comments', 'data' => null], 500);
		
	}

}