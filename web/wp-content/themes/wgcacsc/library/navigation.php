<?php
/**
 * Register Menus
 *
 * @link http://codex.wordpress.org/Function_Reference/register_nav_menus#Examples
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

register_nav_menus(array(
	'top-bar-r'  => 'Right Top Bar',
	'mobile-nav' => 'Mobile',
));


/**
 * Desktop navigation - right top bar
 *
 * @link http://codex.wordpress.org/Function_Reference/wp_nav_menu
 */
if ( ! function_exists( 'foundationpress_top_bar_r' ) ) {
	function foundationpress_top_bar_r() {
		wp_nav_menu( array(
			'container'      => false,
			'menu_class'     => 'menu main-menu float-right',
			'items_wrap'     => '<ul id="%1$s" class="%2$s desktop-menu">%3$s</ul>',
			'theme_location' => 'top-bar-r',
			'depth'          => 1,
			'fallback_cb'    => false,
			'walker'         => new Foundationpress_Top_Bar_Walker(),
		));
	}
}

add_filter( 'wp_nav_menu_items', 'your_custom_menu_item', 10, 2 );
function your_custom_menu_item ( $items, $args ) {
    if ($args->theme_location == 'top-bar-r') {
        $items .= '<li class="menu-item--search"><a href="/?s="><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M9.8 12.8a6.8 6.8 0 1 1 2.5-2.2l4.8 4.7s.8.8 0 1.6l-.8.7c-.8.8-1.6 0-1.6 0l-4.9-4.8zm-7.5-6a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z" fill-rule="nonzero" fill="currentColor"/></svg><span class="show-for-sr">Search</span></a></li>';
    }

    return $items;
}


/**
 * Mobile navigation - topbar (default) or offcanvas
 */
if ( ! function_exists( 'foundationpress_mobile_nav' ) ) {
	function foundationpress_mobile_nav() {
		wp_nav_menu( array(
			'container'      => false,                         // Remove nav container
			'menu'           => __( 'mobile-nav', 'foundationpress' ),
			'menu_class'     => 'vertical menu mobile-nav',
			'theme_location' => 'mobile-nav',
			'items_wrap'     => '<ul id="%1$s" class="%2$s" data-drilldown>%3$s</ul>',
			'fallback_cb'    => false,
			'walker'         => new Foundationpress_Mobile_Walker(),
		));
	}
}


/**
 * Add support for buttons in the top-bar menu:
 * 1) In WordPress admin, go to Apperance -> Menus.
 * 2) Click 'Screen Options' from the top panel and enable 'CSS CLasses' and 'Link Relationship (XFN)'
 * 3) On your menu item, type 'has-form' in the CSS-classes field. Type 'button' in the XFN field
 * 4) Save Menu. Your menu item will now appear as a button in your top-menu
*/
if ( ! function_exists( 'foundationpress_add_menuclass' ) ) {
	function foundationpress_add_menuclass( $ulclass ) {
		$find = array('/<a rel="button"/', '/<a title=".*?" rel="button"/');
		$replace = array('<a rel="button" class="button"', '<a rel="button" class="button"');

		return preg_replace( $find, $replace, $ulclass, 1 );
	}
	add_filter( 'wp_nav_menu','foundationpress_add_menuclass' );
}


/**
 * Adapted for Foundation from http://thewebtaylor.com/articles/wordpress-creating-breadcrumbs-without-a-plugin
 *
 * @param bool $showhome should the breadcrumb be shown when on homepage (only one deactivated entry for home).
 * @param bool $separatorclass should a separator class be added (in case :before is not an option).
 */

