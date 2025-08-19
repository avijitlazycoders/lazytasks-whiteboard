<?php

namespace LazytasksWhiteboard\Helper;

use LazytasksWhiteboard\Helper\Migrations\Lazytasks_whiteboard_Migrator;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Lazytasks_Whiteboard_DBMigrator {

	public static function run()
	{
		self::migrate();
	}

	private static function migrate()
	{
		Lazytasks_Whiteboard_Migrator::migrate();
	}

}