
var app = angular.module('App', ['readableTime']);

angular.module('App').controller('frontpage', ['$scope', '$interval',
      function($scope, $interval) {

  $scope.datapoints = []

  $scope.interruptionCounterTodayOffset = 0
  $scope.interrupted = false

  $scope.totalClosed = 0
  $scope.totalInterrupted = 0

  $scope.dates = [
    new Date(2015,3,19),
    new Date(2015,3,20),
    new Date(2015,3,27),
    new Date(2015,3,28),
    new Date(2015,4,2),
    new Date(2015,4,3),
    new Date(2015,4,10),
    new Date(2015,4,11)
  ]

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

  // incoming historical datapoints
  socket.on('init', function(initObj){
    $scope.$apply(function() {
      console.log(initObj.interruptionCounterTodayOffset)
      $scope.interruptionCounterTodayOffset = initObj.interruptionCounterTodayOffset
      datapoints = initObj.datapoints
      console.log("received " + datapoints.length + " historical datapoints")
      for (i = 0; i < datapoints.length; i++) {
        datapoints[i].moment = new Date(datapoints[i].moment)
      }      
      if (datapoints.length > 1) {
        for (i = 1; i < datapoints.length; i++) {
          datapoints[i].timer = datapoints[i].moment.getTime() - datapoints[i-1].moment.getTime()
        }
      }
      for (i = 0; i < datapoints.length; i++) {
        console.log(datapoints[i].moment.getHours())
        if (datapoints[i].timer < 3600 && datapoints[i].moment.getHours() < 22 && datapoints[i].moment.getHours() >= 10) {
          if (datapoints[i].state == 1)
            $scope.totalClosed += datapoints[i].timer
          else
            $scope.totalInterrupted += datapoints[i].timer
        }
      }            
      $scope.datapoints = $scope.datapoints.concat(datapoints)
    })
  })

  init = function() {

  }

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


/******* filter ********/

(function() {
  'use strict';
  angular.module('readableTime', []).filter('readableTime', function() {
    return function(seconds) {
      var day, format, hour, minute, month, week, year, milliseconds;
      milliseconds = parseInt(seconds * 1000, 10);
      seconds = parseInt(seconds, 10);
      minute = 60;
      hour = minute * 60;
      day = hour * 24;
      week = day * 7;
      year = day * 365;
      month = year / 12;
      format = function(number, string) {
        string = number === 1 ? string : "" + string + "s";
        return "" + number + " " + string;
      };
      switch (false) {
        case !(milliseconds < 1000):
          return format(milliseconds, 'millisecond');
        case !(seconds < minute):
          return format(seconds, 'second');
        case !(seconds < hour):
          return format(Math.floor(seconds / minute), 'minute');
        case !(seconds < day):
          return format(Math.floor(seconds / hour), 'hour');
        case !(seconds < week):
          return format(Math.floor(seconds / day), 'day');
        case !(seconds < month):
          return format(Math.floor(seconds / week), 'week');
        case !(seconds < year):
          return format(Math.floor(seconds / month), 'month');
        default:
          return format(Math.floor(seconds / year), 'year');
      }
    };
  });

}).call(this);

