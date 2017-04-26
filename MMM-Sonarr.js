/**
 * Created by max on 4/21/17.
 */
Module.register("MMM-Sonarr", {
	defaults: {
		apiBase: "",
		apiKey: "",
		fade: true,
		updateInterval: 5 * 50 * 1000,
		initialLoadDelay: 0,
		maximumEntries: 5,
		calendar: {
			num: 1,
			type: "month" // days|months|years
		},
		history: {
			sortKey: "date", // date|series.title
			sortDir: "desc"
		}
	},

	getStyles: function () {
		return ["MMM-Sonarr.css"];
	},

	getScripts: function () {
		return ["moment.js"];
	},

	start: function () {
		Log.info("Starting module: " + this.name);

		this.loaded = false;
		this.sendSocketNotification("CONFIG", this.config);
	},

	socketNotificationReceived: function (notification, payload) {
		Log.log(this.name + " received notification");
		if(notification === "RECORDS") {
			this.records = payload;
			this.loaded = true;
			this.updateDom();
		}
	},

	getDom: function () {
		let wrapper = document.createElement("div");

		if(!this.loaded) {
			wrapper.innerHTML = "Fetching records...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		let calendarTable = document.createElement("table");
		let calendarHeader = document.createElement("header");
		calendarTable.className = "small calendar";
		calendarHeader.innerHTML = "Upcoming";

		let historyTable = document.createElement("table");
		let historyHeader = document.createElement("header");
		historyTable.className = "small history";
		historyHeader.innerHTML = "History";



		for(let r in this.records.calendar) {
			if(r >= this.config.maximumEntries) {break;}

			let record = this.records.calendar[r];

			let row = document.createElement("tr");
			calendarTable.appendChild(row);

			let airTimeCell = document.createElement("td");
			airTimeCell.className = "airtime";
			airTimeCell.innerHTML = record.airdate;
			row.appendChild(airTimeCell);

			let seriesTitleCell = document.createElement("td");
			seriesTitleCell.className = "seriestitle";
			seriesTitleCell.innerHTML = record.seriesTitle;
			row.appendChild(seriesTitleCell);

			let episodeTitleCell = document.createElement("td");
			episodeTitleCell.className = "episodetitle";
			episodeTitleCell.innerHTML = record.episodeTitle;
			row.appendChild(episodeTitleCell);

		}

		for(let r in this.records.history) {
			if(r >= this.config.maximumEntries) {break;}

			let record = this.records.history[r];

			let row = document.createElement("tr");
			historyTable.appendChild(row);

			let airTimeCell = document.createElement("td");
			airTimeCell.className = "airtime";
			airTimeCell.innerHTML = record.airDate;
			row.appendChild(airTimeCell);

			let seriesTitleCell = document.createElement("td");
			seriesTitleCell.className = "seriestitle";
			seriesTitleCell.innerHTML = record.seriesTitle;
			row.appendChild(seriesTitleCell);

			let episodeTitleCell = document.createElement("td");
			episodeTitleCell.className = "episodetitle";
			episodeTitleCell.innerHTML = record.episodeTitle;
			row.appendChild(episodeTitleCell);
		}

		wrapper.appendChild(calendarHeader);
		wrapper.appendChild(calendarTable);
		wrapper.appendChild(historyHeader);
		wrapper.appendChild(historyTable);
		return wrapper;
	},

	scheduleUpdate: function (delay) {
		let next = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			next = delay;
		}

		let self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.updateDom();
		}, next);
	}
});