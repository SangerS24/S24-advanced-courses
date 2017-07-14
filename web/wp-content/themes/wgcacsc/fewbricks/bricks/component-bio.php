<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class map
 * @package fewbricks\bricks
 */
class component_bio extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Staff bios';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_repeater( (new acf_fields\repeater( 'Staff bios' , 'bios' , '201707141712a' ))
        ->add_sub_field( new acf_fields\image( 'Picture' , 'bio_picture' , '201707141713a' ) )
        ->add_sub_field( new acf_fields\text( 'Name' , 'bio_name' , '201707141714a'))
        ->add_sub_field( new acf_fields\text( 'Job title' , 'bio_job_title' , '201707141715a'))
        ->add_sub_field( new acf_fields\wysiwyg( 'Bio' , 'bio_bio' , '201707141715b' , [
            'toolbar' => 'basic'
        ])));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {

        $html = '<div class="component-bio">';

        $bios = $this->get_field('bios');

        if( !empty($bios) ) {
//            $html .= '<div class="staff-bio">';
//            $html .= '<div class="marker" data-lat="' . $map["lat"] . '" data-lng="' . $map["lng"] . '"></div>';
//            $html .= '</div>';
        }

        $html .= '</div>';

        return $html;

    }

}
