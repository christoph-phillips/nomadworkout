//TOOLTIPS
$(".athlete img").tooltip();
$(".segment img").tooltip();
$(".dropdown-toggle").dropdown();

//nav animation
var navDropped = false;

$(".navbar-toggle").click(function() {
  if (navDropped) {
    $(
      ".header-intro-search, .running-riding, .single-header-text, .description-details, .img-attribution"
    ).css({ opacity: 1 });
    navDropped = false;
  } else {
    $(
      ".header-intro-search, .running-riding, .single-header-text, .description-details, .img-attribution"
    ).css({ opacity: 0 });
    navDropped = true;
  }
});

//replaces any broken images with profile img
$(window).load(function() {
  $("img").each(function() {
    if (
      !this.complete ||
      typeof this.naturalWidth == "undefined" ||
      this.naturalWidth == 0
    ) {
      // image was broken, replace with your new image
      this.src = "/public/images/profile.png";
    }
  });
});
