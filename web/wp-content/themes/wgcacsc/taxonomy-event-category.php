<?php
/**
 * The template for displaying archive pages
 *
 * Used to display archive-type pages if nothing more specific matches a query.
 * For example, puts together date-based pages if no date.php file exists.
 *
 * If you'd like to further customize these archive views, you may create a
 * new template file for each one. For example, tag.php (Tag archives),
 * category.php (Category archives), author.php (Author archives), etc.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

$few_args = array();
$tax_id = get_queried_object()->term_id;

$few_args['post_id'] = 'event-category_'.$tax_id;

get_header(); ?>


<div id="page" role="main">

    <?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html( $few_args ); ?>

	<div class="page__inner row">

		<div class="page__inner__content small-12 columns">

			<div class="main-content small-12 large-9 columns" id="main-content">

				<div class="offset-content">
					<?php s24_breadcrumb(); ?>
				</div>

				<div class="main-content" id="main-content">

					<div class="offset-content">
						<?php
						$archiveTitle = get_the_archive_title();
							echo '<h1 class="page-title">' . $archiveTitle . '</h1>';
						?>


                    </div>
                        <?php echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html( $few_args ); ?>
                        <?php echo (new fewbricks\bricks\group_flexible_content('standard_components'))->get_html( $few_args ); ?>


                    <!--   //IF COURSES, add legend //-->
                    <?php if ( is_tax( 'event-category' , 'courses' ) ): ?>
                        <div class="course-types-list offset-event-list">
                            <h6>Course types</h6>
                            <ul class="course-types-list__list">
                                <li><img src="<?php echo get_template_directory_uri().'/assets/images/course-type-computational.svg'; ?>" width="40" height="40" /> Computational</li>
                                <li><img src="<?php echo get_template_directory_uri().'/assets/images/course-type-lecture.svg'; ?>" width="40" height="40" /> Lecture/Discussion</li>
                                <li><img src="<?php echo get_template_directory_uri().'/assets/images/course-type-laboratory.svg'; ?>" width="40" height="40" /> Laboratory</li>
                            </ul>
                        </div>
                    <?php endif; ?> <!-- end of if it courses page -->

                    <?php if ( have_posts() ) : ?>

					<?php /* Start the Loop */ ?>
							<div class="event-list offset-event-list">
						<?php while ( have_posts() ) : the_post(); ?>
							<?php get_template_part( 'template-parts/content', 'event' ); ?>
						<?php endwhile; ?>
							</div>

					<?php else : ?>
                        <div class="small-12 columns">
						<div class="offset-content">
                            No events at the moment.
                        </div>
                        </div>

					<?php endif; // End have_posts() check. ?>

					<?php /* Display navigation to next/previous pages when applicable */ ?>
					<?php if ( function_exists( 'foundationpress_pagination' ) ) { foundationpress_pagination(); } else if ( is_paged() ) { ?>
						<nav id="post-nav">
							<div class="post-previous"><?php next_posts_link( __( '&larr; Older posts', 'foundationpress' ) ); ?></div>
							<div class="post-next"><?php previous_posts_link( __( 'Newer posts &rarr;', 'foundationpress' ) ); ?></div>
						</nav>
					<?php } ?>

                    <?php echo (new fewbricks\bricks\group_flexible_content('bottom_components'))->get_html( $few_args ); ?>

                    <div class="offset-content past-archive-link">
                        <h5 class="h3">Past events</h5>
                        <a href="<?php echo get_term_link( 'past-events' , 'event-category'); ?>" class="component-download__link">Browse our events archive</a>
                    </div>

                    <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

				</div>

			</div>

			<?php get_sidebar(); ?>

		</div>

	</div>

</div>

<?php get_footer();
