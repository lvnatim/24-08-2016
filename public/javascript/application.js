var API_KEY = "be39b646f0c6eeaf"
var BASE_API_URL = "http://api.wunderground.com/api/"+API_KEY+"/forecast10day/q/zmw:"

var constructApiUrl = function(zmw){
  return BASE_API_URL + zmw + ".json"
}

$(document).ready(function() {

  var weatherVideoURLs = {
    clear: "MoNIrdoDjr0", 
    nt_clear: "QGYrxFxFLnY",
    partlycloudy: "rRL_9WxBJBc",
    nt_partlycloudy: "kTL725e9YlU",
    chancerain: "D6OhIZODLDs",
    nt_chancerain: "",
  }

  var current_weather = weatherVideoURLs["clear"]

  $('#video').YTPlayer({
    fitToBackground: true,
    videoId: 'MoNIrdoDjr0',
    callback: function(){
      $('.ytplayer-container').fadeIn(1500);
    }
  });

  function listCities(objects){
    $(".cities").empty();
    $.each(objects, function(index, object){

      var $new_city = $("<div>")
        .attr("style", "display:none;")
        .attr("data-zmw", object.zmw)
        .addClass("city")
        .addClass("moreInfo");

      $("<h3>")
        .text(object.name)
        .appendTo($new_city);

      $("<hr>")
        .appendTo($new_city);

      $new_city.appendTo($(".cities"));
      $new_city.fadeIn(1500);

    });
  }

  $('.search-form').on("keypress", function(e){
    if(e.keyCode == 13){
      $("#title").animate({opacity: 0}, 1500);
      $(".title-box").animate({top: "-100px"}, 1500);
      $("#query").animate({height: "45px", width: "350", "font-size":"45px"},1500);
      var query = document.getElementById("query").value;
      console.log(query);
      $.ajax({
        url: "http://autocomplete.wunderground.com/aq",
        method: "GET",
        dataType: "jsonp",
        jsonpCallback: "callback",
        data: {
          query: query,
          cb: "callback"
        },
        success: function(data){
          listCities(data.RESULTS);
        }
      })
    }
  });

  $('.cities').on('click', '.moreInfo', function(e){
    e.preventDefault();
    var zmw = $(this).data("zmw");
    $.ajax({
      url: constructApiUrl(zmw),
      method: "GET",
      dataType: "jsonp",
      jsonpCallback: "callback",
      success: function(data){
        var forecastData = data.forecast.txt_forecast.forecastday;
        createForecastNodes(forecastData);
      }
    })
  })

  function createForecastNodes(objects){
    $(".cities").animate({opacity:0}, 1500);
    var forecastBoxNode = $("body").find(".forecast-box");
    for(var i = 0; i < objects.length; i++){
      var newNode = $("<div>")
        .attr("style", "display:none;")
        .addClass("forecast")
        .attr("data-weather-id", objects[i].icon);
      $("<h4>").text(objects[i].title).appendTo(newNode);
      $("<p>").text(objects[i].fcttext).appendTo(newNode);
      $("<a>").addClass("close-forecast").text("X").appendTo(newNode);
      newNode.appendTo(forecastBoxNode);
      newNode.fadeIn(1500);
    }
    $('.forecast-box').slick({
      accessibility: true,
      adaptiveHeight: true,
      infinite: false
    });
  }

  $(".app-window").on("click", "a.close-forecast", function(){
    clearForecastBox();
  })

  function clearForecastBox(){
    $(".cities").animate({opacity:1}, 1500);
    var forecastBoxNode = $("body").find(".forecast-box");
    forecastBoxNode.removeClass("slick-initialized").removeClass("slick-slider")
    forecastBoxNode.children().fadeOut(500, function(){
      $(this).remove();
    })
  }

  function fadeInNewVideo(id){
    $('.ytplayer-container').fadeOut(1000, function(){
      $('.ytplayer-container').remove();
      $('#video').removeClass('loaded');
      $('#video').YTPlayer({
        fitToBackground: true,
        videoId: id,
        callback: function(){
          $('.ytplayer-container').fadeIn(1500);
        }
      })
    })
  }

  $('.forecast-box').on('beforeChange', function(event, slick, currentSlide, nextSlide){
      var nextSlideNode = $('.forecast-box').find('.slick-slide[data-slick-index='+ nextSlide +']');
      var videoId = nextSlideNode.data("weatherId");
      fadeInNewVideo(weatherVideoURLs[videoId]);
      console.log(nextSlideNode.data("weatherId"));
    });

});

