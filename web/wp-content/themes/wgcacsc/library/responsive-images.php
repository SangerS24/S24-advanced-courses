<?php
/**
 * Configure responsive images sizes
 *
 * @package WordPress
 * @subpackage FoundationPress
 * @since FoundationPress 2.6.0
 */

// Add additional image sizes
add_image_size( 'fp-small', 640 );
add_image_size( 'fp-medium', 1024 );
add_image_size( 'fp-large', 1200 );

/**
 * Hero Image Styles
 */
add_image_size ( 'hero-image', 1280, 350, array('center', 'center') );

add_image_size ( 'hero-large', 1280, 350, array('center', 'center') );
add_image_size ( 'hero-large-retina', 2560, 700, array('center', 'center') );

add_image_size ( 'hero-medium', 1040, 350, array('center', 'center') );
add_image_size ( 'hero-medium-retina', 2080, 700, array('center', 'center') );

add_image_size ( 'hero-small', 640, 400, array('center', 'center') );
add_image_size ( 'hero-small-retina', 1280, 800, array('center', 'center') );

add_image_size ( 'hero-home-small', 640, 400, array('right', 'center') );
add_image_size ( 'hero-home-small-retina', 1280, 800, array('right', 'center') );

add_image_size( 'hero-listing', 360, 230, array('center', 'center') );


/**
 * Carousel Image Styles
 */
add_image_size ( 'carousel-large', 960, 9999, false );
add_image_size ( 'carousel-large-retina', 1920, 9999, false );

add_image_size ( 'carousel-medium', 640, 9999, false );
add_image_size ( 'carousel-medium-retina', 1280, 9999, false );


/**
 * CTA Image Styles
 */
add_image_size ( 'cta-full', 960, 240, array('center', 'center') );
add_image_size ( 'cta-full-retina', 1920, 480, array('center', 'center') );

add_image_size ( 'cta-half', 480, 240, array('center', 'center') );
add_image_size ( 'cta-half-retina', 960, 480, array('center', 'center') );

add_image_size ( 'cta-third', 320, 240, array('center', 'center') );
add_image_size ( 'cta-third-retina', 640, 480, array('center', 'center') );


// I appreciate the names could be better here, these sizes are incase the CTAs
// are included on pages with a fullwidth left column and no right sidebar column
add_image_size ( 'cta-full--wide', 1260, 240, array('center', 'center') );
add_image_size ( 'cta-full-retina--wide', 2520, 480, array('center', 'center') );

add_image_size ( 'cta-half--wide', 620, 240, array('center', 'center') );
add_image_size ( 'cta-half-retina--wide', 1240, 480, array('center', 'center') );

add_image_size ( 'cta-third--wide', 410, 240, array('center', 'center') );
add_image_size ( 'cta-third-retina--wide', 820, 480, array('center', 'center') );


/**
 * Client Image Styles
 */

add_image_size ( 'client-logo--small', 390, 160, false );


/**
 * News Image Styles
 */

add_image_size ( 'news-listing', 420, 220, array('center', 'center') );
add_image_size ( 'news-listing-retina', 840, 440, array('center', 'center') );

/**
 * Teaser Image Styles
 */

add_image_size ( 'teaser-thumbnail', 460, 460, true );
add_image_size ( 'teaser-thumbnail-retina', 920, 920, true );

/**
 * Bio Image Styles
 */

add_image_size ( 'bio-listing', 240, 240, array('center', 'center') );

/**
 * Download Image Styles
 */

add_image_size ( 'download-thumbnail', 400, 400, false );

// Register the new image sizes for use in the add media modal in wp-admin
add_filter( 'image_size_names_choose', 'wpshout_custom_sizes' );
function wpshout_custom_sizes( $sizes ) {
	return array_merge( $sizes, array(
		'fp-small'  => __( 'FP Small' ),
		'fp-medium' => __( 'FP Medium' ),
		'fp-large'  => __( 'FP Large' ),
	) );
}

// Add custom image sizes attribute to enhance responsive image functionality for content images
function foundationpress_adjust_image_sizes_attr( $sizes, $size ) {

	// Actual width of image
	$width = $size[0];

	// Full width page template
	if ( is_page_template( 'page-templates/page-full-width.php' ) ) {
		1200 < $width && $sizes = '(max-width: 1199px) 98vw, 1200px';
		1200 > $width && $sizes = '(max-width: 1199px) 98vw, ' . $width . 'px';

	// Default 3/4 column post/page layout
	} else {
		770 < $width && $sizes = '(max-width: 639px) 98vw, (max-width: 1199px) 64vw, 770px';
		770 > $width && $sizes = '(max-width: 639px) 98vw, (max-width: 1199px) 64vw, ' . $width . 'px';
	}

	return $sizes;
}
add_filter( 'wp_calculate_image_sizes', 'foundationpress_adjust_image_sizes_attr', 10 , 2 );

// Remove inline width and height attributes for post thumbnails
function remove_thumbnail_dimensions( $html, $post_id, $post_image_id ) {
	$html = preg_replace( '/(width|height)=\"\d*\"\s/', '', $html );
	return $html;
}
add_filter( 'post_thumbnail_html', 'remove_thumbnail_dimensions', 10, 3 );
