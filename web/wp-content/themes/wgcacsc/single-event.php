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

                    <div class="event-breadcrumb small-12 large-9 columns">
                            <div class="--breadcrumb-wrapper offset-content">
                                <?php s24_breadcrumb(); ?>
                            </div>
                    </div>


					<?php while ( have_posts() ) : the_post(); ?>
						<article <?php post_class('post-content clearfix') ?> id="post-<?php the_ID(); ?>">


							<?php do_action( 'foundationpress_page_before_entry_content' ); ?>
							<div class="entry-content">

                                <!-- Header elements; Thumbnail and flages, title, date range -->

                                <div class="small-12 large-9 columns">
								<div class="offset-content event-header clearfix">

                                    <?php
                                            echo wgcacsc_get_event_thumbnail( get_the_ID() , false );
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
                                                echo '<span class="h5 event-header__location">'.$event_location.'</span>';
                                            }
                                        ?>


                                    </div>
								</div>
                                </div> <!-- End header wrappers-->

                                <div class="small-12 large-3 event-side-block columns event-deadlines-register">
                                    <div class="event-side-block__section">
                                        <?php
                                            $deadlines = wgcacsc_get_deadlines( get_the_ID() );
                                            if ( !empty( $deadlines ) ) {
                                                echo wgcacsc_output_deadlines( $deadlines );
                                            }

                                            echo wgcacsc_register_button( get_the_ID() );
                                        ?>
                                    </div>
                                </div> <!-- end deadlines and register section -->

                                <div class="small-12 large-9 columns">
                                        <!-- LEAD -->
                                        <?php
                                            echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html();
                                            echo wgcacsc_get_programme_download( get_the_ID() );
                                            echo (new fewbricks\bricks\component_event_collapsibles('event_details_panels'))->get_html();
                                            echo (new fewbricks\bricks\group_flexible_content('standard_components'))->get_html();
                                        ?>
                                </div>

                                <div class="small-12 large-3 event-side-block large-offset-9">
                                        <?php
                                            echo (new fewbricks\bricks\component_sponsors_side( 'side_sponsors' ))->get_html();
                                            echo wgcacsc_get_questions_section( get_the_ID() );
                                            echo wgcacsc_get_share_section( get_the_ID() );
                                            get_template_part( 'template-parts/share' );
                                        ?>
                                        </div>
                                </div> <!-- end other side sections -->
							</div>
						</article>
					<?php endwhile;?>

                    <div class="small-12 large-9 columns">
					    <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /><span>Back to top</span></a>
                    </div>
				</div>


				<?php do_action( 'foundationpress_after_content' ); ?>

			</div>
		</div>


	</div>


<?php get_footer();
