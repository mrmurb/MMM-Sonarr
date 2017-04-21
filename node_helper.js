/**
 * Created by max on 4/21/17.
 */

const NodeHelper = require('node_helper');
const unirest = require('unirest');
const moment = require('moment');

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node_helper for module: " + this.name);
        this.started = false;
    },

    // Receive notification
    socketNotificationReceived: function (notification, payload) {
        console.log("node_helper for " + this.name + " received socket notification: " + notification + " - Payload: " + payload);

        if(notification === "CONFIG" && this.started === false) {
            this.config = payload;
            this.started = true;
            this.scheduleUpdate(this.config.initialLoadDelay);
        }
    },

    updateRecords: function () {
        let self = this;

        // Empty current records
        this.records = [];

        unirest.get(this.getUrl("calendar"))
            .send()
            .end(function (r) {
                if(r.error) {
                    console.log(self.name + " : " + r.error);
                    //TODO add update call
                } else {
                    //console.log("body: ", JSON.stringify(r.body));
                    self.parseRecords(r.body);
                }
            });
    },

    parseRecords: function (data) {
        for (let i in data) {
            let record = data[i];
            let airDate = record.airDate;
            let seriesTitle = record.series.title;
            let episodeTitle = record.title;

            this.records.push({
                airdate: moment(airDate).format("D/M"),
                seriesTitle: seriesTitle.replace(/ *\([^)]*\) */g, "").trim(),
                episodeTitle: episodeTitle
            });
        }

        this.scheduleUpdate(this.config.updateInterval);
        this.sendSocketNotification("RECORDS", this.records);
    },

    getUrl: function (endpoint) {
        let url = this.config.apiBase;
        url += this.config.apiEndpoint;

        if(this.config.apiEndpoint === "calendar") {
            let date = moment();

            url += "?apiKey=" + this.config.apiKey;
            url += "&start=" + date.format("YYYY-MM-DD");
            url += "&end=" + date.add(1, 'month').format("YYYY-MM-DD");
        }

        if(this.config.apiEndpoint === "history") {

        }

        return url;
    },

    scheduleUpdate: function (delay) {
        let next = this.config.updateInterval;
        if (typeof delay !== 'undefined' && delay >= 0) {
            next = delay;
        }

        let self = this;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            self.updateRecords();
        }, next);
    }
});