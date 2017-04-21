/**
 * Created by max on 4/21/17.
 */
Module.register("MMM-Sonarr", {
    defaults: {
        apiBase: "",
        apiKey: "",
        apiEndpoint: "calendar",
        fade: true,
        updateInterval: 5 * 50 * 1000,
        initialLoadDelay: 0,
        maximumEntries: 5
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

        let table = document.createElement("table");
        table.className = "small";

        for(let r in this.records) {
            if(r >= this.config.maximumEntries) break;

            let record = this.records[r];

            let row = document.createElement("tr");
            table.appendChild(row);

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

        return table;
    },
    
    scheduleUpdate: function (delay) {
        let next = this.config.updateInterval;
        if (typeof delay !== 'undefined' && delay >= 0) {
            next = delay;
        }

        let self = this;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            self.updateDom();
        }, next);
    }
});