/*
* Chaos pad by Jesus Rivera
* Universidad de Sevilla
* http://www.phpied.com/webaudio-source-in-js/
* http://alxgbsn.co.uk/2012/09/09/fun-with-web-audio-and-other-modern-apis/
* for plotting: 
* http://chimera.labs.oreilly.com/books/1234000001552/ch05.html#s05_3
*/
var context;
var oscillator;

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
	var f = 55 + y*1.5;			//1.5 factor provisional
	return f;
};

var chaos = new Chaos();
var visualizer = new Visualizer( context );

chaos.div.onmousedown = function( event ) {

	oscillator = context.createOscillator();
	oscillator.frequency.value = chaos.calculateFrequency( event );
	visualizer.togglePlayback( oscillator );
}

chaos.div.onmousemove = function( event ) {
	oscillator.frequency.value = chaos.calculateFrequency( event );
}

chaos.div.onmouseup = function() {
	visualizer.togglePlayback( oscillator );
}
