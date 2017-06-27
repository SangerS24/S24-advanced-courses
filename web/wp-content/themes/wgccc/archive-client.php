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

        <div class="page__inner row">

            <div class="page__inner__content small-12 columns">

                <div class="main-content small-12 large-9 columns" id="main-content">

                    <?php foundationpress_breadcrumb(); ?>

                    <div class="main-content" id="main-content">

                        <?php
                        $archiveTitle = get_the_archive_title();
                        echo '<h1 class="page-title">' . $archiveTitle . '</h1>';
                        ?>

                        <?php if ( have_posts() ) : ?>

                            <ol class="clients-list row">
                            <?php /* Start the Loop */ ?>
                            <?php while ( have_posts() ) : the_post(); ?>
                                <?php
                                $postId = get_the_ID();
                                $postTitle = get_the_title();
                                $clientHasTestimonial = get_field('client_testimonial', $postId);
                                ?>
                                <li class="client-item small-6 medium-2 columns<?php echo (($clientHasTestimonial == true) ? ' client-item--linked' : ''); ?>">
                                    <?php
                                    if($clientHasTestimonial == true) {
                                        echo '<a class="client-item__inner" href="' . get_permalink($postId) . '">';
                                    } else {
                                        echo '<div class="client-item__inner">';
                                    }
                                    ?>

                                        <?php
                                        $imageID = get_field('client_logo', $postId);
                                        $imageSrc = wp_get_attachment_image_url($imageID, 'client-logo--small');
                                        ?>
                                        <img src="<?php echo $imageSrc; ?>" alt="Logo for <?php echo $postTitle; ?>" />

                                    <?php
                                    if($clientHasTestimonial == true) {
                                        echo '</a>';
                                    } else {
                                        echo '</div>';
                                    }
                                    ?>
                                </li>
                            <?php endwhile; ?>
                            </ol>

                        <?php else : ?>
                            <?php get_template_part( 'template-parts/content', 'none' ); ?>

                        <?php endif; // End have_posts() check. ?>

                        <?php /* Display navigation to next/previous pages when applicable */ ?>
                        <?php if ( function_exists( 'foundationpress_pagination' ) ) { foundationpress_pagination(); } else if ( is_paged() ) { ?>
                            <nav id="post-nav">
                                <div class="post-previous"><?php next_posts_link( __( '&larr; Older posts', 'foundationpress' ) ); ?></div>
                                <div class="post-next"><?php previous_posts_link( __( 'Newer posts &rarr;', 'foundationpress' ) ); ?></div>
                            </nav>
                        <?php } ?>

                        <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

                    </div>

                </div>

                <?php get_sidebar(); ?>

            </div>

        </div>

    </div>

<?php get_footer();
