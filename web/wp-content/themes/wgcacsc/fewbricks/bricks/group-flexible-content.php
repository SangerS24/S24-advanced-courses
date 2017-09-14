<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;
use fewbricks\acf\layout;

/**
 * Class flexible_content
 * @package fewbricks\bricks
 */
class group_flexible_content extends project_brick
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

        $fc = new acf_fields\flexible_content('Sections', 'rows', '150814262016a', [
            'button_label' => 'Add Component'
        ]);

        //wysiwyg
        $l = new layout('', 'l7', '050420161834a');
        $l->add_brick(new component_content('content_component', '050420161834b'));
        $fc->add_layout($l);

        //carousel/image
        $l = new layout('', 'l2', '2509111555a');
        $l->add_brick(new component_image_list('image_list_component', '2509111556x'));
        $fc->add_layout($l);

        //video
        $l = new layout('', 'l6', '050420161617a');
        $l->add_brick(new component_video('video_component', '050420161617b'));
        $fc->add_layout($l);

        //download
        $l = new layout('', 'l8', '060420161448a');
        $l->add_brick(new component_download('download_component', '060420161448b'));
        $fc->add_layout($l);

        //download list
        $l = new layout('', 'l20', '201709141428a');
        $l->add_brick(new component_download_list('download_list_component', '201709141428b'));
        $fc->add_layout($l);

        //collapsibles
        $l = new layout('', 'l12', '201707141515a');
        $l->add_brick(new component_collapsibles('collapsibles_component', '201707141515a'));
        $fc->add_layout($l);

        //bios
        $l = new layout('', 'l11', '201707141707a');
        $l->add_brick(new component_bio('bio_component', '201707141708a'));
        $fc->add_layout($l);

        //testimonial
        $l = new layout('', 'l5', '050420161614a');
        $l->add_brick(new component_testimonial('testimonial_component', '050420161614b'));
        $fc->add_layout($l);

        //map
        $l = new layout('', 'l9', '150820161509a');
        $l->add_brick(new component_map('map_component', '150820161456a'));
        $fc->add_layout($l);

        //CTA
        $l = new layout('', 'l3', '050420151601c');
        $l->add_brick(new component_cta_list('cta_list_component', '050420151601d'));
        $fc->add_layout($l);

        //Teasers
        $l = new layout('', 'l15', '201707181535a');
        $l->add_brick(new component_teasers('teasers_component', '201707181535b'));
        $fc->add_layout($l);

        //sponsors
        $l = new layout('', 'l14', '201707171023a');
        $l->add_brick(new component_sponsors('sponsors_component', '201707171023b'));
        $fc->add_layout($l);

        //newsletter
        $l = new layout('', 'l13', '201707151607a');
        $l->add_brick(new component_newsletter('newsletter_component', '201707151607b'));
        $fc->add_layout($l);

        $this->add_flexible_content($fc);

    }


    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {

        $html = '';

        while ($this->have_rows('rows', $this->get_post_id_to_get_field_from() ) ) {

            $this->the_row();

            $html .= acf_fields\flexible_content::get_sub_field_brick_instance()->get_html();

        }

        return $html;

    }

}
