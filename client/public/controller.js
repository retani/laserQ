
var app = angular.module('App', []);

angular.module('App').controller('frontpage', ['$scope', '$interval',
      function($scope, $interval) {

  $scope.test = "test"
  $scope.datapoints = []

  $scope.timer = 1000
  $scope.interrupted = false

  test  = $scope.test

  // incoming data
  socket.on('datapoint', function(datapoint){
    $scope.$apply(function() {

      stopTimer()

      console.log("received: " + datapoint)

      // preprocess
      datapoint.moment = new Date(datapoint.moment)
      datapoint.timer = 0

      // actions
      $scope.datapoint = datapoint

      //$('#datapoints').prepend($('<li>').html(datapoint.moment + " <b>" + datapoint.count + "</b> " + datapoint.state +  " " + datapoint.timer)); 

      $scope.datapoints.push(datapoint)

      startTimer()

    });
  });  

  // timer functions
  startTimer = function() {
    $scope.timer = 0;
    interruptionTimer = $interval( function() {
        $scope.timer += 0.03;
        $scope.datapoint.timer = $scope.timer
    }, 30)
  }

  stopTimer = function() {
    if (typeof interruptionTimer != "undefined")
    $interval.cancel(interruptionTimer)
  }

  $( "body" ).keypress(function( event ) {
    if ( event.which == 49 ) {
      console.log("simulate 1")
       socket.emit("simulateIncomingDataPoint",{ 
        state : 1, 
        count: 1,
        isDataPoint : true
      })
     }
    if ( event.which == 48 ) {
      console.log("simulate 0")
       socket.emit("simulateIncomingDataPoint",{ 
        state : 0, 
        count : 1,
        isDataPoint : true
      })       
     }
    });

}]);

/************ OTHER **********/


var active_datapoint;
socket.on('system', function(msg){
  $('#messages').prepend($('<li>').text(msg));
});    
socket.on('raw', function(msg){
  $('#messages').prepend($('<li>').text(msg));
});        
