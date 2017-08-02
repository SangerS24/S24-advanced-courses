<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class map
 * @package fewbricks\bricks
 */
class component_collapsibles extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Collapsibles';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_repeater( (new acf_fields\repeater( 'Collapsible panels' , 'collapsible_panels' , '201707141511a' , [
            'button_label' => 'Add panel'
        ] ))
        ->add_sub_field(new acf_fields\text( 'Title' , 'title' , '201707141511d' ))
        ->add_sub_field(new acf_fields\text( 'Direct link' , 'direct_link' , '201707141511c' , [
            'prepend' => '<em>URL_to_this_page/</em>#'
        ]))
        ->add_sub_field( new acf_fields\wysiwyg( 'Content' , 'content' , '201707141511b' , [
            'toolbar' => 'full'
        ])));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        $html = '';

        if( $this->have_rows( 'collapsible_panels' ) ) {
            $html .= '<div class="component component-collapsibles offset-content"><ul class="accordion" data-accordion data-allow-all-closed="true" data-multi-expand="true">';

            $panel_count = 0;
            while ( $this->have_rows( 'collapsible_panels' ) ) {
                $this->the_row();

                $panel_title = $this->get_field_in_repeater( 'collapsible_panels' , 'title');
                $panel_anchor_name = $this->get_field_in_repeater( 'collapsible_panels' , 'direct_link');
                $panel_content = apply_filters( 'the_content' , $this->get_field_in_repeater( 'collapsible_panels' , 'content') );

                if ( $panel_count == 0 ) {
                    $html .= '<li class="accordion-item" data-accordion-item>';
                } else {
                    $html .= '<li class="accordion-item" data-accordion-item>';
                }
                $html .= '<a href="#'.$panel_anchor_name.'" class="accordion-title">'.$panel_title.'</a>';
                $html .= '<div class="accordion-content" data-tab-content id="'.$panel_anchor_name.'">'.$panel_content.'</div>';
                $html .= '</li>';
                $panel_count += 1;
            }

            $html .= '</ul></div>';
        }


        return $html;

    }

}
?>