if ( ! function_exists( 'foundationpress_breadcrumb' ) ) {
	function foundationpress_breadcrumb( $showhome = true, $separatorclass = false ) {

		// Settings
		$separator  = '&gt;';
		$id         = 'breadcrumbs';
		$class      = 'breadcrumbs';
		$home_title = 'Home';

		// Get the query & post information
		global $post,$wp_query;
        $category = get_category(get_query_var('cat'));

		// Build the breadcrums
		echo '<ul id="' . $id . '" class="' . $class . '">';

		// Do not display on the homepage
		if ( ! is_front_page() ) {

			// Home page
			echo '<li class="item-home"><a class="bread-link bread-home" href="' . get_home_url() . '" title="' . $home_title . '">' . $home_title . '</a></li>';
			if ( $separatorclass ) {
				echo '<li class="separator separator-home"> ' . $separator . ' </li>';
			}

			if ( is_single() ) {
                $category = get_the_category();

                // Single post (Only display the first category)
                if (!empty($category[0])) {
                    echo '<li class="item-cat item-cat-' . $category[0]->term_id . ' item-cat-' . $category[0]->category_nicename . '"><a class="bread-cat bread-cat-' . $category[0]->term_id . ' bread-cat-' . $category[0]->category_nicename . '" href="' . get_category_link($category[0]->term_id) . '" title="' . $category[0]->cat_name . '">' . $category[0]->cat_name . '</a></li>';
                } elseif ( is_singular('client') ) {
                    echo '<li class="item-cat"><a class="bread-cat" href="/about/">About</a></li>';
                    echo '<li class="item-cat"><a class="bread-cat" href="/about/clients/">Our Clients</a></li>';
                } elseif ( is_singular('room') ) {
                    echo '<li class="item-cat"><a class="bread-cat" href="/rooms/">Rooms &amp; Spaces</a></li>';
                }

                if ( $separatorclass ) {
					echo '<li class="separator separator-' . $category[0]->term_id . '"> ' . $separator . ' </li>';
				}
				echo '<li class="item-current item-' . $post->ID . '"><strong class="bread-current bread-' . $post->ID . '" title="' . get_the_title() . '">' . get_the_title() . '</strong></li>';

            } else if ( is_category(23) ) {

                // Category page
                echo '<li class="item-current item-cat-' . $category->term_id . ' item-cat-' . $category->category_nicename . '"><strong class="bread-current bread-cat-' . $category->term_id . ' bread-cat-' . $category->category_nicename . '">News &amp; Events</strong></li>';

            } else if ( is_category() ) {

				// Category page
				echo '<li class="item-current item-cat-' . $category->term_id . ' item-cat-' . $category->category_nicename . '"><strong class="bread-current bread-cat-' . $category->term_id . ' bread-cat-' . $category->category_nicename . '">' . $category->cat_name . '</strong></li>';

			} else if ( is_page() ) {

				// Standard page
				if ( $post->post_parent ) {

					// If child page, get parents
					$anc = get_post_ancestors( $post->ID );

					// Get parents in the right order
					$anc = array_reverse( $anc );

					// Parent page loop
					$parents = '';
					foreach ( $anc as $ancestor ) {
						$parents .= '<li class="item-parent item-parent-' . $ancestor . '"><a class="bread-parent bread-parent-' . $ancestor . '" href="' . get_permalink($ancestor) . '" title="' . get_the_title($ancestor) . '">' . get_the_title($ancestor) . '</a></li>';
						if ( $separatorclass ) {
							$parents .= '<li class="separator separator-' . $ancestor . '"> ' . $separator . ' </li>';
						}
					}

					// Display parent pages
					echo $parents;

					// Current page
					echo '<li class="current item-' . $post->ID . '">' . get_the_title() . '</li>';

				} else {

					// Just display current page if not parents
					echo '<li class="current item-' . $post->ID . '"> ' . get_the_title() . '</li>';

				}
			} else if ( is_archive() ) {

			    if(is_post_type_archive('client')) {
                    echo '<li><a href="/about/">About</a></li>';
                }

                // Archive page
                echo '<li class="item-current"><strong class="bread-current">' . get_the_archive_title() . '</strong></li>';

            } else if ( is_tag() ) {

                // Tag page
				// Get tag information
				$term_id = get_query_var('tag_id');
				$taxonomy = 'post_tag';
				$args = 'include=' . $term_id;
				$terms = get_terms($taxonomy, $args);

				// Display the tag name
				echo '<li class="current item-tag-' . $terms[0]->term_id . ' item-tag-' . $terms[0]->slug . '">' . $terms[0]->name . '</li>';

			} elseif ( is_day() ) {

				// Day archive
				// Year link
				echo '<li class="item-year item-year-' . get_the_time('Y') . '"><a class="bread-year bread-year-' . get_the_time('Y') . '" href="' . get_year_link(get_the_time('Y')) . '" title="' . get_the_time('Y') . '">' . get_the_time('Y') . ' Archives</a></li>';
				if ( $separatorclass ) {
					echo '<li class="separator separator-' . get_the_time('Y') . '"> ' . $separator . ' </li>';
				}

				// Month link
				echo '<li class="item-month item-month-' . get_the_time('m') . '"><a class="bread-month bread-month-' . get_the_time('m') . '" href="' . get_month_link(get_the_time('Y'), get_the_time('m')) . '" title="' . get_the_time('M') . '">' . get_the_time('M') . ' Archives</a></li>';
				if ( $separatorclass ) {
					echo '<li class="separator separator-' . get_the_time('m') . '"> ' . $separator . ' </li>';
				}

				// Day display
				echo '<li class="current item-' . get_the_time('j') . '">' . get_the_time('jS') . ' ' . get_the_time('M') . ' Archives</li>';

			} else if ( is_month() ) {

				// Month Archive
				// Year link
				echo '<li class="item-year item-year-' . get_the_time('Y') . '"><a class="bread-year bread-year-' . get_the_time('Y') . '" href="' . get_year_link(get_the_time('Y')) . '" title="' . get_the_time('Y') . '">' . get_the_time('Y') . ' Archives</a></li>';
				if ( $separatorclass ) {
					echo '<li class="separator separator-' . get_the_time('Y') . '"> ' . $separator . ' </li>';
				}

				// Month display
				echo '<li class="item-month item-month-' . get_the_time('m') . '">' . get_the_time('M') . ' Archives</li>';

			} else if ( is_year() ) {

				// Display year archive
				echo '<li class="current item-current-' . get_the_time('Y') . '">' . get_the_time('Y') . ' Archives</li>';

			} else if ( is_author() ) {

				// Auhor archive
				// Get the author information
				global $author;
				$userdata = get_userdata($author);

				// Display author name
				echo '<li class="current item-current-' . $userdata->user_nicename . '">Author: ' . $userdata->display_name . '</li>';

			} else if ( get_query_var('paged') ) {

				// Paginated archives
				echo '<li class="current item-current-' . get_query_var('paged') . '">' . __('Page', 'foundationpress' ) . ' ' . get_query_var('paged') . '</li>';

			} else if ( is_search() ) {

				// Search results page
				echo '<li class="current item-current-' . get_search_query() . '">Search results for: ' . get_search_query() . '</li>';

			} elseif ( is_404() ) {

				// 404 page
				echo '<li>Error 404</li>';
			}
		} else {
			if ( $showhome ) {
				echo '<li class="item-home current">' . $home_title . '</li>';
			}
		}
		echo '</ul>';
	}
}

