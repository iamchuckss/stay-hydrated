/**
 * Initially called when extension page loads. Check timer state and start/continue timer.
 */
function init() {
	addMessageListeners();
}

var ctx = document.getElementById('circular_progress').getContext('2d');
var start = 4.72;
var cw = ctx.canvas.width;
var ch = ctx.canvas.height;
var diff;	

/**
 * Adds listeners so it knows how to handle the messages from the background page.
 */
function addMessageListeners() {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		switch(request.command) {
			case "updateTime":
				// document.getElementById("current-time").innerText = request.time;
				updateProgress(request.progress, request.time);
				break;
			case "timerEnded":
				console.log("Timer ended.");
				break;
		}
	});
}

function updateProgress(progress, time) {
	diff = (progress * Math.PI*2*10).toFixed(2);
	ctx.clearRect(0, 0, cw, ch);
	ctx.lineWidth = 3;
	ctx.fillStyle = '#38A2C3';
	ctx.strokeStyle = "#38A2C3";
	ctx.font = '25px sans-serif'
	ctx.fillText(time, cw*.5 - 30, ch*.5 + 12, cw);
	ctx.beginPath();
	ctx.arc(150, 150, 125, start, diff/10+start, false);
	ctx.stroke();
}

document.addEventListener('DOMContentLoaded', init);