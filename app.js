var fs = require("fs"),
    http = require("http"),
    config = require('config'),
    xregexp = require("xregexp"),
    dbi = require("node-dbi");
var redisClient = require("redis");
console.log( config.redis.host );
console.log( config.database.host );
var red = redisClient.createClient( config.redis.port, config.redis.host );
var cronJob = require('cron').CronJob;
red.on("error", function (err) {
    console.log("Error " + err);
});
dbconf = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name
};
db = new dbi.DBWrapper( 'mysql', dbconf);
db.connect();

// set up alan!

var alan = fs.readFileSync( "alan.gif" );

// oh you can require json!
var collections = require( "./collections.json" );

// hacked out of the DBI adapter class
// why don't they let you access this directly?
function format( sql, bind ) {
    sql = sql.replace( /\$([1-9]+)/g, function( match, p1, offset, s ) {
        if (bind.length == 0) {
            throw new Error('too few parameters given');
        }
        return db.escape( bind[parseInt(p1)-1] );
    } );
  
    return sql;
}

new cronJob( '*/10 * * * * *', function() {
    console.log( "Collecting..." );
    for( var j = 0; j < collections.length; j ++ ) {
        if( collections[j].collection ) {
            red.keys(
                collections[j].collection.redispattern,
                (
                    function( coll, err, keys ) {
                        for( var ki = 0; ki < keys.length; ki ++ ) {
                            red.get(
                                keys[ki],
                                (
                                    function( key, coll, err, val ) {
                                        if( match = new RegExp( coll.pattern ).exec( key ) ) {
                                            str = format( coll.collection.sql, [val].concat(match.slice(1)) );                 
                                            //console.log( str );
                                            db.query( str, function( err, res ) {
                                                if( err ) {
                                                    // don't die!
                                                    console.error( err );
                                                } else {
                                                    console.log( "record updated" );
                                                }
                                            } );
                                        }
                                    }
                                ).bind( null, keys[ki], coll )
                            );
                        }
                    }
                ).bind( null, collections[j] )
            );
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
            //console.log( actions[i] );
            for( var j = 0; j < collections.length; j ++ ) {
                if( match = new RegExp( collections[j].pattern ).exec( actions[i] ) ) {
                    //console.log( "Matched - increment" );
                    red.incr( actions[i] );
                }
            }
        }
    }


    response.writeHead(200, { "Content-Type": "image/gif" });
    response.write( alan, "binary" );        
    response.end();
} ).listen( 3000 );

