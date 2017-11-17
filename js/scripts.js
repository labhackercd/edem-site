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

nav.find('a').on('click', function () {
  var $el = $(this)
    , id = $el.attr('href');
  
  $('html, body').animate({
    scrollTop: $(id).offset().top - nav.outerHeight() + 1
  }, 500);
  
  return false;
});

$(document).ready(function(){
  $('.toggle-menu').on('click', function(){
    $(this).toggleClass('-x');
    $('.navigation-menu').toggleClass('-open');
  });
  $('.navigation-menu > a').on('click', function(){
    $('.toggle-menu').removeClass('-x');
    $('.navigation-menu').removeClass('-open');
  });
  $('.edem-logo').on('click', function(){
    $('.toggle-menu').removeClass('-x');
    $('.navigation-menu').removeClass('-open');
  });
});

$(document).on('scroll', function() {

  if($(document).scrollTop()>96) {
    $('.edem-header').addClass('-small');
  } else {
    $('header').removeClass('-small');
  }
  
});