add_action('foundationpress_before_sidebar' , 's24_list_child_pages' , 10 , 0 );

//list child pages of a section
function s24_list_child_pages() {


    $current_object_id = s24_get_current_object_id();
    $current_object_type = s24_get_current_object_type();

    $side_menu_items = s24_menu_tree_array( $current_object_id , $current_object_type );

    if ( empty($side_menu_items[0]['children']) ) {
        return;
    }

    //menu html
    $menu_string = '<article class="widget widget_nav_menu s24-side-menu"><div class="side-menu-container">';
    $menu_string .= s24_build_menu_list( $side_menu_items[0] , $current_object_id , true );
    $menu_string .= '</div></article>';
    echo $menu_string;
}

function s24_menu_tree_array( $current_object_id , $current_object_type ) {
    $menu_tree_array = array();

    if ( empty($current_object_id) ) {
        //can't find this page in the system
        return $menu_tree_array;
    }

    //Check whether it is in the main menu
    $top_menu_item = s24_get_menu_item( $current_object_id , $current_object_type);

    if ( empty( $top_menu_item) ) {
        return $menu_tree_array; //we could not find this in the main menu
    }

    //if we are here, we found the current page in the main menu - we are going to build an array of menu items for the side menu

    $side_menu_items = array(); //each item has 'item' = OBJ the menu item, 'children' = ARRAY children menu items

    //let's find the topmost menu item
    if ( !empty( $top_menu_item->menu_item_parent ) ) {
        //get the topmost menu item
        while ( !empty($top_menu_item->menu_item_parent) ) {
            $args = array(
                'posts_per_page' => 1,
                'p' => $top_menu_item->menu_item_parent
            );
            $top_menu_item = wp_get_nav_menu_items('main-menu', $args);
            $top_menu_item = $top_menu_item[0];
        }
    }

    array_push( $menu_tree_array , s24_menu_item_array( $top_menu_item ) );

    return $menu_tree_array;
}

