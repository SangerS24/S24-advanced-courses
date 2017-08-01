<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_clients
 * @package fewbricks\bricks
 */
class component_sponsors_side extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'In association with';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('Title', 'title', '201707311452a', [
            'default_value' => 'In association with:'
        ]));

        $this->add_repeater(( new acf_fields\repeater( 'Sponsors' , 'sponsors' , '201707311452b' , [
            'button_label' => 'Add sponsor'
        ]) )

        ->add_sub_field(new acf_fields\image( 'Logo' , 'logo' , '201707311452c') )
        ->add_sub_field(new acf_fields\text( 'Name' , 'name' , '201707311452d') )
        ->add_sub_field(new acf_fields\text( 'Link' , 'link' , '201707311452e') , [
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

        if ( !empty($component_title) && $this->have_rows( 'sponsors', $this->get_post_id_to_get_field_from() ) ) {
            $html .= '<div class="component component-sponsors">';

            if ( !empty($component_title) ) {
                $html .= '<h6>'.$component_title.'</h6>';
            }

            $html .= '<ol class="clients-list row">';

            while ( $this->have_rows( 'sponsors', $this->get_post_id_to_get_field_from() ) ) {
                $this->the_row();

                $name = $this->get_field_in_repeater( 'sponsors' , 'name' );
                $link = $this->get_field_in_repeater( 'sponsors' , 'link' );
                $image = $this->get_field_in_repeater( 'sponsors' , 'logo' );
                if ( $image ) {
                    $image_src = wp_get_attachment_image_src( $image , 'client-logo--small' );
                    $image = '<img src="'.$image_src[0].'" alt="Logo for '.$name.'" />';
                }

                $html .= '<li class="client-item '.( (empty($link)) ? 'client-item__inner': '' ).' ">';
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
