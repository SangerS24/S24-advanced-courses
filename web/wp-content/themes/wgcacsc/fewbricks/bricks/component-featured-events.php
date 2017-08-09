<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_cta_list
 * @package fewbricks\bricks
 */
class component_featured_events extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Featured Events';

    /**
     * @var int
     *
     * The maximum number of heroes that can be input by a user per block
     */
    protected $limit = 3;


    public function __construct($name = '', $key = '', $args = array())
    {
        if(isset($args['limit'])) {
            $this->limit = $args['limit'];
        }

        parent::__construct($name, $key);
    }

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields() {

        $this->add_field(new acf_fields\text('Spotlight Events Title', 'spotlight_events_title', '201708081632a', [
            'instructions' => 'An optional heading that would appear centered above the list of events'
        ]));

        $this->add_field(new acf_fields\relationship('Featured Events', 'featured_events', '201708081632b', [
            'post_type' => array('event'),
            'min' => 0,
            'max' => $this->limit
        ]));

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {

        $html = '';

        $title = $this->get_field('spotlight_events_title');
        $events = $this->get_field( 'featured_events');

        if ( !empty($events) ) {

            $html = '
                <div class="component featured_events offset-content">';
            if(!empty($title)) {
                $html .= '<h2>'. $title .'</h2>';
            }

            $html .= '<div class="row featured-events-list">';

            foreach ( $events as $event) {
                $html .= '<article class="small-12 large-4 columns featured-event">';
                $holding_content = apply_filters( 'the_content', get_field( 'holding_content' , $event->ID ) );

                $link_to_event = true;
                if ( !empty( $holding_content ) ) {
                    $link_to_event = false;
                }
                $html .= wgcacsc_get_event_thumbnail( $event->ID , $link_to_event );

                $html .= '<div class="event-item__text-content"><h3 class="h4 event-item__title">';

                if ( $link_to_event ) {
                    $html .= '<a href="'.get_permalink( $event->ID ).'">'.$event->post_title.'</a>';
                } else {
                    $html .= $event->post_title;
                }

                $html .= '</h3>';

                $dates = wgcacsc_get_event_dates( $event->ID );

                if ( !empty($dates) ) {
                    $html .= '<span class="h5 event-item__date-ranges">'.$dates.'</span>';
                }


                if ( empty($holding_content) ) {
                    $html .= wgcacsc_output_deadlines( wgcacsc_get_deadlines( $event->ID , 'short' ) );
                } else {
                    $html .= $holding_content;
                }

                $html .= '</div>'; //end of text content div

                $html .= '</article>';
            }
            $html .= '</div>
              </div> <!-- /.cta-group -->
            ';

        }

        return $html;

    }

}
