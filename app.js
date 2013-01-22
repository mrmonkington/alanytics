var sys = require("sys"),
    fs = require("fs"),
    http = require("http"),
    crypto = require("crypto");
    xregexp = require("xregexp");
var redisClient = require("redis")
var db = redisClient.createClient();
var cronJob = require('cron').CronJob;
db.on("error", function (err) {
    console.log("Error " + err);
});

// set up alan!

var alan = fs.readFileSync( "alan.gif" );

// oh you can require json!
var collections = require( "./collections.json" );

new cronJob( '*/5 * * * * *', function() {
    console.log( "Collecting..." );
    for( var j = 0; j < collections.length; j ++ ) {
        //if( match = new RegExp( collections[j].pattern ).exec( actions[i] ) ) {
        //    console.log( match );
        //}
        // iterate through matching keys
        if( collections[j].collection ) {
            db.keys( collections[j].collection.redispattern, function( err, keys ) {
                for( var ki = 0; ki < keys.length; ki ++ ) {
                    db.get( keys[ki], function( err, val ) {
                        console.log( val );
                    } );
                }
            } );
        }
    }
}, null, true, 'Europe/London' );
 
http.createServer(function(request, response) {
    //var date = new Date;
    //var day = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();

    action_spec = request.url.slice(1);

    if( action_spec ) {
        actions = action_spec.split(",");
        for( var i = 0; i < actions.length; i++ ) {
            // increment count in redis
            console.log( actions[i] );
            for( var j = 0; j < collections.length; j ++ ) {
                if( match = new RegExp( collections[j].pattern ).exec( actions[i] ) ) {
                    console.log( "Matched - increment" );
                    db.incr( actions[i] );
                }
            }
        }
    }


    //var urlhash = crypto.createHash("md5").update(request.headers.referer).digest("hex");

    /*var keys = [
    "hits-by-url:" + urlhash, 
    "hits-by-day:" + day, 
    "hits-by-url-by-day:" + urlhash + ":" + day
    ];

    for (i in keys)
    db.incr(keys[i]);
    */
    response.writeHead(200, { "Content-Type": "image/gif" });
    response.write( alan, "binary" );        
    response.end();
} ).listen( 3000 );

