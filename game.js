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

// Annoucne results

// NOISY DEBUGGING
kallisti.on('message', function(data) {
	if (data.type !== undefined && data.type === 'result') {
		//console.log(data.result);
	}
});

//Helper functions

function return_max (data, callback) {
	var number_of_cards = data.state.hand.length; //Number of cards
	var current_max = 0;
	for (var i = 0; i < data.state.hand.length; i++) {
		if (data.state.hand[i]) {}
	}
}

function should_challenge (data) {
	var hand_total = 0;
	for (var i = 0; i < data.state.hand.length; i++) {
		hand_total = hand_total + data.state.hand[i];
	}
	if (hand_total > (data.state.hand.length * 7)) { //Modify challenge metric....should use mean, mode, median (statistics)
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'offer_challenge'
			}
		});	
	}
	else {
		find_min(data, function(min) {
			kallisti.send({
				type: 'move',
				request_id: data.request_id,
				response: {
						type: 'play_card',
						card: data.state.hand[min]
					}
			});	
		});
	}
}

function find_min (data, callback) {
	var min_pos = 0;
	for (var i = 0; i < data.state.hand.length; i++) {
		if (data.state.hand[i] < data.state.hand[min_pos]) {
			min_pos = i;
		}
	}
	//console.log(data.state.hand[min_pos]);
	callback(min_pos);
}

function find_max (data, callback) {
	var max_pos = 0;
	for (var i = 0; i < data.state.hand.length; i++) {
		if (data.state.hand[i] > data.state.hand[max_pos]) {
			max_pos = i;
		}
	}
	//console.log(data.state.hand[max_pos]);
	callback(max_pos);
}

function play_min_to_win (data, callback) { //Already determined card on table not bigger or equal to my max, will always be able to find min, so play min to win.
	var min_diff = 13;
	var curr_pos = 0;
	var diff = 0;
	for (var i = 0; i < data.state.hand.length; i++) {
		diff = data.state.hand[i] - data.state.card;
		if (diff > 0 && diff < min_diff) {
			curr_pos = i;
			min_diff = diff;
		}
	}
	callback(curr_pos);
}
//function find_max ()

// My turn

kallisti.on('request_card', function(data) {
	var hand_total = 0;
	for (var i = 0; i < data.state.hand.length; i++) {
		hand_total = hand_total + data.state.hand[i];
	}
	///Issue challenge if I have 1-4 card and average = 13
	if (data.state !== undefined && data.state.your_tricks >= data.state.their_tricks && data.state.can_challenge && hand_total > (data.state.hand.length * 13) && data.state.hand.length < 5) { //Modify challenge metric....should use mean, mode, median (statistics)
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'offer_challenge'
			}
		});
	}
	///Issue challenge if I have 5 cards and have 13, 13, 13, 13, 12
	else if (data.state !== undefined && data.state.your_tricks >= data.state.their_tricks && data.state.can_challenge && hand_total > (data.state.hand.length * 12) && data.state.hand.length === 5) { //Modify challenge metric....should use mean, mode, median (statistics)
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'offer_challenge'
			}
		});
	}
	else if (data.state !== undefined && data.state.your_tricks >= data.state.their_tricks && data.state.can_challenge && hand_total > (data.state.hand.length * 10) && data.state.hand.length > 2 && (data.state.your_points - data.state.their_points) > 5) { //Modify challenge metric....should use mean, mode, median (statistics)
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'offer_challenge'
			}
		});
	}
	///Issue challenge if they are going to win and I am not close
	else if (data.state !== undefined && data.state.your_tricks >= data.state.their_tricks && data.state.can_challenge && data.state.your_points < 9 && data.state.their_points === 9) { //Modify challenge metric....should use mean, mode, median (statistics)
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'offer_challenge'
			}
		});
	}
	////Issue challenge if no one is very close to winning and I have a good chance of winning - card average >= 9
	else if (data.state !== undefined && data.state.your_tricks >= data.state.their_tricks && data.state.can_challenge && hand_total > (data.state.hand.length * 9) && data.state.hand.length > 2 && (data.state.your_points - data.state.their_points < 3)) { //Modify challenge metric....should use mean, mode, median (statistics)
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'offer_challenge'
			}
		});
	}
	else {
		if (data.state !== undefined && data.state.card !== undefined) { //There is a card on table
			if (data.state.card === 13) { //Oppo plays 13, will never win. Play min.
				find_min(data, function (min_pos) {
					console.log("oppo play 13, give up, playing " + data.state.hand[min_pos]);
					console.log("game id is " + data.state.game_id);
					kallisti.send({
						type: 'move',
						request_id: data.request_id,
						response: {
							type: 'play_card',
							card: data.state.hand[min_pos]
						}
					});
				});
			}
			else {
				find_max (data, function (max_pos){
					if (data.state.hand[max_pos] <= data.state.card) { //play min if card on table is same or greater than my max <-- give up
						console.log("opp: " + data.state.card + " vs my max: " + data.state.hand[max_pos] + ", giving up");
						find_min(data, function (min_pos){
							console.log('playing '+data.state.hand[min_pos]);
							console.log("game id is " + data.state.game_id);
							kallisti.send({
								type: 'move',
								request_id: data.request_id,
								response: {
									type: 'play_card',
									card: data.state.hand[min_pos]
								}
							});
						});
					}
					else { //Can win, so play min to win
						play_min_to_win(data, function (to_play) {
							console.log("Playing min to win: Opp = " + data.state.card + ", me = " + data.state.hand[to_play]);
							console.log("game id is " + data.state.game_id);
							kallisti.send({
								type: 'move',
								request_id: data.request_id,
								response: {
									type: 'play_card',
									card: data.state.hand[to_play]
								}
							});
						});
					}
				});
			}
		}
		else { //if there's no card on table, just play min <---- this is a tricky one...final fix
			find_min(data, function (min_pos){
				console.log("Starting hand, playing min: " + data.state.hand[min_pos]);
				console.log("game id is " + data.state.game_id);
				kallisti.send({
					type: 'move',
					request_id: data.request_id,
					response: {
						type: 'play_card',
						card: data.state.hand[min_pos]
					}
				});
			});
		}
	}
	
});

// CHALLENGES

kallisti.on('challenge_offered', function(data) {
	var hand_total = 0;
	for (var i = 0; i < data.state.hand.length; i++) {
		hand_total = hand_total + data.state.hand[i];
	}
	if (data.state.your_tricks >= data.state.their_tricks && data.state.hand.length === 1 && data.state.hand[0] === 13) { //if i only have 1 card and I get 13, must accept.
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'accept_challenge'
			}
		});
	}
	else if (data.state.their_points === 9) { //if they have 9 pts and they challenge me, I must accept...
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'accept_challenge'
			}
		});
	}
	else if (data.state.your_tricks >= data.state.their_tricks && data.state.hand.length > 2 && hand_total > data.state.hand.length * 10) { //If there is more than 2 card and average > 10, accept
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'accept_challenge'
			}
		});
	}
	else if (data.state.your_tricks >= data.state.their_tricks && data.state.hand.length === 2 && hand_total > data.state.hand.length * 11) { //If there exactly 2 card and average > 11, accept
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'accept_challenge'
			}
		});
	}
	else {
		kallisti.send({
			type: 'move',
			request_id: data.request_id,
			response: {
				type: 'reject_challenge'
			}
		});
	}
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

