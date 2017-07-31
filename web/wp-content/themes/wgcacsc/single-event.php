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

			<div class="page__inner__content">

				<div class="main-content" id="main-content">

                    <div class="small-12 columns">
                            <div class="offset-content">
                                <?php s24_breadcrumb(); ?>
                            </div>
                    </div>


					<?php while ( have_posts() ) : the_post(); ?>
						<article <?php post_class('post-content') ?> id="post-<?php the_ID(); ?>">


							<?php do_action( 'foundationpress_page_before_entry_content' ); ?>
							<div class="entry-content">

                                <!-- Header elements; Thumbnail and flages, title, date range -->

                                <?php
                                    $event_header_classes = '';
                                    $event_thumbnail = get_the_post_thumbnail( get_the_ID() , 'teaser-thumbnail');

                                    if ( !empty($event_thumbnail) ) {
                                        $event_header_classes = 'has-thumbnail';
                                    }

                                    $flagged_as_new = !empty( get_field( 'flag_new') );

                                    if ( $flagged_as_new ) {
                                        $event_header_classes .= ' flagged-as-new';
                                    }
                                    $course_type = get_field( 'flag_course_type');
                                ?>

                                <div class="small-12 medium-9 columns">
								<div class="offset-content event-header <?php echo $event_header_classes; ?>">

                                    <?php
                                        if ( !empty($event_thumbnail ) ) {
                                            $th_element = '<figure class="event-header__thumbnail">';
                                            if ( $flagged_as_new ) {
                                                $th_element .= '<span class="event-header__thumbnail__new-flag h5">New</span>';
                                            }
                                            $th_element .= $event_thumbnail;
                                            if ( $course_type != 'none' ) {
                                                $th_element .= '<img class="event-header__thumbnail__course-type event-header__thumbnail__course-type--'.$course_type.'" alt="This course type is '.$course_type.'" src="'.get_template_directory_uri().'/assets/images/course-type-'.$course_type.'.svg" />';
                                            }
                                            $th_element .= '</figure>';

                                            echo $th_element;
                                        }
                                    ?>
                                    <div class="event-header__text-content">
									    <h1 class="page-title"><?php the_title(); ?></h1>
                                        <?php
                                            $date_range = wgcacsc_get_event_dates( get_the_ID() );
                                            if ( !empty($date_range) ) {
                                                echo '<span class="h3 event-header__date-range">'.$date_range.'</span>';
                                            }

                                            $event_location = get_field( 'location' );

                                            if ( !empty($event_location) ) {
                                                echo '<span class="h5">'.$event_location.'</span>';
                                            }
                                        ?>
                                    </div>
								</div>
                                </div> <!-- End header wrappers-->

                                <div class="small-12 medium-3 columns float-right">

                                </div> <!-- end deadlines and register section -->

                                <div class="small-12 medium-9 columns">
                                    More bits about the event
                                </div>

                                <div class="small-12 medium-3 medium-offset-9">
                                    akdjfhlwj
                                </div> <!-- end deadlines and register section -->

							</div>
						</article>
					<?php endwhile;?>

                    <div class="small-12 large-9 columns">
					    <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>
                    </div>
				</div>


				<?php do_action( 'foundationpress_after_content' ); ?>

			</div>
		</div>


	</div>


<?php get_footer();
