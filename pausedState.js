function PausedState() {
	this.html = "paused.html";
	this.opt = {
		type: "basic",
		title: "StayHydrated",
		iconUrl: "icon.png",
		requireInteraction:true,
		buttons :[{
			title: "YES"
		}, {
			title: "NO"
		}]
	};
	this.notificationBaseId = "Time to rehydrate!";
	this.nextState = "ticking";
}
