'use strict';

/* jslint devel: true, newcap: true, plusplus: true, browser: true */
/* global window, global navigator, global screen, global Visualizer */
/*
* Chaos pad by Jesus Rivera
* Universidad de Sevilla, UC3M
* http://www.phpied.com/webaudio-source-in-js/
* http://alxgbsn.co.uk/2012/09/09/fun-with-web-audio-and-other-modern-apis/
* for plotting: 
* http://chimera.labs.oreilly.com/books/1234000001552/ch05.html#s05_3
*/

const PX = "px ";

var x, y; // for the background

var PLAYING, MOBILE, COLORWHEEL;
var context;
var oscillator;
var compressor, delay, volume, feedback, context, filter, visualizer;
COLORWHEEL = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    MOBILE = true;
}

/* para el boton */
/* isSafari ? [0,1,2,3] : ["sine", "square", "sawtooth", "triangle"]; */
var current_color = 1;
const colors = ["#3366FF", "#990CE8", "#FF0000","#E8760C","#FFDA0D", "#00FF48"];
var current_waveform = 0;
const waveforms = ["sine", "square", "sawtooth", "triangle"];
var current_filter = 0;
const filters = [ "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"];


// Calculate the transfer function of the feedback only ONCE
// and then just assign the values. Super efficient!
// =========================================================
var n;
var FEEDBACK_BUFFER = new Array(640);
for (n = 0; n < 640; n++) {
    FEEDBACK_BUFFER[n] = n / (640 + 0.1 * n) * Math.exp(Math.pow(n / 640, 2) - 1);
}

var self, div, bg;
function Chaos() {

    self = this;
    div = document.getElementById('chaos-pad');
    bg = document.getElementById('chaos-bg');
    div.onmousemove = this.onmousemove;
    div.onmousedown = this.onmousedown;

    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new window.AudioContext();

        /* Nodes creation and setup */
        /* Node creation los operadores terciarios son para compatibilidad */
        delay     = context.createDelay ? context.createDelay() : context.createDelayNode();
        volume    = context.createGain  ? context.createGain()  : context.createGainNode();
        feedback  = context.createGain  ? context.createGain()  : context.createGainNode();
        filter    = context.createBiquadFilter();
        compressor = context.createDynamicsCompressor();
        volume.gain.value = 1;

        visualizer = new Visualizer(context);
        filter.type = current_filter;

        /* Routing nodes only  ONCE but oscillator each time*/
        delay.connect(compressor);
        delay.connect(feedback);
        feedback.connect(delay);
        compressor.connect(filter);
        filter.connect(volume);

        if (!MOBILE) {
            volume.connect(visualizer.analyser);
            visualizer.animate();
        }
        volume.connect(context.destination);

    } catch (exception) {
        window.alert('Browser failed to load the application. Exception:' + exception);
    }
}

Chaos.prototype.calculateFrequency = function (event) {
    var y, f;
    // 1. frecuencia + baja (22) es el fondo del pad
    // Ajuste de coordenadas
    y = div.offsetTop + div.offsetHeight -  event.pageY;
    // 2. frequencia relativa al centro del pad,
    // factores provisionales
    f = 22 + y * 1.5;
    /* Calculo de siguiente NOTA musical */
    var n = Math.round(12 * Math.log(f / 440) + 49);
    f = Math.pow(2, (n-49) / 12 ) * 440;
    oscillator.frequency.value = f;
    return this;
};

Chaos.prototype.shiftFrequency = function (event) {
    var y, f;
    // 1. frecuencia + baja (44) es el fondo del pad
    // Ajuste de coordenadas
    y = div.offsetTop + div.offsetHeight -  event.pageY;
    // 2. frequencia relativa al centro del pad,
    // factores provisionales
    f = 22 + y * 1.5;
    /* Calculo de siguiente NOTA musical */
    var n = Math.round(12 * Math.log(f / 440) + 49);
    f = 2 * f - Math.pow(2, (n-49) / 12 ) * 440;
    oscillator.frequency.value = f;
    return this;
};


