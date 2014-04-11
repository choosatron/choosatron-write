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


/// Playback ///

var Operator = {
	'==': {
		name: 'equals',
		type: 'condition',
		action: function(a, b) {
			return a == b;
		}
	},
	'!=': {
		name: 'not equals',
		type: 'condition',
		action: function(a, b) {
			return a != b;
		}
	},
	'>': {
		name: 'greater than',
		type: 'condition',
		action: function(a, b) {
			return a > b;
		}
	},
	'>=': {
		name: 'greater than or equal to',
		type: 'condition',
		action: function(a, b) {
			return a >= b;
		}
	},
	'<': {
		name: 'less than',
		type: 'condition',
		action: function(a, b) {
			return a < b;
		}
	},
	'<=': {
		name: 'less than or equal to',
		type: 'condition',
		action: function(a, b) {
			return a <= b;
		}
	},
	'=': {
		name: 'set to',
		type: 'update',
		action: function(a, b) {
			return b;
		}
	},
	'+=': {
		name: 'increase by',
		type: 'update',
		action: function(a, b) {
			return a + b;
		}
	},
	'-=': {
		name: 'subtract by',
		type: 'update',
		action: function(a, b) {
			return a - b;
		}
	},
	'*=': {
		name: 'multiply by',
		type: 'update',
		action: function(a, b) {
			return a * b;
		}
	},
	'/=': {
		name: 'divide by',
		type: 'update',
		action: function(a, b) {
			return a / b;
		}
	}
};

var Operators = [];
Operator.keywords = Object.keys(Operator);
Operator.keywords.forEach(function(key) {
	var op = Operator[key];
	op.keyword = key;
	Operators.push(op);
});

Object.defineProperty(Operators, 'conditions', {
	get: function() {
		return this.filter(function(o) {return o.type == 'condition';});
	}
});

Object.defineProperty(Operators, 'updates', {
	get: function() {
		return this.filter(function(o) {return o.type == 'update';});
	}
});


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
		if (!list) return this;
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


function Command(data) {
	this.variable = null;
	this.verb     = null;
	this.value    = null;

	Object.defineProperty(this, 'raw', {
		get: function() {
			return this.variable + ' ' + this.verb + ' ' + this.value;
		},
		set: function(str) {
			this.parse(str);
		},
	});

	Model.call(this, data);
};

Command.methods = {
	parse: function(str) {
		this.raw = str;
		var ptrn = /^(\S+)\s(\S+)\s(.+)$/;
		var parts = ptn.exec(str);
		if (parts.length < 4) {
			return false;
		}
		this.variable = parts[1];
		this.verb     = parts[2];
		this.value    = parts[3];
		return true;
	},

	empty: function() {
		return !this.variable || !this.verb || !this.value;
	},

	cast: function(v) {
		var f = parseFloat(v);
		if (!isNaN(f)) return f;
		var i = parseInt(v);
		if (!isNaN(i)) return i;
		return v;
	},

	apply: function(source) {
		var func = Operator[this.verb];
		if (func && func.action) {
			var data = this.cast(source[this.variable] || 0);
			var value = this.cast(this.value);
			source[this.variable] = func.action(data, value);
		}
		return source[this.variable];
	},

	test: function(source) {
		var func = Operator[this.verb];
		if (func && func.action) {
			var data = this.cast(source[this.variable] || 0);
			var value = this.cast(this.value);
			return func.action(data, value);
		}
		return false;
	}
};
Model.extend(Command, Command.methods);


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
		// There should always be an opening. Make one if needed.
		if (!opening) {
			opening = new Passage();
			opening.opening = true;
			this.add_passage(opening);
		}
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

	get_choice: function(id) {
		var choice = null;
		this.passages.some(function(p) {
			var c = p.get_choice(id);
			if (c) {
				choice = c;
				return true;
			}
			return false;
		});
		return choice;
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
		this.passages.some(function(p) {
			if (p.id == id) {
				passage = p;
				return true;
			}
			return false;
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

			if (p.has_append(passage)) {
				entrances.push(p);
			}
		});
		return entrances;
	},

	load_passages: function(passages) {
		var i;

		for (i = 0; i < passages.length; i++) {
			this.passages.push(new Passage(passages[i]));
		}

		// There is a problem where Choice/Append Paths may not be valid destinations until all Passages have been loaded because their IDs might not exist in Passage.passages until then.  This means that has_append() is returning false when Passages are loaded when the app first runs.  My solution for now was to call this method again for each Passage after all Passages have been loaded in Story.load_passages()
		for (i = 0; i < this.passages.length; i++) {
			this.passages[i].reinit();
		}
	}
};
Model.extend(Story, Story.methods);


