(function() {
	'use strict';

	angular.module('storyApp.controllers')
		.controller('StoryCtrl', StoryCtrl);

	StoryCtrl.$inject = ['$scope', '$location', '$timeout', 'ngDialog',
		'Profiles', 'translators', 'FileEntryAutoSave',
		'Story', 'Passage', 'Choice', 'Command', 'Operators', 'Genres'];

	function StoryCtrl($scope, $location, $timeout, ngDialog, Profiles, translators, FileEntryAutoSave, Story, Passage, Choice, Command, Operators, Genres) {
		var vm = this;

		// Variables
		vm.entry              = null;
		vm.story              = null;
		vm.passage            = null;
		vm.profiles           = Profiles;
		vm.variables          = [];

		vm.operators          = Operators;
		vm.genres             = Genres;
		vm.exporters          = translators.exporters();
		vm.alerts             = [];
		//vm.prevPassage        = null;

		vm.navHistory         = [];

		vm.picking            = false;
		vm.deleted            = null;
		vm.modal              = {confirm_message: ''};
		vm.showStoryDetails   = false;
		vm.showPassages       = false;
		vm.saveState          = 'floppy-disk';
		vm.exitChangeModal    = {};

		vm.endingTags   = CDAM.Config.kEndingTags;

		// Functions
		vm.loadVariables         = loadVariables;
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
			Profiles.load()
			.then(function() {
				var profile = Profiles.current;

				if (!profile) {
					console.error("No profiles selected. Redirecting to ./profiles");
					return $location.path('/profiles');
				}

				var entries = profile.getEntries();
				if (!entries || entries.length === 0) {
					console.error("Profile has no entries. Redirecting to ./stories");
					return $location.path('/stories');
				}

				var entry = entries[0];
				var entryId = entry.entryId;

				console.log("Current Entry:");
				console.log(entry);

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

					/*jshint -W087 */
					//debugger;

					if (!result || !result.story) {
						return $location.path('/stories');
					}

					// Set the current story and passage
					vm.story = new Story(result.story);
					vm.setPassage(vm.story.getStartPsg(), true);
					vm.showStoryDetails = vm.story.getPassages().length < 2;
					loadVariables();

					// Update the entry record
					Profiles.current.saveEntry(entryId, vm.story);
					Profiles.save();

					// Start autosaving changes
					autosave(result);

				}, onFail);
			});
		}

		function loadVariables() {
			var cmds = vm.story.collectCommands();
			var vars = [];
			cmds.forEach(function(cmd) {
				vars.push(cmd.getVariable());
			});
			vm.variables = angular.toJson(vars);
		}

		function autosave(aResult) {
			var saver = vm.saver = new FileEntryAutoSave(aResult.story.id, aResult.entry, $scope);

			var handleStoryChange = function(nv, ov, scope) {
				if (Profiles.current.getAutosave() && angular.isDefined(nv)) {
					console.log("handleStoryChange");
					saver.save(aResult.story.getId(), nv.object());
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

		function validPickingOption(aPassage) {
			// Is there ANY reason you can't just link to ANY passage? Even the current one?
			//return (!vm.picking || vm.passage.exitType != 'append' || vm.passage.id != aItem.id);

			// You don't want to ever append to an append, could cause an endless loop.
			// You should never need to do this, I think.
			if (vm.passage.hasAppend() && aPassage.hasAppend()) {
				return false;
			}
			return true;
		}

		// Create a new passage. If a choice is provide,
		// connect that choice to the new passage and add
		// the current passage as an entrance passage for it.
		function newPassage(aEntranceChoice) {
			var passage = new Passage();
			vm.story.addPassage(passage);
			if (aEntranceChoice) {
				aEntranceChoice.setDestination(passage.getId());
				passage.addEntrance(vm.passage.getId(), aEntranceChoice.getId());
			}
			// Set our current passage to the new one.
			vm.passage = passage;
			vm.picking = false;
		}

		// When populated with a value,
		// this triggers the 'picking' css class
		// in passage.view.html
		function pickPassage(aChoice) {
			vm.picking = aChoice;
		}

		// If the passage exists, return it.
		function getPassage(aId) {
			if (!vm.story) {
				return null;
			}
			return vm.story.getPassage(aId);
		}

		function selectPassage(aId) {
			if (vm.picking) {
				// If there is a link from this choice, remove it.
				if (vm.picking.hasDestination()) {
					console.log("Changing old destination to new.");
					vm.story.unlinkSingleChoice(vm.story.getPassage(vm.picking.getDestination()), vm.picking);
				}

				vm.picking.setDestination(aId);
				vm.story.getPassage(aId).addEntrance(vm.passage.getId(), vm.picking.getId());
				vm.picking = false;
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

			if (vm.passage) {
				var index = vm.navHistory.indexOf(vm.passage.getId());
				if (index > -1) {
					vm.navHistory.splice(index, 1);
				}
				vm.navHistory.push(vm.passage.getId());
			}

			if (aPassage !== false) {
				vm.passage = aPassage;
			} else {
				console.warning("Tried to set a non-existent passage.");
				return;
			}

			if (aReset) {
				vm.navHistory = [];
			}

			console.log("History: " + vm.navHistory);
		}

		function deletePassage(aPassage) {
			// TODO: REDO!!!!

			console.info("deleting", aPassage);
			vm.deleted = {
				type: "passage",
				title: aPassage.getContent(),
				undo: function() {
					aPassage.setTrashed(false);
					vm.story.addPassage(aPassage);
					vm.story.linkEntrances(aPassage);
					vm.story.linkChoices(aPassage);
					vm.setPassage(aPassage, false);
				}
			};
			// The choice paths that link to this passage are not being deleted,
			// but if they were that would require a change to "undo" ... for now
			// I'm just checking when a choice is displaying its paths whether
			// they are linking to a valid passage

			// EDIT:

			vm.story.deletePassage(aPassage.getId());
			var index = vm.navHistory.indexOf(aPassage.getId());
			if (index > -1) {
				vm.navHistory.splice(index, 1);
			}
			var previous = vm.story.getPassages()[vm.navHistory[-1]] || vm.story.getStartPsg();
			vm.setPassage(previous, false);
		}

		function confirmExitTypeChange(aPassage, aExitType) {
			var data = {};
			var onConfirm;

			if (aPassage.getExitType() == aExitType) {
				return;
			}

			if (aPassage.exitIsEmpty()) {
				aPassage.setExitType(aExitType);
				return;
			}

			switch (aPassage.getExitType()) {
				case CDAM.Strings.kExitTypeEnding:
					data.willDelete = 'ending value';
					break;
				case CDAM.Strings.kExitTypeAppend:
					data.willDelete = 'append';
					break;
				case CDAM.Strings.kExitTypeChoices:
					data.willDelete = 'choices';
					break;
			}

			switch (aExitType) {
				case CDAM.Strings.kExitTypeEnding:
					data.changeTo = 'an ending';
					break;
				case CDAM.Strings.kExitTypeAppend:
					data.changeTo = 'have an append';
					break;
				case CDAM.Strings.kExitTypeChoices:
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

		function hasDestination(aChoice) {
			return aChoice.hasDestination();
		}

		function newChoice(aPassage) {
			var choice = new Choice();
			aPassage.addChoice(choice);
		}

		function deleteChoice(aPassage, aChoice) {
			vm.deleted  =  {
				type: "choice",
				title: aChoice.getContent(),
				undo: function() {
					vm.passage.addChoice(aChoice);
					vm.story.linkChoice(aPassage, aChoice);
				}
			};
			vm.story.unlinkChoice(aPassage, aChoice);
			aPassage.removeChoice(aChoice);

		}

		function deleteChoiceCondition(aChoice) {
			aChoice.condition = new Command();
			aChoice.setShowCondition(false);
		}

		function addChoiceUpdate(aChoice) {
			aChoice.addUpdate(new Command());
		}

		function deleteChoiceUpdate(aChoice, aUpdate) {
			aChoice.removeUpdate(aUpdate);
			/*aChoice.updates = aChoice.getUpdates().filter(function(u) {
				return (u.raw != aUpdate.raw);
			});*/
		}

		// Clear the search field.
		function clearPassageSearch() {
			vm.passageSearch = '';
		}

		// TODO: Research functionality!!!
		function undoDelete() {
			if (!vm.deleted) {
				return;
			}
			vm.deleted.undo();
			vm.deleted = null;
		}

		// Return a JSON serialized copy of the the current story.
		function jsonStory(aPretty) {
			if (!vm.story) return '{}';
			return vm.story.serialize(aPretty);
		}

		// Export a story as the provided type.
		function exportStory(aType) {
			translators.export(aType, vm.story);
		}
	}

})();
