<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_hero_list
 * @package fewbricks\bricks
 */
class component_hero_list extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Hero List';

    /**
     * @var int
     *
     * The maximum number of heroes that can be input by a user per block
     */
    protected $limit = 1;

    public function __construct($name, $key = '', $limit = 1)
    {
        $this->limit = $limit;
        parent::__construct($name, $key);
    }

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields() {

        $this->add_repeater((new acf_fields\repeater('Hero Items', 'hero_list', '290720161214a', [
            'button_label' => 'Add Hero',
            'max' => $this->limit,
            'allow_null' => 0,
            'instructions' => 'Hero images display full width at the top of the page in question. They are also used as images in listing pages (the news listing page for example)'
        ]))
            ->add_sub_field(new acf_fields\image('Image', 'hero_image', '290720161214b', [
                'instructions' => 'Ideal dimensions: 2560 pixels wide and 1700 pixels tall.<br />Minimum dimensions: 1280 pixels wide, 350 pixels tall'
            ]))
        );

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {
        if(!isset($args['plain'])) {
            $args['plain'] = false;
        }

        $html = '';
        $class = '';
        if(isset($args['class'])) {
            $class .= $args['class'];
        }

        // #TODO: This is a bad way of doing this, find a better way
        if($args['plain'] != true) {
            $html .= '
              <div class="hero-container">
                <div class="row ">
                  <div class="small-12 columns">';
        }

        if ($this->have_rows('hero_list')) {

            if($args['plain'] != true) {
                $html .= '<ol class="menu simple hero-list">';
            }
            while ($this->have_rows('hero_list')) {

                $this->the_row();

                $hero_img = $this->get_field_in_repeater('hero_list', 'hero_image');
                $alt = get_post_meta($hero_img, '_wp_attachment_image_alt', true);

                // #TODO: This is confusing and probably overly complex, refactor
                if($args['plain'] == true) {

                    if(isset($args['size'])) {

                        if(isset($args['size-retina'])) {

                            $heroImagePlainSrc = wp_get_attachment_image_url($hero_img, $args['size']);
                            $heroImagePlainRetinaSrc = wp_get_attachment_image_url($hero_img, $args['size-retina']);

                            $html .= '<picture>';
                            $html .= "<source media='(min-width: 200px)' srcset='$heroImagePlainRetinaSrc 2x, $heroImagePlainSrc 1x' />";
                            $html .= "<source media='(max-width: 200px)' src='$heroImagePlainSrc' />";
                            $html .= '<img class="' . $class . '" src="' . $heroImagePlainSrc . '" alt="' . $alt . '" />';
                            $html .= '</picture>';

                        } else {

                            $heroImagePlainSrc = wp_get_attachment_image_url($hero_img, $args['size']);

                            $html .= '<img class="' . $class . '" src="' . $heroImagePlainSrc . '" alt="' . $alt . '" />';

                        }
                    } else {

                        $heroImagePlainSrc = wp_get_attachment_image_url($hero_img, 'hero-listing');

                        $html .= '<img class="' . $class . '" src="' . $heroImagePlainSrc . '" alt="' . $alt . '" />';

                    }

                } else {

                    $heroImageLargeSrc = wp_get_attachment_image_url($hero_img, 'hero-large');
                    $heroImageLargeRetinaSrc = wp_get_attachment_image_url($hero_img, 'hero-large-retina');

                    $heroImageMediumSrc = wp_get_attachment_image_url($hero_img, 'hero-medium');
                    $heroImageMediumRetinaSrc = wp_get_attachment_image_url($hero_img, 'hero-medium-retina');

                    $heroImageSmallSrc = wp_get_attachment_image_url($hero_img, 'hero-small');
                    $heroImageSmallRetinaSrc = wp_get_attachment_image_url($hero_img, 'hero-small-retina');

                    $html .= '<li>';

                    $html .= '<picture>';
                    $html .= "<source media='(min-width: 1040px)' srcset='$heroImageLargeRetinaSrc 2x, $heroImageLargeSrc 1x' />";
                    $html .= "<source media='(min-width: 640px) and (max-width: 1040px)' srcset='$heroImageMediumRetinaSrc 2x, $heroImageMediumSrc 1x' />";
                    $html .= "<source media='(max-width: 640px)' srcset='$heroImageSmallRetinaSrc 2x, $heroImageSmallSrc 1x' />";
                    $html .= '<img class="' . $class . '" src="' . $heroImageLargeSrc . '" alt="' . $alt . '" />';
                    $html .= '</picture>';

                    $html .= '</li>';

                }

            }
            if($args['plain'] != true) {
                $html .= '</ol>';
            }

        }

        if($args['plain'] != true) {
            $html .= '
                  </div>
                </div>
              </div> <!-- /.row -->
            ';
        }

        return $html;

    }

}
