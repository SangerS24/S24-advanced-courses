<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_clients
 * @package fewbricks\bricks
 */
class component_sponsors extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Sponsors (logo) list';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('List title', 'title', '201707151644a', [
            'instructions' => 'An optional heading that would appear centered above the sponsors list'
        ]));

//        $this->add_field(new acf_fields\relationship('Clients', 'clients', '181120161739a', [
//            'allow_null' => 0,
//            'max' => 6,
//            'instructions' => 'lorem ipsum',
//            'post_type' => 'client',
//            'filters' => array(
//                0 => 'search'
//            )
//        ]));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {

        $html = '';

        return $html;

    }

}
