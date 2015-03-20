
var app = angular.module('App', []);

angular.module('App').controller('frontpage', function($scope)  {

  $scope.test = "test"
  $scope.datapoints = []

  test  = $scope.test
  socket.on('datapoint', function(datapoint){
    

    console.log("received: " + datapoint)

    // preprocess
    datapoint.moment = new Date(datapoint.moment)

    // actions
    $scope.active_datapoint = datapoint    

    if (datapoint.state == 1) {
      $(".show_if_not_interrupted").show();
      $(".show_if_interrupted").hide();
    }
    else {
      $(".show_if_not_interrupted").hide();
      $(".show_if_interrupted").show();
    }
    
    $("[data-var=interruption_count]").text(datapoint.count)

    if (datapoint.state == 0) {
      $scope.active_datapoint.timer = 0;
      interruptionTimer = setInterval( function() {
        //active_datapoint.timer = active_datapoint.moment
         $scope.active_datapoint.timer+= 100;
         $scope.apply()
      }, 100)
    }
    else {
      clearInterval(interruptionTimer)
      datapoint.timer = $scope.active_datapoint.timer;
    }

    $('#datapoints').prepend($('<li>').html(datapoint.moment + " <b>" + datapoint.count + "</b> " + datapoint.state +  " " + datapoint.timer)); 

    $scope.datapoints.push(datapoint)

    $scope.$apply();

  });  

});

/************ OTHER **********/



var active_datapoint;
socket.on('system', function(msg){
  $('#messages').prepend($('<li>').text(msg));
});    
socket.on('raw', function(msg){
  $('#messages').prepend($('<li>').text(msg));
});        
