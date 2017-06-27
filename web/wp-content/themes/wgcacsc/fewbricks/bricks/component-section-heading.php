<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_section_heading
 * @package fewbricks\bricks
 */
class component_section_heading extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Sub Heading';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('Sub Heading', 'section_heading', '180820161341a', [
            'allow_null' => 0,
            'maxlength' => 140,
            'instructions' => 'Max 140 characters'
        ]));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        if(!isset($args['plain'])) {
            $args['plain'] = false;
        }

        if($args['plain'] == true) {
            return $this->get_field('section_heading');
        } else {
            return '<h2 class="component component-sub-heading section-heading offset-content">' . $this->get_field('section_heading') . '</h2>';
        }

    }

}
