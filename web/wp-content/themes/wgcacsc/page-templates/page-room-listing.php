<?php
/*
Template Name: Room Listing Page
#TODO: This template is a bit messy and in need of a refactor
*/


// this variable is used by the template to
// detect whether the room list HTML tag needs closing
// #TODO: there must be a better way of achieving this
$roomsList = false;

get_header(); ?>


    <div id="page" role="main">


        <?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html(); ?>


        <div class="page__inner row">

            <?php do_action( 'foundationpress_before_content' ); ?>

            <div class="page__inner__content small-12 columns">

                <div class="main-content small-12 large-9 columns" id="main-content">

                    <div class="offset-content">
                        <?php foundationpress_breadcrumb(); ?>
                    </div>

                    <?php while ( have_posts() ) : the_post(); ?>
                        <article <?php post_class('post-content') ?> id="post-<?php the_ID(); ?>">
                            <?php do_action( 'foundationpress_page_before_entry_content' ); ?>
                            <div class="entry-content">

                                <div class="offset-content">
                                    <h1 class="page-title"><?php the_title(); ?></h1>
                                </div>

                                <?php echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(); ?>

                                <div class="offset-content">
                                    <?php

                                    $args = array(
                                        'post_type' => 'room',
                                        'posts_per_page' => -1,
                                        'order' => 'ASC',
                                        'orderby' => 'title',
                                        'post__not_in' => array(177)
                                    );
                                    $query = new WP_QUERY($args);


                                    if($query->have_posts()) :
                                        ?>

                                        <div class="room-search" id="room-search" style="display: none;">
                                            <h3>Room Search</h3>

                                            <form action="">
                                                <div class="row">
                                                    <div class="small-12 medium-4 columns room-search__group">
                                                        <label>Room layout
                                                            <select class="room-search__layout">
                                                                <option value="">Room Layout</option>
                                                                <?php
                                                                $layouts = get_terms( 'room_layouts' );
                                                                foreach($layouts as $layout) {
                                                                    echo '<option value="' . $layout->term_id . '">' . $layout->name . '</option>';
                                                                }
                                                                ?>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div class="small-12 medium-4 columns room-search__group">
                                                        <label>Number of attendees
                                                            <select class="room-search__attendees">
                                                                <option value="">Number of attendees</option>
                                                                <option data-tax-id="6" value="1-20">1 to 20</option>
                                                                <option data-tax-id="7" value="21-40">21 to 40</option>
                                                                <option data-tax-id="8" value="41-100">41 to 100</option>
                                                                <option data-tax-id="9" value="101-300">101 to 300</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                    <div class="small-12 medium-3 columns end room-search__group">
                                                        <input type="submit" class="button room-search__submit" value="Search rooms" />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>

                                        <div class="rooms-list">
                                            <?php
                                            $roomsList = true;
                                            $i = 0;
                                            while($query->have_posts()) : $query->the_post();
                                                $i++;
                                                $ID = get_the_ID();
                                                $url = get_permalink();
                                                $capacitiesComponent = new fewbricks\bricks\component_room_capacity('room_capacity');

                                                $layouts = wp_get_post_terms($ID, 'room_layouts');
                                                $layoutsFormatted = '';
                                                foreach ($layouts as $layout) {
                                                    $layoutsFormatted .= $layout->term_id . ',';
                                                }
                                                $layoutsFormatted = substr($layoutsFormatted, 0, -1);

                                                $capacities = wp_get_post_terms($ID, 'room_capacities');
                                                $capacitiesFormatted = '';
                                                foreach ($capacities as $capacity) {
                                                    $capacitiesFormatted .= $capacity->term_id . ',';
                                                }
                                                $capacitiesFormatted = substr($capacitiesFormatted, 0, -1);
                                                ?>
                                                <article id="<?php echo $ID; ?>" class="clearfix row content-item room-item room-item--searchable <?php if ($i == 1) : echo ' first'; endif; ?>" data-layouts="<?php echo $layoutsFormatted; ?>" data-capacities="<?php echo $capacitiesFormatted; ?>">
                                                    <div class="small-12 medium-6 columns content-item__visual">
                                                        <h3 class="content-item__title hide-for-medium"><a href="<?php echo $url; ?>"><?php the_title(); ?></a></h3>
                                                        <a class="content-item__image" href="<?php echo $url; ?>">
                                                            <?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html(array('plain' => true)); ?>
                                                        </a>

                                                        <?php echo $capacitiesComponent->get_html(); ?>
                                                    </div>
                                                    <div class="small-12 medium-6 columns content-item__description">
                                                        <h3 class="content-item__title show-for-medium"><?php the_title(); ?></h3>

                                                        <p><?php echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(array('plain' => true)); ?></p>

                                                        <p><a class="button button-cta" href="<?php echo $url; ?>">Learn More</a></p>
                                                    </div>
                                                </article>
                                            <?php endwhile; ?>
                                    <?php endif; ?>
                                    <?php wp_reset_postdata(); ?>


                                    <?php
                                    // show only the lawn at the bottom

                                    $args = array(
                                        'post_type' => 'room',
                                        'posts_per_page' => -1,
                                        'order' => 'ASC',
                                        'orderby' => 'title',
                                        'post__in' => array(177)
                                    );
                                    $query = new WP_QUERY($args);

                                    if($query->have_posts()) :
                                        echo '<h2 class="section-heading">The extensive grounds and lawn offer a great space for outdoor events</h2>';
                                        $i = 0;
                                        while($query->have_posts()) : $query->the_post();
                                            $i++;
                                            $ID = get_the_ID();
                                            $url = get_permalink();
                                            $capacitiesComponent = new fewbricks\bricks\component_room_capacity('room_capacity');

                                            $layouts = wp_get_post_terms($ID, 'room_layouts');
                                            $layoutsFormatted = '';
                                            foreach ($layouts as $layout) {
                                                $layoutsFormatted .= $layout->term_id . ',';
                                            }
                                            $layoutsFormatted = substr($layoutsFormatted, 0, -1);

                                            $capacities = wp_get_post_terms($ID, 'room_capacities');
                                            $capacitiesFormatted = '';
                                            foreach ($capacities as $capacity) {
                                                $capacitiesFormatted .= $capacity->term_id . ',';
                                            }
                                            $capacitiesFormatted = substr($capacitiesFormatted, 0, -1);
                                            ?>
                                            <article id="<?php echo $ID; ?>" class="clearfix row content-item room-item <?php if ($i == 1) : echo ' first'; endif; ?>" data-layouts="<?php echo $layoutsFormatted; ?>" data-capacities="<?php echo $capacitiesFormatted; ?>">
                                                <div class="small-12 medium-6 columns content-item__visual">
                                                    <h3 class="content-item__title hide-for-medium"><a href="<?php echo $url; ?>"><?php the_title(); ?></a></h3>
                                                    <a class="content-item__image" href="<?php echo $url; ?>">
                                                        <?php echo (new fewbricks\bricks\component_hero_list('page_heroes'))->get_html(array('plain' => true)); ?>
                                                    </a>

                                                    <?php echo $capacitiesComponent->get_html(); ?>
                                                </div>
                                                <div class="small-12 medium-6 columns content-item__description">
                                                    <h3 class="content-item__title show-for-medium"><?php the_title(); ?></h3>

                                                    <p><?php echo (new fewbricks\bricks\component_section_heading('page_sub_heading'))->get_html(array('plain' => true)); ?></p>

                                                    <p><a class="button button-cta" href="<?php echo $url; ?>">Learn More</a></p>
                                                </div>
                                            </article>
                                        <?php endwhile; ?>
                                    <?php endif; ?>

                                    <?php if($roomsList): ?>
                                    </div>
                                    <?php endif; ?>
                                    <?php wp_reset_postdata(); ?>


                                    <?php the_content(); ?>
                                </div>

                                <?php echo (new fewbricks\bricks\group_flexible_content('standard_components'))->get_html(); ?>
                            </div>
                        </article>
                    <?php endwhile;?>

                    <a class="back-to-top" id="back-to-top" href="#off-canvas-wrapper"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/arrow_up.svg" alt="" /> Back to top </a>

                </div>


                <?php do_action( 'foundationpress_after_content' ); ?>

                <?php get_sidebar(); ?>

            </div>
        </div>


    </div>


    <script>
        // #TODO: This is a mess, refactor the whole thing

        function convertArrayToInts(arrayToConvert) {
            var newArray = [];

            for (var i = 0; i < arrayToConvert.length; i++) {
                var itemToPush = parseInt(arrayToConvert[i], 10);
                if(itemToPush % 1 === 0) {
                    newArray.push(itemToPush);
                }
            }

            return newArray;
        }

        // Progressive enhancement! Only show the search if JS is enabled
        var roomSearchContainer = $("#room-search");
        var layoutSearch    = $(".room-search__layout");
        var attendeesSearch = $(".room-search__attendees");
        var rooms = $(".room-item--searchable");
        var roomNumber = rooms.length;

        roomSearchContainer.css("display", "block");
        roomSearchContainer.append("<p id='room-search__notification' class='room-search__notification' style='display: none;'>Search results have been updated, <strong id='room-search__notification__extra'></strong> returned.</p>");
        var roomSearchNotification = $("#room-search__notification");
        var roomSearchNotificationExtra = $("#room-search__notification__extra");


        var roomCapacties = [];
        rooms.each(function() {

            var capacities = $(this).find('.room-capacity__capacity').map(function(i, el) {
                return $(el).text();
            }).get();
            var min = Math.min.apply(null, capacities),
                max = Math.max.apply(null, capacities);

            // specify the absolute minimum and maximum capacities regardless of room layout
            var roomId = $(this).attr('id');
            roomCapacties[roomId] = [];
            roomCapacties[roomId]['min'] = parseInt(min, 10);
            roomCapacties[roomId]['max'] = parseInt(max, 10);


            // get capacities for each room layout, this is necessary if both capacity and room filters are specified
            var cabaret = $(this).find('.room-capacity__capacity--cabaret').text();
            var boardroom = $(this).find('.room-capacity__capacity--boardroom').text();
            var classroom = $(this).find('.room-capacity__capacity--classroom').text();
            var uShape = $(this).find('.room-capacity__capacity--u-shape').text();
            var theatre = $(this).find('.room-capacity__capacity--theatre').text();

            if(cabaret) {
                // the IDs here (e.g. 10) are set to match the taxonomy terms in Wordpress
                roomCapacties[roomId][10] = parseInt(cabaret, 10);
            }

            if(boardroom) {
                roomCapacties[roomId][11] = parseInt(boardroom, 10);
            }

            if(classroom) {
                roomCapacties[roomId][12] = parseInt(classroom, 10);
            }

            if(uShape) {
                roomCapacties[roomId][13] = parseInt(uShape, 10);
            }

            if(theatre) {
                roomCapacties[roomId][14] = parseInt(theatre, 10);
            }

        });


        $(".room-search__submit").click(function(event) {
            event.preventDefault();

            var layoutParam = parseInt(layoutSearch.val(), 10);
            var attendeesParam = attendeesSearch.val();
            var attendeesTax = attendeesSearch.find(':selected').attr('data-tax-id');
            var sizes = attendeesParam.split('-');
            var attendeesParamMin = parseInt(sizes[0], 10);
            var attendeesParamMax = parseInt(sizes[1], 10);

            // search stuff
            // we show/hide the room with CSS depending on whether it matches the search terms
            rooms.each(function(index) {
                var matches = false;
                var roomId = $(this).attr('id');

                if(layoutParam) {
                    matches = false;
                    var roomLayouts = $(this).attr('data-layouts');
                    var roomLayoutsArr = convertArrayToInts(roomLayouts.split(','));

                    for(var j = 0; j < roomLayoutsArr.length; j++) {
                        if(layoutParam == roomLayoutsArr[j]) {
                            matches = true;
                            break;
                        } else {
                            matches = false;
                        }
                    }
                } else {
                    matches = true;
                }


                if(matches == true && attendeesParam && !layoutParam) {
                    var roomCapacities = $(this).attr('data-capacities');
                    var roomCapacitiesArr = convertArrayToInts(roomCapacities.split(','));

                    for (var i = 0; i < roomCapacitiesArr.length; i++) {
                        if (attendeesTax == roomCapacitiesArr[i]) {
                            matches = true;
                            break;
                        } else {
                            matches = false;
                        }
                    }
                } else if(matches == true && attendeesParam && layoutParam) {
                    if(roomCapacties[roomId][layoutParam] >= attendeesParamMin) {
                        matches = true;
                    } else {
                        matches = false;
                    }
                }


                if(!attendeesParam && !layoutParam) {
                    matches = true;
                }

                if(matches == true) {
                    $(this).css('display', 'block');
                    $(this).addClass('room-item__matched');
                } else {
                    $(this).css('display', 'none');
                    $(this).removeClass('room-item__matched');
                }
            });

            var matchedItems = $('.room-item__matched');
            var matchedItemsNum = matchedItems.length;
            roomSearchNotificationExtra.html(matchedItemsNum + ' results');
            roomSearchNotification.css('display', 'block');
        })

    </script>

<?php get_footer();
