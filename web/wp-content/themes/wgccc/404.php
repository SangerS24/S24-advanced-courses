<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

get_header(); ?>

<div id="page" role="main">

	<div class="page__inner row">

		<div class="page__inner__content small-12 columns">

			<div class="main-content small-12 large-9 columns" id="main-content">

				<article <?php post_class('offset-content') ?> id="post-<?php the_ID(); ?>">
					<header>
						<h1 class="entry-title"><?php _e( '404 - Page Not Found', 'foundationpress' ); ?></h1>
					</header>
					<div class="entry-content">
						<div class="error">
							<p class="bottom"><?php _e( 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.', 'foundationpress' ); ?></p>
						</div>
						<p><?php _e( 'Please try the following:', 'foundationpress' ); ?></p>
						<ul>
							<li><?php _e( 'Check your spelling', 'foundationpress' ); ?></li>
							<li><?php _e( 'Try <a href="/search">searching</a> for what you were looking for', 'foundationpress' ); ?></li>
							<li><?php printf( __( 'Return to the <a href="%s">home page</a>', 'foundationpress' ), home_url() ); ?></li>
							<li><?php _e( 'Click the <a href="javascript:history.back()">Back</a> button', 'foundationpress' ); ?></li>
						</ul>
					</div>
				</article>

				<a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

			</div>

		</div>

	</div>

	<?php get_sidebar(); ?>

</div>
<?php get_footer();
