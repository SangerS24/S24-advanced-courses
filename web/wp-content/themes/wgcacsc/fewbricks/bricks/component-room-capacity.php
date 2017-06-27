<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_room_capacity
 * @package fewbricks\bricks
 */
class component_room_capacity extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Room Capacities';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('Cabaret', 'layout_cabaret', '180820161549a'));
        $this->add_field(new acf_fields\text('Board', 'layout_board', '180820161549b'));
        $this->add_field(new acf_fields\text('Class', 'layout_class', '180820161549c'));
        $this->add_field(new acf_fields\text('U Shape', 'layout_u_shape', '180820161549d'));
        $this->add_field(new acf_fields\text('Theatre', 'layout_theatre', '180820161549e'));

    }

    protected function test_seating_number($seatingValue = '') {

        if(!empty($seatingValue) && strtolower(trim($seatingValue)) != 'n/a') {
            return true;
        } else {
            return false;
        }

    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        $html = '';

        $cabaret = $this->get_field('layout_cabaret');
        $board = $this->get_field('layout_board');
        $class = $this->get_field('layout_class');
        $uShape = $this->get_field('layout_u_shape');
        $theatre = $this->get_field('layout_theatre');

        if(
            $this->test_seating_number($cabaret) ||
            $this->test_seating_number($board) ||
            $this->test_seating_number($class) ||
            $this->test_seating_number($uShape) ||
            $this->test_seating_number($theatre)
        ) {

            if (!isset($args['full'])) {
                $args['full'] = false;
            }

            $html = '';

            if ($args['full'] == true) {
                $html .= '<div class="component component-room-capacity offset-content">';

                $html .= '<h2 class="section-heading-small">Room Layout and Capacities</h2>';
                $html .= '<div class="component-room-capacity__inner">';
            }
            $html .= '<ol class="menu simple room-capcities">';
            $html .= '<li class="room-capacity room-cabaret' . ($this->test_seating_number($cabaret) ? '' : ' room-capacity--empty') . '"><img src="' . get_template_directory_uri() . '/assets/images/room_cabaret_icon.svg" alt="" /><p>Cabaret<br />' . ($this->test_seating_number($cabaret) ? '<span class="room-capacity__capacity room-capacity__capacity--cabaret">' . $cabaret . '</span>' : 'N/A') . '</span></p></li>';
            $html .= '<li class="room-capacity room-board' . ($this->test_seating_number($board) ? '' : ' room-capacity--empty') . '"><img src="' . get_template_directory_uri() . '/assets/images/room_board_icon.svg" alt="" /><p>Boardroom<br />' . ($this->test_seating_number($board) ? '<span class="room-capacity__capacity room-capacity__capacity--boardroom">' . $board . '</span>' : '<span class="room-capacity__not-applicable">N/A</span>') . '</p></li>';
            $html .= '<li class="room-capacity room-class' . ($this->test_seating_number($class) ? '' : ' room-capacity--empty') . '"><img src="' . get_template_directory_uri() . '/assets/images/room_class_icon.svg" alt="" /><p>Classroom<br />' . ($this->test_seating_number($class) ? '<span class="room-capacity__capacity room-capacity__capacity--classroom">' . $class . '</span>' : '<span class="room-capacity__not-applicable">N/A</span>') . '</p></li>';
            $html .= '<li class="room-capacity room-u-shape' . ($this->test_seating_number($uShape) ? '' : ' room-capacity--empty') . '"><img src="' . get_template_directory_uri() . '/assets/images/room_u_shape_icon.svg" alt="" /><p>U Shape<br />' . ($this->test_seating_number($uShape) ? '<span class="room-capacity__capacity room-capacity__capacity--u-shape">' . $uShape . '</span>' : '<span class="room-capacity__not-applicable">N/A</span>') . '</p></li>';
            $html .= '<li class="room-capacity room-theatre' . ($this->test_seating_number($theatre) ? '' : ' room-capacity--empty') . '"><img src="' . get_template_directory_uri() . '/assets/images/room_theatre_icon.svg" alt="" /><p>Theatre<br />' . ($this->test_seating_number($theatre) ? '<span class="room-capacity__capacity room-capacity__capacity--theatre">' . $theatre . '</span>' : '<span class="room-capacity__not-applicable">N/A</span>') . '</p></li>';
            $html .= '</ol>';
            if ($args['full'] == true) {
                $html .= '</div>';

                $html .= '</div>';
            }

        }

        return $html;

    }


    public function get_room_capacities_array() {

        $capacities = array();
        if($this->test_seating_number($this->get_field('layout_cabaret'))) {
            $capacities['cabaret'] = $this->get_field('layout_cabaret');
        }
        if($this->test_seating_number($this->get_field('layout_board'))) {
            $capacities['board'] = $this->get_field('layout_board');
        }
        if($this->test_seating_number($this->get_field('layout_class'))) {
            $capacities['class'] = $this->get_field('layout_class');
        }
        if($this->test_seating_number($this->get_field('layout_u_shape'))) {
            $capacities['shape'] = $this->get_field('layout_u_shape');
        }
        if($this->test_seating_number($this->get_field('layout_theatre'))) {
            $capacities['theatre'] = $this->get_field('layout_theatre');
        }

        return $capacities;

    }


}
