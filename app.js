var fs = require("fs"),
    http = require("http"),
    config = require('config'),
    xregexp = require("xregexp"),
    dbi = require("node-dbi"),
    redisClient = require("redis"),
    cronJob = require('cron').CronJob,
    util = require('util')
    ;

// PROC CONTROL

process.title = "alanytics";
 
var PID_FILE
if( config.pid_dir ) {
    PID_FILE  = config.pid_dir + "/" + process.title + ".pid"
} else {
    PID_FILE  = "/var/run/alanytics/" + process.title + ".pid"
}
 
fs.writeFileSync( PID_FILE, process.pid + "\n" );
 
process.on("uncaughtException", function(err) {
  console.error("[uncaughtException]", err);
  return process.exit(1);
});
 
process.on("SIGTERM", function() {
  console.log("SIGTERM (killed by supervisord or another process management tool)");
  return process.exit(0);
});
 
process.on("SIGINT", function() {
  console.log("SIGINT");
  return process.exit(0);
});
 
process.on("exit", function() {
  return fs.unlink(PID_FILE);
});
 
//
// Your code start here
//
 
setInterval(function(){}, 1000);

// END PROC CONTROL

var red = redisClient.createClient( config.redis.port, config.redis.host );
red.on("error", function (err) {
    console.error("Error " + err);
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
var transpalan = fs.readFileSync( "transparent.gif" );

var collections = require( "./collections.json" );

var robots = require( './robots.js' );
var bladerunner = new robots.Bladerunner( "config/robots.iab", "abce" );

function format( sql, bind ) {
    sql = sql.replace( /\$([1-9]+)/g, function( match, p1, offset, s ) {
        return db.escape( bind[parseInt(p1)-1] );
    } );
  
    return sql;
}

new cronJob( config.cron.spec, function() {
    util.debug( "Collecting..." );
    for( var j = 0; j < collections.length; j ++ ) {
        if( collections[j].collection ) {
            util.debug( "  Updating '" + collections[j].title + "'" );
            red.keys(
                collections[j].collection.redispattern,
                ( function( coll, err, keys ) {
                    util.debug( "    Found " + keys.length + " keys" );
                    for( var ki = 0; ki < keys.length; ki ++ ) {
                        red.get(
                            keys[ki],
                            ( function( key, coll, err, val ) {
                                if( match = new RegExp( coll.pattern ).exec( key ) ) {
                                    str = format( coll.collection.sql, [val].concat(match.slice(1)) );                 
                                    db.query( str, function( err, res ) {
                                        if( err ) {
                                            // don't die!
                                            console.error( err );
                                        } else {
                                            // nothing :)
                                        }
                                    } );
                                }
                            } ).bind( null, keys[ki], coll )
                        );
                    }
                } ).bind( null, collections[j] )
            );
        }
    }
}, null, true, 'Europe/London' );
     
http.createServer(function(request, response) {
    //var date = new Date;
    //var day = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();
    
    ua = request.headers[ "user-agent" ];
    util.debug( ua );
    if( ua ) {
        if( bladerunner.validate( ua ) ) {
            util.debug( "validates" );
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
        }
    }

    response.writeHead(200, { "Content-Type": "image/gif" });
    response.write( transpalan, "binary" );        
    response.end();
} ).listen( config.server.port );

console.log( "Listening on port " + config.server.port + "." );
