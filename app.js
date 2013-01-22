var sys = require("sys"),
    fs = require("fs"),
    http = require("http"),
    crypto = require("crypto");
var redisClient = require("redis-client")

var db = redisClient.createClient();

var alan = fs.readFileSync( "alan.gif" );
 
http.createServer(function(request, response) {
  //var date = new Date;
  //var day = date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate();


 
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

