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
var delay, volume, feedback;

function Chaos() {
	try {
		context = new (window.AudioContext || window.webkitAudioContext);
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

Chaos.prototype.calculateFeedback = function( event ) {
	// 1. Hay que ajustar las coordenadas.
	x = event.pageX - this.div.offsetLeft;
	// 2. ganancia relativa al centro del pad
	// Min = 1; max = 2, ancho = 500px
	var f = 1 + x/500;
	return f;
};

Chaos.prototype.shutDown = function( wave ) {
// Funcion molona para apagar guay una onda
// No funciona muy bien :(
	/*var F = Math.floor(wave.frequency.value);
	for( f = F; f > 1; Math.floor( f = f - f/300 ) ) {
		window.setInterval(function(){ 
			wave.frequency.value = f;
		}, 10);
	}*/
	wave.noteOff ? wave.noteOff(0) : wave.stop(0);
	//window.setInterval(	XXX , 300 );
};

var chaos = new Chaos();
var visualizer = new Visualizer( context );

chaos.div.onmousedown = function( event ) {

	/* Node creation los operadores terciarios son para compatibilidad */
	oscillator = context.createOscillator ? context.createOscillator() : context.createOscillatorNode ();
	delay 	   = context.createDelay ? context.createDelay() : context.createDelayNode();
	volume	   = context.createGain  ? context.createGain()  :  context.createGainNode();
	feedback   = context.createGain  ? context.createGain()  :  context.createGainNode();
	/* Node conection */
	oscillator.connect(delay);
	delay.connect(feedback);
	visualizer.connect(feedback);
	/* Calculate parameters */
	oscillator.frequency.value = chaos.calculateFrequency( event );
	//delay.delayTime.value = 0.3;
	feedback.gain.value = chaos.calculateFeedback( event );
	/* Begin the magic */
	oscillator.noteOn ? oscillator.noteOn(0) : oscillator.start(0);
	visualizer.animate();
	PLAYING = true;
}

chaos.div.onmousemove = function( event ) {
	if( PLAYING ) {
		oscillator.frequency.value = chaos.calculateFrequency( event );
		feedback.gain.value = chaos.calculateFeedback( event );
	}
}

/* Que pare (parar sonido) siempre al quitar un click */
document.onmouseup = function() {
	chaos.shutDown(oscillator);
	visualizer.clear( );
	PLAYING = false;
}