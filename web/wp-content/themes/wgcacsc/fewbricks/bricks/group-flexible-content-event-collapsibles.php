<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;
use fewbricks\acf\layout;

/**
 * Class flexible_content
 * @package fewbricks\bricks
 */
class group_flexible_content_event_collapsibles extends project_brick
{

    /**
     * @var string
     */
    protected $label = 'Flexible Content';

    /**
     *
     */
    public function set_fields()
    {

        $fc = new acf_fields\flexible_content('Sections', 'rows', '201707311430a', [
            'button_label' => 'Add Component'
        ]);

        //wysiwyg
        $l = new layout('', 'l7', '201707311430b');
        $l->add_brick(new component_content('content_component', '201707311430c'));
        $fc->add_layout($l);

        //carousel/image
        $l = new layout('', 'l2', '201707311430d');
        $l->add_brick(new component_image_list('image_list_component', '201707311430e'));
        $fc->add_layout($l);

        //video
        $l = new layout('', 'l6', '201707311430f');
        $l->add_brick(new component_video('video_component', '201707311430g'));
        $fc->add_layout($l);

        //download
        $l = new layout('', 'l8', '201707311430h');
        $l->add_brick(new component_download('download_component', '201707311430i'));
        $fc->add_layout($l);

        //bios
        $l = new layout('', 'l11', '201707311430j');
        $l->add_brick(new component_bio('bio_component', '201707311430k'));
        $fc->add_layout($l);

        //testimonial
        $l = new layout('', 'l5', '201707311430l');
        $l->add_brick(new component_testimonial('testimonial_component', '201707311430m'));
        $fc->add_layout($l);

        //map
        $l = new layout('', 'l9', '201707311430n');
        $l->add_brick(new component_map('map_component', '201707311430o'));
        $fc->add_layout($l);

        //sponsors
        $l = new layout('', 'l14', '201707311430p');
        $l->add_brick(new component_sponsors('sponsors_component', '201707311430q'));
        $fc->add_layout($l);

        $this->add_flexible_content($fc);

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {
        $html = '';

        while ($this->have_rows('rows', $this->get_post_id_to_get_field_from()) ) {

            $this->the_row();

            $html .= acf_fields\flexible_content::get_sub_field_brick_instance()->get_html();

        }

        return $html;

    }

}
