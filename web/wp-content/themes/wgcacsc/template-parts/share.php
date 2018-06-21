<?php

/**
 * Set up variables for later
 *
 * PHP's `urlencode()` is based on RFC 1738 but the current standard is RFC 3986 so I wrote a custom function to handle URLs to standards.
 *
 * Alt: Use rawurlencode()
 *
 * Summary of restrictions
 *
 * URL
 * TITLE, 200
 * TEXT (DESCRIPTION), 256
 * IMAGE
 * SUMMARY (linkedin)
 * SOURCE (linkedin)
 *
 *
 */

//function urlEncoder($string) {
//    $entities = array('%21', '%2A', '%27', '%28', '%29', '%3B', '%3A', '%40', '%26', '%3D', '%2B', '%24', '%2C', '%2F', '%3F', '%25', '%23', '%5B', '%5D');
//    $replacements = array('!', '*', "'", "(", ")", ";", ":", "@", "&", "=", "+", "$", ",", "/", "?", "%", "#", "[", "]");
//    return str_replace($entities, $replacements, urlencode($string));
//}

s24_share_widget();

function s24_share_widget() {

	global $post;

	$page_section_id = $post->ID;

	$unencoded_url = esc_url( get_permalink( $page_section_id ) );
	$current_url = urlencode( get_permalink( $page_section_id ) );
	$description = urlencode(get_the_title( $page_section_id ) );
	$summary = urlencode( get_post_meta( $page_section_id , 'page_sub_heading_section_heading' , true ));


	echo <<<EOT
<!-- Share this -->
<div class="towncrier">
    <a href="#share-this"
       class="towncrier__share-button js-towncrier__share-button button-cta"
       aria-label="Open share panel"
       aria-expanded="false"
       aria-haspopup="true">
        <span class="towncrier__share-text accent-color">Share</span>
        <svg width="15" height="17" xmlns="http://www.w3.org/2000/svg"><path d="M11.3 11c-.7 0-1.3.2-1.8.6l-4-2.2a2.8 2.8 0 0 0 0-1.8l4.2-2.3a2.8 2.8 0 1 0-1-1.2l-4 2.3c-.5-.4-1-.7-1.8-.7a2.8 2.8 0 1 0 1.8 5l4 2.1a2.8 2.8 0 1 0 2.6-1.8z" fill-rule="nonzero" fill="#fff"/></svg>
    </a>

    <!-- change aria-hidden to `true` if js -->
    <div class="towncrier__panel js-towncrier__panel" id="share-this" aria-hidden="true">

        <ul class="towncrier__channels">
            <li class="towncrier__channel towncrier__channel--facebook">
                <a target="_blank" class="towncrier__channel-link" href="https://www.facebook.com/sharer/sharer.php?u=$current_url">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="icon towncrier__share-icon" aria-hidden="true">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg><span class="towncrier__channel-label" aria-hidden="true">Facebook</span>
                    <span class="visuallyhidden">Share this with Facebook</span>
                </a>
            </li>
            <li class="towncrier__channel towncrier__channel--twitter">
                <a target="_blank" class="towncrier__channel-link"
                   href="https://twitter.com/intent/tweet?text=$description&amp;url=$current_url">
                    <svg viewBox="328 355 335 276" xmlns="http://www.w3.org/2000/svg" class="icon towncrier__share-icon" aria-hidden="true">
                        <path d="M 630, 425A 195, 195 0 0 1 331, 600A 142, 142 0 0 0 428, 570A  70,  70 0 0 1 370, 523A  70,  70 0 0 0 401, 521A  70,  70 0 0 1 344, 455A  70,  70 0 0 0 372, 460A  70,  70 0 0 1 354, 370A 195, 195 0 0 0 495, 442A  67,  67 0 0 1 611, 380A 117, 117 0 0 0 654, 363A  65,  65 0 0 1 623, 401A 117, 117 0 0 0 662, 390A  65,  65 0 0 1 630, 425Z"/>
                    </svg><span class="towncrier__channel-label" aria-hidden="true">Twitter</span>
                    <span class="visuallyhidden">Share this with Twitter</span>
                </a>
            </li>
            <li class="towncrier__channel towncrier__channel--linkedin">
                <a target="_blank" class="towncrier__channel-link"
                   href="https://www.linkedin.com/shareArticle?mini=true&url=$current_url&title=$description&summary=$summary">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="icon towncrier__share-icon"
                         aria-hidden="true">
                        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                    </svg><span class="towncrier__channel-label" aria-hidden="true">LinkedIn</span>
                    <span class="visuallyhidden">Share this with LinkedIn</span>
                </a>
            </li>
        </ul>
        
        <p>
            <label>Copy this link:</label>
            <input type="text" readonly="readonly" value="$unencoded_url" />
        </p>

        <button class="towncrier__close-button js-towncrier__share-button">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="icon towncrier__close-button-graphic"
                         aria-hidden="true">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
                    </svg>
                    <span class="visuallyhidden">Close share panel</span>
        </button>
    </div>
</div>
<!-- / Share this -->
EOT;

}