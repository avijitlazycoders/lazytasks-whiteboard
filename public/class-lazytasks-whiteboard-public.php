<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://laycoders.co
 * @since      1.0.0
 *
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Lazytasks_Whiteboard
 * @subpackage Lazytasks_Whiteboard/public
 * @author     Lazycoders <info@lazycoders.co>
 */
class Lazytasks_Whiteboard_Public {

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
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function lazytasks_whiteboard_enqueue_styles() {

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

		// wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/lazytasks-whiteboard-public.css', array(), $this->version, 'all' );
		$lazytask_page_id = get_option('lazytask_page_id');

		if (is_page($lazytask_page_id)) {
			if(get_post_status() === 'publish'){
				// phpcs:ignore WordPress.WP.EnqueuedStylesScope
				wp_enqueue_style( 'lazytasks-whiteboard-style', plugin_dir_url( __DIR__ ) . 'admin/frontend/build/index.css', array(), $this->version, 'all');
			}else{
				// redirect to home page
				wp_redirect(home_url());
            	exit;
			}
		}

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function lazytasks_whiteboard_enqueue_scripts() {

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

		// wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/lazytasks-whiteboard-public.js', array( 'jquery' ), $this->version, false );
		$lazytask_page_id = get_option('lazytask_page_id');

		if (is_page($lazytask_page_id)) {
			if(get_post_status() === 'publish'){
				// phpcs:ignore WordPress.WP.EnqueuedScriptsScope
				wp_enqueue_script('lazytasks-whiteboard-script', plugin_dir_url( __DIR__ ) . 'admin/frontend/build/index.js', array('jquery', 'wp-element'), LAZYTASK_VERSION, true);
				wp_localize_script('lazytasks-whiteboard-script', 'appLocalizerWhiteboard', [
					'apiUrl' => home_url('/wp-json'),
					'homeUrl' => home_url(''),
					'nonce' => wp_create_nonce('wp_rest'),
					// 'i18n' => \Lazytask\Services\TransStrings::getStrings(),
				]);
			}else{
				// redirect to home page
				wp_redirect(home_url());
            	exit;
			}
		}

	}

}
