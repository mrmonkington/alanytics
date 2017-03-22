var config = require('./config/default.json');

var fs = require("fs");
var http = require("http");
var xregexp = require("xregexp");
var dbi = require("node-dbi");
var cronJob = require('cron').CronJob;
var redisClient = require("redis");
var util = require('util');

var collect = require('./lib/collect.js');

function debug( msg ) {
    if( config.debug ) {
        util.debug( msg );
    }
}
function error( msg ) {
    console.error( msg );
}

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
        return bind[parseInt(p1)-1];
    } );
  
    return sql;
}
function formatSQL( sql, bind ) {
    sql = sql.replace( /\$([1-9]+)/g, function( match, p1, offset, s ) {
        return db.escape( bind[parseInt(p1)-1] );
    } );
  
    return sql;
}

     
http.createServer( collect.dispatch ).listen( config.server.port, config.server.host );

console.log( "Listening on " + config.server.host + ":" + config.server.port + "." );
