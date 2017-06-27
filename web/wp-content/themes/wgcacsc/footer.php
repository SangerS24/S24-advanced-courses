<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the "off-canvas-wrap" div and all content after.
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

?>

		</section>

		<div class="footer-container" id="footer-container">
			<footer class="footer" id="footer">
				<div class="footer__outer footer__outer--padded">
					<div class="row">
						<div class="small-12 columns">
							<?php do_action( 'foundationpress_before_footer' ); ?>

							<noscript>
								<div id="noscript-navigation" class="noscript-navigation">
									<?php foundationpress_mobile_nav(); ?>
								</div>
							</noscript>

							<ol class="accreditations">
								<li>
									<a href="http://www.venuesofexcellence.co.uk/ ">
										<img src="<?php echo get_template_directory_uri(); ?>/assets/images/venues_of_excellence_dark.png" alt="venues of excellence">
									</a>
								</li>
								<li>
									<a href="http://www.wellcomegenomecampus.org/connectingscience">
										<img src="<?php echo get_template_directory_uri(); ?>/assets/images/connecting_science_logo_dark.svg" alt="Wellcome Genome Campus | Connecting Science">
									</a>
								</li>
							</ol>

							<?php dynamic_sidebar( 'footer-widgets' ); ?>
							<?php do_action( 'foundationpress_after_footer' ); ?>
						</div>
					</div>
				</div>
				<div class="footer__inner">
					<div class="row">
						<div class="small-12 columns">

							<ol class="social-media">
								<li><a href="https://twitter.com/WGCConfCentre"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/twitter_logo_highlight.svg" alt="Twitter Logo"></a></li>
								<li><a href="https://www.facebook.com/WGCConfCentre"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/facebook_logo_highlight.svg" alt="Facebook Logo"></a></li>
							</ol>

						</div>
					</div>
				</div>
				<div class="footer__inner footer__inner__highlight">
					<div class="row">
						<div class="small-12 columns">
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
							<form name="signup" class="mailing-signup" id="signup" action="https://t.trackedlink.net/signup.ashx" method="post" onsubmit="return validate_signup(this)">
								<p class="mailing-signup__message"></p>
								<input type="hidden" name="addressbookid" value="4179703">
								<!-- UserID - required field, do not remove -->
								<input type="hidden" name="userid" value="130710">
								<!-- ReturnURL - when the user hits submit, they'll get sent here -->
								<input type="hidden" name="ReturnURL" value="https://conferencecentre.wellcomegenomecampus.org/thank-you-newsletter">
								<!-- Email - the user's email address -->
								<p class="mailing-signup__group">
									<label for="Email" class="mailing-signup__label">Email</label>
									<input class="mailing-signup__input" id="Email" placeholder="Email address" type="text" name="Email">
								</p>
								<input class="button button-cta mailing-signup__button" type="submit" name="Submit" value="Subscribe">
							</form>
							<!-- End of signup -->
						</div>
					</div>
				</div>
				<div class="footer__outer">
					<div class="row">
						<div class="small-12 medium-6 columns">
							<p><a href="/cookies-policy/">Cookies Policy</a> / <a href="/terms-and-conditions/">Terms and conditions</a> / Website by <a href="http://www.studio24.net/">Studio 24</a></p>
						</div>
						<div class="small-12 medium-6 columns">
							<p class="copyright">&copy; Wellcome Genome Campus Conference Centre</p>
						</div>
					</div>
				</div>
			</footer>
		</div>

		<?php do_action( 'foundationpress_layout_end' ); ?>

<?php if ( get_theme_mod( 'wpt_mobile_menu_layout' ) == 'offcanvas' ) : ?>
		</div><!-- Close off-canvas wrapper inner -->
	</div><!-- Close off-canvas wrapper -->
</div><!-- Close off-canvas content wrapper -->
<?php endif; ?>


<?php wp_footer(); ?>
<?php do_action( 'foundationpress_before_closing_body' ); ?>
</body>
</html>
