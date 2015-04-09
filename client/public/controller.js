
var app = angular.module('App', ['readableTime']);

angular.module('App').controller('frontpage', ['$scope', '$interval',
      function($scope, $interval) {

  $scope.datapoints = []

  $scope.interruptionCounterTodayOffset = 0
  $scope.interrupted = false

  $scope.totalClosed = 0
  $scope.totalInterrupted = 0

  $scope.dates = [
    [new Date(2015,2,19,16),new Date(2015,2,19,22)],
    [new Date(2015,2,20,16),new Date(2015,2,20,22)],
    [new Date(2015,2,26,16),new Date(2015,2,26,22)],
    [new Date(2015,2,27,16),new Date(2015,2,27,22)],
    [new Date(2015,3,2,16), new Date(2015,3,2,22)],
    [new Date(2015,3,3,16), new Date(2015,3,3,22)],
    [new Date(2015,3,9,16),new Date(2015,3,9,22)],
    [new Date(2015,3,10,16),new Date(2015,3,10,22)],
  ]

  $scope.dailyStats = []
  $scope.totalStats = {}
  $scope.twoMinStats = []

  test  = $scope.test


  $interval( function() {
    $scope.clock = Date.now()
  }, 1000)
  

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
          datapoints[i].timer = (datapoints[i].moment.getTime() - datapoints[i-1].moment.getTime())/1000
        }
      }
      // calculate stats
      $scope.totalStats.sumClosed = 0
      $scope.totalStats.sumInterrupted = 0      
      $scope.dates.forEach(function(dateInterval) {
        var sumClosed = 0
        var sumInterrupted = 0
        var twoMinIterator = 0
        var tmptwoMinStats = []
        console.log("BEGIN INTERVAL " + dateInterval[0] + " - " + dateInterval[1])
        for (i = 0; i < datapoints.length-1; i++) {
          if (datapoints[i].state != datapoints[i+1].state) { // validate
            if (datapoints[i].moment >=  dateInterval[0] && datapoints[i+1].moment <= dateInterval[1]) { // choose range
              twoMinIterator = Math.floor((datapoints[i].moment - dateInterval[0]) / (1000*60*2))
              twoMinStart = new Date(dateInterval[0].getTime() + twoMinIterator*2*60*1000)
              twoMinEnd = new Date(dateInterval[0].getTime() + twoMinIterator*(2+2)*60*1000)
              tmptwoMinStats[twoMinIterator] = 0
              if (sumClosed<100) {
                console.log("INTERVAL " + dateInterval[0] + " - " + dateInterval[1])              
                console.log("example datapoint: " + datapoints[i].moment)      
                console.log("3 min iterator :" + twoMinIterator)
                console.log("3 min interval start: " + twoMinStart)
              }
              if (datapoints[i].timer != undefined && datapoints[i].timer < 60*60) {
                if (datapoints[i].state == 1) {
                  sumClosed += datapoints[i].timer
                  if (datapoints[i].moment >=  twoMinStart && datapoints[i+1].moment <= twoMinEnd) {
                    if (tmptwoMinStats[twoMinIterator] == 0){
                      tmptwoMinStats[twoMinIterator] += (datapoints[i].moment - twoMinStart) / 1000
                    }
                  }                    
                }
                else {
                  sumInterrupted += datapoints[i].timer
                  if (datapoints[i].moment >=  twoMinStart && datapoints[i+1].moment <= twoMinEnd) {
                    if ( datapoints[i+1].moment > twoMinEnd){
                      tmptwoMinStats[twoMinIterator] += (twoMinEnd - datapoints[i+1].moment) / 1000
                    }
                    else {
                      tmptwoMinStats[twoMinIterator] += datapoints[i].timer / 1000 
                    }
                  }                  
                }
              }
            }
          }
        }
        $scope.twoMinStats.push(tmptwoMinStats)
        console.log(tmptwoMinStats)
        $scope.dailyStats.push({
          start: dateInterval[0],
          end: dateInterval[1],
          sumClosed: sumClosed,
          sumInterrupted: sumInterrupted,
        })
        console.log(sumClosed + " " + sumInterrupted)
        $scope.totalStats.sumClosed += sumClosed
        $scope.totalStats.sumInterrupted += sumInterrupted
      })
      /*
      for (i = 0; i < datapoints.length; i++) {
        console.log(datapoints[i].moment.getHours())
        if (datapoints[i].timer < 3600 && datapoints[i].moment.getHours() < 22 && datapoints[i].moment.getHours() >= 16) {
          if (datapoints[i].state == 1)
            $scope.totalClosed += datapoints[i].timer
          else
            $scope.totalInterrupted += datapoints[i].timer
        }
      }            
      */

      for (i = 0; i < $(".canvas").length; i++) {
        console.log("drawin canvas #"+i)
        var ctx = $(".canvas").get(i).getContext("2d")
        ctx.fillStyle = "rgb(200,0,0)";
        $scope.twoMinStats[i].forEach(function(y, x){
          y = Math.floor(y)
          console.log(x + " " + y)
          ctx.fillRect (x, 0, 1, y);
        })
      }

      $scope.datapoints = $scope.datapoints.concat(datapoints)
    })
  })

  // charts

  $scope.labels = ["16", "17", "18", "19", "20", "21", "July"];
  $scope.series = ["datapoints"];
  $scope.data = [[28, 48, 40, 19, 86, 27, 90]];

  init = function() {

  }

  // timer functions
  startTimer = function() {
    $scope.timerStart = Date.now()
    $scope.timer = 0;
    interruptionTimer = $interval( function() {
        $scope.timer = (Date.now() - $scope.timerStart)/1000;
        $scope.datapoint.timer = $scope.timer
    }, 30)
  }

  stopTimer = function() {
    if (typeof interruptionTimer != "undefined")
    {
      $interval.cancel(interruptionTimer)
      $scope.timer = (Date.now() - $scope.timerStart)/1000;
    }
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
    if ( event.which == 32 ) {
      console.log("toggle voice")
       socket.emit("key",{ 
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
      };/*
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
      }*/
      return Math.floor(seconds / hour) + ":" + Math.floor(seconds % minute) + ":" + Math.floor(seconds % 60) +  "." + Math.floor(1000*(milliseconds/1000 - Math.floor(milliseconds/1000))) 
    };
  });

}).call(this);

