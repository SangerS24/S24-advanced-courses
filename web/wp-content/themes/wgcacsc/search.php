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
					<?php s24_breadcrumb(); ?>
				</div>

				<div class="offset-content">

					<?php
					$searchQuery = get_search_query();

					if ( have_posts() ):
					?>

						<h1 class="page-title"><?php _e( 'Search Results for', 'foundationpress' ); ?> "<?php echo $searchQuery; ?>"</h1>

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

					<?php elseif ( !empty($_GET['s'] ) ) : ?>

                        <header class="page-header">
                            <h1 class="page-title"><?php _e( 'Nothing Found', 'foundationpress' ); ?></h1>
                        </header>

                        <div class="page-content">
                                <p><?php _e( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'foundationpress' ); ?></p>
                                <?php get_search_form(); ?>
                        </div>

                    <?php else : ?>

                        <header class="page-header">
                            <h1 class="page-title"><?php _e( 'Search', 'foundationpress' ); ?></h1>
                        </header>

                        <div class="page-content">
                             <?php get_search_form(); ?>
                        </div>

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
