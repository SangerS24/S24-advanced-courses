<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class text_and_content
 * @package fewbricks\bricks
 */
class component_download_slim extends project_brick
{

	/**
	 * @var string This will be the default label showing up in the editor area for the administrator.
	 * It can be overridden by passing an item with the key "label" in the array that is the second argument when
	 * creating a brick.
	 */
	protected $label = 'Download (Slim)';

	/**
	 * This is where all the fields for the brick will be set-
	 */
	public function set_fields()
	{

		$this->add_field((new acf_fields\text('File title', 'download_title', '201807021526a')));
		$this->add_field((new acf_fields\file('File', 'download_file', '201807021526b')));

	}

	/**
	 * @return string|void
	 */
	public function get_brick_html($args = array())
	{

//		$file_heading =  $this->get_field("download_heading") ;
//		$file_content =  $this->get_field("download_content") ;
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

		$html = '<div class="component-download--slim offset-content">';
		$html .= '<p><a class="component-download--slim__link" href="' . $file_url . '"><span class="">'.$file_title.'</span> ';
		$html .= '<span class="">('. $filesize .')</span><span class="visuallyhidden"> Will open in a new window</span></p>';
		$html .= '</a>';
		$html .= '</div>';


		return $html;

	}

}
