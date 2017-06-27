<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_testimonial
 * @package fewbricks\bricks
 */
class component_testimonial extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Testimonial';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields() {

        $this->add_field(new acf_fields\text('Heading', 'testimonial_heading', '150820161355a', [
            'instructions' => 'An optional heading to appear above the testimonial.'
        ]));
        $this->add_field(new acf_fields\text('Testimonial', 'testimonial_copy', '150820161356a', [ 'allow_null' => 0 ]));
        $this->add_field(new acf_fields\text('Testimonial Author', 'testimonial_author', '150820161356b'));

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array()) {

        $html = '';
        $heading = $this->get_field('testimonial_heading');
        $caption = $this->get_field('testimonial_copy');
        $author  = $this->get_field('testimonial_author');

        if(!empty($caption)) {
            $html .= '<div class="component component-testimonial">';


            if (!empty($heading)) {
                $html .= '<h3 class="section-heading section-heading--centered">' . $heading . '</h3>';
            }

            $html .= '
              <div class="component-testimonial__inner">';

            $html .= '<p class="component-testimonial__testimonial">' . $caption . '</p>';

            if (!empty($author)) {
                $html .= '<p class="component-testimonial__author">' . $author . '</p>';
            }


            $html .= '
                </div>
              </div>
            ';
        }

        return $html;

    }

}
