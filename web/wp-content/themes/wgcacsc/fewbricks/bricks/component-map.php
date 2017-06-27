<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class map
 * @package fewbricks\bricks
 */
class component_map extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Map';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        // settings for the map field
        $mapArgs = array('center_lat' => '52.0813226', 'center_lng' => '0.1848257', 'zoom' => '11', 'height' => '400');

        $this->add_field(new acf_fields\google_map('Map', 'map', '150820161451a', $mapArgs));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {

        $html = '<div class="component-map">';

        $map = $this->get_field('map');

        if( !empty($map) ) {
            $html .= '<div class="acf-map">';
            $html .= '<div class="marker" data-lat="' . $map["lat"] . '" data-lng="' . $map["lng"] . '"></div>';
            $html .= '</div>';
        }

        $html .= '</div>';

        wp_enqueue_script('wgcacsc_google_maps_api', 'https://maps.googleapis.com/maps/api/js?key=' . GOOGLE_MAPS_API_KEY);
        wp_enqueue_script('wgcacsc_google_maps_custom', get_template_directory_uri() . '/assets/javascript/acf-map.js', array('jquery'), '2.6.1', true);

        return $html;

    }

}
