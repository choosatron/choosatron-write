(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('StoryCtrl', StoryCtrl);

	StoryCtrl.$inject = ['$scope', '$location', '$timeout', 'ngDialog',
		'profiles', 'translators', 'FileEntryAutoSave',
		'Story', 'Passage', 'Choice', 'Command', 'Operators', 'Genres'];

	function StoryCtrl($scope, $location, $timeout, ngDialog, profiles, translators, FileEntryAutoSave, Story, Passage, Choice, Command, Operators, Genres) {
		var vm = this;

		// Variables
		vm.entry              = null;
		vm.story              = null;
		vm.passage            = null;
		vm.profiles           = profiles;
		vm.variables          = [];

		vm.operators          = Operators;
		vm.genres             = Genres;
		vm.exporters          = translators.exporters();
		vm.alerts             = [];
		vm.prevPassage        = null;
		vm.picking            = false;
		vm.deleted            = null;
		vm.modal              = {confirm_message: ''};
		vm.showStoryDetails   = false;
		vm.showPassages       = false;
		vm.saveState          = 'floppy-disk';
		vm.exitChangeModal = {};

		// Functions
		vm.loadVariables         = loadVariables;
		vm.ensurePassage         = ensurePassage;
		vm.autosave              = autosave;
		vm.playbackStory         = playbackStory;
		vm.showStoriesMenu       = showStoriesMenu;
		vm.newPassage            = newPassage;
		vm.pickPassage           = pickPassage;
		vm.getPassage            = getPassage;
		vm.validPickingOption    = validPickingOption;
		vm.selectPassage         = selectPassage;
		vm.editPassage           = editPassage;
		vm.setPassage            = setPassage;
		vm.deletePassage         = deletePassage;
		vm.confirmExitTypeChange = confirmExitTypeChange;
		vm.newChoice             = newChoice;
		vm.hasDestination        = hasDestination;
		vm.deleteChoice          = deleteChoice;
		vm.deleteChoiceUpdate    = deleteChoiceUpdate;
		vm.deleteChoiceCondition = deleteChoiceCondition;
		vm.addChoiceUpdate       = addChoiceUpdate;
		vm.clearPassageSearch    = clearPassageSearch;
		vm.undoDelete            = undoDelete;
		vm.jsonStory             = jsonStory;
		vm.exportStory           = exportStory;

		activate();

		function activate() {
			// Load up the selected story
			profiles.load()
			.then(function() {
				var profile = profiles.current;

				if (!profile) {
					console.error("No profiles selected. Redirecting to ./profiles");
					return $location.path('/profiles');
				}

				var entries = profile.entries;
				if (!entries || entries.length === 0) {
					console.error("Profile has no entries. Redirecting to ./stories");
					return $location.path('/stories');
				}

				var entry = entries[0];
				var entryId = entry.entryId;

				if (!entryId) {
					console.error("No entry id found for entry. Redirecting to ./stories");
					return $location.path('/stories');
				}

				var onFail = function(e) {
					console.error("Error restoring story", e);
					return $location.path('/stories');
				};

				vm.entry = entry;
				translators.restore('json', entryId)
				.then(function(result) {

					if (!result || !result.story) {
						return $location.path('/stories');
					}

					// Set the current story and passage
					vm.story = new Story(result.story);
					vm.passage = result.story.getOpening();
					vm.showStoryDetails = result.story.passages.length < 2;
					loadVariables();

					// Update the entry record
					profiles.current.saveEntry(entryId, result.story);
					profiles.save();

					// Start autosaving changes
					autosave(result);

				}, onFail);
			});
		}

		function loadVariables() {
			var cmds = vm.story.collectCommands();
			var vars = [];
			cmds.forEach(function(cmd) {
				vars.push(cmd.variable);
			});
			vm.variables = angular.toJson(vars);
		}

		function ensurePassage(aPassage) {
			if (!aPassage) {
				vm.passage = vm.story && vm.story.getOpening();
			}
			else {
				vm.passage = aPassage;
			}
		}

		function autosave(aResult) {
			var saver = vm.saver = new FileEntryAutoSave(aResult.story.id, aResult.entry, $scope);

			var handleStoryChange = function(nv, ov, scope) {
				if (profiles.current.autosave && angular.isDefined(nv)) {
					saver.save(aResult.story.id, nv.object());
				}
				else {
					vm.saveState = 'floppy-save';
				}
			};

			var storyWatcher = angular.bind(vm, function(name) {
				return vm.story;
			});

			$scope.$watch(storyWatcher, handleStoryChange, true);

			saver.onSaving(function(key, value) {
				vm.saveState = 'transfer';
			});

			saver.onSaved(function(key, value) {
				$timeout(function() {
					var story = vm.story;
					$scope.$apply(function() {
						vm.saveState = 'floppy-disk';
					});
				}, 250);
			});

			saver.onError(function(e) {
				vm.saveState = 'floppy-remove';
				console.error('Error autosaving story', e);
			});
		}

		function playbackStory() {
			$location.path('/playback');
		}

		function showStoriesMenu() {
			$location.path('/stories');
		}

		function newPassage(aEntranceChoice) {
			vm.passage = new Passage();
			vm.passage.number = vm.story.getNextPassageNumber();
			vm.story.addPassage(vm.passage);
			if (aEntranceChoice) {
				aEntranceChoice.setDestination(vm.passage);
			}
			vm.picking = null;
		}

		function pickPassage(aChoice) {
			vm.picking = aChoice;
		}

		function getPassage(aId) {
			if (!vm.story) {
				return null;
			}
			return vm.story.getPassage(aId);
		}

		function validPickingOption(aItem) {
			return (!vm.picking || vm.passage.exitType != 'append' || vm.passage != aItem);
		}

		function selectPassage(aId) {
			if (vm.picking) {
				vm.picking.setDestination(vm.story.getPassage(aId));
				vm.picking = null;

			} else {
				vm.editPassage(aId);
			}
		}

		function editPassage(aId) {
			vm.setPassage(vm.story.getPassage(aId));
		}

		function setPassage(aPassage, aReset) {
			// TODO: Is there an Angular way to access this element in the scope to do this?
			$('.scrollPassages').scrollTop(0);

			if (aReset) {
				vm.prevPassage = null;
			}
			else {
				vm.prevPassage = vm.passage;
			}

			// Collect the entrances just once to improve performance
			aPassage.entrances = vm.story.collectEntrances(aPassage);

			vm.passage = aPassage;
		}

		function deletePassage(aPassage) {
			console.info("deleting", aPassage);
			vm.deleted = {
				type: "passage",
				title: aPassage.content,
				undo: function() {
					aPassage.trashed = false;
					vm.story.addPassage(aPassage);
					vm.passage = aPassage;
				}
			};
			// The choice paths that link to this passage are not being deleted,
			// but if they were that would require a change to "undo" ... for now
			// I'm just checking when a choice is displaying its paths whether
			// they are linking to a valid passage
			vm.story.deletePassage(aPassage.id);
			var previous = vm.prevPassage || vm.story.getOpening();
			vm.setPassage(previous, true);
		}

		function confirmExitTypeChange(aPassage, aExitType) {
			var data = {};
			var onConfirm;

			if (aPassage.exitType == aExitType) {
				return;
			}

			if (aPassage.exitIsEmpty()) {
				aPassage.setExitType(aExitType);
				return;
			}

			switch (aPassage.exitType) {
				case 'ending':
					data.willDelete = 'ending value';
					break;
				case 'append':
					data.willDelete = 'append';
					break;
				case 'choices':
					data.willDelete = 'choices';
					break;
			}

			switch (aExitType) {
				case 'ending':
					data.changeTo = 'an ending';
					break;
				case 'append':
					data.changeTo = 'have an append';
					break;
				case 'choices':
					data.changeTo = 'have choices';
					break;
			}

			onConfirm = function (okay) {
				aPassage.setExitType(aExitType);
			};

			ngDialog.openConfirm({
				template: 'templates/confirm-exit-change-modal.view.html',
				showClose: true,
				closeByEscape: false,
				data: data
			}).then(onConfirm);
		}

		function newChoice(aPassage) {
			var choice = new Choice();
			aPassage.addChoice(choice);
		}

		function hasDestination(aChoice) {
			return aChoice.hasDestination();
		}

		function deleteChoice(aPassage, aChoice) {
			vm.deleted  =  {
				type: "choice",
				title: aChoice.content,
				undo: function() {vm.passage.addChoice(aChoice);}
			};
			aPassage.removeChoice(aChoice);
		}

		function deleteChoiceUpdate(aChoice, aUpdate) {
			aChoice.updates = aChoice.updates.filter(function(u) {
				return (u.raw != aUpdate.raw);
			});
		}

		function deleteChoiceCondition(aChoice) {
			aChoice.condition = new Command();
			aChoice.showCondition = false;
		}

		function addChoiceUpdate(aChoice) {
			aChoice.updates.push(new Command());
		}

		function clearPassageSearch() {
			vm.passageSearch = '';
		}

		function undoDelete() {
			if (!vm.deleted) {
				return;
			}
			vm.deleted.undo();
			vm.deleted = null;
		}

		function jsonStory(aPretty) {
			if (!vm.story) return '{}';
			return vm.story.serialize(aPretty);
		}

		function exportStory(aType) {
			translators.export(aType, vm.story);
		}
	}

})();
