<?php
/**
 * The template for displaying all single posts and attachments
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

get_header(); ?>


	<div id="page" role="main">


		<?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html(); ?>


		<div class="page__inner row">

			<?php do_action( 'foundationpress_before_content' ); ?>

			<div class="page__inner__content small-12 columns">

				<div class="main-content small-12 large-9 columns" id="main-content">

					<div class="breadcrumb-wrapper --offset-content">
						<?php s24_breadcrumb(); ?>
					</div>

					<?php while ( have_posts() ) : the_post(); ?>
						<article <?php post_class('post-content') ?> id="post-<?php the_ID(); ?>">
							<?php do_action( 'foundationpress_page_before_entry_content' ); ?>
							<div class="entry-content">

								<div class="content-group --offset-content">
									<h1 class="page-title"><?php the_title(); ?></h1>
                                    <p><span class="h3 event-header__date-range"><?php echo get_the_date('d F Y'); ?></span></p>

									<?php get_template_part( 'template-parts/share' ); ?>

								</div>

								<?php echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(); ?>

								<?php echo (new fewbricks\bricks\group_flexible_content('standard_components'))->get_html(); ?>
							</div>
						</article>
					<?php endwhile;?>

					<a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

				</div>


				<?php do_action( 'foundationpress_after_content' ); ?>

				<?php get_sidebar(); ?>

			</div>
		</div>


	</div>


<?php get_footer();
