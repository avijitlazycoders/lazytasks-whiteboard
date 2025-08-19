<?php

namespace LazytasksWhiteboard\Controller;

use WP_REST_Request;
use WP_REST_Response;

class Lazytasks_Whiteboard_Default_Controller {

	// public function getQRCode( WP_REST_Request $request ) {

	// 	// headers check
	// 	$token = $request->get_header('Authorization');
	// 	$token = str_replace('Bearer ', '', $token);
	// 	$token = str_replace('bearer ', '', $token);
	// 	$token = str_replace('Token ', '', $token);
	// 	$token = str_replace('token ', '', $token);

	// 	// decode token
	// 	$userController = new Lazytask_UserController();
	// 	$decodedToken = $userController->decode($token);
	// 	if($decodedToken && isset($decodedToken['status']) && $decodedToken['status'] == 403 && isset($decodedToken['message']) && $decodedToken['message'] == 'Expired token'){
	// 		return new WP_REST_Response(['code'=> 'jwt_auth_invalid_token', 'status'=>403, 'message'=>$decodedToken['message'], 'data'=>$decodedToken], 403);
	// 	}

	// 	$qrCodeImage = get_option('lazytask_premium_qr_code', '');
	// 	if($qrCodeImage) {
	// 		return new WP_REST_Response( [ 'status' => 200, 'data' => [ 'path' => $qrCodeImage ] ], 200 );
	// 	}
	// 	return new WP_REST_Response( [ 'status' => 404, 'data' => '' ], 200 );
	// }

}