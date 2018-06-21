$(document).ready(function() {

    $(document.body).removeClass('no-js');

    $('.component-images').each(function (index) {
        if($(this).find('img').length > 1) {
            $(this).slick({
                //lazyLoad: 'progressive',
                infinite: true,
                adaptiveHeight: true
            });
        }
    });

    var $towncrierShareButton = $('.js-towncrier__share-button');
    var $towncrierPanel = $('.js-towncrier__panel');

    $towncrierShareButton.click(function (event) {
        var state = $towncrierShareButton.attr('aria-expanded') === 'false' ? true : false;
        $towncrierShareButton.attr('aria-expanded', state);
        $towncrierPanel.attr('aria-hidden', !state);

        event.preventDefault();
    });

    $('#back-to-top').click(function(event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, 600);
    });

});
