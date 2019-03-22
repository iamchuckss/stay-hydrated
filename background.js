/**
 * Global Variables
 */
var timerStates = {
	"paused" : new PausedState(),
	"ticking" : new TickingState()},
    stateKey = "paused",
    currentState = timerStates[stateKey],
    timer;


// Add message listeners for messages from timer.js
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// Only start timer if timer was initially off. No delay.
		if (request.command === "startTimer" && stateKey === "paused") {
			changeToNextState();
			console.log("timer started");
			sendResponse({message: "Timer started."});
		}
	});



/**
 * Helper Functions
 */

/**
 * Function to start a timer and send updates to timer.html every second or so.
 */
function startTimer() {
	var start = moment();
	console.log("startTimer()");
	console.log(stateKey);
	timer = setInterval(function() {
	    var difference = moment().diff(start, 'seconds');
	    if (difference > currentState.length()) {
	    	stopTimer();
	    	return;
	    }
	    sendUpdatedTime(currentState.length() - difference);
	}, 1000);
}

/**
 * Given the difference in seconds between the start time and current time,
 * formats it into m:ss (ex. 0:55) and sends a message to timer.js, so it can
 * update the UI.
 */
function sendUpdatedTime(difference) {
	var time = moment().startOf("day").seconds(difference);
	var progress = difference / currentState.length();
	chrome.runtime.sendMessage({
		"command": "updateTime",
		"time": time.format("m:ss"),
		"progress": progress
	});
	// chrome.browserAction.setBadgeText({"text" : time});
}

/**
 * Called when period is over. Stops the running timer and notifies the user
 * that the period is over.
 */
function stopTimer() {
	clearInterval(timer);
	timer = null;
	changeToNextState();
	notifyUser();
	chrome.runtime.sendMessage({
		command: "timerEnded"
	});
}

/**
 * Notifies the user when a period has ended.
 */
function notifyUser() {
	var id = currentState.notificationBaseId;
	var notification = new Notification(id, currentState.opt);
	notification.addEventListener('close', () => {
		if (currentState === "paused") {
			
		}
		changeToNextState();
	});
}

/**
 * Called during a change of state during usual flow.
 */
function changeToNextState() {
	nextStateKey = currentState.nextState;
	changeState(nextStateKey);
}

/**
 * Called when we want to change to a specific state. isDelayed parameter allows
 * us to introduce a delay for before the next timer is started (ex. 10 seconds
 * between the pomodoro period is over and the break begins to give user time to
 * wrap up.).
 */
function changeState(nextStateKey) {
	stateKey = nextStateKey;
	currentState = timerStates[stateKey];
	chrome.browserAction.setPopup({
		"popup": currentState.html
	});

	// We know it's a time period of some sort.
	if (currentState.hasOwnProperty("length")) {
		startTimer();
		console.log(currentState);
	}
}

chrome.runtime.onStartup.addListener(() => {
	checkPermission();
});

chrome.runtime.onInstalled.addListener(() => {
	checkPermission();
});

function checkPermission() {

	// check if browser support notifications
	if (!("Notification" in window)) {
    	alert("This browser does not support desktop notification");
  	}
  	else if (Notification.permission === "granted") {
  		changeToNextState();
  	}
  	else if (Notification.permission !== "denied") {
  		Notification.requestPermission().then(function (permission) {
  			// If user accepts, proceed
  			if (permission === "granted") {
  				changeToNextState();
  			}
  		});
  	}
}