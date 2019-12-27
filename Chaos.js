/* jslint devel: true, newcap: true, plusplus: true, browser: true */
/* global window, global navigator, global screen, global Visualizer */
/*
* Chaos pad by Jesus Rivera
* Universidad de Sevilla
* http://www.phpied.com/webaudio-source-in-js/
* http://alxgbsn.co.uk/2012/09/09/fun-with-web-audio-and-other-modern-apis/
* for plotting: 
* http://chimera.labs.oreilly.com/books/1234000001552/ch05.html#s05_3
*/

'use strict';

var x, y, PX;
PX = "px ";
var PLAYING, MOBILE, COLORWHEEL;
var context;
var oscillator;
var compressor, delay, volume, feedback, context, visualizer;
COLORWHEEL = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    MOBILE = true;
}

/* para el boton */
/* isSafari ? [0,1,2,3] : ["sine", "square", "sawtooth", "triangle"]; */
var current_color = 1;
var colors = ["#3366FF", "#990CE8", "#FF0000", "#E8760C", "#FFDA0D", "#00FF48"];
var current_waveform = 0;
var waveforms = ["sine", "square", "sawtooth", "triangle"];

/* Buffer de la funcion de transferencias del feedback */
/* Super efficcient */
var n;
var FEEDBACK_BUFFER = new Array(640);
for (n = 0; n < 640; n++) {
    FEEDBACK_BUFFER[n] = n / (640 + 0.1 * n) * Math.exp(Math.pow(n / 640, 2) - 1);
}

function Chaos() {
    try {

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new window.AudioContext();

        /* Nodes creation and setup */
        /* Node creation los operadores terciarios son para compatibilidad */
        delay     = context.createDelay ? context.createDelay() : context.createDelayNode();
        volume    = context.createGain  ? context.createGain()  : context.createGainNode();
        feedback  = context.createGain  ? context.createGain()  : context.createGainNode();
        compressor = context.createDynamicsCompressor();
        volume.gain.value = 1;

        visualizer = new Visualizer(context);

        /* Routing nodes only  ONCE but oscillator each time*/
        delay.connect(compressor);
        delay.connect(feedback);
        feedback.connect(delay);
        compressor.connect(volume);
        if (!MOBILE) {
            volume.connect(visualizer.analyser);
            visualizer.animate();
        }
        volume.connect(context.destination);

    } catch (exception) {
        window.alert('Browser failed to load the application. Exception:' + exception);
    }
}

Chaos.prototype.div = document.getElementById("chaos-pad");
Chaos.prototype.bg = document.getElementById("chaos-bg");

Chaos.prototype.calculateFrequency = function (event) {
    var y, f;
    // 1. frecuencia + baja (22) es el fondo del pad
    // Ajuste de coordenadas
    y = this.div.offsetTop + this.div.offsetHeight -  event.pageY;
    // 2. frequencia relativa al centro del pad,
    // factores provisionales
    f = 22 + y * 1.5;
    /* Calculo de siguiente NOTA musical */
    var n = Math.round(12 * Math.log(f / 440) + 49);
    f = Math.pow(2, (n-49) / 12 ) * 440;
    oscillator.frequency.value = f;
};

Chaos.prototype.shiftFrequency = function (event) {
    var y, f;
    // 1. frecuencia + baja (44) es el fondo del pad
    // Ajuste de coordenadas
    y = this.div.offsetTop + this.div.offsetHeight -  event.pageY;
    // 2. frequencia relativa al centro del pad,
    // factores provisionales
    f = 22 + y * 1.5;
    /* Calculo de siguiente NOTA musical */
    var n = Math.round(12 * Math.log(f / 440) + 49);
    f = 2*f - Math.pow(2, (n-49) / 12 ) * 440;
    oscillator.frequency.value = f;
    console.log(getClosestNoteToFrequencyWithQualifier(f))
};