/// Passage ///
function Passage(data) {
	this.number       = null;
	this.content      = '';
	this.choices      = [];
	this.opening      = false;
	this.value        = 0;
	this.ending_value = false; // Not an ending when === false
	this.trashed      = false;
	// Cheating and using a Choice for the append data struct so I can reuse a bunch of code
	this.append_link  = new Choice();

	Model.call(this, data);

	this.reinit();

	Passage.passages[this.id] = this;

	Object.defineProperty(this, "abbr", {
		get: function abbr() {return this.abbreviate(10);}
	});
}

Passage.abbrs = {};
Passage.passages = {};

Passage.methods = {
	// There is a problem where Choice/Append Paths may not be valid destinations until all Passages have been loaded because their IDs might not exist in Passage.passages until then.  This means that has_append() is returning false when Passages are loaded when the app first runs.  My solution for now was to call this method again for each Passage after all Passages have been loaded in Story.load_passages()
	reinit: function () {
		if (this.has_ending()) {
			this.exit_type = 'ending';

		} else if (this.has_append()) {
			this.exit_type = 'append'

		} else {
			this.exit_type = 'choices';
		}
	},

	get_content: function () {
		return this.content || "Unwritten Passage";
	},

	set_exit_type: function (exit_type) {
		this.ending_value = false;
		this.choices = [];
		this.append_link = new Choice();

		this.exit_type = exit_type;
	},

	exit_is_empty: function () {
		return (
			(this.exit_type == 'ending' && !this.has_ending())
			|| (this.exit_type == 'append' && !this.has_append())
			|| (this.exit_type == 'choices' && !this.has_choices())
		);
	},

	has_ending: function () {
		return (this.ending_value !== false);
	},

	has_append: function (passage) {
		if (passage) {
			return (this.append_link.has_destination(passage));
		}

		return (this.append_link && this.append_link.has_destination && this.append_link.has_destination());
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

	get_choice: function(id) {
		var choice = null;
		var found = this.choices.some(function(c) {
			if (c.id == id) {
				choice = c;
				return true;
			}
			return false;
		});
		if (!found && this.has_append() && this.append_link.id == id) {
			choice = this.append_link;
		}
		return choice;
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
	},

	load_append_link: function (append_link) {
		this.append_link = new Choice(append_link);
	}
};
Model.extend(Passage, Passage.methods);


/// Choice ///
function Choice(data) {
	this.content     =  '';

	// These are the conditions used to determine whether this choice is displayed
	this.condition = new Command(); 

	// The id of the passage that this choice links to
	this.destination = null;

	// The updates to perform when this choice is selected
	this.updates = [];

	Model.call(this, data);
}

Choice.methods = {
	get_content: function () {
		return this.content || "Unwritten Choice";
	},

	has_destination: function(passage) {
		if ('undefined' == typeof passage) {
			return this.destination;
		}
		return passage && passage.id && passage.id == this.destination;
	},

	set_destination: function(passage) {
		this.destination = passage && passage.id;
	},

	add_update: function(update) {
		this.updates.push(new Command(update));
	},

	load_updates: function(updates) {
		this.updates = [];
		for (var i=0; i<updates.length; i++) {
			var update = new Command(updates[i]);
			this.updates.push(update);
		}
	},

	load_condition: function(condition) {
		this.condition = new Command(condition);
	}
}
Model.extend(Choice, Choice.methods);


function Playback(data) {
	this.story = null;

	// Holds all of the data being manipulated during playback
	this.sandbox = {};

	// Stores the array of choice ids selected, in order
	this.choices = [];

	Model.call(this, data);
};

Playback.methods = {
	start: function(story) {
		this.story = story;
		return story && story.get_opening();
	},

	select: function(choice) {
		var choice = choice && choice.id ? this.story.get_choice(choice.id) : choice;
		if (!choice) {
			return null;
		}

		var self = this;
		this.choices.push(choice.id);
		if (choice.updates.forEach) {
			choice.updates.forEach(function(u) {
				u.apply(self.sandbox);
			});
		}

		if (!choice.has_destination()) {
			return null;
		}

		var next = this.story.get_passage(choice.destination);
		// Trim the unavailable choices
		next.choices = next.choices.forEach(function(c) {
			c.hidden = c.condition && !c.condition.empty() && !c.condition.test(self.sandbox);
		});

		return next;
	},

	debug: function() {
		var data = [];
		var keys = Object.keys(this.sandbox);
		var sb   = this.sandbox;
		keys.forEach(function(key) {
			data.push({name: key, value: sb[key]});
		});
		console.table(data);
	}
};
Model.extend(Playback, Playback.methods);
