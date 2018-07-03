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
                <span><svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M9.8 12.8a6.8 6.8 0 1 1 2.5-2.2l4.8 4.7s.8.8 0 1.6l-.8.7c-.8.8-1.6 0-1.6 0l-4.9-4.8zm-7.5-6a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z" fill-rule="nonzero" fill="currentColor"/></svg></span>
				<span class="show-for-sr search__submit__text"><?php esc_attr_e( 'Search', 'foundationpress' ); ?></span>
			</button>
		</div>
	</div>
	<?php do_action( 'foundationpress_searchform_after_search_button' ); ?>
</form>
<?php do_action( 'foundationpress_after_searchform' );
