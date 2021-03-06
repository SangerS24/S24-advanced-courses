<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class text_and_content
 * @package fewbricks\bricks
 */
class component_download extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Download';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

	    $this->add_field((new acf_fields\text('Heading', 'download_heading', '201806201029b')));
	    $this->add_field((new acf_fields\wysiwyg('Content', 'download_content', '201806201029a')));
        $this->add_field((new acf_fields\text('File title', 'download_title', '050420151822b')));
        $this->add_field((new acf_fields\file('File', 'download_file', '050420151822f')));
        $this->add_field(new acf_fields\image( 'Thumbnail' , 'thumbnail' , '201707181349a' , [
            'instructions' => 'Optional'
        ]));

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {

	    $file_heading =  $this->get_field("download_heading") ;
	    $file_content =  $this->get_field("download_content") ;
        $file_title =  $this->get_field("download_title") ;
        $file_id = $this->get_field('download_file');
        $file_url = '';

        if (!empty($file_id)) {

            $file_url = wp_get_attachment_url($file_id);
            $filesize = filesize(get_attached_file($file_id));
            $filesize = size_format($filesize, 1);

            // KB sizes don't need a decimal place
            $sizeMeasure = substr($filesize, -2);
            if($sizeMeasure == 'KB') {
                $filesize = substr($filesize, 0, -5);
                $filesize .= ' KB';
            }

        }

        $file_image = $this->get_field( 'thumbnail' );
        if ( !empty( $file_image ) ) {
            $file_image_src = wp_get_attachment_image_src( $file_image , 'download-thumbnail' );
        }

        $html = '<div data-equalizer-watch="front-newsletter-and-download" class="component component-download --offset-content '.( ( !empty($file_image) ) ? 'has-image' : '' ).'">';
        if ( !empty($file_image) ) {
	        $html .=  '<a href="' . $file_url . '" class="component-download__thumblink">';
            $html .= '<img src="'.$file_image_src[0].'" alt="'.$file_title.'" /></a>';
        }
        $html .= '<h5 class="component-download__heading">'.$file_heading.'</h5> ';
        $html .= '<div class="component-download__content">'.$file_content.'</div> ';
	    $html .= '<p><a class="component-download__link" href="' . $file_url . '"><span class="component-download__title">'.$file_title.'</span> ';
        $html .= '<span class="component-download__size">('. $filesize .')</span></p>';
        $html .= '</a>';
        $html .= '</div>';


        return $html;

    }

}
