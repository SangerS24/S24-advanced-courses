<?php

/**
 * Use this class to add project specific brick stuff. This is to avoid having the brick class polluted with
 * irrelevant stuff and make it easier to identify neat new stuff that may be re-used for other projects.
 */

namespace fewbricks\bricks;

/**
 * Class project_brick
 * @package fewbricks\bricks
 */
class project_brick extends brick
{

    /**
     * @var bool
     */
    private static $headline_tag = false;

    /**
     * @param string $name
     * @param string $key
     */
    public function __construct($name = '', $key = '')
    {

        parent::__construct($name, $key);

    }

    /**
     * This function must exist regardless of if it has a body or not.
     * Called after set_fields have been called.
     * Use to add any fields that every brick in the project should have.
     */
    public function set_project_fields()
    {

    }

    /**
     * Wrapper function for ACFs have_rows()
     * @param $name
     * @return bool
     */
    protected function have_rows($name , $post_id = false)
    {

        if ($this->is_option) {
            $outcome = have_rows($this->get_data_name('_' . $name), 'option');
        } else {
            $outcome = have_rows($this->get_name() . '_' . $name , $post_id);
        }

        return $outcome;

    }

    /**
     * @param $data_key
     * @param bool $value
     * @return string
     */
    protected function demo_get_headline_html($data_key, $value = false)
    {

        $this->demo_set_headline_tag();

        $headline = ($value !== false ? $value : $this->get_field($data_key));

        $html = '';

        if (!empty($headline)) {

            $html .= '<' . self::$headline_tag . '>' . $headline . '</' . self::$headline_tag . '>';

        }

        return $html;

    }

    /**
     *
     */
    protected function demo_set_headline_tag()
    {

        switch (self::$headline_tag) {

            case 'h1' :

                self::$headline_tag = 'h2';
                break;

            default :

                self::$headline_tag = 'h1';

        }

    }

    /**
     * @param array $args Any arguments that you need to pass to the brick on runtime. Available as $this->get_html_args
     * @param mixed $brick_layouts Array or string with the file name(s) (without .php) of any layouts that you want to
     * wrap the brick in. Layout files must be placed in [theme]/fewbricks/brick-layouts/.
     * @return string
     */
    public function get_html($args = [], $brick_layouts = false)
    {

        if ( !$this->get_is_layout() && !$this->get_is_sub_field() && isset( $args['post_id']) ) {
            $this->set_post_id_to_get_field_from($args['post_id']);
        }

        $this->set_brick_layouts($brick_layouts);

        $this->get_html_args = $args;

        return $this->get_brick_layouted_html($this->get_brick_html($args));

    }

}
