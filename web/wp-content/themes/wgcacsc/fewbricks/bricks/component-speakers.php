<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class map
 * @package fewbricks\bricks
 */
class component_speakers extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Speakers list';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_repeater( (new acf_fields\repeater( 'Speakers' , 'speakers' , '201708301310a' , [
            'button_label' => 'Add speaker'
        ] ))
        ->add_sub_field( new acf_fields\image( 'Picture' , 'picture' , '201708301310b' ) )
        ->add_sub_field( new acf_fields\text( 'Name' , 'name' , '201708301310c'))
        ->add_sub_field( new acf_fields\text( 'Role/Institute' , 'role' , '201708301310d'))
        ->add_sub_field( new acf_fields\url( 'Link to full profile' , 'profile_url' , '201708301310e')));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        $html = '';

//        $bios = $this->get_field('staff_bios');

        if( $this->have_rows( 'speakers' ) ) {
            $html .= '<div class="component component-speakers">';

            while ( $this->have_rows( 'speakers' ) ) {
                $this->the_row();

                $staff_picture = $this->get_field_in_repeater( 'speakers' , 'picture');
                if ( !empty($staff_picture) ) {
                    $staff_picture_src_array = wp_get_attachment_image_src( $staff_picture , 'bio-listing' );
                    $staff_picture_src = $staff_picture_src_array[0];
                } else {
                    $staff_picture_src = get_template_directory_uri().'/assets/images/headshot_placeholder.svg';
                }
                $staff_name = $this->get_field_in_repeater( 'speakers' , 'name' );
                $staff_title = $this->get_field_in_repeater( 'speakers' , 'role' );
                $staff_url = $this->get_field_in_repeater( 'speakers' , 'profile_url') ;

                $html .= '<div class="component-speakers__speaker small-6 medium-4 large-3 columns">';

                $html .= '<img src="'.$staff_picture_src.'" alt="'.$staff_name.'" />';
                $html .= '<p>';
                if ( !empty($staff_url ) ) {
                    $html .= '<a href="'.$staff_url.'" target="_blank">'.$staff_name.'</a>';
                } else {
                    $html .= $staff_name;
                }
                if ( !empty($staff_title ) ) {
                    $html .= '<br />'.$staff_title;
                }
                $html .= '</p>';
                $html .='</div>';

            }


            $html .= '</div>';
        }


        return $html;

    }

}
?>