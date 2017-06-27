<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class text_and_content
 * @package fewbricks\bricks
 */
class component_360 extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = '360';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('360 Title', 'panorama_title', '150920161519a', [
            'instructions' => 'An optional heading that would appear centered above the 360 panorama'
        ]));


        $this->add_field(new acf_fields\select('360 To Display', 'selection_360', '150920161343a',
            [
                'allow_null' => 0,
                'choices' => [
                    'auditorium' => 'Auditorium',
                    'orchard' => 'Orchard',
                    'roundabout' => 'Roundabout',
                    'zebra_crossing' => 'Zebra Crossing',
                ]
            ]
        ));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        wp_enqueue_script('pano2vr', get_template_directory_uri() . '/assets/javascript/pano2vr_player.js', array('jquery'), '2.6.1', false);

        $title = $this->get_field('panorama_title');

        $panoramaToShow = $this->get_field('selection_360');
        $panoramaLocation = '';
        if($panoramaToShow == 'auditorium') {

            $panoramaLocation = '/360s/auditorium_2/Auditorium_2.xml';

        } elseif ($panoramaToShow == 'orchard') {

            $panoramaLocation = '/360s/orchard/Orchard02_out.xml';

        } elseif ($panoramaToShow == 'roundabout') {

            $panoramaLocation = '/360s/roundabout_1/Roundabout_1.xml';

        } elseif ($panoramaToShow == 'zebra_crossing') {

            $panoramaLocation = '/360s/zebra_crossing/Zebra Crossing_out.xml';

        }

        $html = '<div class="component component-360">';

        if(!empty($title)) {
            $html .= '<h2 class="section-heading section-heading--centered">'. $title .'</h2>';
        }

        $html .= '
            <div id="container-' . $panoramaToShow . '" class="container-360"></div>
            <script type="text/javascript">
                function hideUrlBar() {
                }
                
                $(document).ready(function() {
                    // create the panorama player with the container
                    pano=new pano2vrPlayer("container-' . $panoramaToShow . '");
                    pano.readConfigUrl("' . $panoramaLocation . '");
                    // hide the URL bar on the iPhone
                    setTimeout(function() { hideUrlBar(); }, 10);
                });
            </script>';

        $html .= '</div>';

        return $html;

    }

}
