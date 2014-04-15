var thunky = require('thunky');
var xtend = require('xtend');
var util = require('util');
var PassThrough = require('readable-stream/passthrough');
var events = require('events');
var fwd = require('fwd');

var Lazy = function(open) {
	if (!(this instanceof Lazy)) return new Lazy(open);

	var self = this;
	this.open = thunky(function(cb) {
		open(function(err, db) {
			if (err) return self.emit('error', err);
			fwd(db, self);
			cb(db);
		});
	});

	events.EventEmitter.call(this);
};

util.inherits(Lazy, events.EventEmitter);

Lazy.prototype.get = function() {
	var args = arguments;
	this.open(function(db) {
		db.get.apply(db, args);
	});
};

Lazy.prototype.put = function() {
	var args = arguments;
	this.open(function(db) {
		db.put.apply(db, args);
	});
};

Lazy.prototype.del = function() {
	var args = arguments;
	this.open(function(db) {
		db.del.apply(db, args);
	});
};

Lazy.prototype.close = function() {
	var args = arguments;
	this.open(function(db) {
		db.close.apply(db, args);
	});
};

Lazy.prototype.readStream =
Lazy.prototype.createReadStream = function() {
	var args = arguments;
	var proxy = new PassThrough({objectMode:true, highWaterMark:16});
	var source;
	var destroyed = false;

	proxy.destroy = function() {
		destroyed = true;
		if (source) source.destroy();
	};

	this.open(function(db) {
		source = db.createReadStream.apply(db, args);
		source.pipe(proxy);
		source.on('close', function() {
			proxy.emit('close');
		});

		if (destroyed) source.destroy();
	});

	return proxy;
};

Lazy.prototype.readStream =
Lazy.prototype.createWriteStream = function() {
	var args = arguments;
	var proxy = new PassThrough({objectMode:true, highWaterMark:16});
	var source;
	var destroyed = false;

	proxy.destroy = function() {
		destroyed = true;
		if (source) source.destroy();
	};

	this.open(function(db) {
		source = db.createWriteStream.apply(db, args);
		proxy.pipe(source);
		source.on('close', function() {
			proxy.emit('close');
		});

		if (destroyed) source.destroy();
	});

	return proxy;
};

Lazy.prototype.keyStream =
Lazy.prototype.createKeyStream = function(options) {
	return this.createReadStream(xtend(options, { keys: true, values: false }));
};

Lazy.prototype.valueStream =
Lazy.prototype.createValueStream = function(options) {
	return this.createReadStream(xtend(options, { keys: false, values: true }));
};

Lazy.prototype.batch = function() {
	var args = arguments;
	this.open(function(db) {
		db.batch.apply(db, args);
	});
};

module.exports = Lazy;