<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class map
 * @package fewbricks\bricks
 */
class component_teasers extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Content teasers';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_repeater( (new acf_fields\repeater( 'Content items' , 'content_items' , '201707181519a' , [
            'button_label' => 'Add teaser',
            'max' => 3
        ] ))
        ->add_sub_field( new acf_fields\image( 'Picture' , 'picture' , '201707181519b' ) )
        ->add_sub_field( new acf_fields\text( 'Teaser title' , 'title' , '201707181519c'))
        ->add_sub_field( new acf_fields\wysiwyg( 'Excerpt' , 'excerpt' , '201707181519d' , [
            'toolbar' => 'basic'
        ]))
        ->add_sub_field( new acf_fields\post_object( 'Content to link to' , 'link' , '201707181519e' , [
            'post_type' => array( 'page' , 'post' , 'event' ),
            'return_format' => 'object'
        ]) )
        ->add_sub_field(new acf_fields\text( 'OR external content to link to' , 'external_link' , '201707181519f' , [
                'instructions' => 'Enter the link manually if you cannot find it in the choice above. Please note this setting overrides the choice above.'
            ])));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        $html = '';
        $teaser_count = sizeof( $this->get_field( 'content_items' ) );

        if( $this->have_rows( 'content_items' ) ) {
            $eq_id = 'eq-'.rand();

            $html .= '<div class="component component-teasers component-teasers--'.$teaser_count.'" data-equalizer="'.$eq_id.'">';
            while ( $this->have_rows( 'content_items' ) ) {
                $this->the_row();

                $teaser_picture = $this->get_field_in_repeater( 'content_items' , 'picture');
                $picture_html = '';
                $teaser_title = $this->get_field_in_repeater( 'content_items' , 'title' );
                $teaser_excerpt = apply_filters( 'the_content' , $this->get_field_in_repeater( 'content_items', 'excerpt' ) );
                $teaser_link_object = $this->get_field_in_repeater( 'content_items' , 'link' );
                $teaser_link_external = $this->get_field_in_repeater( 'content_items' , 'external_link' );

                if ( !empty($teaser_picture) ) {
                    $teaser_picture_src = wp_get_attachment_image_url($teaser_picture, 'teaser-thumbnail');
                    $teaser_picture_src_retina = wp_get_attachment_image_url($teaser_picture, 'teaser-thumbnail-retina');

                    $picture_html .= '<picture>';
                    $picture_html .= '<source media="(min-width: 200px)" srcset="'.$teaser_picture_src_retina.' 2x, '.$teaser_picture_src.' 1x" />';
                    $picture_html .= '<source media="(max-width: 200px)" src="'.$teaser_picture_src.'" />';
                    $picture_html .= '<img src="' . $teaser_picture_src . '" alt="' . $teaser_title . '" />';
                    $picture_html .= '</picture>';
                }

                $teaser_link = '';
                if ( !empty($teaser_link_external) ) {
                    $teaser_link = $teaser_link_external;
                } elseif ( !empty($teaser_link_object) ) {
                    $teaser_link = get_permalink( $teaser_link_object->ID );
                }

                //individual teaser html
                $large_col_width = 12 / $teaser_count;
                $medium_up_width = ( $teaser_count > 1 ) ? 'medium-6 large-'.$large_col_width : '';
                $html .= '<div class="small-12 '.$medium_up_width.' columns component-teasers__teaser">';

                $html .= '<div class="component-teasers__teaser__thumbnail-wrapper">';
                if ( !empty( $teaser_link ) ) {
                    $html .= '<a href="'.$teaser_link.'">'.$picture_html.'</a>';
                } else {
                    $html .= $picture_html;
                }
                $html .= '</div>'; //end of thumbnail wrapper

                $html .= '<div class="component-teasers__teaser__text-wrapper" data-equalizer-watch="'.$eq_id.'">';
                $html .= '<h3 class="h5">'.( ( !empty($teaser_link) ) ? '<a href="'.$teaser_link.'">'.$teaser_title.'</a>' : $teaser_title ).'</h3>';
                $html .= $teaser_excerpt;
                if ( !empty( $teaser_link ) ) {
                    $html .= '<a href="'.$teaser_link.'" class="component-teasers__read-more">Read more</a>';
                }
                $html .= '</div>'; //end of content wrapper

                $html .= '</div>';
            }


            $html .= '</div>';
        }


        return $html;

    }

}
?>