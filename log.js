/* 
* Logging methods
*/


function Log() {
	try {
		self = document.createElement("div");
		self.id = "log";
		/* Append*/
		body = document.querySelector('body');
		body.insertBefore( self, body.firstChild );
		/* Style */
		self.style.padding = "0";
		self.style.margin = "0";
		self.style.width = "100%";
		self.style.height = "20%";
		self.style.overflow = "auto";
		self.style.background = "black";
		self.style.color = "white";
		/* Fix bottom*/
		self.style.position = "fixed";
		self.style.top = "100%";
		self.style.marginTop = "-20%";
		self.style.zIndex = 1000;
		/* Create clear button */
		button = document.createElement("button");
		button.innerHTML = "CLEAR";
		button.onclick = function() {
			while ( self.firstChild ) {
				self.removeChild( self.firstChild );
			}
			self.appendChild( button );
		}
		self.appendChild( button );

	} catch ( exception ){
		alert( exception );
	}
};

Log.self = function() {
	return document.getElementById('log');
}

Log.d = function( string ) {
	try {
		self = Log.self();
		text = document.createTextNode(string);
		node = document.createElement("p");
		node.appendChild( text );
		self.appendChild( node );
	} catch ( exception ){
		alert(exception);
	}
};

Log.clear = function(first_argument) {
	self = Log.self();
	while ( self.firstChild ) {
		self.removeChild( self.firstChild );
	}
};

new Log();