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
            'param' => 'page_type',
            'operator' => '!=',
            'value' => 'front_page'
        ]
    ],
    [
        [
            'param' =>'taxonomy',
            'operator' => '==',
            'value' => 'event-category'
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
            'param' => 'page_type',
            'operator' => '==',
            'value' => 'front_page'
        ],
    ]
];

// Create field group
$fg_front_subheading = (new fewacf\field_group('Sub Heading', '201708081454a', $location, 5, [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_front_subheading->add_brick(new bricks\component_section_heading_home('page_sub_heading', '201708081454b'));

// Register the field group
$fg_front_subheading->register();

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



$fg_front_featured = (new fewacf\field_group( 'Featured content' , '201708081612a' , $location , 10 , [
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_front_featured->add_field(new acf_fields\message( 'events ctas section' ,  'events_cta_section' , '201708081628a' , [
    'message' => '<h1>Events CTAs</h1>'
]));
$fg_front_featured->add_brick(new bricks\component_cta_list_home( 'events_call_to_action' ,'201708081612b' ));

$fg_front_featured->add_field(new acf_fields\message( 'spotlight events section' ,  'spotlight_events_section' , '201708081628c' , [
    'message' => '<h1>Spotlight Events</h1>'
]));

$fg_front_featured->add_brick(new bricks\component_featured_events( 'featured_events' ,'201708081612d' ));

$fg_front_featured->add_field(new acf_fields\message( 'latest news' ,  'latest_news_section' , '201708081628e' , [
    'message' => '<h1>Latest news appears here</h1>'
]));

$fg_front_featured->register();

//newsletter and download
$fg_front_newsletter_and_download = (new fewacf\field_group( 'Newsletter and programme download' , '201807091037a' , $location , 12 , [
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_front_newsletter_and_download->add_field(new acf_fields\message( 'newsletters section' , 'newsletter_section' , '201807091037b' , [
    'message' => '<h1>Newsletter Sign Up</h1>'
]));

$fg_front_newsletter_and_download->add_brick(new bricks\component_newsletter( 'front_newsletter' , '201807091037c') );

$fg_front_newsletter_and_download->add_field(new acf_fields\message( 'programme download section' , 'download_section' , '201807091037d' , [
    'message' => '<h1>Programme Download</h1>'
]));

$fg_front_newsletter_and_download->add_brick(new bricks\component_download( 'front_download' , '201807091037d') );

$fg_front_newsletter_and_download->register();

// Create field group
$fg_front_bottom = (new fewacf\field_group('Bottom components', '201708081554a', $location, 15, [
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_front_bottom->add_brick(new bricks\group_flexible_content('bottom_components', '201708081554b'));

// Register the field group
$fg_front_bottom->register();

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

//// Key details - e.g. dates, deadlines

$fg_event_key_details = (new fewacf\field_group( 'Event Key Details' , '201707191650a' , $location , 1 , [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_key_details->add_brick(new bricks\component_section_heading('page_sub_heading', '201707311344a'));
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

/// Registration links etc.

$fg_event_registration_info = (new fewacf\field_group( 'Event Registration Details' , '201707191720a' , $location , 2 , [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_registration_info->add_field(new acf_fields\text( 'Registration page link' , 'registration_link' , '201707191720b' , [
    'instructions' => 'If left blank, the registration button will not appear and will be replaced by the text entered in the next field.'
]));

$fg_event_registration_info->add_field(new acf_fields\text( 'Registration button replacement text' , 'registration_button_replacement' , '201707191720z' , [
    'default_value' => 'Registration opens soon, contact the conference organiser.'
]) );

$fg_event_registration_info->add_field(new acf_fields\wysiwyg( 'Pre-registration holding content' , 'holding_content' , '201707191720c' , [
    'instructions' => 'Content that appears if the registration is not yet open. Make sure to remove it for the event content to show.'
]));

$fg_event_registration_info->register();


////Programme download

$fg_event_download = (new fewacf\field_group( 'Event downloadable programme' , '201707311348a' , $location , 3 , [
    'position' => 'acf_after_title',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_download->add_field(new acf_fields\file( 'File' , 'event_download_file' , '201707311349a' ));
$fg_event_download->add_field(new acf_fields\text( 'Download link text' , 'event_download_label' , '201707311349b' , [
    'default_value' => 'Download full programme (PDF)'
]));

$fg_event_download->register();


//// Full details collapsibles

$fg_event_full_details = (new fewacf\field_group( 'Event full details' , '201707311412a' , $location , 20 , [
    'style' => 'seamless'
]));

$fg_event_full_details->add_brick(new bricks\component_event_collapsibles( 'event_details_panels' , '201707311416a' ) );

$fg_event_full_details->register();

$fg_event_bottom_components = (new fewacf\field_group('Bottom components', '201707311421a', $location, 50));

$fg_event_bottom_components->add_brick(new bricks\group_flexible_content('standard_components', '201707311421b'));

// Register the field group
$fg_event_bottom_components->register();


$fg_event_flags = (new fewacf\field_group( 'Event flags' , '201707311329a' , $location , 10 , [
    'position' => 'side',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

///side ACFS

// Flags (new, course type)

$fg_event_flags->add_field(new acf_fields\checkbox( 'Flag as new' , 'flag_new' , '201707311331a' , [
    'choices' => [
        'new' => 'Yes, flag as new'
    ]
]));

$fg_event_flags->add_field(new acf_fields\radio( 'Course type flag' , 'flag_course_type' , '201707311336a' , [
    'choices' => [
        'none' => 'None (or not a course)',
        'computational' => 'Computational',
        'lecture' => 'Lecture/Discussion',
        'laboratory' => 'Laboratory'
    ],
    'default_value' => 'none'
]));

$fg_event_flags->register();

//sidebar elements

$fg_event_side_sponsors = (new fewacf\field_group( 'In association with' , '201707311456a' , $location , 20 , [
    'position' => 'side',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_side_sponsors->add_brick(new bricks\component_sponsors_side( 'side_sponsors' , '201707311456b' ) );

$fg_event_side_sponsors->register();

$fg_event_side_questions = (new fewacf\field_group( 'Questions' , '201707311456c' , $location , 30 , [
    'position' => 'side',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_side_questions->add_field(new acf_fields\text( 'Title' , 'side_questions_title' , '201707311456d', [
    'default_value' => 'Questions?'
]));

$default_questions_content = <<<EOD
<a href="mailto:advancedcourses@wellcomegenomecampus.org">Email the organisers</a>

or calls us: +44 (0)1223 495100
EOD;


$fg_event_side_questions->add_field(new acf_fields\wysiwyg( 'Content' , 'side_question_content' , '201707311456e' , [
    'default_value' => $default_questions_content
]));

$fg_event_side_questions->register();

$fg_event_side_share = (new fewacf\field_group( 'Share' , '201707311514a' , $location , 40 , [
    'position' => 'side',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_side_share->add_field(new acf_fields\text( 'Hashtag' , 'side_share_hashtag' , '201707311514c' ) );

$fg_event_side_share->register();


/*
 * Event categories bottom components
 */

$location = [
    [
        [
            'param' => 'taxonomy',
            'operator' => '==',
            'value' => 'event-category'
        ]
    ]
];

$fg_event_cat_bottom = (new fewacf\field_group( 'Bottom components' , 'event_cat_bottom' , $location , 60 , [
    'position' => 'normal',
    'names_of_items_to_hide_on_screen' => [
        0 => 'the_content'
    ]
]));

$fg_event_cat_bottom->add_brick(new bricks\group_flexible_content( 'bottom_components' , '201708021123a' ));

$fg_event_cat_bottom->register();