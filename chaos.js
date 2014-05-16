/*
* Chaos pad by Jesus Rivera
* Universidad de Sevilla
* http://www.phpied.com/webaudio-source-in-js/
* http://alxgbsn.co.uk/2012/09/09/fun-with-web-audio-and-other-modern-apis/
* for plotting: 
* http://chimera.labs.oreilly.com/books/1234000001552/ch05.html#s05_3
*/

// globals
var audio_context, audio_analyser, source, playable;

function Chaos() {
	log("new chaos created");
}

Chaos.prototype.div = document.getElementById("chaos-pad");

// Chaos.prototype.play = function ( freq ) {
// 	/* Tiene que haberse inicializado oscilator antes */
// 	source = audio_context.createOscillator();
// 	source.frequency.value = freq;
// 	source.connect(audio_context.destination);
// 	source.noteOn(0);
// }

// Chaos.prototype.stop = function () {
// 	source = source.noteOff(0);
// }

var chaos = new Chaos();
var visualizer = new VisualizerSample();

chaos.div.onmousedown = function( event ) {
	// 1. frecuencia + baja (55) es el fondo del pad
	// 	  hay que ajustar las coordenadas.
	y = this.offsetTop + 500; // coordenada del bottom
	y -= event.pageY;		   	   // diferencia de coords.
	// 2. frequencia relativa al centro del pad
	f = 55 + y*1.5;			//1.5 factor provisional
	visualizer.togglePlayback(f);
}

chaos.div.onmousemove = function( event  ) {
	if (event.which == 1) {
		// 1. frecuencia + baja (55) es el fondo del pad
		// 	  hay que ajustar las coordenadas.
		y = this.offsetTop + 500; // coordenada del bottom
		y -= event.pageY;		   	   // diferencia de coords.
		// 2. frequencia relativa al centro del pad
		f = 55 + y*1.5;			//1.5 factor provisional
		visualizer.pitch(f);
	}
	
}

chaos.div.onmouseup = function() {
	visualizer.togglePlayback(440);
}

