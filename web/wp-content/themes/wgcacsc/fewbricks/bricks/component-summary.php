<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class text_and_content
 * @package fewbricks\bricks
 */
class component_summary extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Summary';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('Heading', 'heading', '300820161546a', [
            'maxlength' => 140,
            'instructions' => 'Max 140 characters'
        ]));
        $this->add_field(new acf_fields\text('Sub Heading', 'sub_heading', '300820161546b'));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        $html = '';

        if(!empty($this->get_field('heading') || !empty($this->get_field('sub_heading')))) {
            $html .= '<div class="component-summary">';

            if (!empty($this->get_field('heading'))) {
                $html .= '<h1 class="section-heading section-heading--normal">' . $this->get_field('heading') . '</h1>';
            }

            if (!empty($this->get_field('sub_heading'))) {
                $html .= '<h2 class="section-heading section-heading--dark">' . $this->get_field('sub_heading') . '</h2>';
            }

            $html .= '</div>';
        }

        return $html;

    }

}
