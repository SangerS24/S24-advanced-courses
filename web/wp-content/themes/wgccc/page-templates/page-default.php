<?php
/*
Template Name: Default Page
*/
get_header(); ?>

    <div id="page" role="main">

        <?php do_action( 'foundationpress_before_content' ); ?>
        <?php while ( have_posts() ) : the_post(); ?>
            <article <?php post_class('main-content') ?> id="main-content">
                <header>
                    <h1 class="entry-title"><?php the_title(); ?></h1>
                </header>
                <?php do_action( 'foundationpress_page_before_entry_content' ); ?>
                <div class="entry-content">
                    <?php the_content(); ?>

                    <?php echo (new fewbricks\bricks\group_flexible_content('standard_components'))->get_html(); ?>
                </div>
                <footer>
                    <?php wp_link_pages( array('before' => '<nav id="page-nav"><p>' . __( 'Pages:', 'foundationpress' ), 'after' => '</p></nav>' ) ); ?>
                    <p><?php the_tags(); ?></p>
                </footer>
                <?php do_action( 'foundationpress_page_before_comments' ); ?>
                <?php comments_template(); ?>
                <?php do_action( 'foundationpress_page_after_comments' ); ?>

                <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

            </article>
        <?php endwhile;?>

        <?php do_action( 'foundationpress_after_content' ); ?>

    </div>

<?php get_footer();
