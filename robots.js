// Kills robots
var fs = require("fs");

RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var Bladerunner = function( src, format ) {

	this.robots = Array();
    this.format = format;
    this.src = src;

    // load robot definition
    if( format == "abce" ) {
        rt = String(fs.readFileSync( src ));
        rt.split(/\n/).forEach( ( function( ln ) {
            ln = ln.trim();
            if( ln[ 0 ] != "#" && ln != "" ) {
                fields = ln.split( "|" );
                pattern = fields[0];
                active = fields[1];
                exceptions = fields[2];
                twopass_redundant = fields[3];
                target = fields[4];
                expiry = fields[5];
                if( active == "1" ) {
                    this.robots.push( {
                        "pattern" : new RegExp( RegExp.escape( pattern ) ),
                        "exceptions" : new RegExp( exceptions.replace( ",", "|" ) )
                    } );
                }
            }
        } ).bind(this) );
    } else {
        throw new Error( "'" + format + "' is not known format." );
    }

    // iS NOT robot?
	this.validate = function( match ) {
		this.robots.forEach( ( function( robot, match ) {
			// TODO check robot exceptions list
			if( robot.pattern.exec( match[ "client_useragent" ] ) ) {
				return false;
            }
        } ).bind( match ) );
		return true;
    };

    this.isRobot = function( match ) { return !this.validate( match ); };

}
exports.Bladerunner = Bladerunner;
