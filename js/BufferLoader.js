
// Load track sample
// =================
// new BufferLoader(context, function (bufferList) {
//  var source = context.createBufferSource();
//  source.buffer = bufferList[0];
//  source.connect(compressor);
//  source.connect(delay);
//  source.start(0);
// }).fetch(['tracks/hohey.mp3']).load();


function BufferLoader(context, callback) {
  this.context = context;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.fetch = function (urlList) {
  this.urlList = urlList;
  return this;
};

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  var loader = this;
  request.onload = function() {
    loader.context.decodeAudioData(request.response, 
      function (buffer) {
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      });
  };
  request.onerror = function() {
    alert('Cannot load ' + url);
  }
  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}

BufferLoader.prototype.read = function(file) {
  var self = this;
  // Check if it is playable file
  if (!document.createElement('audio').canPlayType(file.type))
    window.alert(file.type + " is not supported by your browser");

  fr = new FileReader();
  fr.onload = function (fd) {
    console.log('fd=%s', fd);
    console.log('fd.target=%s', fd.target);
    self.context.decodeAudioData(fd.target.result, self.onload,
    function(error) {
      console.error('decodeAudioData error -> %s', error);
      throw error;
    });
  };
  fr.readAsArrayBuffer(file);
};
