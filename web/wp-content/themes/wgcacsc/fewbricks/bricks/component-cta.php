<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_cta
 * @package fewbricks\bricks
 */
class component_cta extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'CTA';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields() {

        $this->add_field(new acf_fields\image('Image', 'cta_image', '290720161518a', [ 'allow_null' => 0 ]));
        $this->add_field(new acf_fields\text('Title', 'cta_title', '290720161518b', [ 'allow_null' => 0 ]));
        $this->add_field(new acf_fields\post_object('Link', 'cta_link', '290720161518c',
            [
                'allow_null' => 0,
                'post_type' => [
                    0 => 'post',
                    1 => 'page',
                    2 => 'room',
                    3 => 'event'
                ]
            ]
        ));

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array()) {

        $html = '
          <div class="cta-item ' . $args['ctaClass'] . '">';

        // we use this to determine if the CTAs are shown in a column that
        // is full width on Desktop devices. We need to know this as it
        // allows us to tailor the crop/image styles used
        $containerFullWidth = false;
        if(isset($args['containerFullWidth'])) {
            $containerFullWidth = $args['containerFullWidth'];
        }

        $image = $this->get_field('cta_image');
        $caption = $this->get_field('cta_title');
        $linkObjectId = $this->get_field('cta_link');
        $linkUrl = '';

        if (!empty($linkObjectId)) {
            $linkUrl = get_the_permalink($linkObjectId);
        }


        $alt = get_post_meta($image, '_wp_attachment_image_alt', true);
        $imageSrc = '';
        $imageSrcRetina = '';
        $imageUrls = array();

        if($containerFullWidth == true) {
            $imageUrls['imageSrcFull'] = wp_get_attachment_image_url($image, 'cta-full--wide');
            $imageUrls['imageSrcFullRetina'] = wp_get_attachment_image_url($image, 'cta-full-retina--wide');

            $imageUrls['imageSrcHalf'] = wp_get_attachment_image_url($image, 'cta-half--wide');
            $imageUrls['imageSrcHalfRetina'] = wp_get_attachment_image_url($image, 'cta-half-retina--wide');

            $imageUrls['imageSrcThird'] = wp_get_attachment_image_url($image, 'cta-third--wide');
            $imageUrls['imageSrcThirdRetina'] = wp_get_attachment_image_url($image, 'cta-third-retina--wide');
        } else {
            $imageUrls['imageSrcFull'] = wp_get_attachment_image_url($image, 'cta-full');
            $imageUrls['imageSrcFullRetina'] = wp_get_attachment_image_url($image, 'cta-full-retina');

            $imageUrls['imageSrcHalf'] = wp_get_attachment_image_url($image, 'cta-half');
            $imageUrls['imageSrcHalfRetina'] = wp_get_attachment_image_url($image, 'cta-half-retina');

            $imageUrls['imageSrcThird'] = wp_get_attachment_image_url($image, 'cta-third');
            $imageUrls['imageSrcThirdRetina'] = wp_get_attachment_image_url($image, 'cta-third-retina');
        }

        if($args['ctaSize'] == 'full') {
            $imageSrc = $imageUrls['imageSrcFull'];
            $imageSrcRetina = $imageUrls['imageSrcFullRetina'];
        } elseif($args['ctaSize'] == 'half') {
            $imageSrc = $imageUrls['imageSrcHalf'];
            $imageSrcRetina = $imageUrls['imageSrcHalfRetina'];
        } elseif($args['ctaSize'] == 'third') {
            $imageSrc = $imageUrls['imageSrcThird'];
            $imageSrcRetina = $imageUrls['imageSrcThirdRetina'];
        }


        if(!empty($caption)) {
            $html .= '<div class="cta-item__picture-wrapper"><picture>';
            $html .= "<source media='(min-width: 1040px)' srcset='$imageSrcRetina 2x, $imageSrc 1x' />";
            $html .= "<source media='(min-width: 480px) and (max-width: 1040px)' srcset='".$imageUrls['imageSrcFullRetina']." 2x, ".$imageUrls['imageSrcFull']." 1x' />";
            $html .= "<source media='(max-width: 480px)' srcset='".$imageUrls['imageSrcHalfRetina']." 2x, ".$imageUrls['imageSrcHalf']." 1x' />";
            $html .= '<img class="cta-item__image" src="' . $imageSrc . '" alt="' . $alt . '" />';
            $html .= '</picture></div>';
            $html .= '<a href="'. $linkUrl .'" class="cta-item__link"><span>' . $caption . '</span></a>';
        }


        $html .= '
          </div>
        ';

        return $html;

    }

}
