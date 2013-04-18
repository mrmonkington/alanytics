// Kills robots
var fs = require("fs");
var util = require("util");

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
                        "pattern" : new RegExp( RegExp.escape( pattern), "i" ),
                        "exceptions" : new RegExp( exceptions.replace( ",", "|" ), "i" )
                    } );
                }
            }
        } ).bind(this) );
    } else {
        throw new Error( "'" + format + "' is not known format." );
    }

    // iS NOT robot?
	this.validate = function( match ) {
		for( var i in this.robots ) {
            robot = this.robots[i]; 
			// TODO check robot exceptions list
			if( robot.pattern.exec( match[ "client_useragent" ], "i" ) ) {
				return false;
            }
        }
		return true;
    };

    this.isRobot = function( match ) { return !this.validate( match ); };

}
exports.Bladerunner = Bladerunner;