function s24_get_current_object_id() {

    $item_id = false;

    //looks for current page in the main menu first
    if ( ! (is_singular() || is_category() || is_tag() || is_tax() || is_home() || is_post_type_archive('event' ) ) ) {
        return $item_id;
    }


    if (is_home() ) {
        $item_id = get_option( 'page_for_posts' );
    } elseif ( is_post_type_archive('event' ) ) {
        $item_id = 974;
    } elseif ( is_tax() || is_category() || is_tag() ) {
        $item_id = get_queried_object()->term_id;
    }elseif ( is_single() || is_singular('event') || is_page() ) {
        global $post;
        $item_id = $post->ID;
    }

    return $item_id;
}

function s24_get_current_object_type() {
    $item_type = '';

    //looks for current page in the main menu first
    if ( ! (is_singular() || is_category() || is_tag() || is_tax() || is_home() || is_post_type_archive('event' ) ) ) {
        return $item_type;
    }

    //id of the page we are at
    $current_object_id = 0;


    if (is_home() || is_post_type_archive('event' ) ) {
        $item_type = 'post_type';
    } elseif ( is_tax() || is_category() || is_tag() ) {
        $item_type = 'taxonomy';
    }elseif ( is_single() || is_singular('event') || is_page() ) {
        global $post;
        $item_type = 'post_type';
    }

    return $item_type;
}

//creates and returns menu item array (item itself and children - recursively )
function s24_menu_item_array( $root_menu_item ) {
    $menu_item_array = array();
    $menu_item_array['item'] = $root_menu_item;
    $menu_item_array['children'] = array();

    //get children
    $args = array(
        'meta_query' => array(
            array(
                'key' => '_menu_item_menu_item_parent',
                'value' => $root_menu_item->ID,
                'compare' => '='
            )
        )
    );
    $children_item = wp_get_nav_menu_items( 'main-menu' , $args );

    if ( !empty($children_item) ) {
        foreach ( $children_item as $child_item ) {
            array_push( $menu_item_array['children'] , s24_menu_item_array( $child_item ) );
        }
    }

    return $menu_item_array;
}

//function s24_set_single_menu_item( $menu_item ) {
//    die('<pre>'.print_r( $menu_item , 1).'</pre>');
//    $items = array($menu_item);
//    $items = array_map( 'wp_setup_nav_menu_item', $items );
//    $items = apply_filters( 'wp_get_nav_menu_items', $items );
//    return $items[0];
//}

function s24_build_menu_list( $side_menu_item , $current_id , $topmost = false ) {

    $list_html = '';
    $item_object = $side_menu_item['item'];
    $submenu_class = 'sub-menu';
    if ( $topmost ) {
        //topmost item
        $list_html .= '<h5><a href="'.$item_object->url.'">'.$item_object->title.'</a></h5>';
        $submenu_class = 'menu';
    } else {
        $li_classes = '';
        if ( $item_object->object_id == $current_id ) {
            $li_classes = ' class="current-menu-item"';
        }
        $list_html .= '<li'.$li_classes.'><a href="'.$item_object->url.'">'.$item_object->title.'</a>';
    }

    //children ul
    if ( !empty($side_menu_item['children'] ) ) {
        $list_html .= '<ul class="'.$submenu_class.'">';
        foreach ( $side_menu_item['children'] as $child_item ) {
            $list_html .= s24_build_menu_list( $child_item , $current_id );
        }
        $list_html .= '</ul>';
    }

    if ( !$topmost ) {
        $list_html .= '</li>';
    }

    return $list_html;
}

