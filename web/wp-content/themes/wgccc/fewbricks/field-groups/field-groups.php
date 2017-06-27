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
            'value' => 'room'
        ],
    ],
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
            'value' => 'event'
        ],
    ],
    [
        [
            'param' => 'page_template',
            'operator' => '==',
            'value' => 'default'
        ],
    ],
    [
        [
            'param' => 'page_template',
            'operator' => '==',
            'value' => 'page-templates/page-room-listing.php'
        ],
    ],
    [
        [
            'param' => 'page_template',
            'operator' => '==',
            'value' => 'page-templates/page-news-listing.php'
        ],
    ],
    [
        [
            'param' => 'page_template',
            'operator' => '==',
            'value' => 'page-templates/page-contact.php'
        ],
    ],
    [
        [
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'client',
        ]
    ]
];


// Create field group
$fg = (new fewacf\field_group('Sub Heading', '180820161345a', $location, 5, [
    'position' => 'acf_after_title'
]));

$fg->add_brick(new bricks\component_section_heading('page_sub_heading', '150820161606a'));

// Register the field group
$fg->register();


// Create field group
$fg0 = (new fewacf\field_group('Hero', '150820161607a', $location, 3, [
    'position' => 'acf_after_title'
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
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'room'
        ],
    ]
];


// Create field group
$fg2 = (new fewacf\field_group('Room Layouts', '180820161559a', $location, 12));

$fg2->add_brick(new bricks\component_room_capacity('room_capacity', '180820161600a'));

// Register the field group
$fg2->register();


// Create field group
$fg3 = (new fewacf\field_group('Room Image Carousel', '190820161713a', $location, 11));

$fg3->add_brick(new bricks\component_image_list('room_image_carousel', '190820161713b'));

// Register the field group
$fg3->register();



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
    'position' => 'acf_after_title'
]));

$fg35->add_brick(new bricks\component_hero_list('page_heroes', '220820161421b'));

// Register the field group
$fg35->register();



$fg36 = (new fewacf\field_group('Introduction', '300820161550a', $location, 9));

$fg36->add_brick(new bricks\component_summary('homepage_introduction', '300820161550b'));

$fg36->register();



$fg4 = (new fewacf\field_group('CTAs', '220820161109a', $location, 10));

$fg4->add_brick(new bricks\component_cta_list('homepage_cta_list_1', '220820161107a'));

//$fg4->add_brick(new bricks\component_cta_list('homepage_cta_list_2', '220820161111a'));

$fg4->register();


$fg5 = (new fewacf\field_group('Homepage Testimonial', '220820161110a', $location, 14));

$fg5->add_brick(new bricks\component_testimonial('homepage_testimonial', '220820161110b'));

$fg5->register();


$fg53 = (new fewacf\field_group('Homepage Clients Featured', '181120161741a', $location, 14));

$fg53->add_brick(new bricks\component_clients('homepage_clients', '181120161741b'));

$fg53->register();



$fg55 = (new fewacf\field_group('Homepage Highlighted Content', '220920161219a', $location, 14));

$fg55->add_field(new acf_fields\text('Homepage Highlighted Content Title', 'content_bottom_title', '220920161220a'));

$fg55->register();


$location = [
    [
        [
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'post'
        ]
    ]
];

$fg8 = (new fewacf\field_group('Base Settings', '210920161440a', $location, 4, [
    'position' => 'acf_after_title',
    'hide_on_screen' => [
        0 => 'the_content',
        2 => 'custom_fields',
        3 => 'discussion',
        4 => 'comments',
        5 => 'revisions',
        6 => 'slug',
        7 => 'author',
        8 => 'format',
        10 => 'featured_image',
        12 => 'tags',
        13 => 'send-trackbacks',
    ]
]));

$fg8->add_field(new acf_fields\radio('Promote to homepage', 'promoted_to_homepage', '300820160918a', [
    'instructions' => 'Whether or not to display this item at the bottom of the homepage. The \'Remove from homepage\' date must also be set for this to work correctly',
    'choices' => array(
        '0' => 'Don\'t promote to homepage',
        '1' => 'Promote to homepage'
    )
]));
$fg8->add_field(new acf_fields\date_picker('Remove from homepage', 'promoted_to_homepage_expiry', '220920160843a', [
    'instructions' => 'Specify a date after which the post will no longer appear on the homepage. If you specified 22nd of September for example, the post would stop displaying on the homepage on the 22nd of September at 23:590 This field must be set if you want this item to appear on the homepage.'
]));
$fg8->add_brick(new bricks\component_listing_image('listing_image', '210920161445a'));
$fg8->add_field(new acf_fields\text('Listing Summary', 'listing_summary', '210920161008a', [
    'instructions' => 'Add a summary to show on listing pages/the homepage. For events, if this isn\'t filled in, then the event details are used to populate the listing page. If you populate this field for an event, a read more link will be displayed linking through to further details regarding the event.'
]));
$fg8->register();


$location = [
    [
        [
            'param' => 'post_category',
            'operator' => '==',
            'value' => 'category:events',
        ]
    ],
    [
        [
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'event'
        ],
    ],
];


$fg6 = (new fewacf\field_group('Event Details', '300820160901a', $location, 14));

$fg6->add_field(new acf_fields\text('Organiser', 'organiser', '300820160902a'));
$fg6->add_field(new acf_fields\date_picker('Event start date', 'event_date', '300820160902b', [
    'instructions' => 'This date is used to determine the order of the event in the news/events listing. It is also displayed above the event title on the website.'
]));
$fg6->add_field(new acf_fields\text('Event Date Details', 'event_date_details', '220920161537a', [
    'instructions' => 'This is displayed under the event details, and should be used to highlight which dates the conference runs, e.g. 22-24 September etc.'
]));
$fg6->add_field(new acf_fields\url('Event website', 'event_website', '300820160902c'));

$fg6->register();




$location = [
    [
        [
            'param' => 'post_type',
            'operator' => '==',
            'value' => 'client',
        ]
    ]
];

$fg9 = (new fewacf\field_group('Client Details', '181120161802a', $location, 10));
$fg9->add_field(new acf_fields\image('Client Logo', 'client_logo', '181120161802b', [
    'instructions' => 'Add a logo for the client.'
]));
$fg9->add_field(new acf_fields\true_false('Does the client have a testimonial?', 'client_testimonial', '211120161321a', [
    'instructions' => 'If this checkbox is checked it means the logo will link through to a page containing the generic page components populated below.'
]));

$fg9->register();
