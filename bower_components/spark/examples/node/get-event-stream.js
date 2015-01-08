/*jslint node: true */
"use strict";

//var spark = require('../../lib/spark');
var spark = require('spark');

spark.on('login', function() {

  //Get all events
  spark.getEventStream(false, false, function(data) {
    console.log("Event: " + JSON.stringify(data));
  });

  //Get your devices events
  spark.getEventStream(false, 'mine', function(data) {
    console.log("Event: " + JSON.stringify(data));
  });

  //Get test event for specific core
  spark.getEventStream('test', 'CORE_ID', function(data) {
    console.log("Event: " + JSON.stringify(data));
  });


});

// Login as usual
spark.login({ username: 'email@example.com', password: 'password'});
//spark.login({ accessToken: '012345' });
