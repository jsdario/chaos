/*
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 // shim layer with setTimeout fallback
 window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame    || 
  window.oRequestAnimationFrame      || 
  window.msRequestAnimationFrame     || 
  function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };
})();

/* Get canvas */
var canvas = document.querySelector('canvas');
var drawContext = canvas.getContext('2d');


  // width: 500px;
  // height: 285px;
var WIDTH = 500;
var HEIGHT = 285;

// Interesting parameters to tweak!
var SMOOTHING = 0.8;
var FFT_SIZE = 2048;

function Visualizer( context ) {

  this.context = context;
  this.analyser =  this.context.createAnalyser();
  this.analyser.connect( this.context.destination);
  this.analyser.minDecibels = -140;
  this.analyser.maxDecibels = 0;
  this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
  this.times = new Uint8Array(FFT_SIZE);

  this.isPlaying = false;
  this.startTime = 0;
  this.startOffset = 0;
  log("visualizer created");
}

// Toggle playback
Visualizer.prototype.togglePlayback = function( freq ) {
  if (this.isPlaying) {
    // Stop playback
    this.source.noteOff(0);
    this.clear();
    log("stopped");
    // Save the position of the play head.
  } else {
    this.source =  this.context.createOscillator();
    this.source.frequency.value = freq;
    // Connect graph
    this.source.connect(this.analyser);
    this.source.noteOn(0);
    // Start visualizer.
    window.requestAnimFrame(this.draw.bind(this));
  }
  this.isPlaying = !this.isPlaying;
}

Visualizer.prototype.pitch = function( freq ) {
  this.source.frequency.value = freq;
}

Visualizer.prototype.draw = function() {
  this.analyser.smoothingTimeConstant = SMOOTHING;
  this.analyser.fftSize = FFT_SIZE;

  // Get the frequency data from the currently playing music
  this.analyser.getByteTimeDomainData(this.times);

  var width = Math.floor(1/this.freqs.length, 10);
  var barWidth = WIDTH/FFT_SIZE;
  drawContext.fillStyle = 'white';
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // Draw the time domain chart.
  for (var i = 0; i < FFT_SIZE; i++) {
    var value = this.times[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    drawContext.fillRect(i * barWidth, offset, 1, 4);
    // Linear interpolation
    if ( this.times[i+1] != null ){
      value =  (value + this.times[i+1])/2;
      percent = value / 256;
      height = HEIGHT * percent;
      offset = HEIGHT - height - 1;
      drawContext.fillRect( (i+0.5) * barWidth, offset, 1, 2);
    }
  } 

  Visualizer.prototype.clear = function() {
    drawContext.clearRect(0, 0, 500, 500);
    log("clearing");
  }

  if (this.isPlaying) {
    requestAnimFrame(this.draw.bind(this));
  }
}

Visualizer.prototype.getFrequencyValue = function(freq) {
  var nyquist =  this.context.sampleRate/2;
  var index = Math.round(freq/nyquist * this.freqs.length);
  return this.freqs[index];
}