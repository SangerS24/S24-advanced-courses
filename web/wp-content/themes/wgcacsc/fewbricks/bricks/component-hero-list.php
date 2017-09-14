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
            'instructions' => 'Hero images display full width at the top of the page in question.'
        ]))
            ->add_sub_field(new acf_fields\image('Image', 'hero_image', '290720161214b', [
                'instructions' => 'Required dimensions: 2560 pixels wide and 800 pixels tall.<br />Minimum dimensions: 1280 pixels wide, 400 pixels tall'
            ]))
        );

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {
        $heroes = $this->get_field( 'hero_list' , $this->get_post_id_to_get_field_from()) ;

        //get out if no heroes anyway
        if ( empty( $heroes ) ) {
            return '';
        }

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

        foreach ( $heroes as $hero) {
            if($args['plain'] != true) {
                $html .= '<ol class="menu simple hero-list">';
            }

            $hero_img = $hero['hero_list_hero_image'];
            $alt = get_post_meta($hero_img, '_wp_attachment_image_alt', true);
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

                    if ( is_front_page() ) {
                        $heroImageSmallSrc = wp_get_attachment_image_url($hero_img, 'hero-home-small');
                        $heroImageSmallRetinaSrc = wp_get_attachment_image_url($hero_img, 'hero-home-small-retina');
                    } else {
                        $heroImageSmallSrc = wp_get_attachment_image_url($hero_img, 'hero-small');
                        $heroImageSmallRetinaSrc = wp_get_attachment_image_url($hero_img, 'hero-small-retina');
                    }

                    $html .= '<li>';

                    $html .= '<picture>';
                    $html .= "<source media='(min-width: 1040px)' srcset='$heroImageLargeRetinaSrc 2x, $heroImageLargeSrc 1x' />";
                    $html .= "<source media='(min-width: 640px) and (max-width: 1040px)' srcset='$heroImageMediumRetinaSrc 2x, $heroImageMediumSrc 1x' />";
                    $html .= "<source media='(max-width: 640px)' srcset='$heroImageSmallRetinaSrc 2x, $heroImageSmallSrc 1x' />";
                    $html .= '<img class="' . $class . '" src="' . $heroImageLargeSrc . '" alt="' . $alt . '" />';
                    $html .= '</picture>';

                    $html .= '</li>';

                }

            if($args['plain'] != true) {
                $html .= '</ol>';
            }
        }

        if ( is_front_page() ) {
            $html .= '<div class="home-page-title"><h1>'.get_the_title().'</h1></div>';
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
