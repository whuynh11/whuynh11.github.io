$(document).ready(function () {
    $('.menu-toggler').on('click', function () {
        $(this).toggleClass('open');
        $('.top-nav').toggleClass('open');
    });

    $('.top-nav .nav-link').on('click', function () {
        $('.menu-toggler').toggleClass('open');
        $('.top-nav').removeClass('open');
    });

    $('nav a[href*="#"]').on('click', function () {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 100
        }, 450);
    });

    $('#up').on('click', function () {
        $("html, body").animate({
            scrollTop: 0
        }, 400);
    });

    AOS.init({
        easing: 'ease',
        duration: 1800,
        once: true
    });

    window.onload = function() {

        var pageTitle = document.title;
        var attentionMessage = '♪ Baby, Come Back! ♪';
        var blinkEvent = null;
      
        document.addEventListener('visibilitychange', function(e) {
          var isPageActive = !document.hidden;
      
          if(!isPageActive){
            blink();
          }else {
            document.title = pageTitle;
            clearInterval(blinkEvent);
          }
        });
      
        function blink(){
          blinkEvent = setInterval(function() {
            if(document.title === attentionMessage){
              document.title = pageTitle;
            }else {
              document.title = attentionMessage;
            }
          }, 600);
        }
      };
});