function s24_breadcrumb( $showhome = true, $separatorclass = false ) {

    // Settings
    $separator  = '&gt;';
    $id         = 'breadcrumbs';
    $class      = 'breadcrumbs';
    $home_title = 'Home';

    //if home page
    if ( is_front_page() && ( $showhome == true ) ) {
        echo '<ul id="' . $id . '" class="' . $class . '"><li class="item-home current">' . $home_title . '</li></ul>';
        return;
    } if ( is_search() ) {
        $results_for_str = ( !empty($_GET['s']) ) ? ' results for '.$_GET['s'] : '';
        echo '<ul id="' . $id . '" class="' . $class . '"><li class="item-home"><a href="'.home_url().'">' . $home_title . '</a> / Search'.$results_for_str.'</li></ul>';
        return;
    }

    $current_object_id = s24_get_current_object_id();
    $current_object_type = s24_get_current_object_type();

    $trail_array = s24_trail_array( $current_object_id , $current_object_type );

    if ( empty($trail_array ) ) {
        //if not not catered for in s24 trail
        foundationpress_breadcrumb();
    } else {
        //if catered for in s24 trail
        //building the breadcrumb from the trail array
        $breadcrumb_html = '';

        //current page - tail of trail
        if ( get_query_var('paged') ) {
            //paged entry
            $breadcrumb_html = '<li class="current item-current-' . get_query_var('paged') . '">' . __('Page', 'foundationpress' ) . ' ' . get_query_var('paged') . '</li>';
            $last_bit = array_shift( $trail_array );
            $breadcrumb_html = '<li>'.s24_build_breadcrumb_link( $last_bit ).'</li>'.$breadcrumb_html;
        } else {
            $last_bit = array_shift( $trail_array );
            $breadcrumb_html = '<li class="current">'.s24_build_breadcrumb_link( $last_bit , true ).'</li>';
        }
        //going up rest of the trail
        foreach ( $trail_array  as $trail_item ) {
            $breadcrumb_html = '<li>'.s24_build_breadcrumb_link( $trail_item ).'</li>'.$breadcrumb_html;
        }

        if ( empty( $breadcrumb_html ) ) {
            return;
        }
        echo '<ul id="' . $id . '" class="' . $class . '"><li><a href="'.get_home_url().'">' . $home_title . '</a></li>'.$breadcrumb_html.'</ul>';

    }
}

