<?php
/**
 * The default template for displaying content
 *
 * Used for both single and index/archive/search.
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>

<div id="post-<?php the_ID(); ?>" <?php post_class('clearfix row content-item'); ?>>
	<?php
	$postType = get_post_type();
	$date = get_the_date();
	$title = get_the_title();
	$url = get_the_permalink();

	$eventSummary = get_field('listing_summary');

	if(empty($eventSummary) && has_category(18)) {
		$eventSummary .= (get_field('organiser') ? '<small>Event organiser:</small> ' . get_field('organiser') . '<br />' : '');
        $eventSummary .= (get_field('event_date_details') ? '<small>Event Dates:</small> ' . get_field('event_date_details') . '<br />' : '');
        $eventSummary .= (get_field('event_website') ? '<a href="' . get_field('event_website') . '">Visit event website</a>' : '');

		if(has_category(18)) {
			$url = '';
		}
	} else {
		$eventSummary = (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(array('plain' => true));
	}

	$excerpt = $eventSummary;
	$image = '';

	if($postType == 'post') {
		$image = (new fewbricks\bricks\component_listing_image('listing_image'))->get_html();
	} else {
		$date = '';
		$image = (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html(array('plain' => true));
	}

	if(has_category(18)) {
		$date = get_field('event_date');
		if(empty($date)) {
			$date = get_the_date();
		} else {
			$date = date('M j Y', strtotime($date));
		}
	}

	$detailsHtmlClasses = 'small-12 columns content-item__description';
	?>

	<?php if(isset($image) && !empty($image)): ?>
		<div class="small-12 medium-6 columns content-item__visual">
			<div class="news-item__image">
				<?php echo $image; ?>
			</div>
		</div>
		<?php
		$detailsHtmlClasses = 'small-12 medium-6 columns content-item__description';
		?>
	<?php endif; ?>

	<div class="<?php echo $detailsHtmlClasses; ?>">
        <?php
        if(!empty($date) && !has_category(18) && !is_front_page()) {
            echo '<p class="news-item__date">'. $date .'</p>';
        }
        ?>
		<h3 class="content-item__title"><?php the_title(); ?></h3>
		<?php
		if(!empty($excerpt)) {
			echo '<p class="news-item__excerpt">' . $excerpt . '</p>';
		}
		if(!empty($url)) {
			echo '<p><a class="button button-cta" href="' . $url . '">Read More<span class="show-for-sr"> of ' . $title . '</span></a></p>';
		}
		?>
	</div>

</div>
