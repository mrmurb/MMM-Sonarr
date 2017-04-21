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
        let response = [];

        unirest.get(self.getUrl("calendar")).send().end(function (r) {
            if (r.error) {
                console.log(self.name + " : " + r.error);
                //TODO add update call
            } else {
                // console.log("body: ", JSON.stringify(r.body));
                // self.parseRecords(r.body);
                response.calendar = r.body;

                unirest.get(self.getUrl("history")).send().end(function (r) {
                    if (r.error) {
                        console.log(self.name + " : " + r.error);
                    } else {
                        response.history = r.body.records;
                        self.parseRecords(response);
                    }
                })
            }
        });
    },

    parseRecords: function (data) {
        let records = {
            calendar: [],
            history: []
        };

        // Handle upcoming records, calendar.
        for (let i in data.calendar) {
            let record = data.calendar[i];
            let airDate = record.airDate;
            let seriesTitle = record.series.title;
            let episodeTitle = record.title;

            records.calendar.push({
                airdate: moment(airDate).format("D/M"),
                seriesTitle: seriesTitle.replace(/ *\([^)]*\) */g, "").trim(),
                episodeTitle: episodeTitle
            });
        }

        // Handle past records, history

        for (let i in data.history) {
            let record = data.history[i];
            if(record.eventType === "downloadFolderImported") {
                let airDate = record.episode.date;
                let seriesTitle = record.series.title;
                let episodeTitle = record.episode.title;

                records.history.push({
                    airDate: moment(airDate).format("D/M"),
                    seriesTitle: seriesTitle.replace(/ *\([^)]*\) */g, "").trim(),
                    episodeTitle: episodeTitle
                });
            }
        }

        this.scheduleUpdate(this.config.updateInterval);
        this.sendSocketNotification("RECORDS", records);
    },

    getUrl: function (endpoint) {
        let url = this.config.apiBase;
        url += endpoint;
        url += "?apiKey=" + this.config.apiKey;

        if(endpoint === "calendar") {
            let date = moment();
            url += "&start=" + date.add(1, "days").format("YYYY-MM-DD");
            url += "&end=" + date.add(this.config.calendar.num, this.config.calendar.type).format("YYYY-MM-DD");
        }

        if(this.config.apiEndpoint === "history") {
            url += "&sortKey=" + this.config.history.sortKey;
            url += "&sortDir=" + this.config.history.sortDir;
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