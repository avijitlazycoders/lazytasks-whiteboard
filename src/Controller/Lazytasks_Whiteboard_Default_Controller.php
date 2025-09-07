<?php

namespace LazytasksWhiteboard\Controller;

use WP_REST_Request;
use WP_REST_Response;
use Exception;
use WP_Error;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

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


	// Function to generate JWT token
	public function validate_token( WP_REST_Request $request, $permissions=[] ) {

		$auth_header = $request->get_header( 'Authorization' );

		if ( ! $auth_header ) {
			return new WP_Error(
				'jwt_auth_no_auth_header',
				'Authorization header not found.',
				[
					'status' => 403,
				]
			);
		}

		/*
		 * Extract the authorization header
		 */
		[ $token ] = sscanf( $auth_header, 'Bearer %s' );

		/**
		 * if the format is not valid return an error.
		 */
		if ( ! $token ) {
			return new WP_Error(
				'jwt_auth_bad_auth_header',
				'Authorization header is required.',
				[
					'status' => 403,
				]
			);
		}

		/** Get the Secret Key */
		$secret_key = defined( 'LAZYTASK_JWT_SECRET_KEY' ) ? LAZYTASK_JWT_SECRET_KEY : false;
		if ( ! $secret_key ) {
			return new WP_Error(
				'jwt_auth_bad_config',
				'JWT is not configured properly, please contact the administration',
				[
					'status' => 403,
				]
			);
		}

		/** Try to decode the token */
		try {

			$token = JWT::decode( $token, new Key( LAZYTASK_JWT_SECRET_KEY, 'HS256' ) );

			/** The Token is decoded now validate the iss */
			if ( $token->iss !== get_bloginfo( 'url' ) ) {
				/** The iss do not match, return error */
				return new WP_Error(
					'jwt_auth_bad_iss',
					'The iss do not match with this server',
					[
						'status' => 403,
					]
				);
			}

			/** So far so good, validate the user id in the token */
			if ( ! isset( $token->data->user_id ) ) {
				/** No user id in the token, abort!! */
				return new WP_Error(
					'jwt_auth_bad_request',
					'User ID not found in the token',
					[
						'status' => 403,
					]
				);
			}

			if(sizeof($permissions)>0){
				$llc_permissions = $token->data->llc_permissions;
				$intersect = array_intersect($llc_permissions, $permissions);
				if(sizeof($intersect)==0){
					return new WP_Error(
						'jwt_auth_bad_request',
						'You do not have permission to access this resource',
						[
							'status' => 403,

						]
					);
				}
			}

			// check token expiration
			if (time() > $token->exp) {
				return new WP_Error(
					'jwt_auth_bad_request',
					'Token has expired',
					[
						'status' => 408,
					]
				);
			}


			/** This is for the /toke/validate endpoint*/
			return [
				'code' => 'jwt_auth_valid_token',
				'status' => 200,
				'data' => [
					'token' => $token,
					'status' => 200,
				],
			];
		} catch ( Exception $e ) {
			/** Something were wrong trying to decode the token, send back the error */
			return new WP_Error(
				'jwt_auth_invalid_token',
				$e->getMessage(),
				[
					'status' => 403,
				]
			);
		}
	}

	public function permission_check(WP_REST_Request $request, $permissions=[])
	{

		$response = $this->validate_token($request, $permissions);
		// var_dump($response);die;
		if (is_wp_error($response)) {
			return $response;
		}
		return true;
	}

}