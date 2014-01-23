function Story(data) {
	this.title     =  '';
	this.version   =  1.0;
	this.id        =  '';
	this.passages  =  [];

	this.get_opening  =  function() {
		if (!this.passages) return null;
		return this.passages[0];
	};

	this.add_passage  =  function(passage) {
		passage.id  =  this.passages.length + 1;
		this.passages.push(passage);
		return passage.id;
	};

	this.each_passage  =  function(callback) {
		for (var i=0,p; p = this.passages[i]; i++) {
			var stop = callback.call(this, p);
			if (stop === false) break;
		}
		return this;
	};

	this.collect_entrances  =  function(passage) {
		var entrances = [];
		this.each_passage( function( p ) {
			if ( p.has_destination( passage ) ) {
				entrances.push( p );
			}
		} );
		return entrances;
	};

	if (data) {
		this.title = data.title;
		this.version = data.version;
		this.id = data.id;
		for (var i in data.passages) {
			this.passages.push(new Passage(data.passages[i]));
		}
	}
};

function Passage(data) {
	this.id         =  '';
	this.content    =  '';
	this.choices    =  [];

	this.add_choice  =  function(choice) {
		choice.id  =  this.choices.length + 1;
		this.choices.push(choice);
		return choice.id;
	};

	this.remove_choice  =  function(choice) {
		for (var i=0,c; c=this.choices[i]; i++) {
			if (c.id == choice.id) {
				this.choices.splice(i, 1);
				break;
			}
		}
	}

	this.has_destination  =  function(passage) {
		var has  =  false;
		this.each_choice( function( c ) {
			if ( c.has_destination( passage ) ) {
				has  =  true;
				return false;
			}
		} );
		return has;
	};

	this.each_choice  =  function(callback) {
		for (var i=0,c; c=this.choices[i]; i++) {
			var stop = callback.call(this, c);
			if (stop === false) break;
		}
		return this;
	};

	if (data) {
		this.id = data.id;
		this.content = data.content;
		for (var i in data.choices) {
			this.choices.push(new Choice(data.choices[i]));
		}
	}
};

function Choice(data) {
	this.id       =  '';
	this.content  =  '';
	this.path     =  new Path();
	this.paths    =  [this.path];

	this.has_destination  =  function(passage) {
		if (!passage) {
			return this.path.destination != null;
		}
		for (var i=0,p; p = this.paths[i]; i++) {
			if (p.destination && p.destination.id == passage.id) return true;
		}
		return false;
	};

	this.set_destination  =  function(passage) {
		this.path.destination  =  passage;
	}

	if (data) {
		this.id = data.id;
		this.content = data.content;
		this.paths = [];
		this.path = null;
		for (var i in data.paths) {
			this.paths.push(new Path(data.paths[i]));
		}
		if (this.paths.length) {
			this.path = this.paths[0];
		}
	}
}

function Path(data) {
	this.destination  =  null;

	if (data) {
		this.destination = data.destination;
	}
}
