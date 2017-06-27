<?php

function wgccc_format_editor($settings) {

    $style_formats = array(
        array(
            'title' => 'Header 2',
            'block' => 'h2',
            'classes' => 'h2'
        ),
        array(
            'title' => 'Header 3',
            'block' => 'h3',
            'classes' => 'h3'
        ),
        array(
            'title' => 'Header 4',
            'block' => 'h4',
            'classes' => 'h4'
        ),
        array(
            'title' => 'Header 5',
            'block' => 'h5',
            'classes' => 'h5'
        ),
        array(
            'title' => 'Header 6',
            'block' => 'h6',
            'classes' => 'h6'
        )
    );

    $settings['style_formats'] = json_encode($style_formats);

    return $settings;

}

add_filter( 'tiny_mce_before_init' , 'wgccc_format_editor'  );

//add_filter( 'acf/fields/wysiwyg/toolbars' , 'wgccc_format_editor'  );
