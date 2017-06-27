<?php

add_action( 'init', 'wgccc_register_my_taxonomies' );
function wgccc_register_my_taxonomies() {
    // Room Layouts
    register_taxonomy( 'room_layouts', array( 'room' ), array('hierarchical' => true, 'label' => 'Layouts'));

    // Room Capacities
    register_taxonomy( 'room_capacities', array( 'room' ), array('hierarchical' => true, 'label' => 'Capacities'));
}
