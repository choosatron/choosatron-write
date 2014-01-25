Array.prototype.addRange = function(start, end) {
	for (var i=start; i<=end; i++) {
		this.push(i);
	}
};

function RandomId(len) {
	this.length = len ? len : 10;
	this.chars  = [];
};

RandomId.candidates = [];
RandomId.candidates.addRange(97, 122);

RandomId.prototype = {
	pick_one: function() {
		var i = Math.floor(Math.random() * RandomId.candidates.length);
		var c = RandomId.candidates[i];
		return String.fromCharCode(c);
	},

	generate: function() {
		for (var i=0; i<this.length; i++) {
			this.chars.push(this.pick_one());
		}
	},

	toString: function() {
		if (this.chars.length != this.length) {
			this.generate();
		}
		return this.chars.join('');
	}
}

function Model() {
	var id = new RandomId();
	this.id = id.toString();
}

Model.extend = function(cls, data) {
	cls.prototype = new Model();
	angular.forEach(data, function(func, name) {
		cls.prototype[name] = func;
	});
};

Model.prototype = {
	load: function(data) {
		for (var key in data) {
			var loader = 'load_' + key;
			if (typeof this[loader] === 'function') {
				this[loader]( data[key] );
			}
			else {
				this[key] = data[key];
			}
		}
	},

	each: function(field, callback) {
		var list = this[field];
		for (var i=0, item; item = list[i]; i++) {
			var stop = callback(item);
			if (stop === false) break;
		}
		return this;
	},

	object: function() {
		var o = {};
		for (var key in this) {
			var val = this[key];
			if (val instanceof Model) {
				o[key] = val.serialize();
			}
			else {
				o[key] = val;
			}
		}
		return o;
	},

	serialize: function() {
		var o = this.object();
		var s = angular.toJson(o);
		return s;
	}
};

function Story(data) {
	this.title     =  '';
	this.version   =  1.0;
	this.passages  =  [];
	if (data) this.load(data);
}

Story.methods = {
	get_opening: function() {
		if (!this.passages) return null;
		return this.passages[0];
	},

	add_passage: function(passage) {
		this.passages.push(passage);
		return passage.id;
	},

	each_passage: function(callback) {
		return this.each('passages', callback);
	},

	collect_entrances: function(passage) {
		var entrances = [];
		this.each_passage(function(p) {
			if (p.has_destination(passage)) {
				entrances.push(p);
			}
		});
		return entrances;
	},

	load_passages: function(passages) {
		for (var i=0; i<passages.length; i++) {
			this.passages.push(new Passage(passages[i]));
		}
	}
};
Model.extend(Story, Story.methods);

function Passage(data) {
	this.content    =  '';
	this.choices    =  [];
	if (data) this.load(data);
}

Passage.methods = {
	add_choice: function(choice) {
		this.choices.push(choice);
		return choice.id;
	},

	remove_choice: function(choice) {
		for (var i=0,c; c=this.choices[i]; i++) {
			if (c.id == choice.id) {
				this.choices.splice(i, 1);
				break;
			}
		}
	},

	has_destination: function(passage) {
		var has  =  false;
		this.each_choice( function( c ) {
			if ( c.has_destination( passage ) ) {
				has  =  true;
				return false;
			}
		} );
		return has;
	},

	each_choice: function(callback) {
		return this.each('choices', callback);
	},

	load_choices: function(choices) {
		for (var i=0; i<choices.length; i++) {
			this.choices.push(new Choice(choices[i]));
		}
	}
};
Model.extend(Passage, Passage.methods);

function Choice(data) {
	this.content  =  '';
	this.paths    =  [new Path()];
	if (data) this.load(data);
}

Choice.methods = {
	has_destination: function(passage) {
		var has = false;
		angular.forEach(this.paths, function(path) {
			if (has) return;
			if (path.destination) {
				if (passage && passage.id == path.destination) {
					has = true;
				}
				else if (!passage) {
					has = true;
				}
			}
		});
		return has;
	},

	set_destination: function(passage) {
		if (this.paths.length > 0) {
			this.paths[0].destination = passage.id;
		}
		else {
			var path = new Path();
			path.destination = passage.id;
			this.paths.push(path);
		}
	},

	load_paths: function(paths) {
		this.paths = [];
		for (var i=0; i<paths.length; i++) {
			this.paths.push(new Path(paths[i]));
		}
	}
}
Model.extend(Choice, Choice.methods);

function Path(data) {
	this.destination = null;
	if (data) this.load(data);
}
Path.prototype = new Model();
