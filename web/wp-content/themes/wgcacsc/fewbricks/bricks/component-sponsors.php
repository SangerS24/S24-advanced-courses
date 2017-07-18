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

        $this->add_repeater(( new acf_fields\repeater( 'Sponsors' , 'sponsors' , '201707181026a' , [
            'button_label' => 'Add sponsor'
        ]) )

        ->add_sub_field(new acf_fields\image( 'Logo' , 'logo' , '201707181026b') )
        ->add_sub_field(new acf_fields\text( 'Name' , 'name' , '201707181026c') )
        ->add_sub_field(new acf_fields\text( 'Link' , 'link' , '201707181026d') , [
            'instructions' => 'Full URL starting with http://'
        ] ) );

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {

        $html = '';

        $component_title = $this->get_field( 'title' );

        if ( !empty($component_title) && $this->have_rows( 'sponsors' ) ) {
            $html .= '<div class="component component-sponsors">';

            if ( !empty($component_title) ) {
                $html .= '<h3 class="section-heading section-heading--centered">'.$component_title.'</h3>';
            }

            $html .= '<ol class="clients-list row">';

            while ( $this->have_rows( 'sponsors' ) ) {
                $this->the_row();

                $name = $this->get_field_in_repeater( 'sponsors' , 'name' );
                $link = $this->get_field_in_repeater( 'sponsors' , 'link' );
                $image = $this->get_field_in_repeater( 'sponsors' , 'logo' );
                if ( $image ) {
                    $image_src = wp_get_attachment_image_src( $image , 'client-logo--small' );
                    $image = '<img src="'.$image_src[0].'" alt="Logo for '.$name.'" />';
                }

                $html .= '<li class="client-item small-6 medium-3 large-2 columns '.( (empty($link)) ? 'client-item__inner': '' ).' ">';
                if ( !empty($link) ) {
                    $html .= '<a class="client-item__inner" href="' . $link . '">'.$image.'</a>';
                } else {
                    $html .= $image;
                }

                $html .= '</li>';
            }

            $html .= '</ol>';

            $html .= '</div>';
        }

        return $html;

    }

}
