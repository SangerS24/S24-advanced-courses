<?php
/**
 * The sidebar containing the main widget area
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>
<aside class="sidebar show-for-large large-3 columns" data-sticky-container>
	<div class="sticky sidebar__inner" id="sidebar__inner" data-sticky data-top-anchor="breadcrumbs:top" data-btm-anchor="main-content:bottom" data-margin-top="7.0">
		<?php do_action( 'foundationpress_before_sidebar' ); ?>
		<?php dynamic_sidebar( 'sidebar-widgets' ); ?>
		<?php do_action( 'foundationpress_after_sidebar' ); ?>
	</div>
</aside>
