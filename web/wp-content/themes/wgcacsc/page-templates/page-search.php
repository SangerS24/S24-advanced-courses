<?php
/*
Template Name_ori: Search Page
*/
get_header(); ?>

    <div id="page" role="main">

        <div class="page__inner row">

            <?php do_action( 'foundationpress_before_content' ); ?>

            <div class="page__inner__content small-12 columns">

                <div class="main-content small-12 large-9 columns" id="main-content">

                    <header class="offset-content">
                        <h1 class="entry-title">Search</h1>
                    </header>
                    <div class="entry-content offset-content">

                        <?php the_content(); ?>

                        <?php get_search_form(); ?>

                    </div>

                    <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

                </div>

            </div>

        </div>

    </div>

<?php get_footer(); ?>
