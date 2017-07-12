<?php
/**
 * Template part for off canvas menu
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>

<nav class="off-canvas position-right mobile-navigation" id="mobile-navigation" data-off-canvas data-position="right" role="navigation">
  <?php foundationpress_mobile_nav(); ?>

  <div class="mobile-search-form">
    <?php echo get_search_form(); ?>
  </div>

</nav>

<div class="off-canvas-content" data-off-canvas-content>
