<?php

namespace fewbricks\bricks;

use fewbricks\acf\fields as acf_fields;

/**
 * Class component_content
 * @package fewbricks\bricks
 */
class component_newsletter extends project_brick
{

    /**
     * @var string This will be the default label showing up in the editor area for the administrator.
     * It can be overridden by passing an item with the key "label" in the array that is the second argument when
     * creating a brick.
     */
    protected $label = 'Newsletter signup form';

    /**
     * This is where all the fields for the brick will be set-
     */
    public function set_fields()
    {
        $this->add_field(new acf_fields\text( 'Title' , 'title' , '201707151548a' , [
            'default_value' => 'Sign up to our monthly newsletter'
        ]) );

        $default_text =<<<EOD
Each month, our email newsletter highlights upcoming conferences and courses.

The newsletter also includes details about sponsorship opportunities and our overseas courses and retreats.
EOD;

        $this->add_field(new acf_fields\wysiwyg('Intro text', 'text', '201707151548b', [
            'default_value' => $default_text
        ]));

        $this->add_field(new acf_fields\text( 'Label for email form field' , 'label' , '201707151548c' , [
            'default_value' => 'Enter your email address'
        ]));

        $this->add_field(new acf_fields\text( 'Label for submit button' , 'label_button' , '201707151548e' , [
            'default_value' => 'Sign up'
        ]));

        $this->add_field(new acf_fields\wysiwyg( 'Content' , 'archive_link' , '201707151548f'));
    }

    /**
     * @return string|void
     */
    public function get_brick_html($args = array())
    {
        $html = '<div class="component component-newsletter " data-equalizer-watch="front-newsletter-and-download"><div class="--offset-content">';
        $html .= '<h5 class="component-newsletter__title">'.$this->get_field( 'title' ).'</h5>';
        $html .= apply_filters( 'the_content' , $this->get_field( 'text' ) );

        $email_label = $this->get_field( 'label');
        $submit_label = $this->get_field( 'label_button');
        $thank_you_url = get_permalink( 938 );

        $html .= <<<EOD
<!-- Start of signup -->
							<script language="javascript">
								<!--
								function validate_signup(frm) {
									var emailAddress = frm.Email.value;
									var errorString = '';
									if (emailAddress == '' || emailAddress.indexOf('@') == -1) {
										errorString = 'Please enter your email address';
									}



									var isError = false;
									if (errorString.length > 0)
										isError = true;

									if (isError)
										alert(errorString);
									return !isError;
								}


								//-->
							</script>
							<form name="signup" class="mailing-signup" id="signup" action="https://dmtrk.net/signup.ashx" method="post" onsubmit="return validate_signup(this)">
								<p class="mailing-signup__message"></p>
								<input type="hidden" name="addressbookid" value="9422476">
								<!-- ContentInsight field (1/3) -->
								<input type="hidden" name="ci_isconsentform" value="true">
								<!-- UserID - required field, do not remove -->
								<input type="hidden" name="userid" value="130710">
								<!-- Signature field - required field, do not remove -->
								<input type="hidden" name="SIG203a839b4dc2f452e1785fe8ca45bef50982f15b1937f3cbf1de1f789438556b" value="">
								<!-- ReturnURL - when the user hits submit, they'll get sent here -->
								<input type="hidden" name="ReturnURL" value="$thank_you_url">
								<!-- Email - the user's email address -->
								<p class="mailing-signup__group">
									<label for="Email" class="mailing-signup__label">$email_label</label>
									<input class="mailing-signup__input" id="Email" placeholder="Email address" type="text" name="Email">
								</p>
								<!-- ContentInsight fields (2,3/3) -->
								<input type="hidden" name="ci_userConsentText" value="">
								<input type="hidden" id="ci_consenturl" name="ci_consenturl" value="">
								
								<input class="button button-cta mailing-signup__button" type="submit" name="Submit" value="$submit_label">
							</form>
							<!-- End of signup -->
EOD;

        $archive_link_text = $this->get_field( 'archive_link' );
        if( !empty($archive_link_text) ) {
//            $newsletter_archive_url = get_permalink( 1102 );

            $html .= '<div>'.$archive_link_text.'</div>';
        }
        $html .= '</div></div>';
        return $html;
    }

}
