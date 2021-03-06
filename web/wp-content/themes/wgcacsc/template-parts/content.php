<?php
/**
 * The default template for displaying content
 *
 * Used for both single and index/archive/search.
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>

<div id="post-<?php the_ID(); ?>" <?php post_class('clearfix row content-item'); ?>>

    <?php
        $post_text_content_layout_classes = 'small-12 columns content-item__description';

        $news_listing_thumbnail_srcs = array();

        if ( !empty( get_the_post_thumbnail() ) ) {
            $news_listing_thumbnail_srcs['default'] = get_the_post_thumbnail_url( get_the_ID() , 'news-listing' );
            $news_listing_thumbnail_srcs['retina'] = get_the_post_thumbnail_url( get_the_ID() , 'news-listing-retina' );
        }
        if ( !empty( $news_listing_thumbnail_srcs ) ) {
            ?>
            <div class="small-12 medium-6 columns content-item__visual">
                <div class="news-item__image">
                    <a class="" href="<?php the_permalink(); ?>">
                    <picture>
                        <source media="(min-width: 200px)" srcset="<?php echo $news_listing_thumbnail_srcs['retina']; ?> 2x, <?php echo $news_listing_thumbnail_srcs['default']; ?> 1x" />
                        <source media="(max-width: 200px)" src="<?php echo $news_listing_thumbnail_srcs['default']; ?>" />
                        <img src="<?php echo $news_listing_thumbnail_srcs['default']; ?>" alt="<?php the_title(); ?>" />
                        </picture>
                        </a>
                </div>
            </div>

            <?php

            $post_text_content_layout_classes = 'small-12 medium-6 columns content-item__description';
        }
    ?>

	<div class="<?php echo $post_text_content_layout_classes; ?>">
        <p class="news-item__date"><time class="updated" datetime="<?php echo get_the_time( 'c' ); ?>"><?php echo sprintf( __( '%1$s', 'foundationpress' ), get_the_date() ); ?></time></p>
		<h3 class="content-item__title"><a class="" href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
        <p class="news-item__excerpt"><?php echo get_field( 'page_sub_heading_section_heading' ); ?></p>
        <p><a class="button button-cta" href="<?php the_permalink(); ?>">Read More</a></p>
	</div>

</div>
