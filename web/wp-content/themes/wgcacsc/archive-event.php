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

get_header(); ?>


<div id="page" role="main">

    <?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html( array( 'post_id' => 974 ) ); ?>

	<div class="page__inner row">

		<div class="page__inner__content small-12 columns">

			<div class="main-content small-12 large-9 columns" id="main-content">

				<div class="offset-content">
					<?php s24_breadcrumb(); ?>
				</div>

                        <article>
                            <div class="entry-content">

                                <div class="offset-content">
                                    <h1 class="page-title"><?php echo get_the_title( 974 ); ?></h1>
                                </div>

                                <?php echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html( array( 'post_id' => 974 ) ); ?>

                                <?php echo (new fewbricks\bricks\group_flexible_content('standard_components'))->get_html( array( 'post_id' => 974 ) ); ?>
                            </div>
                        </article>

                <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /><span>Back to top</span></a>

            </div>

			<?php get_sidebar(); ?>
        </div>



	</div>

</div>

<?php get_footer();
