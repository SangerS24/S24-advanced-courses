<?php
/**
 * The template for displaying the header
 *
 * Displays all of the head element and everything up until the "container" div.
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>
<!doctype html>
<html class="no-js" <?php language_attributes(); ?> >
	<head>
        <script>document.documentElement.className += ' js ';</script>
		<meta charset="<?php bloginfo( 'charset' ); ?>" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<?php wp_head(); ?>
	</head>
	<body <?php body_class('no-js'); ?>>
	<?php do_action( 'foundationpress_after_body' ); ?>

	<?php if ( get_theme_mod( 'wpt_mobile_menu_layout' ) == 'offcanvas' ) : ?>
	<div class="off-canvas-wrapper" id="off-canvas-wrapper">
		<div class="off-canvas-wrapper-inner" data-off-canvas-wrapper>
		<?php get_template_part( 'template-parts/mobile-off-canvas' ); ?>
	<?php endif; ?>

	<?php do_action( 'foundationpress_layout_start' ); ?>

	<div class="site-header-container" id="site-header-container" data-sticky-container>
		<header id="masthead" class="site-header" role="banner" data-sticky data-sticky-on="large" data-top-anchor="masthead:top" data-margin-top="0">
			<div class="site-header__inner row" role="navigation" >
				<div class="small-8 medium-5 large-4 columns logo-container">
					<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" class="site-logo" id="site-logo">
						<img src="<?php echo get_template_directory_uri(); ?>/assets/images/logo.svg" alt="Wellcome Genome Campus Conference Centre" />
					</a>
				</div>

				<div class="small-4 medium-7 large-8 columns site-header__navigation">
					<div class="clearfix button-group site-header__ctas">
						<button class="mobile-navigation-toggle mobile-navigation-toggle--js float-right" type="button" data-toggle="mobile-navigation">
							<img src="<?php echo get_template_directory_uri(); ?>/assets/images/hamburger_icon.svg" alt="" />
							<span class="show-for-sr">Access the main menu</span>
						</button>
						<noscript>
							<a href="#noscript-navigation" class="mobile-navigation-toggle float-right">
								<img src="<?php echo get_template_directory_uri(); ?>/assets/images/hamburger_icon.svg" alt="" />
								<span class="show-for-sr">Access the main menu</span>
							</a>
						</noscript>
					</div>

					<?php foundationpress_top_bar_r(); ?>

					<?php if ( ! get_theme_mod( 'wpt_mobile_menu_layout' ) || get_theme_mod( 'wpt_mobile_menu_layout' ) == 'topbar' ) : ?>
						<?php get_template_part( 'template-parts/mobile-top-bar' ); ?>
					<?php endif; ?>
				</div>
			</div>
		</header>
	</div>

	<section class="container main-content">
		<?php do_action( 'foundationpress_after_header' );
