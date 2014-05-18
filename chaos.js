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

/* para el boton */
/* isSafari ? [0,1,2,3] : ["sine", "square", "sawtooth", "triangle"]; */
var iterator = 0;
var waveforms = ["sine", "square", "sawtooth", "triangle"];

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

	} catch (e) {
		alert('No web audio source support in this browser' + e);
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
	return f;
};

Chaos.prototype.calculateGain = function( event ) {
	// 1. Hay que ajustar las coordenadas.
	x = event.pageX - this.div.offsetLeft;
	// 2. ganancia relativa al centro del pad
	// sigue una exponencial cuadratica creciente con un factor aqui mi calculo
	// http://www.wolframalpha.com/input/?i=%28x%2F500%29*e^%28+%28x%2F500%29^2+-+1+%29+
	// Min = 1; max = 2, ancho = 500px
	if ( x < 50 ) {
		f = 0;
	} else {
		f = Math.pow(x/(500+0.1*x),2)*Math.exp( Math.pow(x/500,2) - 1 );
	}
	log( "exp: " + f );
	//si f es mayor que uno, es un sistema inestable!
	return f;
};

Chaos.prototype.route = function() {
	try {
		/* Node conection */
		oscillator.connect( filter );
		//filter.type = 'lowpass';
		filter.connect( compressor );
		filter.connect( delay );
		delay.connect( compressor );
		delay.connect( feedback );
		feedback.connect( delay );	
		compressor.connect( volume );
		volume.connect( visualizer.analyser );
		volume.connect( context.destination );

	} catch ( exception ){
		alert("Unable to set up. " + exception);
	}
};

Chaos.prototype.shutdown = function( ) {
// Funcion molona para apagar guay una onda
// No funciona muy bien :(
	try {
		var F = Math.floor(oscillator.frequency.value);
		for( f = F; f > 1; Math.floor( f = f - f/300 ) ) {
			oscillator.frequency.value = f;
		}
		oscillator.noteOff ? oscillator.noteOff(0) : oscillator.stop(0);
	} catch ( exception ) {
		alert(" Syntax error. " + exception )
	}
};

var chaos = new Chaos();
var visualizer = new Visualizer( context );

chaos.div.onmousedown = function( event ) {

	/* Calculate parameters */
	oscillator = context.createOscillator ? context.createOscillator() : context.createOscillatorNode ();
	chaos.route();
	var freq =  chaos.calculateFrequency( event );
	oscillator.frequency.value = freq;
    feedback.gain.value = chaos.calculateGain( event );
    oscillator.type = waveforms[iterator];
    oscillator.noteOn ? oscillator.noteOn(0) : oscillator.start(0);
    visualizer.animate();
    PLAYING = true;
}

chaos.div.onmousemove = function( event ) {
	if( PLAYING ) {
		var freq =  chaos.calculateFrequency( event );
		oscillator.frequency.value = freq;
		feedback.gain.value = chaos.calculateGain( event );
	}
}

/* Que pare (parar sonido) siempre al quitar un click */
document.onmouseup = function() {
	//chaos.shutDown();
	oscillator.noteOff ? oscillator.noteOff(0) : oscillator.stop(0);
	visualizer.clear( );
	PLAYING = false;
}

var waveform_btn = document.getElementById('waveform');
waveform_btn.onclick = function(){
	iterator = (iterator < 3) ? (iterator+1) : 0;
	return (waveform_btn.innerHTML = waveforms[iterator]);
};


var start = 0;
var taptap_btn = document.getElementById('tap-tap');
taptap_btn.onmousedown = function( ) {
	if( start == 0 ) {
		log(start);
		start = new Date().getTime();
	} else {
		var elapsed = new Date().getTime() - start;
		delay.delayTime.value = elapsed * 0.001;
		log("Delay: " + elapsed);
        // start again
        start = 0;
        return (taptap_btn.innerHTML = elapsed + "ms");
    }
};