var EventEmitter = require('events').EventEmitter;
	assert = require('assert'),
	sys = require('sys');

function EventManager() {
	if(!(this instanceof EventManager)) {
		return new EventManager();
	}
	
	EventEmitter.call(this);
	
	this.route = { };
}

sys.inherits(EventManager, EventEmitter);

exports.EventManager = EventManager;

EventManager.prototype.default = function(event, cb) {
	if(this.route[event]) {
		throw 'Default implementation for ' + event + ' is already there.';
	}
	
	this.route[event] = [cb];
};

EventManager.prototype.override = function(event, cb) {
	if(!this.route[event]) {
		throw 'Cant override an event that does not exist: ' + event;
	}
	
	this.route[event].push(cb);
};

EventManager.prototype.emit = function() {
	assert.ok(arguments.length >= 1);
	
	var event = arguments[0];
	
	var args = [];
	for(var i = 1; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	EventEmitter.prototype.emit.apply(this, arguments);
	
	var route = this.route[event];
	if(route) {
		assert.notEqual(route.length, 0);
		
		for(var i = route.length - 1; i > 0; i--) {
			route[i].next = route[i-1];
		}
		var result = route[route.length - 1].
				apply(route[route.length - 1], args);
		
		for(var i = 0; i < route.length; i++) {
			route[i].next = undefined;
		}
		
		return result;
	}
};