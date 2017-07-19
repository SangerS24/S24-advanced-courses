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

    $('#back-to-top').click(function(event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, 600);
    });

});
