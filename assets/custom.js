/**Custom JS**/
//$(document).ready(function () {
$(window).on('load', function () {
  setTimeout(function () {
    $("button.ss-recs-prev").attr("aria-label", "Previous");
    $("button.ss-recs-next").attr("aria-label", "Next");
    $("#tabs-menu li a").removeAttr("role");
  }, 5000);    
});
//});

/**Mobile Nav- custom js**/
// $("#MobileNav li").click( function(e){
//     e.preventDefault();
//     $("ul#MobileNav .site-nav__dropdown-megamenu").css("display", "block");
// })

// $(".main-menu-l1Link").on("click", function() {
//   let t = $(this).attr("section-name");
//   console.log("t", t);
//   $(this).hasClass("active") || ($(".main-menu-l1Link").removeClass("active"), 
//   $('.main-menu-l1Link[section-name="' + t + '"]').addClass("active"))
// })

$(".mobile-nav--open").on("click", function(){
  $(".mobile-menu-l1 button:first-child").trigger("click");
})

$(".main-menu-l1Link").on("click", function() {
  let t = $(this).attr("section-name");
  $(this).hasClass("active") || ($(".main-menu-l1Link").removeClass("active"), 
  $('.main-menu-l1Link[section-name="' + t + '"]').addClass("active"),     
  $("#navWrapper").find("nav.mobile-nav-wrapper").hide().removeClass("active"), 
  $("#navWrapper").find("nav.mobile-nav-wrapper[section-name='" + t + "']").show().addClass("active"))
})

$("ul#MobileNav li.mobile-nav__item button").on("click", function(){
  $("#navWrapper").find(".mobile-menu-l1").hide(); 
})
$("ul#MobileNav li.mobile-nav__item button.mobile-nav__return-btn").on("click", function(){
  $("#navWrapper").find(".mobile-menu-l1").show(); 
})




