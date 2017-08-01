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


//function wgcacsc_sort_archive($query) {
//    $postType = get_query_var('post_type');
//    if(!is_admin() && ($postType != 'client') && ($query->is_archive() || $query->category())) {
//        $query->set('meta_key', 'post_sort_date');
//        $query->set('orderby', 'meta_value');
//        $query->set('order', 'DESC');
//    }
//
//    if(!is_admin() && $postType == 'client') {
//        $query->set('orderby', 'title');
//        $query->set('order', 'ASC');
//        $query->set('posts_per_page', 100);
//    }
//}
//add_action('pre_get_posts', 'wgcacsc_sort_archive');


//function wgcacsc_add_cookie_compliance_message() {
//    // output the cookie message
//    echo '<div id="cookie-message"><div class="row" id="cookie-message__inner"><p>We use cookies to ensure we give you the best experience on our website. If you continue, we\'ll assume that you are happy to receive all cookies. Please refer to our <a href="/cookies-policy/">Cookies Policy</a> for more information, including how to disable them.</p></div></div>';
//
//    // add a class to the body if javascript is enabled
//    echo '<script>/* Detect JS support*/ document.body.className = document.body.className + " js_enabled";</script>';
//
//    wp_enqueue_script( 'cookie-message', get_template_directory_uri() . '/assets/javascript/custom/cookie-message.js', array(), '1.0', true );
//}
//add_action('foundationpress_after_body', 'wgcacsc_add_cookie_compliance_message');


function wgcacsc_add_tracking_code() {
    if(defined('ADDITIONAL_TRACKER_JS')) {
        echo ADDITIONAL_TRACKER_JS;
    }
}
add_action('foundationpress_before_closing_body', 'wgcacsc_add_tracking_code');

//returns event start and end date as single string
function wgcacsc_get_event_dates( $event_id ) {
    $start_date = get_field( 'start_date' , $event_id );

    $end_date = get_field( 'end_date' , $event_id );

    //no dates entered (no start date to be strict)
    if (empty( $start_date )) {
        return '';
    }

    $start_date = date_create_from_format( 'Ymd' , $start_date );

    //start date but no end date
    if ( empty( $end_date ) ) {
        return $start_date->format('d F Y');
    }

    $end_date = date_create_from_format( 'Ymd' , $end_date );
    //starts and ends in different years
    if ( $start_date->format('Y' ) != $end_date->format( 'Y' ) ) {
        return $start_date->format( 'd F Y' ).' - '.$end_date->format( 'd F Y' );
    }

    //starts and ends in different months
    if ( $start_date->format('Ym' ) != $end_date->format( 'Ym' ) ) {
        return $start_date->format( 'd F' ).' - '.$end_date->format( 'd F Y' );
    }

    //starts and ends in same month

    return $start_date->format('d' ).' - '.$end_date->format( 'd F Y' );
}

//returns array of deadlines or false if no deadlines
function wgcacsc_get_deadlines( $event_id ) {
    $deadlines = get_field( 'deadlines' , $event_id );

    if ( empty( $deadlines ) ) {
        return false;
    }

    //array of 'filtered' deadlines - contain only deadline label and value (which can be a formatted date or 'closed')
    $deadlines_array = array();

    foreach ($deadlines as $deadline) {

        $temp_deadline = array();

        $temp_deadline['label'] = $deadline['deadlines_name'];

        if ( !empty( $deadline['deadlines_closed'] ) && in_array( 'closed' , $deadline['deadlines_closed'] ) ) {
            $temp_deadline['value'] = 'Closed';
        } elseif ( $deadline['deadlines_date'] < date( 'Ymd' ) ) {
            $temp_deadline['value'] = 'Closed';
        } elseif ( !empty($deadline['deadlines_date'] ) ) {
            $temp_deadline['value'] = date_create_from_format( 'Ymd' , $deadline['deadlines_date'] );
            $temp_deadline['value'] = $temp_deadline['value']->format( 'd F Y' );
        }

        //only add the deadline if the date exists
        if ( isset( $temp_deadline['value'] ) ) {
            array_push( $deadlines_array , $temp_deadline );
        }
    }

    return $deadlines_array;
}

//return html list of deadlines
function  wgcacsc_output_deadlines( $deadlines_array ) {
    if ( empty( $deadlines_array ) ) {
        return '';
    }

    $deadlines_html = '<div class="event-deadlines"><h6>Deadlines: </h6><ul>';

    foreach ( $deadlines_array as $deadline ) {
        $deadlines_html .= '<li><span class="event-deadlines__label">'.$deadline['label'].'</span> <span class="event-deadlines__date">'.$deadline['value'].'</span></li>';
    }

    $deadlines_html .= '</ul></div>';

    return $deadlines_html;
}

//returns register button or placeolder text
function wgcacsc_register_button( $event_id ) {
    $registration_link = get_field( 'registration_link' , $event_id );

    if ( !empty( $registration_link ) ) {
        return '<a class="button event-register-button" href="'.$registration_link.'" target="_blank">Register</a>';
    }

    $registration_link_alternative = get_field( 'registration_button_replacement' , $event_id );

    if ( !empty($registration_link_alternative) ) {
        return '<p>'.$registration_link_alternative.'</p>';
    }
}

//returns single event download
function wgcacsc_get_programme_download( $event_id ) {

    $download_file_id = get_field( 'event_download_file' , $event_id );

    if ( empty($download_file_id) ) {
        return '';
    }
    $download_file_url = wp_get_attachment_url($download_file_id);

    $download_file_title = get_field( 'event_download_label' , $event_id );
    $download_file_title = ( !empty($download_file_title) ) ? $download_file_title : get_the_title( $download_file_id );

    $download_html = '<div class="component component-download offset-content">';
    $download_html .= '<a class="component-download__link" href="'.$download_file_url.'"><span class="component-download__title">'.$download_file_title.'</span></a>';
    $download_html .= '</div>';

    return $download_html;
}

//returns html of 'questions' section of single event page
function wgcacsc_get_questions_section( $event_id ) {
    $section_content = apply_filters( 'the_content' , get_field( 'side_question_content' , $event_id ) );

    if ( empty($section_content) ) {
        return;
    }

    $section_title = get_field( 'side_questions_title' , $event_id );

    $section_html = '<div class="event-side-block__section">';
    if ( !empty($section_title) ) {
        $section_html .= '<h6 class="event-questions__title">'.$section_title.'</h6>';
    }
    $section_html .= $section_content.'</div>';

    return $section_html;
}