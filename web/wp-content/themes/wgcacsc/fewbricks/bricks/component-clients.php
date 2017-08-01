<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_clients
 * @package fewbricks\bricks
 */
class component_clients extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Clients';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('Clients Title', 'clients_title', '211120161138a', [
            'instructions' => 'An optional heading that would appear centered above the clients list'
        ]));

        $this->add_field(new acf_fields\relationship('Clients', 'clients', '181120161739a', [
            'allow_null' => 0,
            'max' => 6,
            'instructions' => 'lorem ipsum',
            'post_type' => 'client',
            'filters' => array(
                0 => 'search'
            )
        ]));

    }

    /**
     * @return string|void
     */
    public function get_brick_html( $args = array())
    {

        $html = '';
        $clients = $this->get_field('clients');
        $title = $this->get_field('clients_title');

        if(!empty($clients)) {
            $html .= '<div class="component component-clients">';
            if(!empty($title)) {
                $html .= '<h2 class="section-heading section-heading--centered">' . $title . '</h2>';
            }
            $html .= '<ol class="clients-list row">';

            foreach ($clients as $client) {
                $clientHasTestimonial = get_field('client_testimonial', $client->ID);
                $link = ($clientHasTestimonial == true) ? get_permalink($client->ID) : get_post_type_archive_link('client');

                $html .= '<li class="client-item small-6 medium-2 columns' . (($clientHasTestimonial == true) ? ' client-item--linked' : '') . '">';
                $html .= '<a class="client-item__inner" href="' . $link . '">';

                $imageID = get_field('client_logo', $client->ID);
                $imageSrc = wp_get_attachment_image_url($imageID, 'client-logo--small');
                $image = '<img src="' . $imageSrc . '" alt="Logo for ' . $client->post_title . '" />';

                $html .= $image;
                $html .= '</li>';
            }

            $html .= '</ol>';
            $html .= '<a href="' . get_post_type_archive_link('client') . '" class="button button-cta">see all our clients</a>';
            $html .= '</div>';
        }

        return $html;

    }

}
