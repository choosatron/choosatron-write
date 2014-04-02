function StoryCtrl($scope, $autosave, $stories, $preferences, $file) {

	$scope.operators          = Operators;
	$scope.alerts             = [];
	$scope.stories            = [];
	$scope.story              = null;
	$scope.passage            = null;
	$scope.prev_passage       = null;
	$scope.picking            = false;
	$scope.deleted            = null;
	$scope.view               = 'stories';
	$scope.modal              = {confirm_message: ''};
	$scope.show_story_details = false;
	$scope.show_passages      = false;
	$scope.stories_sort       = 'title';
	$scope.stories_sort_desc  = false;
	$scope.save_state         = false;

	$scope.exit_change_modal = {};

	this.init  =  function() {
		$scope.load_stories();
		$autosave.watch(
			$scope,
			'story',
			function(s) {return s ? s.id : null},
			function(s) {return s ? s.object() : null}
		);

		$autosave.onSaving(function(key, value) {
			$scope.save_state = 'saving';
			console.info('Saving', key);
		});

		$autosave.onThrottling(function(key, time) {
			$scope.save_state = 'throttling';
			console.info('Delaying save', key, time, 'ms');
		});

		$autosave.onSaved(function(key, value) {
			$scope.save_state = 'saved';
			console.info('Saved', key);
		});

		$autosave.onError(function(e) {
			$scope.save_sate = 'error';
			console.error('Error autosaving story', e);
		});
	}

	$scope.sort_stories = function (sort) {
		if ($scope.stories_sort == sort) {
			$scope.stories_sort_desc = !$scope.stories_sort_desc;

		} else {
			$scope.stories_sort = sort;
			$scope.stories_sort_desc = false;
		}
	};

	$scope.get_story  =  function(id) {
		if (!id) return null;
		for (var i=0, story; story = $scope.stories[i]; i++) {
			if (story.id == id) return story;
		}
		return null;
	};

	$scope.load_stories  =  function() {
		$stories.values().then(function(stories) {
			$scope.stories = [];
			var story = null;
			for (var i=0, data; data = stories[i]; i++) {
				story = new Story(data);
				$scope.stories.push(story);
			}
			$preferences.get('last_story').then(function (info) {
				if (!info || !info.story_id) {
					return;
				}

				var story = $scope.get_story(info.story_id);
				if (story) {
					$scope.select_story(story);

					if (info.passage_id) {
						var passage = $scope.get_passage(info.passage_id);

						if (passage) {
							$scope.set_passage(passage, true);
						}
					}
				}
			});
		});
	};

	$scope.show_stories_menu = function () {
		$scope.view = 'stories';
	};

	$scope.playback_story = function() {
		$scope.view = 'playback';
	};

	$scope.edit_story = function() {
		$scope.view = 'passage';
	};

	$scope.delete_story  =  function(story) {
		$scope.deleted  =  {
			type: "story",
			title: story.title,
			undo: function() {$scope.story = story;}
		};
		$scope.story    =  null;
		$scope.set_passage(null, true);
		$stories.remove(story.id);

		var stories = [];
		angular.forEach($scope.stories, function(s, key) {
			if (s.id != story.id) stories.push(s);
		});
		$scope.stories = stories;
	};

	$scope.set_last_story = function () {
		$preferences.set('last_story', ($scope.story && $scope.passage) ? {story_id: $scope.story.id, passage_id: $scope.passage.id} : null);
	};

	$scope.select_story  =  function(story) {
		$scope.story    =  story;
		$scope.set_passage((story ? story.get_opening() : null), true);
		$scope.set_last_story();
		$scope.view = 'passage';
	};

	$scope.new_story  =  function() {
		var story    = new Story();
		$scope.story = story;
		$scope.new_passage();
		$scope.stories.push(story);
		$scope.set_last_story();
		$scope.view = 'passage';
		$scope.show_story_details = true;
	}

	$scope.new_passage  =  function(entrance_choice) {
		$scope.set_passage(new Passage());
		$scope.passage.number = $scope.story.get_next_passage_number();
		$scope.story.add_passage($scope.passage);
		if (entrance_choice) {
			entrance_choice.set_destination($scope.passage);
		}
		$scope.picking = null;
	};

	$scope.pick_passage  =  function(choice) {
		$scope.picking = choice;
	};

	$scope.get_passage  =  function(id) {
		if (!$scope.story) return null;
		return $scope.story.get_passage(id);
	};

	$scope.valid_picking_option = function (item) {
		return (
			!$scope.picking
			|| $scope.passage.exit_type != 'append'
			|| $scope.passage != item
		);
	};

	$scope.select_passage = function (id) {
		if ($scope.picking) {
			$scope.picking.set_destination($scope.story.get_passage(id));
			$scope.picking = null;

		} else {
			$scope.edit_passage(id);
		}
	};

	$scope.edit_passage = function (id) {
		$scope.set_passage($scope.story.get_passage(id));
	};

	$scope.set_passage  =  function (passage, reset) {
		// TODO: Is there an Angular way to access this element in the scope to do this?
		$('.scrollPassages').scrollTop(0);

		if (reset) {
			$scope.prev_passage = null;

		} else {
			$scope.prev_passage = $scope.passage;
		}

		$scope.passage = passage;

		$scope.set_last_story();
	};

	$scope.delete_passage  =  function(passage) {
		$scope.deleted = {
			type: "passage",
			title: passage.content,
			undo: function() {
				passage.trashed = false;
				$scope.story.add_passage(passage);
				$scope.passage = passage;
			}
		};
		// The choice paths that link to this passage are not being deleted, but if they were that would require a change to "undo" ... for now I'm just checking when a choice is displaying its paths whether they are linking to a valid passage
		$scope.story.delete_passage(passage.id);
		$scope.passage = $scope.story.get_opening();
	};

	$scope.confirm_exit_type_change = function (passage, exit_type) {
		var alert, message, onConfirm;

		if (passage.exit_type == exit_type) {
			return;
		}

		if (passage.exit_is_empty()) {
			passage.set_exit_type(exit_type);
			return;
		}

		switch (passage.exit_type) {
			case 'ending':
				alert = 'This passage\'s ending value will be deleted.';
				break;
			case 'append':
				alert = 'This passage\'s append will be deleted.';
				break;
			case 'choices':
				alert = 'This passage\'s choices will be deleted.';
				break;
		}

		message = 'A passage can only have one type of exit.  ';

		switch (exit_type) {
			case 'ending':
				message += 'Are you sure you want to change this passage to an ending?';
				break;
			case 'append':
				message += 'Are you sure you want to change this passage to have an append?';
				break;
			case 'choices':
				message += 'Are you sure you want to change this passage to have choices?';
				break;
		}

		$scope.exit_change_modal.alert = alert;
		$scope.exit_change_modal.message = message;

		onConfirm = function () {
			$scope.$apply(function () {
				passage.set_exit_type(exit_type);
			});
		};

		$('#confirmExit').off('click.confirmed');
		$('#confirmExit').one('click.confirmed', onConfirm);

		$('#exitChangeConfirmModal').modal('show');
	};

	$scope.new_choice  =  function(passage) {
		var choice  =  new Choice();
		passage.add_choice(choice);
	};

	$scope.has_destination  =  function(choice) {
		return choice.has_destination();
	}

	$scope.delete_choice  =  function(passage, choice) {
		$scope.deleted  =  {
			type: "choice",
			title: choice.content,
			undo: function() {$scope.passage.add_choice(choice);}
		};
		passage.remove_choice(choice);
	}

	$scope.delete_choice_update = function(choice, update) {
		// @todo
	};

	$scope.add_choice_update = function(choice) {
		choice.updates.push(new Command());
	};

	$scope.clear_passage_search  =  function() {
		$scope.passage_search = '';
	};

	$scope.undo_delete  =  function() {
		if (!$scope.deleted) return;
		$scope.deleted.undo();
		$scope.deleted = null;
	};

	$scope.json_story  =  function(pretty) {
		if (!$scope.story) return '{}';
		return $scope.story.serialize(pretty);
	};

	$scope.export_story  =  function (story) {
		// $file.export(story.title + '.json', story.serialize(), 'json');

		$file.export_file(story.title, 'json', story.serialize(), 'text/javascript');
	};

	$scope.export_story_choosatron  =  function (story) {

		// TODO: Convert story to binary here either directly via story object or via story.serialize() JSON

		// Create a binary unsigned byte view of 100 bytes.
		var buffer = new ArrayBuffer(100),
			byteView = new Uint8Array(buffer),
			uint16View = new Uint16Array(buffer),
			uint32View = new Uint32Array(buffer);

		// Set a few example byte values
		/*byteView[0] = 0;
		byteView[1] = 255;
		byteView[2] = 0xff;
		byteView[3] = 1;
		byteView[4] = 0x01;

		uint32View[2] = 0xffffffff;
		uint32View[3] = 0x01010101;
		uint32View[4] = 6000000;*/

		for (var i=0; i<uint32View.length; i++) {
  			uint32View[i] = i*2;
		}

		for (var i=0; i<uint16View.length; i++) {
  			console.log("Entry " + i + ": " + uint16View[i]);
  			uint16View[i] = i;
		}

		$file.export_file(story.title, 'cdam', buffer, 'application/octet-stream');
	};

	$scope.import_story  =  function() {
		if ($scope.import.text) {
			var data = angular.fromJson($scope.import.text);
			var story = new Story(data);
			story.refresh_id();
			$scope.select_story(story);
		}
		else if ($scope.import.text) {
			$file.read($scope.import.text, function(text) {
				var data = angular.fromJson(text);
				var story = new Story(data);
				story.refresh_id();
				$scope.select_story(story);
			});
		}
	}

	this.init();
}
