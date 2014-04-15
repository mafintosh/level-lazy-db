# level-lazy-db

Open leveldb only when you need to

	npm install level-lazy-db

[![build status](https://secure.travis-ci.org/mafintosh/level-lazy-db.png)](http://travis-ci.org/mafintosh/level-lazy-db)]

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