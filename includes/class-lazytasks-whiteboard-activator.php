<?php

/**
 * Fired during plugin activation
 *
 * @link       https://laycoders.co
 * @since      1.0.0
 *
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/includes
 * @author     Lazycoders <info@lazycoders.co>
 */
class Lazytasks_Whiteboard_Activator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {

		$installed = get_option('lazytasks_whiteboard_installed');

		if ($installed) return;

		\LazytasksWhiteboard\Helper\Lazytasks_whiteboard_DatabaseTableSchema::run();

		if( !defined('LAZYTASKS_WHITEBOARD_DB_VERSION') || get_option('lazytasks_whiteboard_db_version')==='' || version_compare(get_option('lazytasks_whiteboard_db_version'), LAZYTASKS_WHITEBOARD_DB_VERSION, '<') ) {
			update_option('lazytasks_whiteboard_db_version', LAZYTASKS_WHITEBOARD_DB_VERSION, 'no');
			\LazytasksWhiteboard\Helper\Lazytasks_Whiteboard_DBMigrator::run();
		}

		add_option('lazytasks_whiteboard_installed', true);
	}

}
