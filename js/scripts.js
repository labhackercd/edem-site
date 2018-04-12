var sections = $('section');
var nav = $('.edem-header');

function showError(errorMessage) {
  $('.JS-error').addClass('-show');
  $('.JS-error').text(errorMessage);
}

function hideError(errorMessage) {
  $('.JS-error').removeClass('-show');
}


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
  $.fn.toggleStyle = function(attributes) {
    $(this).attr('style') ? $(this).removeAttr('style') : $(this).css(attributes);
  }
  $('.toggle-menu').on('click', function(){
    $(this).toggleClass('-x');
    $('.navigation-menu').toggleClass('-open');
    $('body').toggleStyle({'overflowY':'hidden'});
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

  // Send form
  $('#contact-form').submit(function(event) {
    event.preventDefault();
    var contactForm = $(this);
    var submitButton = $('#contact-submit');

    if (contactForm.hasClass('js-submitting')) {
      return false;

    } else {
      $.ajax({
        type: contactForm.attr('method'),
        url: contactForm.attr('action'),
        data: contactForm.serialize(),

        beforeSend: function() {
          contactForm.addClass('js-submitting');
          submitButton.addClass('-loading');
          hideError();
        },
        success: function(response){
          submitButton.removeClass('-loading').addClass('-done');
          setTimeout(function(){ submitButton.removeClass('-done') }, 3000);
        },

        error: function(jqXRH) {
          contactForm.removeClass('js-submitting');
          submitButton.removeClass('-loading').addClass('-error');
          setTimeout(function(){ submitButton.removeClass('-error') }, 3000);

          if (jqXRH.status == 0) {
            showError('Verifique sua conexão com a internet.');
          } else if (jqXRH.status == 401) {
            showError(jqXRH.responseJSON["data"])
          } else {
            showError("Ocorreu um erro no servidor, tente novamente em alguns instantes.");
          }
        }
      });
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
