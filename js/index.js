'use strict';

// Start the magic
var chaos = new Chaos();

/* Optimization */
window.onblur = visualizer.clear;
window.onfocus = visualizer.animate;

//  Responsiveness
window.onload = chaos.resize;
window.onresize = chaos.resize;

/* Que pare (parar sonido) siempre al quitar un click */
document.onmouseup = chaos.onmouseup;

/* Botones de la interfaz */
document.getElementById('waveform').onclick = function () {
	waveforms.push(waveforms.shift());
	return (this.innerHTML = waveforms[current_waveform]);
};

document.getElementById('filter').onclick = function () {
	filters.push(filters.shift());
	filter.type = current_filter;
	return (this.innerHTML = filters[current_filter]);
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

document.getElementById('dlabel').onclick = function () {
	delay.delayTime.value = 0;
	return (taptap_btn.innerHTML = "off");
};

var volume_val  = document.getElementById('volume');
document.getElementById('plus-volume').onclick = function () {
	if (volume.gain.value < 1)
		volume.gain.value += 0.01;

	return (volume_val.innerHTML = Math.floor(100 * volume.gain.value) + '%');
};
document.getElementById('less-volume').onclick = function () {
	if (volume.gain.value > 0)
		volume.gain.value -= 0.01;

	return (volume_val.innerHTML = Math.floor(100 * volume.gain.value) + '%');
};

// wiring up
//===========

div.ondragover = function (e) {
	console.log('dragginover');
	e.preventDefault();
};
div.ondragleave = function (e) {
	console.log('leaving');
};
div.ondrop = function (e) {
	new BufferLoader(context, function(buffer) {
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(compressor);
      source.connect(delay);
      source.start(0);
    }).read(e.dataTransfer.files[0]);
	e.stopPropagation();
	e.preventDefault();
	return false;
};