<?php

/**
 * Fired during plugin deactivation
 *
 * @link       https://laycoders.co
 * @since      1.0.0
 *
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/includes
 */

/**
 * Fired during plugin deactivation.
 *
 * This class defines all code necessary to run during the plugin's deactivation.
 *
 * @since      1.0.0
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/includes
 * @author     Lazycoders <info@lazycoders.co>
 */
class Lazytasks_Whiteboard_Deactivator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function deactivate() {
		// Remove the installed option
		delete_option('lazytasks_whiteboard_installed');
		delete_option('lazytasks_whiteboard_version');
	}

}
