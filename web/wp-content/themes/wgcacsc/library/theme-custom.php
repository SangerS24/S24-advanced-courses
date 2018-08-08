<?php

function format_search_form( $form ) {

	$query = get_search_query();
	if ( ! empty( $query ) ) {
		$form = str_replace( 'value=""', 'value="' . $query . '"', $form );
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
 *
 * @return string|void
 *
 * Remove the prefix from archive pages, e.g. the category page title by default is:
 * Category: name of category
 *
 * This function gets rid of the 'Category:' part
 */
function custom_archive_title( $title ) {
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

	if ( $postType == 'post' ) {

		$postId          = get_the_ID();
		$sortDate        = '';
		$eventCustomDate = get_field( 'event_date' );
		if ( ! empty( $eventCustomDate ) ) {
			$sortDate = $eventCustomDate;
		} else {
			$sortDate = get_the_date();
			$sortDate = date( 'Ymd', strtotime( $sortDate ) );
		}

		if ( ! add_post_meta( $postId, 'post_sort_date', $sortDate, true ) ) {
			update_post_meta( $postId, 'post_sort_date', $sortDate );
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
	if ( defined( 'ADDITIONAL_TRACKER_JS' ) ) {
		echo ADDITIONAL_TRACKER_JS;
	}
}

add_action( 'foundationpress_before_closing_body', 'wgcacsc_add_tracking_code' );

//returns html of event thumbnail with 'new' and 'course type' flags
function wgcacsc_get_event_thumbnail( $event_id, $link_it = true ) {
	$event_thumbnail = get_the_post_thumbnail( $event_id, 'teaser-thumbnail' );
	$flagged_as_new  = ! empty( get_field( 'flag_new', $event_id ) );
	$course_type     = get_field( 'flag_course_type', $event_id );

	if ( empty( $event_thumbnail ) ) {
		return '';
	}

	$th_element = '<figure class="event-header__thumbnail">';

	if ( $link_it ) {
		$th_element .= '<a href="' . get_permalink( $event_id ) . '">';
	}
	if ( $flagged_as_new ) {
		$th_element .= '<span class="event-header__thumbnail__new-flag h5">New</span>';
	}
	$th_element .= $event_thumbnail;
	if ( $course_type != 'none' ) {
		$th_element .= '<img class="event-header__thumbnail__course-type event-header__thumbnail__course-type--' . $course_type . '" alt="This course type is ' . $course_type . '" src="' . get_template_directory_uri() . '/assets/images/course-type-' . $course_type . '.svg" />';
	}
	if ( $link_it ) {
		$th_element .= '</a>';
	}
	$th_element .= '</figure>';

	return $th_element;
}

//returns event start and end date as single string
function wgcacsc_get_event_dates( $event_id ) {
	$start_date = get_field( 'start_date', $event_id );

	$end_date = get_field( 'end_date', $event_id );

	//no dates entered (no start date to be strict)
	if ( empty( $start_date ) ) {
		return '';
	}

	$start_date = date_create_from_format( 'd/m/Y', $start_date );

	//start date but no end date
	if ( empty( $end_date ) ) {
		return $start_date->format( 'd F Y' );
	}

	$end_date = date_create_from_format( 'd/m/Y', $end_date );
	//starts and ends in different years
	if ( $start_date->format( 'Y' ) != $end_date->format( 'Y' ) ) {
		return $start_date->format( 'd F Y' ) . ' - ' . $end_date->format( 'd F Y' );
	}

	//starts and ends in different months
	if ( $start_date->format( 'Ym' ) != $end_date->format( 'Ym' ) ) {
		return $start_date->format( 'd F' ) . ' - ' . $end_date->format( 'd F Y' );
	}

	//starts and ends in same month

	return $start_date->format( 'd' ) . ' - ' . $end_date->format( 'd F Y' );
}


function wgcacsc_is_registration_open( $event_id ) {
    $deadlines = get_field( 'deadlines', $event_id );
    $is_registration_open = true;

    if ( !empty($deadlines) ) {
	    foreach ( $deadlines as $deadline ) {
		    if ( $deadline['deadlines_name'] === 'Registration deadline' && ( ! empty( $deadline['deadlines_date'] ) || ! empty( $deadline['deadlines_closed'] ) ) ) {
			    if ( ! empty( $deadline['deadlines_closed'] ) ) {
				    if ( $deadline['deadlines_closed'][0] == 'closed' ) {
					    $is_registration_open = false;
					    break;
				    }
			    }

			    $registration_deadline = DateTime::createFromFormat( 'd/m/Y', $deadline['deadlines_date'] );
			    $date_now              = new DateTime();

			    // set time to the same to ensure fair comparison
			    $registration_deadline->setTime( 0, 0 );
			    $date_now->setTime( 0, 0 );

			    // if the registration deadline is in the past, then registration is closed
			    if ( $date_now > $registration_deadline ) {
				    $is_registration_open = false;
			    }

		    }
	    }
    }

    return $is_registration_open;
}


//returns array of deadlines or false if no deadlines
//Format either 'expanded' = 'd F Y',  or 'short' = 'd M' and Y only if not this year
function wgcacsc_get_deadlines( $event_id, $format = 'expanded' ) {
	$deadlines = get_field( 'deadlines', $event_id );

	if ( empty( $deadlines ) ) {
		return false;
	}

	//array of 'filtered' deadlines - contain only deadline label and value (which can be a formatted date or 'closed')
	$deadlines_array = array();

	foreach ( $deadlines as $deadline ) {

		$temp_deadline = array();
		$temp_deadline['label'] = $deadline['deadlines_name'];

        $deadline_date = '';

        // reformat the dates using DateTime for more reliable results
        if(!empty($deadline['deadlines_date'])) {
            $deadline_date = DateTime::createFromFormat('d/m/Y', $deadline['deadlines_date']);
            $deadline_date->setTime(0, 0); // set time to the same to ensure fair comparison
        }
		$date_now      = new DateTime();
        $date_now->setTime(0,0); // set time to the same to ensure fair comparison


		if ( ! empty( $deadline['deadlines_closed'] ) && in_array( 'closed', $deadline['deadlines_closed'] ) ) {
			$temp_deadline['value'] = 'Closed';
		} elseif ( $deadline_date < $date_now ) {
			$temp_deadline['value'] = 'Closed';
		} elseif ( ! empty( $deadline['deadlines_date'] ) ) {
			$temp_deadline['value'] = $deadline_date;
			$date_format            = '';
			if ( $format == 'expanded' ) {
				$date_format = 'd F Y';
			} elseif ( ( $format == 'short' ) ) {
				$date_format = 'd M Y';
				if ( $temp_deadline['value']->format( 'Y' ) == date( 'Y' ) ) {
					$date_format = 'd M';
				}
			}
			$temp_deadline['value'] = $temp_deadline['value']->format( $date_format );
		}

		//only add the deadline if the date exists
		if ( isset( $temp_deadline['value'] ) ) {
			array_push( $deadlines_array, $temp_deadline );
		}
	}

	return $deadlines_array;
}

//return html list of deadlines
function wgcacsc_output_deadlines( $deadlines_array ) {
	if ( empty( $deadlines_array ) ) {
		return '';
	}

	$deadlines_html = '<div class="event-deadlines"><h6>Deadlines: </h6><ul>';

	foreach ( $deadlines_array as $deadline ) {
		$deadlines_html .= '<li><span class="event-deadlines__label">' . $deadline['label'] . '</span> <span class="event-deadlines__date">' . $deadline['value'] . '</span></li>';
	}

	$deadlines_html .= '</ul></div>';

	return $deadlines_html;
}

//returns register button or placeolder text
function wgcacsc_register_button( $event_id ) {

    // if registration is closed, then don't output the registration link
    if(wgcacsc_is_registration_open( $event_id ) === false) {
        return '';
    }

	$registration_link = get_field( 'registration_link', $event_id );

	if ( ! empty( $registration_link ) ) {
		$register_text = '';
		$event_cats    = wp_get_object_terms( $event_id, 'event-category' );

		if ( ! empty( $event_cats ) ) {
			$event_cats = array_filter( $event_cats, 'remove_past_events_cat' );
			if ( ! empty( $event_cats ) ) {
				$primary_cat = array_shift( $event_cats );
				switch ( $primary_cat->slug ) {
					case 'conferences':
						$register_text = 'Register';
						break;
					case 'courses':
						$register_text = 'Apply';
						break;
					case 'online-courses':
						$register_text = 'Join';
						break;
					case 'overseas-courses':
						$register_text = 'Apply';
						break;
					case 'retreats':
						$register_text = '';
						break;

					default:
						$register_text = 'Apply';
				}
			}
		}

		return '<a class="button event-register-button" href="' . $registration_link . '" target="_blank">' . $register_text . '</a>';
	}

	$registration_link_alternative = get_field( 'registration_button_replacement_adv', $event_id );

	if ( ! empty( $registration_link_alternative ) ) {
		return '<p>' . apply_filters( 'the_content', $registration_link_alternative ) . '</p>';
	}

	return '';
}

function remove_past_events_cat( $e_cat_object ) {
	return $e_cat_object->slug != 'past-events';
}

//returns single event download
function wgcacsc_get_programme_download( $event_id ) {

	$download_file_id = get_field( 'event_download_file', $event_id );

	if ( empty( $download_file_id ) ) {
		return '';
	}
	$download_file_url = wp_get_attachment_url( $download_file_id );

	$download_file_title = get_field( 'event_download_label', $event_id );
	$download_file_title = ( ! empty( $download_file_title ) ) ? $download_file_title : get_the_title( $download_file_id );

	$download_html = '<div class="component-download--slim offset-content">';
	$download_html .= '<p><a class="component-download--slim__link" href="' . $download_file_url . '"><span class="">' . $download_file_title . '</span><span class="visuallyhidden"> Will open in a new window</span></a></p>';
	$download_html .= '</div>';

	return $download_html;
}

//returns html of 'questions' section of single event page
function wgcacsc_get_questions_section( $event_id ) {

	// Get all fields
	$section_title         = get_field( 'side_questions_title', $event_id );
	$section_email         = get_field( 'side_question_email', $event_id );
	$section_email_subject = get_field( 'side_question_email_subject', $event_id );
	$section_phone         = get_field( 'side_question_phone', $event_id );
	$section_content       = apply_filters( 'the_content', get_field( 'side_question_content', $event_id ) );

	// If email is empty, return nothing
	if ( empty( $section_email ) ) {
		return;
	}

	$section_html = '<div class="event-side-block__section">';
	if ( ! empty( $section_title ) ) {
		$section_html .= '<h6 class="event-questions__title">' . $section_title . '</h6>';
	}
	if ( ! empty( $section_email ) ) {
		$section_html .= '<p><a href="mailto:' . $section_email . '?subject=' . rawurldecode( $section_email_subject ) . '">Email the organiser</a>';
	}
	if ( ! empty( $section_phone ) ) {
		$section_html .= '</br><a href="tel:' . $section_phone . '">' . $section_phone . '</a>';
	}
	if ( ! empty( $section_content ) ) {
		$section_html .= '</p>' . $section_content;
	}

	$section_html .= '</div>';

	return $section_html;
}

//returns html of share section of the single event page
function wgcacsc_get_share_section( $event_id ) {
	$hashtag = get_field( 'side_share_hashtag', $event_id );

	$share_html = '<div class="event-side-block__section">';
	if ( ! empty( $hashtag ) ) {
		$share_html .= '<p>Hashtag: ' . $hashtag . '</p>';
	}

	$share_url    = urlencode( get_permalink( $event_id ) );
	$share_status = urlencode( get_the_title( $event_id ) . ' ' . get_permalink( $event_id ) . ' ' . $hashtag );
//    $share_html .= '<ul class="event-shares">';
//    $share_html .= '<li class="event-shares__facebook"><a href="https://www.facebook.com/sharer/sharer.php?u='.$share_url.'" target="_blank">Facebook</a></li>';
//    $share_html .= '<li class="event-shares__twitter"><a href="https://twitter.com/home?status='.$share_status.'" target="_blank">Twitter</a></li>';
//    $share_html .= '</ul>';
//    $share_html .= '</div>';

	return $share_html;
}


//PRE GET POSTS

//exclude past events from listings
//re-order events by start date - ASC

//load all events in past events
add_action( 'pre_get_posts', 'wgcacsc_pre_get_posts' );

function wgcacsc_pre_get_posts( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}

	//past events page
	if ( is_tax( 'event-category', 'past-events' ) ) {
		$query->set( 'posts_per_page', - 1 );
		$query->set( 'orderby', 'meta_value_num date' );
		$query->set( 'meta_key', 'start_date' );
		$query->set( 'order', 'DESC' );
		$new_tax_query = array(
			array(
				'taxonomy' => 'event-category',
				'field'    => 'slug',
				'terms'    => array( 'retreats' ),
				'operator' => 'NOT IN'
			)
		);
		$query->set( 'tax_query', $new_tax_query );
	}
	//event cat pages
	if ( is_tax( 'event-category' ) && ! is_tax( 'event-category', 'past-events' ) ) {
		$new_tax_query = array(
			array(
				'taxonomy' => 'event-category',
				'field'    => 'slug',
				'terms'    => array( 'past-events' ),
				'operator' => 'NOT IN'
			)
		);
		$query->set( 'tax_query', $new_tax_query );

		$query->set( 'orderby', 'meta_value_num date' );
		$query->set( 'meta_key', 'start_date' );
		$query->set( 'order', 'ASC' );
		$query->set( 'posts_per_page', - 1 );
	}
}

//default meta value of 0 for start date to avoid exclusion of events without a start date
function wgcacsc_add_default_date( $post_id ) {
	if ( get_post_type( $post_id ) == 'event' ) {
		add_post_meta( $post_id, 'start_date', 0, true );
	}
}

add_action( 'save_post', 'wgcacsc_add_default_date' );


//GET LATEst news for front page
function wgcacsc_get_latest_news() {

	global $wp_query;
	// To make wp sort posts by `sticky` again (it doesn't when is_home is `false`)
	$wp_query->is_home = true;

	$args      = array(
		'posts_per_page' => 3
	);
	$the_query = new WP_Query( $args );


	// The Loop
	if ( $the_query->have_posts() ) {

		$html = '<div class="--offset-content"><h2 class="latest-news__heading">Latest news</h2>';
		$html .= '<div class="latest-news-list">';

		while ( $the_query->have_posts() ) {
			$the_query->the_post();

			$news_listing_thumbnail_srcs = array();

			if ( ! empty( get_the_post_thumbnail( get_the_ID() ) ) ) {
				$news_listing_thumbnail_srcs['default'] = get_the_post_thumbnail_url( get_the_ID(), 'news-listing' );
				$news_listing_thumbnail_srcs['retina']  = get_the_post_thumbnail_url( get_the_ID(), 'news-listing-retina' );
			}

			$html .= '<article class="row latest-news-item">';

			if ( ! empty( $news_listing_thumbnail_srcs ) ) {
				$html .= '<div class="columns small-12 medium-2 content-item__visual">';
				$html .= '<div class="news-item__image">';
				$html .= '<a href="' . get_permalink( get_the_ID() ) . '"><picture>';
				$html .= '<source media="(min-width: 200px)" srcset="' . $news_listing_thumbnail_srcs['retina'] . ' 2x, ' . $news_listing_thumbnail_srcs['default'] . ' 1x" />';
				$html .= '<source media="(max-width: 200px)" src="' . $news_listing_thumbnail_srcs['default'] . '" />';
				$html .= '<img src="' . $news_listing_thumbnail_srcs['default'] . '" alt="' . get_the_title() . '" />';
				$html .= '</picture></a>';
				$html .= ' </div>';
				$html .= '</div>';
			}

			$html .= '<div class="columns small-12 medium-10">';
			$html .= '<h3 class="content-item__title"><a href="' . get_permalink( get_the_ID() ) . '">' . get_the_title() . '</a></h3>';
			$html .= '<p class="news-item__excerpt">' . get_field( 'page_sub_heading_section_heading', get_the_ID() ) . '</p>';
//        $html .= '<p><a class="button button-cta" href="'.get_permalink( $latest_news_item->ID ).'">Read More</a></p>';
			$html .= '</div></article>';

		}

		$html .= '</div>';
		$html .= '</div>';

		/* Restore original Post Data */
		wp_reset_postdata();

		return $html;


	} else {

		return '';

	}

}


function wps_change_role_name() {
    global $wp_roles;
    if (!isset($wp_roles)) {
        $wp_roles = new WP_Roles();
    }
    $wp_roles->roles['wgccc_administrator']['name'] = 'WGC Administrator';
    $wp_roles->role_names['wgccc_administrator'] = 'WGC Administrator';
}
add_action('init', 'wps_change_role_name');
