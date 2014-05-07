# level-lazy-db

Open leveldb only when you need to

	npm install level-lazy-db

[![build status](http://img.shields.io/travis/mafintosh/level-filesystem.svg?style=flat)](http://travis-ci.org/mafintosh/level-lazy-db)
![dat](http://img.shields.io/badge/Development%20sponsored%20by-dat-green.svg?style=flat)

## Usage

Simply pass a function the calls it callback with a levelup instance.
The method will only be called once and only when you call a io method on the db.

``` js
var lazy = require('level-lazy-db');
var level = require('level');

var db = lazy(function(cb) {
	cb(null, level('/tmp/my.db'));
});

db.get('test', function(err, val) {
	// calling a method opens the db
});

```

## License

MIT
