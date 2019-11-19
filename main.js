$(document).ready(function () {
    $('.menu-toggler').on('click', function () {
        $(this).toggleClass('open');
        $('.top-nav').toggleClass('open');
    });

    $('.top-nav .nav-link').on('click', function () {
        $('.menu-toggler').toggleClass('open');
        $('.top-nav').removeClass('open');
    });

    AOS.init({
        easing: 'ease',
        duration: 1800
    });
});