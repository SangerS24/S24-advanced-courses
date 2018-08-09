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
                    

                    <?php if ( have_posts() ) : ?>

					<?php
                        /* Start the Loop */
                        //In this instance, the loop only stores the entries in an array
                        //They will be re-ordered and then displayed from the array after

                        $event_cat_terms = get_terms( array( 'taxonomy' => 'event-category' , 'order' => 'ASC' , 'orderby' => 'menu_order' , 'exclude' => array(29) ) );

                        $past_events_array = array();

                        foreach ( $event_cat_terms as $event_cat_term) {
                            $past_events_array[ $event_cat_term->term_id ]['object'] = $event_cat_term;
                            $past_events_array[ $event_cat_term->term_id ]['years'] = array();
                        }


                        while (have_posts() ) {
                            the_post();
                            $event_array = array();

                            $event_array['title'] = get_the_title();
                            $event_array['permalink'] = get_permalink( get_the_ID() );
                            $event_array['year'] = get_post_meta( get_the_ID() , 'start_date' , true);
                            if ( !empty( $event_array['year'] ) ) {
                                $event_array['year'] = substr( $event_array['year'] , 0 , 4 );
                            }
                            $event_array['category'] = array_diff( wp_get_object_terms( array( get_the_ID() ) , array('event-category') , array( 'fields' => 'ids' ) )  , array( 30 ) );

                            if ( !empty( $event_array['category'] ) && !empty( $event_array['year'] ) ) {
                                //check category exist beyond 'past events' and year exists otherwise can't fit it in the list
                                $event_array['category'] = array_shift( $event_array['category'] );

                                if ( isset( $past_events_array[ $event_array['category'] ]['years'][ $event_array[ 'year' ] ] ) ) {
                                    //entries already added for that year
                                    array_push( $past_events_array[ $event_array['category'] ]['years'][ $event_array[ 'year' ] ] , $event_array );
                                } else {
                                    $past_events_array[ $event_array['category'] ]['years'][ $event_array[ 'year' ] ] = array( $event_array );
                                }
                            }
                        }

                        if ( !empty( $past_events_array ) ) {
                            $past_event_html = '<div class="past-events-list offset-content">';
                            foreach ( $past_events_array as $past_events_category ) {

                                if ( !empty($past_events_category['years'] ) ) {
                                    $past_event_html .= '<h4>'.$past_events_category['object']->name.'</h4>';
                                    krsort( $past_events_category['years']  );
                                    $past_event_html .= '<ul class="accordion" data-accordion data-multi-expand="true" data-allow-all-closed="true">';
                                    //accordion items
                                    foreach ( $past_events_category['years'] as $year => $entries ) {
                                        $past_event_html .= '<li class="accordion-item" data-accordion-item><a href="#'.$past_events_category['object']->slug.'-'.$year.'" class="accordion-title">'.$year.'</a>';
                                        $past_event_html .= '<div class="accordion-content" data-tab-content>';
                                        if ( !empty($entries ) ) {
                                            $past_event_html .= '<ul class="past-events-list__ul">';
                                            foreach ( $entries as $event_entry ) {
                                                $past_event_html .= '<li><a href="'.$event_entry['permalink'].'">'.$event_entry['title'].'</a></li>';
                                            }
                                            $past_event_html .= '</ul>';
                                        }
                                        $past_event_html .= '</div>';
                                        $past_event_html .= '</li>';
                                    }
                                    $past_event_html .= '</ul>';
                                }
                            }
                            $past_event_html .= '</div>';

                            echo $past_event_html;
                        }

                        ?>


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

                    <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /><span>Back to top</span></a>

				</div>

			</div>

			<?php get_sidebar(); ?>

		</div>

	</div>

</div>

<?php get_footer();
