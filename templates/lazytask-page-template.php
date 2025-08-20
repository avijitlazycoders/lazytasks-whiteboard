<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<?php
/*
Template Name: Lazytask Page Template
*/

wp_head();

?>
<style>
    .container {
        max-width: 100%!important;
        padding-left: 0!important;
        padding-right: 0!important;
    }
</style>
<body class="container">
<div id="lazy_pms"></div>
</body>

<?php wp_footer(); ?>
</html>

