<?php

namespace Lazytask\Helper\Migrations;
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Lazytask_TaskMigrator {

	//migrate
	public static function migrate()
	{
		self::add_project_whiteboards_table();
		self::add_whiteboard_comments_table();
		
	}


	private static function add_project_whiteboards_table()
	{
		global $wpdb;
		$table_name = LAZYTASK_TABLE_PREFIX . 'project_whiteboards';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `project_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
		
		// Fetch all projects
		$projects_table = LAZYTASK_TABLE_PREFIX . 'projects';
		$projects = $wpdb->get_results("SELECT id FROM {$projects_table} WHERE deleted_at IS NULL");

		if (!empty($projects)) {
			foreach ($projects as $project) {
				$project_id = $project->id;

				// Check if whiteboard entry exists for this project
				$exists = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT COUNT(*) FROM {$table_name} WHERE project_id = %d",
						$project_id
					)
				);

				// Insert if not exists
				if ($exists == 0) {
					$wpdb->insert($table_name, [
						'project_id' => $project_id,
						'created_by' => get_current_user_id(),
						'data' => json_encode([]),
						'created_at' => current_time('mysql'),
						'updated_at' => current_time('mysql'),
						'deleted_at' => null
					]);
				}
			}
		}
	}

	public static function add_whiteboard_comments_table()
	{
		global $wpdb;
		$table_name = LAZYTASK_TABLE_PREFIX . 'whiteboard_comments';

		$table_generate_query = "
	        CREATE TABLE IF NOT EXISTS `". $table_name ."` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned DEFAULT NULL,
  `project_id` bigint unsigned DEFAULT NULL,
  `whiteboard_id` bigint unsigned DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `comments_coordinates` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
		require_once (ABSPATH. 'wp-admin/includes/upgrade.php');
		dbDelta($table_generate_query);
	}
	

}