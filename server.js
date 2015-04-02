doPlaySound = true
doSpeak = true
doSpeakIntro = false

interruptionCounter = null;
interruptionState = null;
interruptionCounterToday = null;

var util = require('util');

// set up server
var Express = require('express');
var app = Express();
var http = require('http').Server(app);


/*
var sassMiddleware = require('node-sass-middleware');

app.use(sassMiddleware({
    src: require('path').join(__dirname, 'client/sass'),
    dest: require('path').join(__dirname, 'client/public'),
    debug: true,
    force: true,
    outputStyle: 'compressed',
    //prefix:  '/prefix'
}));
//app.use(Express.static(require('path').join(__dirname, 'public')));
*/

// set up socket.io
var io = require('socket.io')(http);

// require say.js
var say = require('say')
var speech = require('./server/speech.js');
var applvol = require('osx-wifi-volume-remote')

// provide local jquery to client
app.use(require('express-jquery')('/jquery.js'));

// set up db
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');


var DataPoint = mongoose.model('DataPoint', { 
    state : Number,
    count : Number,
    moment: Date,
  }
);


DataPoint.findOne({}).sort({count: -1}).exec( function(err, doc) {
    if (doc == null) {
      console.log("initializing db")
      interruptionCounter = 0
    }
    else {
      interruptionCounter = doc.count;
    }
    console.log("current score: " + interruptionCounter);
    DataPoint.count({"moment": {"$lt": (new Date).setHours(0) }}).exec( function(err, count) {
        if (count == null) {
          interruptionCounterToday = 0
        }
        else {
          var score = count / 2
          console.log(score)
          interruptionCounterToday = interruptionCounter - score;
        }
        console.log("score today: " + (interruptionCounterToday));
    });    
    speech.init()
});


// set up serial
var Serialport = require("serialport")
var SerialPort = Serialport.SerialPort
var serialPort = new SerialPort("/dev/tty.usbserial-A9005baS", {
  baudrate: 57600,
  parser: Serialport.parsers.readline("\r\n"),
}, true, function(err) {
    console.log(err)
  });

serialPort.on("data", function (data) {
  console.log(data);
  io.emit('raw', data);
  var incoming = serial.parse(data)
  if (incoming.isDataPoint && incoming.count > 0) {
    processIncomingDataPoint(incoming)
  }
});

serialPort.on("open", function () {
  console.log("serial connection established")
})

serialPort.on("close", function () {
  console.log("!!! serial connection lost !!!")
})

processIncomingDataPoint = function(incoming) {
  if (incoming.state == 0){
      interruptionCounter++;
      interruptionCounterToday++;
      speech.interruption_start();
  }
  if (interruptionState != null) // not the first one
  {
    if (incoming.state == 0) {
      //applvol.set(function(){}, 100)
    }
    else {
      //applvol.fade(function(){}, 0, 1000)
      //speech.stop()
    }      
  }
  interruptionState = incoming.state
  var d = new DataPoint({ 
    state: incoming.state,  
    count: interruptionCounter,
    moment: new Date,
    countToday: interruptionCounterToday,
  })
  io.emit('datapoint', d);
  console.log(util.inspect(d))
  d.save(function (err) {
    if (err) // ...
    console.log('meow');
    console.log('saved');
  });  
}

var serial = require('./server/serial.js');

// express server public folder and more

app.use("/public", Express.static(require('path').join(__dirname, 'client/public')));
app.use('/angular', Express.static(require('path').join(__dirname, 'node_modules/angular/')));

// express server home page
app.get('/', function(req, res){
  res.sendfile('./client/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('system', 'welcome new observer');
    socket.on("simulateIncomingDataPoint", function (incoming) {
    console.log("received simulation")
    processIncomingDataPoint(incoming)
  });
});


// run server
http.listen(3000, function(){
  console.log('listening on *:3000');
});