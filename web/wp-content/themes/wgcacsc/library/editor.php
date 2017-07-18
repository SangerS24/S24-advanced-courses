<?php

//Change default TinyMCE
function my_format_TinyMCE( $in ) {

    $in['block_formats'] = 'Paragraph=p;Heading 1=h1;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6';
    $in['toolbar1'] = 'bold,italic,link,unlink, undo, redo';
    $in['toolbar2'] = '';
    $in['toolbar3'] = '';
    $in['toolbar4'] = '';
    return $in;
}
add_filter( 'tiny_mce_before_init', 'my_format_TinyMCE' );

function enable_more_buttons($buttons) {

    $buttons[] = 'table';

    return $buttons;

}
add_filter('mce_buttons_3', 'enable_more_buttons');

add_filter( 'acf/fields/wysiwyg/toolbars' , 's24_toolbars'  );
function s24_toolbars( $toolbars )
{

    // Add a new toolbar called "Very Simple"
    // - this toolbar has only 1 row of buttons
    $toolbars['Full' ] = array();
    $toolbars['Full' ][1] = array('bold' , 'italic' , 'bullist', 'ctplist', 'numlist' , 'hr', 'link', 'unlink', 'wp_adv' );
    $toolbars['Full'][2] = array( 'formatselect' ,  'table' , 'undo' , 'redo');

    // remove the 'Basic' toolbar completely
    $toolbars['Basic' ] = array();
    $toolbars['Basic'][1] = array( 'bold' , 'italic', 'link' , 'unlink');

    // return $toolbars - IMPORTANT!
    return $toolbars;
}
