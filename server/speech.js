var say = require('say')
var play = require('play')
var applvol = require('osx-wifi-volume-remote')

system = "Alex"
narrator = "Markus"; //"Anna"

init = function() {
  if (!doSpeak) return;
  applvol.set(function(){}, 100)
	say.speak(system, "Ready. Score: " + interruptionCounter + "!" )
}

speaking = false;

speaking_starts = function() {
  speaking = true;
}

speaking_finishes = function() {
  speaking = false;
}

going_on = function(interruptionCounterAtStart){
  if (!doSpeak) return;
  console.log(interruptionCounterAtStart);
  console.log(interruptionCounter);
  if (interruptionState == 0 && interruptionCounterAtStart == interruptionCounter) {
    speaking_starts();
    say.speak(narrator, "Das Quadrat ist weiterhin zum " + interruptionCounterAtStart + "ten Mal unterbrochen", function(){speaking_finishes(); going_on(interruptionCounterAtStart)})
  }
}

interruption_start = function(){
  if (!doSpeak) return;
  var interruptionCounterAtStart = interruptionCounter
  if (doPlaySound) play.sound('./server/audio/82903.wav');
  if (!speaking) {
    speaking_starts()
    say.speak(narrator, interruptionCounter + "te Quadratunterbrechung", function(){speaking_finishes(); going_on(interruptionCounterAtStart)});
  }
}

module.exports = { init: init, going_on : going_on, interruption_start : interruption_start};