Chaos.prototype.calculateGain = function (event) {
    var x = event.pageX - this.div.offsetLeft; // coord
    // 2. ganancia relativa al centro del pad
    // Min = 0; max ~= 0.9
    // sigue una exponencial cuadratica creciente
    // con un umbral de disparo y un factor atenuante
    // http://www.wolframalpha.com/input/?i=%28x%2F500%29*e^%28+%28x%2F500%29^2+-+1+%29+
    if (x < 50) {
        feedback.gain.value = 0;
    } else if (x < this.div.offsetWidth) {
        feedback.gain.value = FEEDBACK_BUFFER[x];
    }
    // If f > 1 => sistema inestable
};

var chaos = new Chaos();

chaos.div.onmousedown = function (event) {
    if (!PLAYING) {
        /* Connect to the system */
        oscillator = context.createOscillator ? context.createOscillator() : context.createOscillatorNode();
        oscillator.type = waveforms[current_waveform];
        oscillator.connect(compressor);
        oscillator.connect(delay);
        /* Calculate parameters */
        chaos.calculateFrequency(event);
        chaos.calculateGain(event);
        PLAYING = true;
        /* Style background */
        x = event.pageX - chaos.div.offsetLeft - chaos.div.offsetWidth;
        y = event.pageY - chaos.div.offsetTop - chaos.div.offsetHeight;
        chaos.div.style.backgroundPosition = x + PX + y + PX;    
        return oscillator.noteOn ? oscillator.noteOn(0) : oscillator.start(0);
    }
};

chaos.div.onmousemove = function (event) {
    if (PLAYING) {
        /* Style background */
        x = event.pageX - chaos.div.offsetLeft - chaos.div.offsetWidth;
        y = event.pageY - chaos.div.offsetTop - chaos.div.offsetHeight;
        chaos.div.style.backgroundPosition = x + PX + y + PX;
        chaos.shiftFrequency(event);
        chaos.calculateGain(event);
    }
};

/* Que pare (parar sonido) siempre al quitar un click */
document.onmouseup = function () {
    PLAYING = false;
    return oscillator.noteOff ? oscillator.noteOff(0) : oscillator.stop(0);
};

/* Optimization */
window.onblur = function () {
    visualizer.clear();
};

window.onfocus = function () {
    visualizer.animate();
};


/* Botones de la interfaz */
var waveform_btn = document.getElementById('waveform');
waveform_btn.onclick = function () {
    current_waveform = (current_waveform < 3) ? (current_waveform + 1) : 0;
    return (waveform_btn.innerHTML = waveforms[current_waveform]);
};

var start = 0;
var taptap_btn = document.getElementById('tap-tap');
taptap_btn.onmousedown = function () {
    if (start === 0) {
        taptap_btn.innerHTML = "hit again";
        start = new Date().getTime();
    } else {
        var elapsed = new Date().getTime() - start;
        delay.delayTime.value = elapsed * 0.001;
        // start again
        start = 0;
        return (taptap_btn.innerHTML = elapsed + "ms");
    }
};

var delay_off = document.getElementById('dlabel');
delay_off.onclick = function () {
    delay.delayTime.value = 0;
    return (taptap_btn.innerHTML = "off");
};

/**
 * Freq = note x 2 N/12,
 * 
 * Returns a string with a qualifier like, "the next note is close and above"
 * ^E
 */
const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const A = 55; // "note": Lowest A possible 
const K = Math.pow(2, 1/12);

function getClosestNoteToFrequencyWithQualifier(f) {
    const distance = Math.pow(f / A, 1 / K); // Number of steps from f to A
    const steps = distance % 12;
    const roundSteps = Math.round(distance) % 12;
    const closestNote = notes[roundSteps];
    let qualifier = steps - roundSteps > 0 ? '^' : '˅'
    if (steps - roundSteps == 0) {
        qualifier = ''
    }
    return qualifier + closestNote // String!
}
