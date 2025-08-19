<?php

namespace LazytasksWhiteboard\Routes;

use LazytasksWhiteboard\Controller\Lazytasks_Whiteboard_Default_Controller;
use LazytasksWhiteboard\Controller\Lazytasks_Whiteboard_Controller;
use WP_REST_Server;

class Lazytasks_Whiteboard_Api {

	const WHITEBOARD_ROUTE_NAMESPACE = 'lazytasks/api/v1';
	public function admin_routes(){
		register_rest_route(
			self::WHITEBOARD_ROUTE_NAMESPACE,
			'/premium/qr-code',
			array(
				'method' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytasks_Whiteboard_Default_Controller(), 'getQRCode'),
				'permission_callback' => '__return_true',
				'args' => array()
			)
		);

		register_rest_route(
			self::WHITEBOARD_ROUTE_NAMESPACE,
			'/whiteboard/projects/whiteboard/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'getWhiteboardContentByProjectId'),
				'permission_callback' => '__return_true',
				// 'permission_callback' => function($request) {
				// 	$userController = new Lazytask_UserController();
				// 	return $userController->permission_check($request, ['create-project']);
				// },
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::WHITEBOARD_ROUTE_NAMESPACE,
			'/whiteboard/projects/whiteboard/edit/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'updateWhiteboardContentByProjectId'),
				// 'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);
		
		register_rest_route(
			self::WHITEBOARD_ROUTE_NAMESPACE,
			'/whiteboard/projects/whiteboard/comment/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'addWhiteboardComment'),
				// 'permission_callback' => array(new UserController(), 'permission_check'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);

		register_rest_route(
			self::WHITEBOARD_ROUTE_NAMESPACE,
			'/whiteboard/projects/whiteboard/comments/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'getwhiteboardComments'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);
		
		register_rest_route(
			self::WHITEBOARD_ROUTE_NAMESPACE,
			'/whiteboard/projects/whiteboard/delete/comments/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'deleteWhiteboardComment'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);
		
		register_rest_route(
			self::WHITEBOARD_ROUTE_NAMESPACE,
			'/whiteboard/projects/whiteboard/edit/comments/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'editWhiteboardComment'),
				'permission_callback' => '__return_true',
				'args' => array(
					'id' => array(
						'required' => true,
						'validate_callback' => function($param, $request, $key){
							return $param;
						}
					)
				)
			)
		);
	}

}