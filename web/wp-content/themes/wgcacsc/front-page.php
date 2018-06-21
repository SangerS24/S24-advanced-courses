<?php
/**
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
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

         <div class="main-content small-12 columns" id="main-content">

             <?php while ( have_posts() ) : the_post(); ?>
               <article <?php post_class('post-content') ?> id="post-<?php the_ID(); ?>">
                   <?php do_action( 'foundationpress_page_before_entry_content' ); ?>
                   <div class="entry-content">

                       <?php

                       echo (new fewbricks\bricks\component_cta_list_home('events_call_to_action'))->get_html();
                        echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html();

                       $spotlight_events_title = get_field('spotlight_events_header' );

                       echo '<div class="--offset-content">';
                       if ( !empty($spotlight_events_title) ) {
                           echo '<h2 class="section-heading--centered">'.$spotlight_events_title.'</h2>';
                       }

                       echo (new fewbricks\bricks\component_teasers('front_events_teasers'))->get_html();
                       echo '</div>';

                       ?>

                       <div class="--offset-content front-newsletter-and-download">
                           <div class="row" data-equalizer="front-newsletter-and-download">
                               <div class="columns small-12 medium-6">
                                   <?php echo (new fewbricks\bricks\component_download('front_download'))->get_html(); ?>
                               </div>
	                           <div class="columns small-12 medium-6">
		                           <?php echo (new fewbricks\bricks\component_newsletter('front_newsletter'))->get_html(); ?>
                               </div>
                           </div>
                       </div>

                       <div class="row news-and-flexible-content">
                           <div class="columns small-12 medium-6">
	                           <?php echo (new fewbricks\bricks\group_flexible_content('bottom_components'))->get_html(); ?>
                           </div>
                           <div class="columns small-12 medium-6">
	                           <?php echo wgcacsc_get_latest_news(); ?>
                           </div>
                       </div>

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
