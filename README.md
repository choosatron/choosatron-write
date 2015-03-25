# Choosatron Write [![Backlog](https://badge.waffle.io/choosatron/choosatron-write.png?label=backlog&title=backlog)](https://waffle.io/choosatron/choosatron-write) [![Build Status](https://travis-ci.org/choosatron/choosatron-write.svg)](https://travis-ci.org/choosatron/choosatron-write)

## APIs ##
 - [USB raw access](https://developer.chrome.com/apps/usb)

## Dependencies ##
 - [chrome](http://www.google.com/chrome/)
 - [bower](http://bower.io/)
 - [nodejs](http://nodejs.org/)
 - [grunt](http://gruntjs.com/)

## Getting Started ##

0. Install dependencies.
   - Install [chrome](http://www.google.com/chrome/)
   - Install [nodejs](http://nodejs.org/download/)
   - `npm install -g bower`
   - `npm install -g grunt`
   - `npm install -g grunt-cli` [optional - puts grunt in your path]
1. `git clone https://github.com/choosatron/choosatron-write`
2. `cd ./choosatron-write`
3. `npm install`
4. `grunt build`

## Installing the App ##

1. **Choosatron Write** is a Chrome Packaged App. You will need to use grunt to build the application before running it as an application.
 - `grunt build` will create a minified version of the application.
 - `grunt debug` will create a debuggable version of the application. This will also keep a watch for any changes you make to the files in `./source/` and re-build the application if any changes are detected.
2. Open Chrome and go to your [Chrome extensions](chrome://extensions)
3. Ensure that "Developer mode" is checked.
4. Click "Load unpacked extension..." and select the `./choosatron-write/build/` directory.

=======

## Usage ##

Write interactive, choice-driven stories.

### Passages ###

This is where most of your writing will go. A passage can be one or more paragraphs of content. There's no limit to how long these can be, but remember that the point of interactive fiction is to interact! It's usually best to keep a passage short so that you can get to the fun part, the choices.

### Choices ###

These are presented after a passage. A reader's choice will determine where they are taken next. Each choice leads to a new passage. If you are writing a story for the Choosatron, you'll want to keep the length of each choice at about 30 characters or so if you want to fit it all on one line. You'll also want to limit the list to four choices.

In addition to linking a choice to a new passage, you can have two special types of choices.

#### Appends ####

Appends aren't really choices at all. An append will string together one passage with another seamlessly. Think of it like glue. When you append a passage on to another, they are stuck together. When you read a passage that has an "append," the two passages blend together. Appends are useful if you want to re-use passages multiple times without re-writing them.

#### Endings ####

When you get to a passage that is an ending, you can decide, on a scale of horrible to excellent, the quality of the ending.

#### Conditions ####

Conditions are tricky. When a reader selects a choice, you can manipulate one or more variables. This is called an "Update." Right now, you can set the variable or perform simple math: add, subtract, multiply or divide.

You can use variables to decide whether a choice displays by adding in a condition to the choice. Conditions will compare a variable's current value and only display the choice if the test is met.

## What is the Choosatron? ##

The Choosatron is an unassuming little box that contains some amazing possibilities. It is an interactive fiction arcade machine that provides players a tangible artifact from their unique journey through one of its stories.
