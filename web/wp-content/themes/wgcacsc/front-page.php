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

                        echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html();
                        echo (new fewbricks\bricks\component_cta_list_home('events_call_to_action'))->get_html();
                       echo (new fewbricks\bricks\component_featured_events('featured_events'))->get_html();

                       echo wgcacsc_get_latest_news();

                       ?>

                       <div class="offset-content front-newsletter-and-download">
                           <div class="row">
                               <?php
                                    echo (new fewbricks\bricks\component_newsletter('front_newsletter'))->get_html();
                               echo (new fewbricks\bricks\component_download('front_download'))->get_html();
                               ?>
                           </div>
                       </div>

                       <?php

                        echo (new fewbricks\bricks\group_flexible_content('bottom_components'))->get_html(); ?>
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
