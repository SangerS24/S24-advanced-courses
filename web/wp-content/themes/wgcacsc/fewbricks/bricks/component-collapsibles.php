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
//
//        if( $this->have_rows( 'staff_bios' ) ) {
//            $html .= '<div class="component component-collapsibles offset-content">';
//
//            while ( $this->have_rows( 'staff_bios' ) ) {
//                $this->the_row();
//            }
//
//            $html .= '</div>';
//        }


        return $html;

    }

}
?>