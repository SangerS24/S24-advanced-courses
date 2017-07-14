<?php

function format_search_form($form) {

    $query = get_search_query();
    if(!empty($query)) {
        $form = str_replace('value=""', 'value="'.$query.'"', $form);
    }

    return $form;

}

add_filter( 'get_search_form', 'format_search_form' );


/**
 * Set the Yoast box to display at the bottom of the page/post edit page
 *
 * @return string
 */
function yoast_to_bottom() {
    return 'low';
}

//add_filter( 'wpseo_metabox_prio', 'yoasttobottom');

add_filter( 'wpcf7_support_html5_fallback', '__return_true' );


// remove the comments page from the Wordpress admin as we aren't using it
add_action( 'admin_menu', 'remove_comments_admin_page' );
function remove_comments_admin_page() {
    remove_menu_page( 'edit-comments.php' );
}

/**
 * @param $title
 * @return string|void
 *
 * Remove the prefix from archive pages, e.g. the category page title by default is:
 * Category: name of category
 *
 * This function gets rid of the 'Category:' part
 */
function custom_archive_title($title) {
    if ( is_category() ) {
        $title = single_cat_title( '', false );
    } elseif ( is_tag() ) {
        $title = single_tag_title( '', false );
    } elseif ( is_author() ) {
        $title = '<span class="vcard">' . get_the_author() . '</span>';
    } elseif ( is_post_type_archive() ) {
        $title = post_type_archive_title( '', false );
    } elseif ( is_tax() ) {
        $title = single_term_title( '', false );
    }

    return $title;
}
add_filter( 'get_the_archive_title', 'custom_archive_title' );


// when a news item/event is updated, we need to add the event_date if one exists, or if not the publish date
// to the post meta table, this is so we have one unified field we can use to sort these posts on
function wgcacsc_add_post_date( $post_id ) {

    $postType = get_post_type();

    if($postType == 'post') {

        $postId = get_the_ID();
        $sortDate = '';
        $eventCustomDate = get_field('event_date');
        if (!empty($eventCustomDate)) {
            $sortDate = $eventCustomDate;
        } else {
            $sortDate = get_the_date();
            $sortDate = date('Ymd', strtotime($sortDate));
        }

        if (!add_post_meta($postId, 'post_sort_date', $sortDate, true)) {
            update_post_meta($postId, 'post_sort_date', $sortDate);
        }

    }
}
add_action( 'save_post', 'wgcacsc_add_post_date' );

// don't load the Contact Form 7 JS and CSS on all pages
add_filter( 'wpcf7_load_js', '__return_false' );
add_filter( 'wpcf7_load_css', '__return_false' );


function wgcacsc_sort_archive($query) {
    $postType = get_query_var('post_type');
    if(!is_admin() && ($postType != 'client') && ($query->is_archive() || $query->category())) {
        $query->set('meta_key', 'post_sort_date');
        $query->set('orderby', 'meta_value');
        $query->set('order', 'DESC');
    }

    if(!is_admin() && $postType == 'client') {
        $query->set('orderby', 'title');
        $query->set('order', 'ASC');
        $query->set('posts_per_page', 100);
    }
}
add_action('pre_get_posts', 'wgcacsc_sort_archive');


function wgcacsc_add_cookie_compliance_message() {
    // output the cookie message
    echo '<div id="cookie-message"><div class="row" id="cookie-message__inner"><p>We use cookies to ensure we give you the best experience on our website. If you continue, we\'ll assume that you are happy to receive all cookies. Please refer to our <a href="/cookies-policy/">Cookies Policy</a> for more information, including how to disable them.</p></div></div>';

    // add a class to the body if javascript is enabled
    echo '<script>/* Detect JS support*/ document.body.className = document.body.className + " js_enabled";</script>';

    wp_enqueue_script( 'cookie-message', get_template_directory_uri() . '/assets/javascript/custom/cookie-message.js', array(), '1.0', true );
}
add_action('foundationpress_after_body', 'wgcacsc_add_cookie_compliance_message');


function wgcacsc_add_tracking_code() {
    if(defined('ADDITIONAL_TRACKER_JS')) {
        echo ADDITIONAL_TRACKER_JS;
    }
}
add_action('foundationpress_before_closing_body', 'wgcacsc_add_tracking_code');

//Change default TinyMCE
function my_format_TinyMCE( $in ) {
//    $in['remove_linebreaks'] = false;
//    $in['gecko_spellcheck'] = false;
//    $in['keep_styles'] = true;
//    $in['accessibility_focus'] = true;
//    $in['tabfocus_elements'] = 'major-publishing-actions';
//    $in['media_strict'] = false;
//    $in['paste_remove_styles'] = false;
//    $in['paste_remove_spans'] = false;
//    $in['paste_strip_class_attributes'] = 'none';
//    $in['paste_text_use_dialog'] = true;
//    $in['wpeditimage_disable_captions'] = true;
//    $in['plugins'] = 'tabfocus,paste,media,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpfullscreen';
//    $in['content_css'] = get_template_directory_uri() . "/editor-style.css";
//    $in['wpautop'] = true;
//    $in['apply_source_formatting'] = false;
//    $in['block_formats'] = "Paragraph=p; Heading 2=h2;Heading 3=h3; Heading 4=h4";
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
