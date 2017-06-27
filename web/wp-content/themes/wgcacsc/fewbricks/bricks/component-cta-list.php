<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_cta_list
 * @package fewbricks\bricks
 */
class component_cta_list extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'CTA List';

    /**
     * @var int
     *
     * The maximum number of heroes that can be input by a user per block
     */
    protected $limit = 3;

    protected $fullWidth = false;

    public function __construct($name = '', $key = '', $args = array())
    {
        if(isset($args['limit'])) {
            $this->limit = $args['limit'];
        }

        parent::__construct($name, $key);
    }

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields() {

        $this->add_field(new acf_fields\text('CTA Group Title', 'cta_list_title', '290720161518d', [
            'instructions' => 'An optional heading that would appear centered above the list of CTAs'
        ]));

        $this->add_repeater((new acf_fields\repeater('CTA List', 'cta_list', '290720161518e', [
            'button_label' => 'Add CTA',
            'required' => 0,
            'min' => 0,
            'max' => $this->limit
        ]))
            ->add_brick(new component_cta('cta_list_item', '290720161518f')));

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {

        if(isset($args['full_width'])) {
            $this->fullWidth = true;
        }

        $html = '';

        $title = $this->get_field('cta_list_title');

        $numCtas = count($this->get_field('cta_list'));

        $ctaClass = '';
        $ctaSize = '';
        if($numCtas == 1) {
            $ctaClass = 'small-12 columns cta-item--full';
            $ctaSize = 'full';
        } else if($numCtas == 2) {
            $ctaClass = 'small-12 medium-6 columns cta-item--half';
            $ctaSize = 'half';
        } else if($numCtas == 3) {
            $ctaClass = 'small-12 large-4 columns cta-item--third';
            $ctaSize = 'third';
        }

        $test = $this->have_rows('cta_list');
        $testContent = $this->get_field('cta_list');

        if ($this->have_rows('cta_list')) {

            $html = '
                <div class="component cta-group">';
            if(!empty($title)) {
                $html .= '<h2 class="section-heading section-heading--centered">'. $title .'</h2>';
            }

            $html .= '<div class="row cta-group-items">';
            while ($this->have_rows('cta_list')) {

                $this->the_row();

                $ctaItem = $this->get_child_brick_in_repeater('cta_list', 'cta_list_item', 'component_cta')->get_html(['ctaClass' => $ctaClass, 'ctaSize' => $ctaSize, 'containerFullWidth' => $this->fullWidth]);
                $html .= $ctaItem;

            }
            $html .= '</div>
              </div> <!-- /.cta-group -->
            ';

        }

        return $html;

    }

}
