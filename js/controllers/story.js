angular.module('storyApp.controllers')
.controller('StoryCtrl', ['$scope', '$location', '$selection', '$stories', 'AutoSave', 

function StoryCtrl($scope, $location, $selection, $stories, AutoSave ) {

	var autosave = new AutoSave($stories, $scope);

	$scope.operators          = Operators;
	$scope.alerts             = [];
	$scope.story              = null;
	$scope.passage            = null;
	$scope.prev_passage       = null;
	$scope.picking            = false;
	$scope.deleted            = null;
	$scope.modal              = {confirm_message: ''};
	$scope.show_story_details = false;
	$scope.show_passages      = false;
	$scope.stories_sort       = 'title';
	$scope.stories_sort_desc  = false;
	$scope.save_state         = false;

	$scope.exit_change_modal = {};

	function ensurePassage(passage) {
		if (!$scope.passage) {
			$scope.passage = $scope.story && $scope.story.get_opening();
		}
	}

	function init() {

		$selection.watchStory($scope);
		$selection.watchPassage($scope, ensurePassage);

		autosave.watch(
			'story',
			function(s) {return s ? s.id : null},
			function(s) {return s ? s.object() : null}
		);

		autosave.onSaving(function(key, value) {
			$scope.save_state = 'saving';
		});

		autosave.onThrottling(function(key, time) {
			$scope.save_state = 'throttling';
		});

		autosave.onSaved(function(key, value) {
			$scope.save_state = 'saved';
		});

		autosave.onError(function(e) {
			$scope.save_sate = 'error';
			console.error('Error autosaving story', e);
		});
	}

	$scope.playback_story = function(story) {
		$selection.set(story, story.get_opening()).then(function() {
			$location.path('playback');
		});
	};

	$scope.show_stories_menu = function () {
		$selection.clear().then(function() {
			$location.path('stories');
		});
	};

	$scope.new_passage  =  function(entrance_choice) {
		$selection.setPassage(new Passage()).then(function() {
			$scope.passage.number = $scope.story.get_next_passage_number();
			$scope.story.add_passage($scope.passage);
			if (entrance_choice) {
				entrance_choice.set_destination($scope.passage);
			}
			$scope.picking = null;
		});
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

		$selection.setPassage(passage);
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

	init();
}]);
