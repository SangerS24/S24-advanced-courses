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
        echo wgcacsc_get_event_thumbnail( get_the_ID() );
    ?>

	<div class="event-item__text-content">
        <h3 class="h4 event-item__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
        <?php
            $dates = wgcacsc_get_event_dates( get_the_ID() );

            if ( !empty($dates) ) {
                echo '<span class="h5 event-item__date-ranges">'.$dates.'</span>';
            }

            $holding_content = apply_filters( 'the_content', get_field( 'holding_content' ) );

            if ( empty($holding_content) ) {
              echo wgcacsc_output_deadlines( wgcacsc_get_deadlines( get_the_ID() , 'short' ) );
            } else {
                echo $holding_content;
            }

        ?>
	</div>

</div>
