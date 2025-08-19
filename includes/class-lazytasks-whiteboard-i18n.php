<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://laycoders.co
 * @since      1.0.0
 *
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/includes
 * @author     Lazycoders <info@lazycoders.co>
 */
class Lazytasks_Whiteboard_i18n {


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		load_plugin_textdomain(
			'lazytasks-whiteboard',
			false,
			dirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
		);

	}



}
