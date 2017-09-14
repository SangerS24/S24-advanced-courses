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
                <div class="footer__top">
                    <div class="row">
                        <div class="small-12 columns">

                            <a href="https://connectingscience.wellcomegenomecampus.org/" target="_blank"><img src="<?php echo get_stylesheet_directory_uri().'/assets/images/connecting-science-logo.svg'; ?>" alt="Visit the Connecting Science website"/></a>

                        </div>
                    </div>
                </div>
				<div class="footer__inner">
					<div class="row">
						<div class="small-12 columns">

							<ol class="social-media">
								<li><a href="https://www.facebook.com/ACSCevents"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/facebook_logo_highlight.svg" alt="Facebook Logo"></a></li>
								<li><a href="https://www.youtube.com/c/WellcomeGenomeCampusCoursesandConferences"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/youtube_logo_highlight.svg" alt="YouTube Logo"></a></li>
								<li><a href="https://twitter.com/ACSCevents"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/twitter_logo_highlight.svg" alt="Twitter Logo"></a></li>
								<li><a href="http://www.linkedin.com/company/wellcomegenomecampuscoursesandconferences"><img src="<?php echo get_template_directory_uri(); ?>/assets/images/linkedin_logo_highlight.svg" alt="LinkedIn Logo"></a></li>
							</ol>

						</div>
					</div>
				</div>
				<div class="footer__outer">
					<div class="row">
						<div class="small-12 medium-6 columns">
							<p><a href="/cookies-policy/">Cookies Policy</a> / <a href="/terms-and-conditions/">Terms and conditions</a> / Website by <a href="http://www.studio24.net/">Studio 24</a></p>
						</div>
						<div class="small-12 medium-6 columns">
							<p class="copyright">&copy; Wellcome Genome Campus Advanced Courses and Scientific Conferences</p>
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
