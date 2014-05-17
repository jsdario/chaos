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

		/* Nodes creation and routing */
		/* Node creation los operadores terciarios son para compatibilidad */
		delay 	   = context.createDelay ? context.createDelay() : context.createDelayNode();
		volume	   = context.createGain  ? context.createGain()  :  context.createGainNode();
		feedback   = context.createGain  ? context.createGain()  :  context.createGainNode();
		filter 	   = context.createBiquadFilter();
		compressor = context.createDynamicsCompressor();

		/* Node conection */
		// filter.type = 'lowpass';
		filter.connect( compressor );
		filter.connect( delay );
		delay.connect( feedback );
		feedback.connect( delay );	
		delay.connect( compressor );
		compressor.connect( volume );
		volume.connect( context.destination );
		
		//volume.connect( visualizer.analyser );

	} catch (e) {
		alert('No web audio source support in this browser');
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
	// Min = 1; max = 2, ancho = 500px
	var f = x/(500+x);//valores mas o menos arbitrarios
	//si f es mayor que uno, es un sistema inestable!
	return f;
};

Chaos.prototype.shutDown = function( wave ) {
// Funcion molona para apagar guay una onda
// No funciona muy bien :(
	var F = Math.floor(wave.frequency.value);
	for( f = F; f > 1; Math.floor( f = f - f/300 ) ) {
		//window.setInterval(function(){ 
			wave.frequency.value = f;
		//}, 10);
}
window.setInterval(	function(){
	wave.noteOff ? wave.noteOff(0) : wave.stop(0);
} , 300 );
};

var chaos = new Chaos();
var visualizer = new Visualizer( context );


chaos.div.onmousedown = function( event ) {

	/* Calculate parameters */
	oscillator = context.createOscillator ? context.createOscillator() : context.createOscillatorNode ();
	oscillator.connect( filter );
	var freq =  chaos.calculateFrequency( event );
	oscillator.frequency.value = freq;
    // filter.frequency.value = 2*freq;
	volume.gain.value = 0.63;
	feedback.gain.value = chaos.calculateGain( event );
	/* Begin the magic */
	oscillator.type = waveforms[iterator];
	oscillator.noteOn ? oscillator.noteOn(0) : oscillator.start(0);
	//visualizer.animate();
	PLAYING = true;
}

chaos.div.onmousemove = function( event ) {
	if( PLAYING ) {
		var freq =  chaos.calculateFrequency( event );
		oscillator.frequency.value = freq;
		// filter.frequency.value = 2*freq;
		feedback.gain.value = chaos.calculateGain( event );
	}
}

/* Que pare (parar sonido) siempre al quitar un click */
document.onmouseup = function() {
	chaos.shutDown(oscillator);
	//visualizer.clear( );
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