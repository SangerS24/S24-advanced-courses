<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class map
 * @package fewbricks\bricks
 */
class component_bio extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Staff bios';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_repeater( (new acf_fields\repeater( 'Staff bios' , 'staff_bios' , '201707151148' , [
            'button_label' => 'Add staff'
        ] ))
        ->add_sub_field( new acf_fields\image( 'Picture' , 'picture' , '201707141713a' ) )
        ->add_sub_field( new acf_fields\text( 'Name' , 'name' , '201707141714a'))
        ->add_sub_field( new acf_fields\text( 'Job title' , 'job_title' , '201707141715a'))
        ->add_sub_field( new acf_fields\wysiwyg( 'Bio' , 'bio' , '201707141715b' , [
            'toolbar' => 'basic'
        ])));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        $html = '';

//        $bios = $this->get_field('staff_bios');

        if( $this->have_rows( 'staff_bios', $this->get_post_id_to_get_field_from() ) ) {
            $html .= '<div class="component component-bio offset-content">';

            while ( $this->have_rows( 'staff_bios', $this->get_post_id_to_get_field_from() ) ) {
                $this->the_row();

                $staff_picture = $this->get_field_in_repeater( 'staff_bios' , 'picture');
                if ( !empty($staff_picture) ) {
                    $staff_picture_src_array = wp_get_attachment_image_src( $staff_picture , 'bio-listing' );
                    $staff_picture_src = $staff_picture_src_array[0];
                } else {
                    $staff_picture_src = get_template_directory_uri().'/assets/images/headshot_placeholder.svg';
                }
                $staff_name = $this->get_field_in_repeater( 'staff_bios' , 'name' );
                $staff_title = $this->get_field_in_repeater( 'staff_bios' , 'job_title' );
                $staff_bio = apply_filters( 'the_content' , $this->get_field_in_repeater( 'staff_bios' , 'bio') );

                $html .= '<div class="component-bio__staff">';

                $html .= '<div class="component-bio__staff__name-title">';
                if ( !empty( $staff_name) ) {
                    $html .= '<h4>'.$staff_name.'</h4>';
                }
                if ( !empty( $staff_title ) ) {
                    $html .= '<p class="component-bio__staff__job-title">'.$staff_title.'</p>';
                }
                $html .= '</div>';

                $html .= '<div class="component-bio__staff__picture"><img src="'.$staff_picture_src.'" alt="'.$staff_name.'" /></div>';

                $html .= '<div class="component-bio__staff__bio">';
                if ( !empty( $staff_bio ) ) {
                    $html .= $staff_bio;

                }
                $html .= '</div>';
                $html .= '</div>';
            }


            $html .= '</div>';
        }


        return $html;

    }

}
?>