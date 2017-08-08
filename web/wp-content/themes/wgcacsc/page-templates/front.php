<?php
/*
Template Name - ori: Homepage
*/
get_header(); ?>


	<div id="page" class="page page-full" role="main">


		<?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html(); ?>


		<div class="page__inner row">

			<?php do_action( 'foundationpress_before_content' ); ?>

			<div class="page__inner__content small-12 columns">

				<div class="main-content small-12 columns" id="main-content">

					<?php while ( have_posts() ) : the_post(); ?>
						<article <?php post_class('post-content') ?> id="post-<?php the_ID(); ?>">
							<?php do_action( 'foundationpress_page_before_entry_content' ); ?>
							<div class="entry-content">

								<?php echo (new fewbricks\bricks\component_summary('homepage_introduction'))->get_html(); ?>

								<?php echo (new fewbricks\bricks\component_cta_list('homepage_cta_list_1'))->get_html(['full_width' => true]); ?>

								<?php echo (new fewbricks\bricks\component_cta_list('homepage_cta_list_2'))->get_html(['full_width' => true]); ?>

								<?php echo (new fewbricks\bricks\component_testimonial('homepage_testimonial'))->get_html(); ?>

								<?php the_content(); ?>


								<?php

								$bottomContentTitle = get_field('content_bottom_title');

								$newsEventsArray = array();
								$today = date('Ymd');
								$eventArgs = array(
									'post_type' => 'post',
									'posts_per_page' => 3,
									'meta_query' => array(
										array(
											'key'     => 'promoted_to_homepage',
											'orderby' => 'meta_value_num',
											'value'   => 1,
											'type'    => 'numeric',
											'compare' => '=='
										),
										array(
											'key'		=> 'promoted_to_homepage_expiry',
											'compare'	=> '>=',
											'value'		=> $today,
										)
									),
									'orderby' => 'promoted_to_homepage',
									'order'   => 'DESC',
								);
								$eventQuery = new WP_QUERY($eventArgs);

								if($eventQuery->have_posts()) {
									echo '<div class="component component-latest-news">';
									if(!empty($bottomContentTitle)) {
										echo '<h2 class="section-heading section-heading--centered">' . $bottomContentTitle . '</h2>';
									}
									echo '<div class="row latest-news-row latest-events-row">';

									$countQuery = new WP_QUERY;
									$numItems = count($countQuery->query($eventArgs));

									while($eventQuery->have_posts()) : $eventQuery->the_post();

										if(has_category(18)) {
											$id = get_the_ID();

											// we use slightly different data for events
											$date = get_field('event_date');
											if(empty($date)) {
												$date = get_the_date();
											} else {
												$date = date('M j Y', strtotime($date));
											}
											$newsEventsArray[$id] = array(
												'id' => $id,
												'title' => get_the_title(),
												'date' => $date,
												'image' => (new fewbricks\bricks\component_listing_image('listing_image'))->get_html(),
											);

											$eventSummary = get_field('listing_summary');

											if(!empty($eventSummary)) {
												$newsEventsArray[$id]['excerpt'] = $eventSummary;
												$newsEventsArray[$id]['url'] = get_permalink();
												$newsEventsArray[$id]['linkText'] = '';
											} else {
												$eventSummary .= (get_field('organiser') ? '<small>Event organiser:</small> ' . get_field('organiser') . '<br />' : '');
												$eventSummary .= (get_field('event_date_details') ? '<small>Event Dates:</small> ' . get_field('event_date_details') . '<br />' : '');
												$eventSummary .= (get_field('event_website') ? '<a href="' . get_field('event_website') . '">Visit event website</a>' : '');
												$newsEventsArray[$id]['excerpt'] = $eventSummary;
												$newsEventsArray[$id]['url'] = '';
												$newsEventsArray[$id]['linkText'] = '';
											}

										} else {
											$newsEventsArray[] = array(
												'id' => get_the_ID(),
												'url' => get_permalink(),
												'title' => get_the_title(),
												'date' => get_the_date(),
												'image' => (new fewbricks\bricks\component_listing_image('listing_image'))->get_html(),
												'excerpt' => (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(array('plain' => true)),
											);
										}

										$itemClass = '';
										if($numItems == 1) {
											echo '<div class="small-12 medium-7 columns medium-centered">';
											get_template_part( 'template-parts/content' );
											echo '</div>';
										} elseif($numItems == 2) {
											echo '<div class="small-12 large-6 columns news-item--half">';
											get_template_part( 'template-parts/content' );
											echo '</div>';
										} elseif(count($newsEventsArray) > 2) {

											foreach($newsEventsArray as $item):
											?>
												<div class="medium-12 large-4 columns news-item--compact event-item">
													<?php if(isset($item['image']) && !empty($item['image'])): ?>
														<div class="news-item__image">
															<?php echo $item['image']; ?>
														</div>
													<?php endif; ?>
													<div class="news-item__details">
														<h3 class="news-item__title"><?php echo $item['title']; ?></h3>
														<?php
														if(!empty($item['excerpt'])) {
															echo '<p class="news-item__excerpt">' . $item['excerpt'] . '</p>';
														}
														?>
														<?php if(!empty($item['url'])): ?>
															<p><a class="button button-cta"  href="<?php echo $item['url']; ?>">Read more</a></p>
														<?php endif; ?>
													</div>
												</div>

											<?php endforeach; ?>
										<?php
										}
									endwhile;

									echo '</div>
										</div>';
								} ?>
								<?php wp_reset_postdata(); ?>

								<?php echo (new fewbricks\bricks\component_clients('homepage_clients'))->get_html(); ?>

							</div>
						</article>
					<?php endwhile;?>


					<a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>


				</div>


				<?php do_action( 'foundationpress_after_content' ); ?>

			</div>
		</div>


	</div>


<?php get_footer();
