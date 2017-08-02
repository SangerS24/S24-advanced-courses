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
        $holding_content = apply_filters( 'the_content', get_field( 'holding_content' ) );

        $link_to_event = true;
        if ( !empty( $holding_content ) ) {
            $link_to_event = false;
        }
        echo wgcacsc_get_event_thumbnail( get_the_ID() , $link_to_event );
    ?>

	<div class="event-item__text-content">
        <h3 class="h4 event-item__title">
            <?php if ( $link_to_event ): ?>
            <a href="<?php the_permalink(); ?>">
            <?php endif; ?>
                <?php the_title(); ?>
            <?php if ( $link_to_event ): ?>
            </a>
            <?php endif; ?>
        </h3>
        <?php
            $dates = wgcacsc_get_event_dates( get_the_ID() );

            if ( !empty($dates) ) {
                echo '<span class="h5 event-item__date-ranges">'.$dates.'</span>';
            }


            if ( empty($holding_content) ) {
              echo wgcacsc_output_deadlines( wgcacsc_get_deadlines( get_the_ID() , 'short' ) );
            } else {
                echo $holding_content;
            }

        ?>
	</div>

</div>
