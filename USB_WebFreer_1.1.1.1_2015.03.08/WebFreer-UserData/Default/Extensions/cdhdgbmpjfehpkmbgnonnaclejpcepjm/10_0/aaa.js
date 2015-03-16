$(document).on("ready",function(){
  var adb = "";
  var intervalCount = 0;
  setInterval(function(){

    $("body > [id]").each(function(){
      if( $(this).attr("id").length == 4 ){
        if( $(this).css("position").match(/fixed/i) && $(this).css("opacity") == 0.949999988079071 ){
          adb = $(this).attr("id");
        }
      }
    });
    if(adb){
      $('#'+adb).hide();
      $("#"+adb+" ~ *").css("display","initial");
    }

    $("a:contains(antiblock.org)").parent("p").parent("*[id]").remove();

    $("script[src]").each(function(){
      if( $(this).attr("src").match(/element_main.js$/) ){
          $(this).remove();
      }
    });

  },10);
});
