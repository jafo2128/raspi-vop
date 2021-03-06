// --------------------------------------------------------
//              _____ _____    ____                        
//  _ _ ___ ___|     |  _  |  |    \ ___ ___ _____ ___ ___ 
// | | | -_| -_|  |  |   __|  |  |  | .'| -_|     | . |   |
//  \_/|___|___|_____|__|     |____/|__,|___|_|_|_|___|_|_|
//
// --------------------------------------------------------
// This script starts up everything you need to talk to
// to the veeOP. It uses I2C to talk to the veeOP, and
// then you can use a REST client to talk to this.
// --------------------------------------------------------                                                      

var constants = require("./library/constants.js");             	// Constants module (w/ general configs)
var WireInterface = require("./library/wireInterface.js");     	// Our module for interfacing on the wire with i2c.
var TestPlan = require("./library/testPlan.js");               	// This is our test plan, it's a suite of things we can test.
var moment = require('moment');                        		// Moment.js module, mostly for debugging (so far).
var Syslog = require('node-syslog');				// Node-syslog module.
var Logger = require('./library/logger.js');			// Our logging module.
var logger = new Logger(Syslog);				// Perform our syslog initialization / create our logger object.

// Yep, we're starting!
logger.log("veeOP Daemon started.");

// ------- Initialize the i2c module
// -- Docs @ https://github.com/kelly/node-i2c
var i2c = require('i2c');
var address = constants.I2C_ADDRESS;
var wire = new i2c(address, {device: constants.I2C_DEVICE}); // point to your i2c address, debug provides REPL interface

// Add an interface to our wire object.
wireInterface = new WireInterface(wire,constants,logger);

// Restify object, for making RESTful APIs
var restify = require('restify');

// Setup restify
var server = restify.createServer();
server.use(restify.bodyParser());

// Our REST API object, the one we customize.
var Rest = require("./library/rest.js");               // This is our test plan, it's a suite of things we can test.
var rest = new Rest(server,wireInterface,logger);

// ----------------------------------------------------
// -- Testing script.
// This comprises the unit tests for the i2c interface
// ----------------------------------------------------

// Uncomment this and create a test plan object.
// testPlan = new TestPlan(moment,wireInterface);

// -- With the watchdog off, initiate a shutdown, then cancel it.
// testPlan.watchDogOffCancelAShutdown();

// -- Request a shutdown in 2 minutes
// testPlan.watchDogOffRequestShutdown(true,2);

// -- Request a shut down in 15 seconds.
// testPlan.watchDogOffRequestShutdown(false,15);

// -- Test the i2c error rate by loading this with tons of tests as fast as you can.
// testPlan.errorBlaster(10000);

// -- Test Method, boot fails, but ignition is on (expect reboot)
// testPlan.bootFailsIngitionON();

// -- Test method, boot fails, but ignition is off (expect shutdown, no reboot)
// testPlan.bootFailsIngitionOFF();

// -- A test for a nomal boot and shutdown!
// testPlan.normalBootAndShutdown();

// -- And another for a watchdog recovery during shutdown
// testPlan.watchdogRecoveryDuringShutdownPhase();

// -- And here's one for a shutdown with an early ignition back on after it's off (expect a reboot)
// testPlan.shutdownWithEarlyIgnition();
