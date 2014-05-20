/*
* Chaos pad by Jesus Rivera
* Universidad de Sevilla
* http://www.phpied.com/webaudio-source-in-js/
* http://alxgbsn.co.uk/2012/09/09/fun-with-web-audio-and-other-modern-apis/
* for plotting: 
* http://chimera.labs.oreilly.com/books/1234000001552/ch05.html#s05_3
*/

var PLAYING;
var context;
var oscillator;
var delay, volume, feedback, context, filter;
var visualizer;

/* para el boton */
/* isSafari ? [0,1,2,3] : ["sine", "square", "sawtooth", "triangle"]; */
var current_waveform = 0;
var waveforms = ["sine", "square", "sawtooth", "triangle"];
var current_filter = 0;
var filters = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"];

/* Buffer de la funcion de transferencias del feedback */
/* Super efficcient */
var FEEDBACK_BUFFER = new Array(500);
for( n = 0; n < 500; n ++ ) {
	FEEDBACK_BUFFER[n] = n/(500+0.1*n)*Math.exp( Math.pow(n/500,2) - 1 );
}

function Chaos() {
	try {
		context = new (window.AudioContext || window.webkitAudioContext);

		/* Nodes creation and setup */
		/* Node creation los operadores terciarios son para compatibilidad */
		delay 	   = context.createDelay ? context.createDelay() : context.createDelayNode();
		volume	   = context.createGain  ? context.createGain()  :  context.createGainNode();
		feedback   = context.createGain  ? context.createGain()  :  context.createGainNode();
		filter 	   = context.createBiquadFilter();
		compressor = context.createDynamicsCompressor();
		volume.gain.value = 1;

		visualizer = new Visualizer( context );

		/* Routing nodes only  ONCE but oscillator each time*/
		delay.connect( compressor );
		delay.connect( feedback );
		feedback.connect( delay );	
		compressor.connect( filter );
		filter.connect( volume );
		volume.connect( visualizer.analyser );
		volume.connect( context.destination );

	} catch (exception) {
		alert('No web audio source support in this browser' + exception);
	}
}

Chaos.prototype.div = document.getElementById("chaos-pad");

Chaos.prototype.calculateFrequency = function( event ) {
	// 1. frecuencia + baja (55) es el fondo del pad
	// 	  hay que ajustar las coordenadas.
	y = this.div.offsetTop + 500; // coordenada del bottom
	y -= event.pageY;		   	   // diferencia de coords.
	// 2. frequencia relativa al centro del pad
	var f = 22 + y*1.5;			//1.5 factor provisional
	oscillator.frequency.value = f;
};

Chaos.prototype.setFilterFrequency = function ( event ) {
	f = oscillator.frequency.value
    filter.frequency.value = 5*f;
}

Chaos.prototype.calculateGain = function( event ) {

	x = event.pageX - this.div.offsetLeft; // coord
	// 2. ganancia relativa al centro del pad
	// Min = 0; max ~= 0.9
	// sigue una exponencial cuadratica creciente
	// con un umbral de disparo y un factor atenuante
	// http://www.wolframalpha.com/input/?i=%28x%2F500%29*e^%28+%28x%2F500%29^2+-+1+%29+
	if ( x < 50 ) {
		feedback.gain.value = 0;
	} else if ( x < 500 ) {
		feedback.gain.value = FEEDBACK_BUFFER[x];
	}
	// If f > 1 => sistema inestable
};

var chaos = new Chaos();
visualizer.animate();

chaos.div.onmousedown = function( event ) {
	try{
		/* Connect to the system */
		oscillator = context.createOscillator ? context.createOscillator() : context.createOscillatorNode ();
		oscillator.connect( compressor );
		oscillator.connect( delay );
		/* Calculate parameters */
		chaos.calculateFrequency( event );
		chaos.setFilterFrequency( event );
		chaos.calculateGain( event );
		oscillator.type = waveforms[current_waveform];
		oscillator.noteOn ? oscillator.noteOn(0) : oscillator.start(0);
		PLAYING = true;
	} catch( exception ){
		alert(exception);
	}
}

chaos.div.onmousemove = function( event ) {
	if( PLAYING ) {
		chaos.calculateFrequency( event );
		chaos.setFilterFrequency( event );
		chaos.calculateGain( event );
	}
}

/* Que pare (parar sonido) siempre al quitar un click */
document.onmouseup = function() {
	oscillator.noteOff ? oscillator.noteOff(0) : oscillator.stop(0);
	PLAYING = false;
}

var waveform_btn = document.getElementById('waveform');
waveform_btn.onclick = function(){
	current_waveform = (current_waveform < 3) ? (current_waveform+1) : 0;
	return (waveform_btn.innerHTML = waveforms[current_waveform]);
};

var filter_btn = document.getElementById('filter');
filter_btn.onclick = function(){
	current_filter = (current_filter < 3) ? (current_filter+1) : 0;
	filter.type = current_filter;
	return (filter_btn.innerHTML = filters[current_filter]);
};

var start = 0;
var taptap_btn = document.getElementById('tap-tap');
taptap_btn.onmousedown = function( ) {
	if( start == 0 ) {
		start = new Date().getTime();
	} else {
		var elapsed = new Date().getTime() - start;
		delay.delayTime.value = elapsed * 0.001;
        // start again
        start = 0;
        return (taptap_btn.innerHTML = elapsed + "ms");
    }
};