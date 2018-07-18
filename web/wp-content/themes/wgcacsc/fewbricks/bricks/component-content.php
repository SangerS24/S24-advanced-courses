<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_content
 * @package fewbricks\bricks
 */
class component_content extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Content';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\wysiwyg('Text', 'text', '150820161412a', [ 'allow_null' => 0 ]));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {

        return '<div class="component content-group component-content --offset-content">' . $this->get_field('text') . '</div>';

    }

}
