
module.exports = function(server,wire) {

	this.autopat_enabled = false;

	// --------------------------------------------------------------------
	// -- myConstructor : Throws the constructor into a method.
	// ...Because javascript wants the methods to be defined before referencing them.

	this.myConstructor = function() {

		// Method call at the bottom of this class.
	
		// Routing is sent to our handler.
		server.get('/:mode', this.responseHandler);
		server.post('/:mode', this.responseHandler);
		server.head('/:mode', this.responseHandler);

		server.get('/:mode/:submode', this.responseHandler);
		server.post('/:mode/:submode', this.responseHandler);
		server.head('/:mode/:submode', this.responseHandler);

		server.listen(8080, function() {
			console.log('%s listening at %s', server.name, server.url);
		});

	};

	// --------------------------------------------------------------------
	// -- responseHandler : Handles routing of API events.

	this.responseHandler = function(req, res, next) {

		// console.log('checking params:',req.params);

		// Switch based on the mode.
		switch (req.params.mode) {
			case "get-info":
				return_json = this.getInfo();
				break;
			case "pat":
				return_json = this.patTheDog();
				break;
			case "auto-pat":
				return_json = this.setAutoPat(req.params.seconds);
				break;
			default:
				return_json = {error: "Unknown command."};
				// That's an error of sorts.
				break;

		}

		// res.send('hello ' + req.params.name);
		// console.log('ze req!',req.params);
		
		// Return a JSON result.
		res.contentType = 'json';
		res.send(return_json);

	}.bind(this);

	// --------------------------------------------------------------------
	// -- setAutoPat : Start auto-patting the dog, every N seconds.

	this.autoPatter = function(seconds) {

		// Exit out of this if we disable autopat.
		if (!this.autopat_enabled) { return; }

		// Convert seconds to millis.
		in_millis = seconds * 1000;

		setTimeout((function() {
			
			// Pat the dog.
			wireInterface.patTheDog(function(err){
				console.log("did an autopat.");
			});
			// Now, let's call ourself!
			this.autoPatter(seconds);

		}).bind(this), in_millis);


	};

	// --------------------------------------------------------------------
	// -- setAutoPat : Start auto-patting the dog, every N seconds.

	this.setAutoPat = function(seconds) {

		// Check an error on this pat.
		is_error = false;
		
		// Enable autopat.
		this.autopat_enabled = true;

		// Pat the dog once now, to be nice.
		wireInterface.patTheDog(function(err){
			if (err) { is_error = true; }
		});

		// Call the autopat method, which will recurse.
		this.autoPatter(seconds);

		// Return empty json.
		return {error: is_error};

	};

	// --------------------------------------------------------------------
	// -- patTheDog : Manually Pat the dog.
	
	this.patTheDog = function() {

		is_error = false;
		// Simply pat the dog.
		wireInterface.patTheDog(function(err){
			if (err) { is_error = true; }
		});

		// Return empty json.
		return {error: is_error};
	};

	// --------------------------------------------------------------------
	// -- getInfo : Get information about the state of the watchdog timer

	this.getInfo = function() {

		info = {
			ignition: {
				state: false,
				minutes: 0,
				seconds: 0,
			},
			watchdog_enabled: false,
			error: false,
		};

		wireInterface.getIgnitionState(function(ign_state,err){
			if (err) { info.error = true; }
			info.ignition.state = ign_state;
		});

		wireInterface.ignitionLastChanged(false,function(seconds,err){
			if (err) { info.error = true; }
			info.ignition.seconds = seconds;
		});

		wireInterface.ignitionLastChanged(true,function(minutes,err){
			if (err) { info.error = true; }
			info.ignition.minutes = minutes;
		});

		wireInterface.getWatchDog(function(wdtmode,err){
			if (err) { info.error = true; }
			info.watchdog_enabled = wdtmode;
		});

		console.log(JSON.stringify(info, null, 4));

		return info;

	};

	// Call the constructor (after defining all of the above.)

	this.myConstructor();

	
}