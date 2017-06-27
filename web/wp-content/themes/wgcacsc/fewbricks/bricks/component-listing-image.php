<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_listing_image
 * @package fewbricks\bricks
 */
class component_listing_image extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Listing Image';

    public function __construct($name, $key = '', $limit = 1)
    {
        $this->limit = $limit;
        parent::__construct($name, $key);
    }

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields() {

        $this->add_field(new acf_fields\image('Image', 'listing_image', '210920161443a', [
                'instructions' => 'An image for the homepage/news listing. Ideal dimensions: 840 pixels wide and 440 pixels tall.<br />Minimum dimensions: 420 pixels wide, 220 pixels tall'
            ])
        );

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {

        $html = '';

        $image = $this->get_field('listing_image');
        if(!empty($image)) {
            $alt = get_post_meta($image, '_wp_attachment_image_alt', true);
            $listingImagePlainSrc = wp_get_attachment_image_url($image, 'news-listing');
            $listingImagePlainRetinaSrc = wp_get_attachment_image_url($image, 'news-listing-retina');

            $html .= '<picture>';
            $html .= "<source media='(min-width: 200px)' srcset='$listingImagePlainRetinaSrc 2x, $listingImagePlainSrc 1x' />";
            $html .= "<source media='(max-width: 200px)' src='$listingImagePlainSrc' />";
            $html .= '<img src="' . $listingImagePlainSrc . '" alt="' . $alt . '" />';
            $html .= '</picture>';
        }

        return $html;

    }

}
