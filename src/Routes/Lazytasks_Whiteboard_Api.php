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
			'/whiteboard/projects/whiteboard/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::READABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'getWhiteboardContentByProjectId'),
				'permission_callback' => '__return_true',
				'permission_callback' => function($request) {
					$userController = new Lazytasks_Whiteboard_Default_Controller();
					return $userController->permission_check($request, ['whiteboard-access']);
				},
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
				'permission_callback' => function($request) {
					$userController = new Lazytasks_Whiteboard_Default_Controller();
					return $userController->permission_check($request, ['whiteboard-manage']);
				},
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
				'permission_callback' => function($request) {
					$userController = new Lazytasks_Whiteboard_Default_Controller();
					return $userController->permission_check($request, ['whiteboard-comments']);
				},
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
				'permission_callback' => function($request) {
					$userController = new Lazytasks_Whiteboard_Default_Controller();
					return $userController->permission_check($request, ['whiteboard-access']);
				},
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
				'permission_callback' => function($request) {
					$userController = new Lazytasks_Whiteboard_Default_Controller();
					return $userController->permission_check($request, ['whiteboard-comments']);
				},
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
			'/whiteboard/projects/whiteboard/delete/all/comments/(?P<id>\d+)',
			array(
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => array(new Lazytasks_Whiteboard_Controller(), 'deleteWhiteboardAllComment'),
				'permission_callback' => function($request) {
					$userController = new Lazytasks_Whiteboard_Default_Controller();
					return $userController->permission_check($request, ['whiteboard-manage']);
				},
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
				'permission_callback' => function($request) {
					$userController = new Lazytasks_Whiteboard_Default_Controller();
					return $userController->permission_check($request, ['whiteboard-comments']);
				},
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