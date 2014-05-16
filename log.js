/* 
* Logging methods
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