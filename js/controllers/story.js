angular.module('storyApp.controllers')
.controller('StoryCtrl', ['$scope', '$location', '$timeout', '$profiles', '$translators', 'FileEntryAutoSave',
	'Passage', 'Choice', 'Command', 'Operators', 'Genres',
function StoryCtrl($scope, $location, $timeout, $profiles, $translators, FileEntryAutoSave, Passage, Choice, Command, Operators, Genres) {

	$scope.entry              = null;
	$scope.story              = null;
	$scope.passage            = null;

	$scope.operators          = Operators;
	$scope.genres             = Genres;
	$scope.exporters          = $translators.exporters();
	$scope.alerts             = [];
	$scope.prev_passage       = null;
	$scope.picking            = false;
	$scope.deleted            = null;
	$scope.modal              = {confirm_message: ''};
	$scope.show_story_details = false;
	$scope.show_passages      = false;
	$scope.save_state         = false;

	$scope.exit_change_modal = {};

	// Load up the selected story
	$profiles.load()
	.then(function() {
		var profile = $profiles.current;

		if (!profile) {
			console.error("No profiles selected. Redirecting to ./profiles");
			return $location.path('profiles');
		}

		var entries = profile.entries;
		if (!entries || entries.length == 0) {
			console.error("Profile has no entries. Redirecting to ./stories");
			return $location.path('stories');
		}

		var entry = entries[0];
		var entryId = entry.entry_id;

		if (!entryId) {
			console.error("No entry id found for entry. Redirecting to ./stories");
			return $location.path('stories');
		}

		var onFail = function(e) {
			console.error("Error restoring story", e);
			return $location.path('stories');
		};

		$scope.entry = entry;
		$translators.restore('json', entryId)
		.then(function(result) {

			if (!result || !result.story) {
				return $location.path('stories');
			}

			// Set the current story and passage
			$scope.story = result.story;
			$scope.passage = result.story.get_opening();
			$scope.show_story_details = result.story.passages.length < 2;

			// Update the entry record
			$profiles.current.save_entry(entryId, result.story);
			$profiles.save();

			// Start autosaving changes
			autosave(result);

		}, onFail);
	});

	function ensurePassage(passage) {
		if (!$scope.passage) {
			$scope.passage = $scope.story && $scope.story.get_opening();
		}
	};

	function autosave(result) {
		var saver = new FileEntryAutoSave(result.story.id, result.entry, $scope);

		var getStoryId = function(s) {
			return s && s.id;
		}

		var getStoryForSave = function(s) {
			if (!s) return null;

			// set the date asynchronously so it doesn't fire a digest call
			$timeout(function() {
				s.modified = Date.now();
			});

			return s.object();
		}

		saver.watch('story', getStoryId, getStoryForSave);

		saver.onSaving(function(key, value) {
			$scope.save_state = 'saving';
		});

		saver.onThrottling(function(key, time) {
			$scope.save_state = 'throttling';
		});

		saver.onSaved(function(key, value) {
			$scope.save_state = 'saved';
		});

		saver.onError(function(e) {
			$scope.save_sate = 'error';
			console.error('Error autosaving story', e);
		});
	}

	$scope.playback_story = function() {
		$location.path('playback');
	};

	$scope.show_stories_menu = function () {
		$location.path('stories');
	};

	$scope.new_passage  =  function(entrance_choice) {
		$scope.passage = new Passage();
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
		} 
		else {
			$scope.prev_passage = $scope.passage;
		}

		$scope.passage = passage;
	};

	$scope.delete_passage = function(passage) {
		console.info("deleting", passage);
		$scope.deleted = {
			type: "passage",
			title: passage.content,
			undo: function() {
				passage.trashed = false;
				$scope.story.add_passage(passage);
				$scope.passage = passage;
			}
		};
		// The choice paths that link to this passage are not being deleted, 
		// but if they were that would require a change to "undo" ... for now 
		// I'm just checking when a choice is displaying its paths whether 
		// they are linking to a valid passage
		$scope.story.delete_passage(passage.id);
		var previous = $scope.prev_passage || $scope.story.get_opening();
		$scope.set_passage(previous, true);
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
		choice.updates = choice.updates.filter(function(u) {
			return (u.raw != update.raw);
		});
	};

	$scope.delete_choice_condition = function(choice) {
		choice.condition = new Command();
		choice.showCondition = false;
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

	$scope.export_story = function(type) {
		$translators.export(type, $scope.story);
	};
}]);
