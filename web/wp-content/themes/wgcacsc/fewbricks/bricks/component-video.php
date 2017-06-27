<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class video
 * @package fewbricks\bricks
 */
class component_video extends project_brick
{

    /**
     * @var string
     */
    protected $label = 'Video';

    /**
     *
     */
    public function set_fields()
    {

        $this->add_field(new acf_fields\text('Heading', 'heading', '150820161414a'));

        $this->add_field(
            (new acf_fields\oembed('URL', 'url', '140820161415a'))
                ->set_settings([
                    'instructions' => 'Enter the URL of the YouTube or Vimeo video that you want to display.'
                ])
        );

    }

    /**
     * @return string
     */
    protected function get_brick_html($args = array())
    {

        $html = '<h3 class="section-heading section-heading--centered">' . $this->get_field('heading') . '</h3>';

        if (false !== ($url = $this->get_video_url())) {

            $html .= '
                <div class="component component-video">
                    <div class="embed-responsive embed-responsive-16by9">
                        <iframe src="' . $url . '" allowfullscreen></iframe>
                    </div>
                </div>';

        }

        return $html;

    }

    /**
     * @return bool|mixed|null|void
     */
    private function get_video_url()
    {

        $url = $this->get_field('url');

        if (!empty($url)) {

            preg_match('/src="(.+?)"/', $this->get_field('url'), $matches);

            if (isset($matches[1])) {

                $url_match = $matches[1];

                if (isset($matches[1])) {

                    $params = [];
                    $params['showinfo'] = 0;
                    $params['modestbranding'] = 1;
                    $params['theme'] = 'light';
                    $params['rel'] = 0;
                    $params['wmode'] = 'transparent';

                    if (!empty($params)) {
                        $url = add_query_arg($params, $url_match);
                    }

                }

            }

        }

        return (empty($url) ? false : $url);

    }

}
