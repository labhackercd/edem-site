var sections = $('section');
var nav = $('.edem-header');

$(window).on('scroll', function () {
  var currentPosition = $(this).scrollTop();
  sections.each(function() {
    var top = $(this).offset().top - nav.outerHeight() - 32,
        bottom = top + $(this).outerHeight();
    if (currentPosition >= top && currentPosition <= bottom) {
      nav.find('a').removeClass('-active');
      sections.removeClass('-active');
      nav.find('a[href="#'+$(this).attr('id')+'"]').addClass('-active');
    }
  });
});

$('.js-anchor').on('click', function () {
  var $el = $(this)
    , id = $el.attr('href');
  $('html, body').animate({
    scrollTop: $(id).offset().top - nav.outerHeight() + 1
  }, 500);
  return false;
});

$(document).ready(function(){

  // Navigation menu
  $('.toggle-menu').on('click', function(){
    $(this).toggleClass('-x');
    $('.navigation-menu').toggleClass('-open');
    $('body').toggleClass('-noscroll');
  });
  $('.navigation-menu > a, .edem-logo').on('click', function(){
    $('.toggle-menu').removeClass('-x');
    $('.navigation-menu').removeClass('-open');
    $('body').removeClass('-noscroll');
  });

  // Text input
  $('.js-input').blur(function() {
    if ($(this).val()) {
      $(this).closest( '.input-container' ).addClass('-filled');
    } else {
      $(this).closest( '.input-container' ).removeClass('-filled');
    }
  });

});

// Header height
$(document).on('scroll', function() {
  if($(document).scrollTop()>96) {
    $('.edem-header').addClass('-small');
  } else {
    $('header').removeClass('-small');
  }  
});
