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

        if ( !empty( get_the_post_thumbnail() ) ) {
            ?>
            <div class="small-12 medium-6 columns content-item__visual">
                <div class="news-item__image">
                    <picture>
                        <source media="(min-width: 200px)" srcset="<?php echo get_the_post_thumbnail_url( get_the_ID() , 'news-listing-retina' ); ?> 2x, <?php echo get_the_post_thumbnail_url( get_the_ID() , 'news-listing' ); ?> 1x" />
                        <source media="(max-width: 200px)" src="<?php echo get_the_post_thumbnail_url( get_the_ID() , 'news-listing' ); ?>" />
                        <img src="<?php echo get_the_post_thumbnail_url( get_the_ID() , 'news-listing' ); ?>" alt="<?php the_title(); ?>" />
                        </picture>
                </div>
            </div>

            <?php

            $post_text_content_layout_classes = 'small-12 medium-6 columns content-item__description';
        }
    ?>

	<div class="<?php echo $post_text_content_layout_classes; ?>">
        <p class="news-item__date"><time class="updated" datetime="<?php echo get_the_time( 'c' ); ?>"><?php echo sprintf( __( '%1$s', 'foundationpress' ), get_the_date() ); ?></time></p>
        <?php
        if(!empty($date) && !has_category(18) && !is_front_page()) {
            echo '<p class="news-item__date">'. $date .'</p>';
        }
        ?>
		<h3 class="content-item__title"><?php the_title(); ?></h3>
        <p class="news-item__excerpt"><?php the_excerpt(); ?></p>
        <p><a class="button button-cta" href="<?php the_permalink(); ?>">Read More</a></p>
	</div>

</div>
