/*
* Chaos pad by Jesus Rivera
* Universidad de Sevilla
* http://www.phpied.com/webaudio-oscillator-in-js/
* http://alxgbsn.co.uk/2012/09/09/fun-with-web-audio-and-other-modern-apis/
*/

var chaos = document.getElementById("chaos-pad");

chaos.play = function ( freq ) {
	/* Tiene que haberse inicializado oscilator antes */
	this.oscillator = oscillator;
	oscillator = audio_context.createOscillator();
	oscillator.frequency.value = freq;
	oscillator.connect(audio_context.destination);
	oscillator.noteOn(0);
}

chaos.stop = function () {
	this.oscillator = oscillator.noteOff(0);
}

/*
* Web Audio API
*/

function log( string ) {
	self = document.getElementById("log");
	text = document.createTextNode(string);
	node = document.createElement("p");
	node.appendChild( text );
	self.appendChild( node );
}

function clearLog() {
	self = document.getElementById("log");
	while ( self.firstChild ) {
		self.removeChild( self.firstChild );
	}
}

// globals
var audio_context, audio_analyser, oscillator, playable;
var audio_nodes = {};

// hello audio world
(function init(g){
	try {
		audio_context = new (g.AudioContext || g.webkitAudioContext);
		oscillator = audio_context.createOscillator();
		audio_analyser = audio_context.createAnalyser();
		/*
		// Types of nodes
		audio_nodes.filter = audio_context.createBiquadFilter();  
		audio_nodes.volume = audio_context.createGainNode();
		audio_nodes.delay = audio_context.createDelayNode();
		audio_nodes.feedbackGain = audio_context.createGainNode();

		// Ocillator has to be routed through all sound nodes
		oscillator.connect(audio_nodes.filter);
		audio_nodes.filter.connect(audio_nodes.volume);
		audio_nodes.filter.connect(audio_nodes.delay);
		audio_nodes.delay.connect(audio_nodes.feedbackGain);
		audio_nodes.feedbackGain.connect(audio_nodes.volume);
		audio_nodes.feedbackGain.connect(audio_nodes.delay);
		audio_nodes.volume.connect(audio_analyser);
		audio_analyser.connect(audio_context.destination);
		*/
	} catch (e) {
		alert('No web audio oscillator support in this browser');
	}
}(window));

chaos.onmousedown = function( event ) {
	if( !playable ){
		// 1. frecuencia + baja (55) es el fondo del pad
		// 	  hay que ajustar las coordenadas.
		y = chaos.offsetTop + 500; // coordenada del bottom
		y -= event.pageY;		   	   // diferencia de coords.
		// 2. frequencia relativa al centro del pad
		f = 55 + y*1.5;			//1.5 factor provisional
		chaos.play(f);
	}
	playable = true;
}

chaos.onmousemove = function( event  ) {
	if (event.which == 1 && playable) {
		// 1. frecuencia + baja (55) es el fondo del pad
		// 	  hay que ajustar las coordenadas.
		y = chaos.offsetTop + 500; // coordenada del bottom
		y -= event.pageY;		   	   // diferencia de coords.
		// 2. frequencia relativa al centro del pad
		f = 55 + y*1.5;			//1.5 factor provisional
		oscillator.frequency.value = f;
	}
}

chaos.onmouseup = function() {
	playable = false;
	chaos.stop();
}
