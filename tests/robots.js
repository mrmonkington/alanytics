robots = require( '../robots.js' )

exports.testBladerunner = function( test ) {
	r = new robots.Bladerunner( "config/robots.iab", "abce" );
	test.ok( r.isRobot( { "client_useragent" : "apachebench" } ) );
	test.ok( r.isRobot( { "client_useragent" : "Wget/1.13.4 (linux-gnu) " } ) );
	test.ok( r.isRobot( { "client_useragent" : "the apachebench" } ) );
	test.ok( r.isRobot( { "client_useragent" : "the apachebench v2" } ) );
    test.ok( r.validate( { "client_useragent" : "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.3) Gecko/2008092510 Ubuntu/8.04 (hardy) Firefox/3.0.3" } ) );
    test.done();
}
