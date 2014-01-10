#!/usr/bin/env node


var kallisti = require('kallisti');

kallisti.connect('cuda.contest', 9999);

// CONNECTIONS

kallisti.on('connect', function() {
	console.log("Client Connected");
});

kallisti.on('greetings_program', function(data) {
	console.log("Connected to server");
});

// NOISY DEBUGGING

//kallisti.on('message', function(data) {
	//console.log(data);
//});

// CHALLENGES

kallisti.on('request_card', function(data) {
	// Play first card
	kallisti.send({
		type: 'move',
		request_id: data.request_id,
		response: {
			type: 'play_card',
			card: data.state.hand[0]
		}
	});

});

kallisti.on('challenge_offered', function(data) {
	// Always reject challenge
	kallisti.send({
		type: 'move',
		request_id: data.request_id,
		response: {
			type: 'reject_challenge'
		}
	});
});

// RESULTS

kallisti.on('trick_tied', function(data) {
});

kallisti.on('hand_done', function(data) {
});

kallisti.on('accepted', function(data) {
});

kallisti.on('game_won', function(data) {
});

kallisti.on('trick_won', function(data) {
});

kallisti.on('hand_won', function(data) {
});

// BAD THINGS

kallisti.on('error', function(data) {
    if (data.message) {
        console.log(data.message)
        kallisti.emit('end')
    } else {
        console.log("RECEIVED AN ERROR FROM THE SERVER");
        console.log(data);
    }
});

kallisti.on('parse-error', function(data) {
	console.log("RECEIVED AN UNPARSABLE MESSAGE FROM SERVER");
	console.log(data);
});

kallisti.on('end', function() {
	console.log("Client Disconnected. Retrying in ten seconds.");

    setTimeout(function() {kallisti.connect('cuda.contest', 9999)}, 10000);
});

