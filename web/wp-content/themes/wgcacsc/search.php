<?php
/**
 * The template for displaying search results pages.
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

get_header(); ?>

<div id="page" role="main">

	<div class="page__inner row">

		<?php do_action( 'foundationpress_before_content' ); ?>

		<div class="page__inner__content small-12 columns" role="main">

			<div class="main-content small-12 large-9 columns" id="main-content">

				<div class="offset-content">
					<?php foundationpress_breadcrumb(); ?>
				</div>

				<div class="offset-content">

					<?php
					$searchQuery = get_search_query();

					if ( have_posts() ):
					?>

						<h2><?php _e( 'Search Results for', 'foundationpress' ); ?> "<?php echo $searchQuery; ?>"</h2>

						<?php
						get_search_form();
						?>

					<?php endif; ?>

					<?php if ( have_posts() ) : ?>

						<div class="content-list">
							<?php while ( have_posts() ) : the_post(); ?>
								<?php get_template_part( 'template-parts/content', get_post_format() ); ?>
							<?php endwhile; ?>
						</div>

					<?php else : ?>

						<?php get_template_part( 'template-parts/content', 'none' ); ?>

					<?php endif;?>

					<?php do_action( 'foundationpress_before_pagination' ); ?>

					<?php if ( function_exists( 'foundationpress_pagination' ) ) { foundationpress_pagination(); } else if ( is_paged() ) { ?>

						<nav id="post-nav">
							<div class="post-previous"><?php next_posts_link( __( '&larr; Older posts', 'foundationpress' ) ); ?></div>
							<div class="post-next"><?php previous_posts_link( __( 'Newer posts &rarr;', 'foundationpress' ) ); ?></div>
						</nav>
					<?php } ?>

				</div>

				<a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

			</div>

			<?php do_action( 'foundationpress_after_content' ); ?>

		</div>

	</div>

</div>
<?php get_footer();
