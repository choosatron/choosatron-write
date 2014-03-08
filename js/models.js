/// RandomId ///
function RandomId(len) {
	this.length = len ? len : 10;
	this.id = '';
};

RandomId.addRange = function(a, start, end) {
	for (var i=start; i<=end; i++) {
		a.push(i);
	}
};

RandomId.candidates = [];
RandomId.addRange(RandomId.candidates, 97, 122);
RandomId.used = [];
RandomId.create = function(len) {
	var id = new RandomId(len);
	return id.toString();
}

RandomId.prototype = {
	pick_one: function() {
		var i = Math.floor(Math.random() * RandomId.candidates.length);
		var c = RandomId.candidates[i];
		return String.fromCharCode(c);
	},

	generate: function() {
		for (var i=0; i<this.length; i++) {
			this.id += this.pick_one();
		}
		if (RandomId.used.indexOf(this.id) >= 0) {
			this.id = '';
			this.generate();
		}
	},

	toString: function() {
		if (this.id.length != this.length) {
			this.generate();
		}
		return this.id;
	}
}


/// Model base class ///
function Model(data) {
	this.id       = RandomId.create();
	this.created  = Date.now();
	this.modified = null;
	this.opened   = null;

	if (data) this.load(data);
}

Model.abbrs = [];

Model.extend = function(cls, data) {
	cls.prototype = new Model();
	cls.constructor = cls;
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

	refresh_id: function() {
		var id = new RandomId();
		this.id = id.toString();
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

	serialize: function(pretty) {
		var o = this.object();
		var s = angular.toJson(o, pretty);
		return s;
	}
};


/// Story ///
function Story(data) {
	this.lastPassageNumber = 0;

	this.created = Date.now();
	this.title        =  '';
	this.version      =  1.0;
	this.description  =  '';
	this.cover_url    =  '';
	this.genre        =  '';
	this.author       =  '';
	this.credit       =  '';
	this.passages     =  [];
	Model.call(this, data);
}

Story.methods = {
	get_title: function () {
		return this.title || "Untitled Story";
	},

	get_next_passage_number: function () {
		return ++this.lastPassageNumber;
	},

	get_opening: function() {
		var opening = null;
		this.each_passage(function(p) {
			if (p.opening) {
				opening = p;
				return false;
			}
		});
		return opening;
	},

	get_orphans: function() {
		var destinations = [];
		this.each_passage(function(p) {
			destinations.concat(p.get_destinations());
		});
		var ophans = [];
		this.each_passage(function(p) {
			if (destinations.indexOf(p.id) < 0) {
				orphans.push(p);
			}
		});
		return p;
	},

	add_passage: function(passage) {
		if (this.passages.length == 0) {
			passage.opening = true;
		}
		this.passages.push(passage);
		return passage.id;
	},

	delete_passage: function(id) {
		if (!this.passages) return;
		for (var i=0; i<this.passages.length; i++) {
			if (this.passages[i].id == id) {
				// Delete entry from array
				this.passages[i].trashed = true;
				this.passages.splice(i, 1);
				break;
			}
		}
	},

	get_passage: function(id) {
		var passage = null;
		this.each_passage(function(p) {
			if (p.id == id) {
				passage = p;
				return false;
			}
		});
		return passage;
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


/// Passage ///
function Passage(data) {
	this.number = null;
	this.content     =  '';
	this.choices     =  [];
	this.opening     =  false;
	this.value       =  0;
	this.ending_value = false; // Not an ending when === false
	this.trashed = false;

	Model.call(this, data);

	if (this.has_ending()) {
		this.exit_type = 'ending';

	} else if (this.has_append()) {
		this.exit_type = 'append'

	} else {
		this.exit_type = 'choices';
	}

	Passage.passages[this.id] = this;

	Object.defineProperty(this, "abbr", {
		get: function abbr() {return this.abbreviate(10);}
	});
}

Passage.abbrs = {};
Passage.passages = {};

Passage.methods = {
	get_content: function () {
		return this.content || "Write your passage content here."
	},

	set_exit_type: function (exit_type) {
		this.ending_value = false;
		this.choices = [];

		this.exit_type = exit_type;
		console.log(this.exit_type);///
	},

	has_ending: function () {
		return (this.ending_value !== false);
	},

	has_append: function () {
		return false;
	},

	has_choices: function () {
		return (this.choices && this.choices.length);
	},

	set_ending: function (val) {
		this.ending_value = val;
	},

	ending_type_name: function () {
		if (!this.has_ending()) {
			return '';
		}

		switch (this.ending_value) {
			case -2:
				return 'terrible';
			case -1:
				return 'bad';
			case 0:
				return 'neutral';
			case 1:
				return 'good';
			case 2:
				return 'great';
		}

		return '';
	},

	abbreviate: function(len) {
		var starter = this.content.replace(/[^a-zA-Z0-1]/g, '').substr(0, len).toLowerCase();
		var abbr = starter;
		var i = 1;
		while (Passage.abbrs[abbr] && Passage.abbrs[abbr] != this.id) {
			abbr = starter + (i++).toString(); 
		}
		Passage.abbrs[abbr] = this.id;
		return abbr;
	},

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

	get_destinations: function() {
		var ids = [];
		this.each_choice(function(c) {
			c.each_path(function(p) {
				if (ids.indexOf(p.destination) < 0) {
					ids.push(p.destination);
				}
			});
		});
		return ids;
	},

	get_passage_choice: function (passage) {
		var n = 1,
			matching_choice;

		this.each_choice(function (choice) {
			if (choice.has_destination(passage)) {
				matching_choice = n + '. ' + choice.get_content();
			}

			n++;
		});

		return matching_choice;
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


/// Choice ///
function Choice(data) {
	this.content     =  '';

	// These are the conditions used to determine whether this choice is displayed
	this.conditions  =  '';

	// An array of possible paths for this choice.
	this.paths       =  [new Path()];

	Model.call(this, data);
}

Choice.methods = {
	get_content: function () {
		return this.content || "Write your choice content here."
	},

	has_destination: function(passage) {
		var has = false;
		angular.forEach(this.paths, function(path) {
			if (has) return;
			if (path.destination) {
				if (passage && passage.id == path.destination) {
					has = true;
				}
				else if (!passage && Passage.passages[path.destination] && !Passage.passages[path.destination].trashed) {
					has = true;
				}
			}
		});
		return has;
	},

	set_destination: function(passage) {
		if (this.paths.length > 0) {
			this.paths[0].destination = passage ? passage.id : null;
		}
		else {
			var path = new Path();
			path.destination = passgage ? passage.id : null;
			this.paths.push(path);
		}
	},

	each_path: function(callback) {
		return this.each('paths', callback);
	},

	load_paths: function(paths) {
		this.paths = [];
		for (var i=0; i<paths.length; i++) {
			this.paths.push(new Path(paths[i]));
		}
	}
}
Model.extend(Choice, Choice.methods);


/// Path ///
function Path(data) {
	// The destination id of the passage this path takes you to.
	this.destination  =  null;

	// The conditions that need to be met in order for this path to display.
	this.conditions   =  '';

	// The updates that occur if this path is taken.
	this.updates      =  '';
	Model.call(this, data);
}
Model.extend(Path, {});
