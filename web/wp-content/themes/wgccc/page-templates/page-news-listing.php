<?php
/*
Template Name: News Listing Page
*/
get_header(); ?>


    <div id="page" role="main">


        <?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html(); ?>



        <div class="page__inner row">

            <?php do_action( 'foundationpress_before_content' ); ?>

            <div class="page__inner__content small-12 columns">

                <div class="main-content small-12 large-9 columns" id="main-content">

                    <div class="offset-content">
                        <?php foundationpress_breadcrumb(); ?>
                    </div>

                    <?php while ( have_posts() ) : the_post(); ?>
                        <div <?php post_class('main-content') ?> id="main-content">

                            <div class="offset-content">
                                <h1 class="page-title"><?php the_title(); ?></h1>
                            </div>

                            <?php echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(); ?>

                            <?php the_content(); ?>

                            <?php echo (new fewbricks\bricks\group_flexible_content('standard_components'))->get_html(); ?>



                            <?php do_action( 'foundationpress_page_before_entry_content' ); ?>
                            <div class="entry-content">
                                <?php the_content(); ?>
                            </div>

                            <?php
                            $paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
                            $pagerange = 3;
                            $args = array(
                                'post_type'      => 'post',
                                'posts_per_page' => $pagerange,
                                'meta_key' => 'post_sort_date',
                                'orderby' => 'meta_value',
                                'order'   => 'DESC',
                                'paged'   => $paged
                            );

                            $archive_query = new WP_Query( $args );

                            if ( $archive_query->have_posts() ) {

                                echo '<div class="content-list offset-content">';

                                while ( $archive_query->have_posts() ) {
                                    $archive_query->the_post();
                                    $detailsHtmlClasses = 'small-12 columns content-item__description';
//                                    get_template_part('content', get_post_type() );
                                    $date = get_the_date();
                                    $title = get_the_title();
                                    $url = get_the_permalink();
                                    $excerpt = (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(array('plain' => true));
                                    $image = (new fewbricks\bricks\component_listing_image('listing_image'))->get_html();

                                    if(has_category(18)) {
                                        $detailsHtmlClasses .= ' content-item--event';
                                        $excerpt = (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(array('plain' => true));

                                        $eventSummary = get_field('listing_summary');

                                        $date = get_field('event_date');
                                        if(empty($date)) {
                                            $date = get_the_date();
                                        } else {
                                            $date = date('M j Y', strtotime($date));
                                        }

                                        if(!empty($eventSummary)) {
                                            $excerpt = $eventSummary;
                                            $url = get_permalink();
                                        } else {
                                            $eventSummary = '<p>';
                                            $eventSummary .= (get_field('organiser') ? '<small>Event organiser:</small> ' . get_field('organiser') . '<br />' : '');
                                            $eventSummary .= (get_field('event_date_details') ? '<small>Event Dates:</small> ' . get_field('event_date_details') . '<br />' : '');
                                            $eventSummary .= (get_field('event_website') ? '<small>Event website:</small> ' . get_field('event_website') : '');
                                            $excerpt = $eventSummary;
                                            $url = '';
                                        }
                                    }

                                    ?>

                                    <div class="clearfix row content-item">
                                        <?php if(isset($image) && !empty($image)): ?>
                                            <div class="small-12 medium-6 columns content-item__visual">
                                                <h3 class="content-item__title hide-for-medium news-item__title"><a href="<?php echo $url; ?>"><?php echo $title; ?></a></h3>
                                                <div class="news-item__image">
                                                    <?php echo $image; ?>
                                                </div>
                                            </div>
                                            <?php
                                            $detailsHtmlClasses = 'small-12 medium-6 columns content-item__description';
                                            ?>
                                        <?php endif; ?>
                                        <div class="<?php echo $detailsHtmlClasses; ?>">
                                            <h3 class="content-item__title show-for-medium"><?php the_title(); ?></h3>
                                            <p class="news-item__date"><?php echo $date; ?></p>
                                            <?php
                                            if(!empty($excerpt)) {
                                                echo '<p class="news-item__excerpt">' . $excerpt . '</p>';
                                            }
                                            ?>
                                            <?php if(!empty($url)): ?>
                                                <p><a href="<?php echo $url; ?>">Read More<span class="show-for-sr"> of <?php echo $title; ?></span></a></p>
                                            <?php endif; ?>
                                        </div>
                                    </div>

                                    <?php
                                }

                                $args = array(
                                    'base'               => get_pagenum_link(1) . '%_%',
                                    'format'             => 'page/%#%',
                                    'total'              => $archive_query->max_num_pages,
                                    'current'            => $paged,
                                    'show_all'           => false,
                                    'end_size'           => 1,
                                    'mid_size'           => $pagerange,
                                    'prev_next'          => true,
                                    'prev_text'          => __('Previous'),
                                    'next_text'          => __('Next'),
                                    'type'               => 'plain',
                                    'add_args'           => false,
                                    'add_fragment'       => '',
                                    'before_page_number' => '',
                                    'after_page_number'  => ''
                                );
                                echo '<div class="pagination-links">';
                                echo paginate_links( $args );
                                echo '</div>';

                                echo '</div>';

                            }

                            wp_reset_postdata();
                            ?>

                        </div>
                    <?php endwhile;?>

                    <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

                </div>


                <?php do_action( 'foundationpress_after_content' ); ?>

                <?php get_sidebar(); ?>

            </div>
        </div>


    </div>


<?php get_footer();
