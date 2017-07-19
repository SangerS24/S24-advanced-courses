<?php

/**
 * Example file on how to build field groups.
 * "Namespacing" by prefixing variable names with "fewbricks" is optional
 * but is recommended to avoid the, clashing with other data in WordPress.
 */

use fewbricks\bricks AS bricks;
use fewbricks\acf AS fewacf;
use fewbricks\acf\fields AS acf_fields;

// --- Generic pages - all components are available by default ---

$location = [
    [
        [
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'post'
        ],
    ],
    [
        [
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'page'
        ],
        [
            'param' => 'page_template',
            'operator' => '!=',
            'value' => 'page-templates/front.php'
        ]
    ]
];


// Create field group
$fg = (new fewacf\field_group('Sub Heading', '180820161345a', $location, 5, [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg->add_brick(new bricks\component_section_heading('page_sub_heading', '150820161606a'));

// Register the field group
$fg->register();


// Create field group
$fg0 = (new fewacf\field_group('Hero', '150820161607a', $location, 3, [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg0->add_brick(new bricks\component_hero_list('page_heroes', '150820161606a'));

// Register the field group
$fg0->register();


// Create field group
$fg1 = (new fewacf\field_group('Standard page components', '150901113b', $location, 15));

$fg1->add_brick(new bricks\group_flexible_content('standard_components', '1509111553r'));

// Register the field group
$fg1->register();



$location = [
    [
        [
            'param' => 'page_template',
            'operator' => '==',
            'value' => 'page-templates/front.php'
        ],
    ]
];

// Create field group
$fg35 = (new fewacf\field_group('Hero', '220820161421a', $location, 8, [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg35->add_brick(new bricks\component_hero_list('page_heroes', '220820161421b'));

// Register the field group
$fg35->register();


/*
 * Events ACFs
 */
$location = [
    [
        [
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'event'
        ]
    ]
];

$fg_event_key_details = (new fewacf\field_group( 'Event Key Details' , '201707191650a' , $location , 1 , [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_key_details->add_field(new acf_fields\date_picker( 'Start date' , 'start_date' , '201707191652a' ) );
$fg_event_key_details->add_field(new acf_fields\date_picker( 'End date' , 'end_date' , '201707191652b' ) );
$fg_event_key_details->add_field(new acf_fields\text( 'Location' , 'location' , '201707191652c' ) );

$fg_event_key_details->add_field((new acf_fields\repeater( 'Deadlines' , 'deadlines' , '201707191655a' , [
    'button_label' => 'Add deadline'
]))
    ->add_sub_field(new acf_fields\text( 'Deadline name' , 'name' , '201707191656a'))
    ->add_sub_field(new acf_fields\date_picker( 'Date' , 'date' , '201707191656b' , [
        'instructions' => 'The deadline will be marked as closed after this date.'
    ]))
    ->add_sub_field(new acf_fields\checkbox( 'Close now?' , 'closed' , '201707191656c' , [
        'choices' => [
            'closed' => 'Yes'
        ],
        'instructions' => 'Tick this box to close the deadline even if the date has not passed.'
    ])));

$fg_event_key_details->register();

$fg_event_registration_info = (new fewacf\field_group( 'Event Registration Details' , '201707191720a' , $location , 2 , [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_registration_info->add_field(new acf_fields\text( 'Registration page link' , 'registration_link' , '201707191720b' , [
    'instructions' => 'If left blank, the registration button will not appear.'
]));

$fg_event_registration_info->add_field(new acf_fields\wysiwyg( 'Pre-registration holding content' , 'holding_content' , '201707191720c' , [
    'instructions' => 'Content that appears if the registration is not yet open. Make sure to remove it for the event content to show.'
]));

$fg_event_registration_info->register();