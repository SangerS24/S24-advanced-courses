<?php
/**
 * The sidebar containing the main widget area
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>
<aside class="sidebar small-12 large-3 columns show-for-large" data-sticky-container>
	<div class="sidebar__inner sticky" id="sidebar__inner" data-sticky data-top-anchor="breadcrumbs:top" data-btm-anchor="main-content:bottom" data-margin-top="12.0">
		<?php do_action( 'foundationpress_before_sidebar' ); ?>
		<?php
            if ( is_home() || is_category() || is_tag() || is_single() ) {
                dynamic_sidebar( 'sidebar-widgets' );
            }
        ?>
		<?php do_action( 'foundationpress_after_sidebar' ); ?>
	</div>
</aside>
