<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://laycoders.co
 * @since             1.0.0
 * @package           Lazytasks_Whiteboard
 *
 * @wordpress-plugin
 * Plugin Name:       Lazytasks Whiteboard
 * Plugin URI:        https://laycoders.co
 * Description:       Addon for LazyTasks FREE Plugin.
 * Version:           1.0.0
 * Author:            Lazycoders
 * Author URI:        https://laycoders.co/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       lazytasks-whiteboard
 * Domain Path:       /languages
 * Requires Plugins:  lazytasks-project-task-management
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'LAZYTASKS_WHITEBOARD_VERSION', '1.0.0' );
define( 'LAZYTASKS_WHITEBOARD_DB_VERSION', '1.0.0' );

global $wpdb;
define( 'LAZYTASKS_WHITEBOARD_TABLE_PREFIX', $wpdb->prefix .'pms_whiteboard_' );

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-lazytasks-whiteboard-activator.php
 */
function activate_lazytasks_whiteboard() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-lazytasks-whiteboard-activator.php';
	Lazytasks_Whiteboard_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-lazytasks-whiteboard-deactivator.php
 */
function deactivate_lazytasks_whiteboard() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-lazytasks-whiteboard-deactivator.php';
	Lazytasks_Whiteboard_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_lazytasks_whiteboard' );
register_deactivation_hook( __FILE__, 'deactivate_lazytasks_whiteboard' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-lazytasks-whiteboard.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_lazytasks_whiteboard() {

	$plugin = new Lazytasks_Whiteboard();
	$plugin->run();

}
run_lazytasks_whiteboard();

require_once "vendor/autoload.php";
