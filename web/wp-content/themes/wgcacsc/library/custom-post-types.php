<?php

add_action( 'init', 'wgcacsc_register_my_cpts' );
function wgcacsc_register_my_cpts()
{
    // Event custom post type
    $labels = array(
        "name" => __('Events', ''),
        "singular_name" => __('Event', ''),
        "menu_name" => __('Events', ''),
        "name_admin_bar" => __('Event', ''),
        'add_new'            => __('Add New', 'event', ''),
        'add_new_item'       => __('Add New Event', ''),
        'new_item'           => __('New Event', ''),
        'edit_item'          => __('Edit Event', ''),
        'view_item'          => __('View Event', ''),
        'all_items'          => __('All Events', ''),
        'search_items'       => __('Search Events', ''),
        'parent_item_colon'  => __('Parent Events:', ''),
        'not_found'          => __('No events found.', ''),
        'not_found_in_trash' => __('No events found in Trash.', '')
    );

    $args = array(
        "labels" => $labels,
        "description" => "",
        "public" => true,
        "show_ui" => true,
        "has_archive" => true,
        "show_in_menu" => true,
        "exclude_from_search" => false,
        "capability_type" => "post",
        "map_meta_cap" => true,
        "rewrite" => array("slug" => "our-events"),
        "query_var" => true,
        "menu_icon" => "dashicons-calendar-alt",
        "supports" => array("title", "excerpt", "revisions", "author"),
    );
    register_post_type("event", $args);

    $labels = array(
        'name'              => _x( 'Event Categories', '' ),
        'singular_name'     => _x( 'Event Category', '' ),
        'search_items'      => __( 'Search Event Categories', '' ),
        'all_items'         => __( 'All Event Categories', '' ),
        'parent_item'       => __( 'Parent Event Category', '' ),
        'parent_item_colon' => __( 'Parent Event Category:', '' ),
        'edit_item'         => __( 'Edit Event Category', '' ),
        'update_item'       => __( 'Update Event Category', '' ),
        'add_new_item'      => __( 'Add New Event Category', '' ),
        'new_item_name'     => __( 'New Event Category Name', '' ),
        'menu_name'         => __( 'Event Category', '' ),
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'event-type' ),
    );

    register_taxonomy( 'event-category', array( 'event' ), $args );
}