Chaos.prototype.setFilterFrequency = function (event) {
    var y, min, max, octave_number, alpha;
    y = event.pageY - div.offsetTop;
    min = 22; // min 40Hz
    max = context.sampleRate / 2; // max half of the sampling rate
    // Logarithm (base 2) to compute how many octaves fall in the range.
    octave_number = Math.log(max / min) / Math.LN2;
    // Compute a parameter from 0 to 1 based on an exponential scale.
    alpha = Math.pow(2, octave_number * (((2 / div.offsetHeight) * (div.offsetHeight - y)) - 1.0));
    if (filter.type === 'highpass' || filter.type === 'bandpass') {
        filter.frequency.value = min / alpha;
    } else if (filter.type === 'lowpass') {
        filter.frequency.value = min / alpha + 440;
    } else {
        filter.frequency.value = max * alpha;
    }
    return this;
};

Chaos.prototype.calculateGain = function (event) {
    var x = event.pageX - div.offsetLeft; // coord
    // 2. ganancia relativa al centro del pad
    // Min = 0; max ~= 0.9
    // sigue una exponencial cuadratica creciente
    // con un umbral de disparo y un factor atenuante
    // http://www.wolframalpha.com/input/?i=%28x%2F500%29*e^%28+%28x%2F500%29^2+-+1+%29+
    if (x < 50) {
        feedback.gain.value = -0.2;
    } else if (x < div.offsetWidth) {
        feedback.gain.value = FEEDBACK_BUFFER[x];
    }
    // If f > 1 => sistema inestable
    return this;
};

Chaos.prototype.onmousedown = function (event) {
    if (!PLAYING) {
        /* Connect to the system */
        oscillator = context.createOscillator ? context.createOscillator() : context.createOscillatorNode();
        oscillator.type = waveforms[current_waveform];
        oscillator.connect(compressor)
        oscillator.connect(delay);

        /* Calculate parameters */
        self.calculateFrequency(event)
        .setFilterFrequency(event)
        .calculateGain(event);
        
        PLAYING = true;
        /* Style background */
        x = event.pageX - div.offsetLeft - div.offsetWidth;
        y = event.pageY - div.offsetTop - div.offsetHeight;
        div.style.backgroundPosition = x + PX + y + PX;    
        return oscillator.noteOn ? oscillator.noteOn(0) : oscillator.start(0);
    }
};


Chaos.prototype.onmousemove = function (event) {
    if (PLAYING) {
        /* Style background */
        x = event.pageX - div.offsetLeft - div.offsetWidth;
        y = event.pageY - div.offsetTop - div.offsetHeight;
        div.style.backgroundPosition = x + PX + y + PX;
        self.shiftFrequency(event);
        self.setFilterFrequency(event);
        self.calculateGain(event);
    }
};

Chaos.prototype.onmouseup = function () {
    if (PLAYING) {
        PLAYING = false;
        return oscillator.noteOff ? oscillator.noteOff(0) : oscillator.stop(0);
    }
};

Chaos.prototype.resize = function () {
    /* Style it up! */
    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width
    , height = (window.innerHeight > 0) ? window.innerHeight : screen.height;

    /* Limit to screen dimensions */
    div.style.width = (div.offsetWidth > width) ?  width : div.offsetWidth;
    div.style.height = (div.offsetHeight > height) ?  height : div.offsetHeight;

    /* make it square! */
    if (div.style.width < div.style.height)
        div.style.height = div.offsetWidth + 'px';
    else
        div.style.width = div.offsetHeight + 'px';
    
    if( !COLORWHEEL ) {
        COLORWHEEL = true;
        /* First transition is fired, next are intervaled */
        bg.style.backgroundColor = colors[1];
        window.setInterval(function(){
            current_color = (current_color < 5) ? (current_color + 1) : 0;
            bg.style.backgroundColor = colors[current_color];
        }, 10000);
    }
};

