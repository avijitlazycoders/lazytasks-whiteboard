<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://laycoders.co
 * @since      1.0.0
 *
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/admin
 * @author     Lazycoders <info@lazycoders.co>
 */
class Lazytasks_Whiteboard_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Lazytasks_Whiteboard_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Lazytasks_Whiteboard_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */
		if (isset($_REQUEST['page']) && str_contains($_REQUEST['page'], 'lazytasks-page')){
			wp_enqueue_style( 'lazytasks-whiteboard-style', plugin_dir_url( __FILE__ ) . 'frontend/build/index.css', array(), $this->version, 'all');
		}
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/lazytasks-whiteboard-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Lazytasks_Whiteboard_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Lazytasks_Whiteboard_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/lazytasks-whiteboard-admin.js', array( 'jquery' ), $this->version, false );
		
		if (isset($_REQUEST['page']) && str_contains($_REQUEST['page'], 'lazytasks-page')) {
			// phpcs:ignore WordPress.WP.EnqueuedScriptsScope
			wp_enqueue_script('lazytasks-whiteboard-script', plugin_dir_url( __DIR__ ) . 'admin/frontend/build/index.js', array('lazytasks-script', 'wp-element'), $this->version, true);
			wp_localize_script('lazytasks-whiteboard-script', 'appLocalizerWhiteboard', [
				'apiUrl' => home_url('/wp-json'),
				'homeUrl' => home_url(''),
				'nonce' => wp_create_nonce('wp_rest'),
			]);
		}

	}

	//api routes
	public function lazytasks_whiteboard_admin_routes() {
		(new \LazytasksWhiteboard\Routes\Lazytasks_Whiteboard_Api())->admin_routes();
	}

}
