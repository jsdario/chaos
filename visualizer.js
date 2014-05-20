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
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame   || 
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

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.getElementById('chaos-pad').removeChild(canvas);
} else {

    // Interesting parameters to tweak!
    var SMOOTHING = 0.8;
    var FFT_SIZE = 2048;
    var WIDTH = canvas.offsetWidth;
    var BARWIDTH = WIDTH / FFT_SIZE;
    var HEIGHT = canvas.offsetHeight;
    var OFFSET = 0.25 * HEIGHT;
    var drawContext = canvas.getContext('2d');

    function Visualizer(context) {

        this.context = context;
        this.analyser =  this.context.createAnalyser();
        this.analyser.minDecibels = -140;
        this.analyser.maxDecibels = 0;
        this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
        this.times = new Uint8Array(FFT_SIZE);

        this.PLAYING = false;
        this.startTime = 0;
        this.startOffset = 0;
        
        this.analyser.smoothingTimeConstant = SMOOTHING;
        this.analyser.fftSize = FFT_SIZE;
    }

    Visualizer.prototype.draw = function () {
        var j, value, width;
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        drawContext.fillStyle = "white";

        // Get the time data from the currently playing music
        this.analyser.getByteTimeDomainData(this.times);
        width = Math.floor(1/this.freqs.length, 10);

        // Draw the time domain chart.
        for (j = 0; j < FFT_SIZE; j++) {
            value = this.times[j];
            drawContext.fillRect(j * BARWIDTH, OFFSET + value, 1, 4);
        } 

        if (this.PLAYING) {
            requestAnimFrame(this.draw.bind(this));
        }
    };

    Visualizer.prototype.animate = function() {
        this.PLAYING = true;
        window.requestAnimFrame(this.draw.bind(this));
    };

    Visualizer.prototype.clear = function( time ) {
        this.PLAYING = false;
        window.setInterval(function() {
            //Set some time so the canvas finishes painting
            drawContext.clearRect(0, 0, drawContext.canvas.width, drawContext.canvas.height);
        }, time ? time : 100);
        canvas.width = 0;
    };

    Visualizer.prototype.getFrequencyValue = function(freq) {
        var index, nyquist;
        nyquist =  this.context.sampleRate / 2;
        index = Math.round(freq / nyquist * this.freqs.length);
        return this.freqs[index];
    };
}