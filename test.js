var tape = require('tape');
var memdb = require('memdb');

var lazy = function(t) {
	var once = true;
	return require('./')(function(cb) {
		t.ok(once);
		once = false;
		process.nextTick(function() {
			cb(null, memdb());
		});
	});
};

tape('get', function(t) {
	var db = lazy(t);
	db.get('test', function(err) {
		t.ok(err);
		t.end();
	});
});

tape('put', function(t) {
	var db = lazy(t);
	db.put('hello', 'world', function(err) {
		t.ok(!err);
		db.get('hello', function(err, val) {
			t.same(val, 'world');
			t.end();
		});
	});
});

tape('del', function(t) {
	var db = lazy(t);
	db.put('hello', 'world', function() {
		db.del('hello', function(err) {
			t.ok(!err);
			db.get('hello', function(err) {
				t.ok(err);
				t.end();
			});
		});
	});
});

tape('close', function(t) {
	var db = lazy(t);
	db.put('hello', 'world', function() {
		db.close(function(err) {
			t.ok(!err);
			t.end();
		});
	});
});

tape('read-stream', function(t) {
	var db = lazy(t);
	db.put('hello', 'world', function() {
		db.put('hi', 'welt', function() {
			var rs = db.createReadStream();
			var expects = ['world', 'welt'];

			rs.on('data', function(data) {
				t.same(data.value, expects.shift());
			});

			rs.on('end', function() {
				t.end();
			});
		});
	});
});

tape('write-stream', function(t) {
	var db = lazy(t);
	var ws = db.createWriteStream();
	var expects = ['world', 'welt'];

	ws.write({key:'hello', value:'world', type:'put'});
	ws.end({key:'hi', value:'welt', type:'put'});
	ws.on('close', function() {
		db.get('hello', function(err, val) {
			t.same(val, 'world');
			db.get('hi', function(err, val) {
				t.same(val, 'welt');
				t.end();
			});
		});
	});
});

tape('batch', function(t) {
	var db = lazy(t);

	db.batch([{
		type:'put',
		key:'hello',
		value:'world'
	},{
		type:'put',
		key:'hi',
		value:'welt'
	}], function(err) {
		t.ok(!err);
		db.get('hello', function(err, val) {
			t.same(val, 'world');
			db.get('hi', function(err, val) {
				t.same(val, 'welt');
				t.end();
			});
		});
	});
});