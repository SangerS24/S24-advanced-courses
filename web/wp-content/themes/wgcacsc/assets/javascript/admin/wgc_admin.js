acf.add_action('ready', function( $el ){
    loadCollapsibleURLMonitoring($el);
    addCollapsibleURLMonitoring($el);
});


acf.add_action('append', function( $el ){
    addCollapsibleURLMonitoring($el);
});

function loadCollapsibleURLMonitoring( $el ) {
    var $UrlField = $el.find('[data-name="collapsible_panels_direct_link"] input[type="text"]');

    //add copy pastable URL if url already exists on loading
    jQuery($UrlField).each(function(){
        var $UrlFieldWrap = jQuery(this).closest('div.acf-input');
        var $copySpan;
        if ( jQuery($UrlFieldWrap).find('.url-copy-input').length == 0 ) {
            var $copyPaste = jQuery('<p>Full URL to Copy and paste:</p>');
            jQuery($copyPaste).appendTo( $UrlFieldWrap);

            $copySpan = jQuery('<input/>').addClass('url-copy-input').attr('type', 'text').attr('readonly' , 'readonly');

            jQuery($copySpan).appendTo( $UrlFieldWrap );
        } else {
            $copySpan = jQuery($UrlFieldWrap).find('.url-copy-input');
        }

        jQuery($copySpan).val( globalData.page_url + '#' + jQuery(this).val());

    });
}

function addCollapsibleURLMonitoring( $el ) {
    //Title and URL fields
    var $titleField = $el.find('[data-name="collapsible_panels_title"] input[type="text"]');
    var $UrlField = $el.find('[data-name="collapsible_panels_direct_link"] input[type="text"]');

    // //add copy pastable URL if url already exists on loading
    // jQuery($UrlField).each(function(){
    //     var $UrlFieldWrap = jQuery(this).closest('div.acf-input');
    //     var $copySpan = jQuery('<input/>').addClass('url-copy-input').attr('type', 'text').attr('readonly' , 'readonly');
    //
    //     jQuery($copySpan).appendTo( $UrlFieldWrap );
    //     jQuery($copySpan).val( globalData.page_url + '#' + jQuery(this).val());
    //
    // });


    //pre-populate url if title changes
    jQuery($titleField).change(function(){
        var $titleValue = jQuery(this).val();
        var $slugValue = stringToSlug($titleValue);

        var $nextUrlField = jQuery(this).parents('.acf-fields').first().find('[data-name="collapsible_panels_direct_link"] input[type="text"]');
        jQuery($nextUrlField).val( $slugValue );

        var $copySpan = jQuery(this).parents('.acf-fields').first().find('.url-copy-input');
        jQuery($copySpan).val( globalData.page_url + '#' + $slugValue );
    });



    jQuery( $UrlField ).change(function(){
        var $UrlValue = jQuery(this).val();
        $UrlValue = stringToSlug( $UrlValue );
        var $copySpan = jQuery(this).parents('.acf-input').first().find('.url-copy-input');

        jQuery(this).val( $UrlValue );
        jQuery($copySpan).val( globalData.page_url + '#' + $UrlValue );
    });
}

function stringToSlug( $str ) {
    $str = $str.trim();
    $str = $str.toLowerCase();
    $str = $str.replace(/[^a-zA-Z0-9]+/g, '-');

    return $str;
}