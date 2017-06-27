<?php
/**
 * The template for displaying search form
 *
 * @package FoundationPress
 * @since FoundationPress 1.0.0
 */

do_action( 'foundationpress_before_searchform' ); ?>
<form role="search" method="get" id="searchform" action="<?php echo home_url( '/' ); ?>">
	<?php do_action( 'foundationpress_searchform_top' ); ?>
	<div class="input-group searchform__input-group">
		<input type="text" class="input-group-field search__input" value="" name="s" id="s" placeholder="<?php esc_attr_e( 'Search', 'foundationpress' ); ?>">
		<?php do_action( 'foundationpress_searchform_before_search_button' ); ?>
		<div class="input-group-button search-form__input-group-button">
			<button id="searchsubmit" class="button search__submit">
				<span class="show-for-sr search__submit__text"><?php esc_attr_e( 'Search', 'foundationpress' ); ?></span>
			</button>
		</div>
	</div>
	<?php do_action( 'foundationpress_searchform_after_search_button' ); ?>
</form>
<?php do_action( 'foundationpress_after_searchform' );
