<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_image_list
 * @package fewbricks\bricks
 */
class component_image_list extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Image or image carousel';

    /**
     * @var int
     *
     * The maximum number of images that can be input by a user per block
     */
    protected $limit = 40;

    public function __construct($name = '', $key = '', $limit = 40)
    {
        $this->limit = $limit;
        parent::__construct($name, $key);
    }

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields() {

        $this->add_field(new acf_fields\text('Heading', 'image_list_heading', '150820161346a', [
            'instructions' => 'An optional heading to appear above the image/images.'
        ]));

        $this->add_repeater((new acf_fields\repeater('Image/Images', 'image_list', '290720161250a', [
            'button_label' => 'Add Image',
            'allow_null' => 0,
            'instructions' => 'A list of images to display, if there is more than one image, the images will display in a carousel (a box that allows you to swipe through the images).'
        ]))
            ->add_sub_field(new acf_fields\image('Image', 'carousel_image', '290720161260b', [
                'instructions' => 'Minimum dimensions: 960 pixels wide, 400 pixels tall.<br />It is recommended the image are all of roughly the same size, if not the carousel will resize depending on the image size.'
            ]))
            ->add_sub_field(new acf_fields\text('Caption', 'carousel_image_caption', '290720161250c', [
                'instructions' => 'An optional caption to appear beneath the image.'
            ])));

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {
        $numImages = count($this->get_field('image_list'));

        // only load the Slick javascript if we need it
        if($numImages > 1) {
            // Slick Slider
            wp_enqueue_script('slick', get_template_directory_uri() . '/assets/javascript/slick.js', array('jquery'), '2.6.1', true);
        }

        $heading = $this->get_field('image_list_heading');

        $html = '
          <div class="component component-images-container">';

        if(!empty(trim($heading))) {
            $html .= '<h2 class="section-heading section-heading--centered">' . $heading . '</h2>';
        }

        if ($this->have_rows('image_list', $this->get_post_id_to_get_field_from() )) {

            $html .= '<ol class="component-images">';
            while ($this->have_rows('image_list', $this->get_post_id_to_get_field_from() )) {

                $this->the_row();

                $caption = $this->get_field_in_repeater('image_list', 'carousel_image_caption');

                $image = $this->get_field_in_repeater('image_list', 'carousel_image');
                $alt = get_post_meta($image, '_wp_attachment_image_alt', true);
                $imageLargeSrc = wp_get_attachment_image_url($image, 'carousel-large');
                $imageLargeRetinaSrc = wp_get_attachment_image_url($image, 'carousel-large-retina');

                $imageMediumSrc = wp_get_attachment_image_url($image, 'carousel-medium');
                $imageMediumRetinaSrc = wp_get_attachment_image_url($image, 'carousel-medium-retina');


                $html .= '<li>';
                $html .= '<figure class="component-images__figure">';

                $html .= '<picture class="component-images__image">';
                $html .= "<source media='(min-width: 640px)' srcset='$imageLargeRetinaSrc 2x, $imageLargeSrc 1x' />";
                $html .= "<source media='(max-width: 640px)' srcset='$imageMediumRetinaSrc 2x, $imageMediumSrc 1x' />";
                $html .= '<img src="' . $imageLargeSrc . '" alt="'. $alt .'" />';
                $html .= '</picture>';
                if(!empty($caption)) {
                    $html .= '<figcaption class="component-images__caption">' . $caption . '</figcaption>';
                }

                $html .= '</figure>';
                $html .= '</li>';

            }
            $html .= '</ol>';

        }

        $html .= '
          </div> <!-- /.row -->
        ';

        return $html;

    }

}
