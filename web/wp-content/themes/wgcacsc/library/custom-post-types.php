<?php

add_action( 'init', 'wgccc_register_my_cpts' );
function wgccc_register_my_cpts()
{

    // Room custom post type
    $labels = array(
        "name" => __('Rooms', ''),
        "singular_name" => __('Room', ''),
        "menu_name" => __('Rooms', ''),
        "name_admin_bar" => __('Room', ''),
        'add_new'            => __('Add New', 'room', ''),
        'add_new_item'       => __('Add New Room', ''),
        'new_item'           => __('New Room', ''),
        'edit_item'          => __('Edit Room', ''),
        'view_item'          => __('View Room', ''),
        'all_items'          => __('All Rooms', ''),
        'search_items'       => __('Search Rooms', ''),
        'parent_item_colon'  => __('Parent Rooms:', ''),
        'not_found'          => __('No rooms found.', ''),
        'not_found_in_trash' => __('No rooms found in Trash.', '')
    );

    $args = array(
        "labels" => $labels,
        "description" => "",
        "public" => true,
        "show_ui" => true,
        "show_in_rest" => false,
        "rest_base" => "",
        "has_archive" => false,
        "show_in_menu" => true,
        "exclude_from_search" => false,
        "capability_type" => "post",
        "map_meta_cap" => true,
        "hierarchical" => false,
        "rewrite" => array("slug" => "rooms"),
        "query_var" => true,
        "menu_icon" => "dashicons-id-alt",
        "supports" => array("title", "excerpt", "revisions", "author"),
    );
    register_post_type("room", $args);


    // Clients custom post type
    $labels = array(
        "name" => __('Our Clients', ''),
        "singular_name" => __('Client', ''),
        "menu_name" => __('Clients', ''),
        "name_admin_bar" => __('Clients', ''),
        'add_new'            => __('Add New', 'client', ''),
        'add_new_item'       => __('Add New Client', ''),
        'new_item'           => __('New Client', ''),
        'edit_item'          => __('Edit Client', ''),
        'view_item'          => __('View Client', ''),
        'all_items'          => __('All Clients', ''),
        'search_items'       => __('Search Clients', ''),
        'parent_item_colon'  => __('Parent Client:', ''),
        'not_found'          => __('No client found.', ''),
        'not_found_in_trash' => __('No clients found in Trash.', '')
    );

    $args = array(
        "labels" => $labels,
        "description" => "",
        "public" => true,
        "show_ui" => true,
        "show_in_rest" => false,
        "rest_base" => "",
        "has_archive" => true,
        "show_in_menu" => true,
        "exclude_from_search" => false,
        "capability_type" => "post",
        "map_meta_cap" => true,
        "hierarchical" => false,
        "rewrite" => array("slug" => "about/clients"),
        "query_var" => true,
        "menu_icon" => "dashicons-groups",
        "supports" => array("title", "revisions", "author"),
    );
    register_post_type("client", $args);


//    // Event custom post type
//    $labels = array(
//        "name" => __('Events', ''),
//        "singular_name" => __('Event', ''),
//        "menu_name" => __('Events', ''),
//        "name_admin_bar" => __('Event', ''),
//        'add_new'            => __('Add New', 'event', ''),
//        'add_new_item'       => __('Add New Event', ''),
//        'new_item'           => __('New Event', ''),
//        'edit_item'          => __('Edit Event', ''),
//        'view_item'          => __('View Event', ''),
//        'all_items'          => __('All Events', ''),
//        'search_items'       => __('Search Events', ''),
//        'parent_item_colon'  => __('Parent Events:', ''),
//        'not_found'          => __('No events found.', ''),
//        'not_found_in_trash' => __('No events found in Trash.', '')
//    );
//
//    $args = array(
//        "labels" => $labels,
//        "description" => "",
//        "public" => true,
//        "show_ui" => true,
//        "show_in_rest" => false,
//        "rest_base" => "",
//        "has_archive" => false,
//        "show_in_menu" => true,
//        "exclude_from_search" => false,
//        "capability_type" => "post",
//        "map_meta_cap" => true,
//        "hierarchical" => false,
//        "rewrite" => array("slug" => "events"),
//        "query_var" => true,
//        "menu_icon" => "dashicons-calendar-alt",
//        "supports" => array("title", "excerpt", "revisions", "author"),
//    );
//    register_post_type("event", $args);

}