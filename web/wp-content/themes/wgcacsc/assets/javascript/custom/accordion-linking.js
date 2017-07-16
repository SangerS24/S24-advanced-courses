jQuery(document).ready(function(){
    //change URL when accordion opened
    jQuery('.accordion-title').click( function(e){
        var hash = jQuery(this).attr('href');
        history.pushState( 'page-section' , '' , hash );
    });

    //go to panel if in URL
    if ( window.location.hash ) {
        var targetAnchor = jQuery('[href='+ window.location.hash +']');

        if ( targetAnchor.length > 0 ) {
            var targetAnchorOffset = targetAnchor.offset();
            targetAnchor.closest( 'li' ).addClass('is-active');
            jQuery('html , body').scrollTop( targetAnchorOffset.top - 200 );
        }
    }
});