<?php
/**
 * The sidebar containing the main widget area
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>
<aside class="sidebar small-12 large-3 columns">
	<div class="sidebar__inner" id="sidebar__inner">
		<?php do_action( 'foundationpress_before_sidebar' ); ?>
		<?php dynamic_sidebar( 'sidebar-widgets' ); ?>
		<?php do_action( 'foundationpress_after_sidebar' ); ?>
	</div>
</aside>