function s24_trail_array( $current_object_id , $current_object_type ) {
    $trail_array = array();

    if ( empty($current_object_id) ) {
        //can't find this page in the system
        return $trail_array;
    }


    //Check whether it is in the main menu
    $current_menu_item_object = s24_get_menu_item( $current_object_id , $current_object_type );

    $current_working_menu_item = array();

    if  ( !empty( $current_menu_item_object ) ) {
        $current_working_menu_item['object'] = $current_menu_item_object;
        $current_working_menu_item['type'] = 'nav_menu_item';

        //if we are here, we found the current page in the main menu - we are going to build an array of menu items for the side menu

        array_push( $trail_array ,  $current_working_menu_item ); //trail items from current up to topmost ancestor - here initiated with current item
    } else {
        //let's go up the ancestry to hist a menu item

        //let's not bother if it's not a news item or an event
        if ( ! ( is_single() || is_singular('event') || is_category() || is_tax( 'event-category') ) ) {
            return $trail_array;
        }


        if ( is_singular( 'post' ) ) {
            //this is a single post or event - let's add it to the trail
            $post_item = array();
            $post_item['type'] = 'post_type';
            $post_item['object'] = get_post( $current_object_id );
            array_push( $trail_array , $post_item );
            $post_cat = wp_get_post_categories( $current_object_id );
            if ( !empty( $post_cat ) ) {
                $post_cat = $post_cat[0];
                $post_cat_object = get_term( $post_cat , 'category' );
                $post_cat_menu_item = s24_get_menu_item( $post_cat , 'taxonomy');
                while( ( $post_cat_menu_item == false ) && ( $post_cat_object->parent != 0 ) ) {
                    //as long as it's not a menu item and it has parents
                    $cat_menu_item = array();
                    $cat_menu_item['object'] = $post_cat_object;
                    $cat_menu_item['type'] = 'taxonomy';
                    array_push( $trail_array , $cat_menu_item );
                    $post_cat = $post_cat_object->parent;
                    $post_cat_object = get_term( $post_cat , 'category' );
                    $post_cat_menu_item = s24_get_menu_item( $post_cat , 'taxonomy' );
                }

                //it's either a menu item or we hit the topmost category in the ancestry
                if ( !empty( $post_cat_menu_item ) ) {
                    $current_working_menu_item['object'] = $post_cat_menu_item;
                    $current_working_menu_item['type'] = 'nav_menu_item';
                    array_push( $trail_array , $current_working_menu_item );

                    $current_menu_item_object = $post_cat_menu_item;
                } else {
                    $cat_menu_item = array();
                    $cat_menu_item['object'] = $post_cat_object;
                    $cat_menu_item['type'] = 'taxonomy';
                    array_push( $trail_array , $cat_menu_item );

                    //it has no parent cat
                    $posts_page_menu_item = s24_get_menu_item( get_option( 'page_for_posts') , 'post_type' );

                    if ( $post_cat_menu_item == false ) {
                        //main post page is not in menu
                        $post_page_item = array();
                        $post_page_item['object'] = get_post( get_option( 'page_for_posts') );
                        $post_page_item['type'] = 'post_type';

                        array_push( $trail_array , $post_page_item );
                        return $trail_array;
                    } else {
                        //post page is in the menu
                        $current_working_menu_item['object'] = $posts_page_menu_item;
                        $current_working_menu_item['type'] = 'nav_menu_item';
                        array_push( $trail_array , $current_working_menu_item );

                        $current_menu_item_object = $posts_page_menu_item;
                    }
                }

            }

        } elseif( is_singular( 'event' ) ) {
            //this is a single post or event - let's add it to the trail
            $post_item = array();
            $post_item['type'] = 'post_type';
            $post_item['object'] = get_post( $current_object_id );
            array_push( $trail_array , $post_item );
            $event_cat = wp_get_post_terms( $current_object_id , 'event-category' );
            if ( !empty( $event_cat ) ) {
                $event_cat_object = $event_cat[0];
                $event_cat = $event_cat_object->term_id;
                $event_cat_menu_item = s24_get_menu_item( $event_cat , 'taxonomy');
                while( ( $event_cat_menu_item == false ) && ( $event_cat_object->parent != 0 ) ) {
                    //as long as it's not a menu item and it has parents
                    $cat_menu_item = array();
                    $cat_menu_item['object'] = $event_cat_object;
                    $cat_menu_item['type'] = 'taxonomy';
                    array_push( $trail_array , $cat_menu_item );
                    $event_cat = $event_cat_object->parent;
                    $event_cat_object = get_term( $event_cat , 'event-category' );
                    $event_cat_menu_item = s24_get_menu_item( $event_cat , 'taxonomy' );
                }

                //it's either a menu item or we hit the topmost event-category in the ancestry
                if ( !empty( $event_cat_menu_item ) ) {
                    $current_working_menu_item['object'] = $event_cat_menu_item;
                    $current_working_menu_item['type'] = 'nav_menu_item';
                    array_push( $trail_array , $current_working_menu_item );

                    $current_menu_item_object = $event_cat_menu_item;
                } else {
                    $cat_menu_item = array();
                    $cat_menu_item['object'] = $event_cat_object;
                    $cat_menu_item['type'] = 'taxonomy';
                    array_push( $trail_array , $cat_menu_item );

                    //it has no parent cat
                    $events_archive_page_object = get_page_by_path( 'our-events' );

                    $events_page_menu_item = s24_get_menu_item( $events_archive_page_object->ID , 'post_type' );

                    if ( $events_page_menu_item == false ) {
                        //main post page is not in menu
                        $events_page_item = array();
                        $events_page_item['object'] = get_post( $events_archive_page_object->ID );
                        $events_page_item['type'] = 'post_type';

                        array_push( $trail_array , $events_page_item );
                        return $trail_array;
                    } else {
                        //post page is in the menu
                        $current_working_menu_item['object'] = $events_page_menu_item;
                        $current_working_menu_item['type'] = 'nav_menu_item';
                        array_push( $trail_array , $current_working_menu_item );

                        $current_menu_item_object = $events_page_menu_item;
                    }
                }

            }

        } elseif ( is_category() || is_tax() ) {
            if ( is_category() ) {
                $taxonomy_type = 'category';
            } else {
                $taxonomy_type = 'event-category';
            }

            $term_id = $current_object_id;
            $term_object = get_term( $term_id , $taxonomy_type );
            $term_menu_item = s24_get_menu_item( $term_id , 'taxonomy');
            while( ( $term_menu_item == false ) && ( $term_object->parent != 0 ) ) {
                //as long as it's not a menu item and it has parents
                $cat_menu_item = array();
                $cat_menu_item['object'] = $term_object;
                $cat_menu_item['type'] = 'taxonomy';
                array_push( $trail_array , $cat_menu_item );
                $term_id = $term_object->parent;
                $term_object = get_term( $term_id , $taxonomy_type );
                $term_menu_item = s24_get_menu_item( $term_id , 'taxonomy' );
            }

            //it's either a menu item or we hit the topmost category in the ancestry
            if ( !empty( $term_menu_item ) ) {
                $current_working_menu_item['object'] = $term_menu_item;
                $current_working_menu_item['type'] = 'nav_menu_item';
                array_push( $trail_array , $current_working_menu_item );

                $current_menu_item_object = $term_menu_item;
            } else {
                $cat_menu_item = array();
                $cat_menu_item['object'] = $term_object;
                $cat_menu_item['type'] = 'taxonomy';
                array_push( $trail_array , $cat_menu_item );

                //it has no parent cat
                $archive_page_id = get_option( 'page_for_posts' );
                if ( $taxonomy_type == 'event-category' ) {
                    $archive_page_object = get_page_by_path( 'our-events' );
                    $archive_page_id = $archive_page_object->ID;
                }

                $posts_page_menu_item = s24_get_menu_item( $archive_page_id , 'post_type' );

                if ( $term_menu_item == false ) {
                    //main post page is not in menu
                    $post_page_item = array();
                    $post_page_item['object'] = get_post( $archive_page_id );
                    $post_page_item['type'] = 'post_type';

                    array_push( $trail_array , $post_page_item );
                    return $trail_array;
                } else {
                    //post page is in the menu
                    $current_working_menu_item['object'] = $posts_page_menu_item;
                    $current_working_menu_item['type'] = 'nav_menu_item';
                    array_push( $trail_array , $current_working_menu_item );

                    $current_menu_item_object = $posts_page_menu_item;
                }
            }
            //////////////////////////////
        }
    }

    //let's find these menu ancestors!
    if ( !empty( $current_menu_item_object->menu_item_parent ) ) {
        //get the topmost menu item
        while ( !empty($current_menu_item_object->menu_item_parent) ) {
            $args = array(
                'posts_per_page' => 1,
                'p' => $current_menu_item_object->menu_item_parent
            );
            $current_menu_item_object = wp_get_nav_menu_items('main-menu', $args);
            $current_menu_item_object = $current_menu_item_object[0];

            $current_working_menu_item['object'] = $current_menu_item_object;
            $current_working_menu_item['type'] = 'nav_menu_item';
            array_push( $trail_array , $current_working_menu_item );
        }
    }

    return $trail_array;
}

function s24_build_breadcrumb_link( $link_object , $current = false ) {
    $href = '';
    $label = '';
    switch ( $link_object['type'] ) {
        case 'nav_menu_item':
            $menu_item_object = $link_object['object'];
            $href = $menu_item_object->url;
            $label = $menu_item_object->title;
            break;
        case 'taxonomy':
            $href = get_term_link( $link_object['object'] );
            $label = $link_object['object']->name;
            break;
        case 'post_type':
            $href = get_permalink( $link_object['object']->ID  );
            $label = $link_object['object']->post_title;
            break;
    }

    if ( $current ) {
        $link_html = $label;
    } else {
        $link_html = '<a href="'.$href.'">'.$label.'</a>';
    }
    return $link_html;
}

//returns menu item object or false if not in menu
function s24_get_menu_item( $item_id , $item_type ) {
    $args = array(
        'meta_query' => array(
            'relationship' => 'AND',
            array(
                'key' => '_menu_item_object_id',
                'value' => $item_id,
                'compare' => '='
            ),
            array(
                'key' => '_menu_item_type',
                'value' => $item_type,
                'compare' => '='
            )
        )
    );
    $menu_item_object = wp_get_nav_menu_items( 'main-menu' , $args);
    if ( empty($menu_item_object) ) {
        return false;
    } else {
        return $menu_item_object[0];
    }
}
