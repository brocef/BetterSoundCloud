/* 
 * Copyright (C) 2017 Brian Cefali
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global chrome */

function setStatus(status_msg, type) {
    var status_span = document.getElementById("status_span");
    status_span.classList.remove("bsc_info", "bsc_warning", "bsc_error", "bsc_hidden");
    if (type === "err") {
        status_span.classList.add("bsc_error");
    } else if (type === "info") {
        status_span.classList.add("bsc_info");
    } else if (type === "warn") {
        status_span.classList.add("bsc_warning");
    }
    status_span.innerHTML = status_msg;
}

function save_options() {
    var min_duration_str = document.getElementById('min_duration').value;
    var max_duration_str = document.getElementById('max_duration').value;
    var allow_playlists = document.getElementById('allow_playlists').checked;
    var allow_reposts = document.getElementById('allow_reposts').checked;

    chrome.storage.sync.set({
        last_version: DEFAULT_OPTIONS.last_version,
        minimumTrackDuration: {
            as_str: min_duration_str,
            as_int: convertTimeFieldToSeconds(min_duration_str)
        },
        maximumTrackDuration: {
            as_str: max_duration_str,
            as_int: convertTimeFieldToSeconds(max_duration_str)
        },
        allowPlaylists: allow_playlists,
        allowReposts: allow_reposts
    }, function () {
        setStatus("Settings saved successfully", "info");
    });
}

var DEFAULT_OPTIONS = {
        last_version: "1.0.11",
        minimumTrackDuration: {
            as_str: "00:00",
            as_int: 0
        },
        maximumTrackDuration: {
            as_str: "2:00:00",
            as_int: 3600 * 2
        },
        allowPlaylists: true,
        allowReposts: true,
        allowPromoted: false
    };

function restore_options() {
    chrome.storage.sync.get(DEFAULT_OPTIONS, function (items) {
        if (items.last_version !== DEFAULT_OPTIONS.last_version) {
            items = DEFAULT_OPTIONS;
            setStatus("BSC was updated... resetting options to defaults", "warn");
        }
        document.getElementById('min_duration').value = items.minimumTrackDuration.as_str;
        document.getElementById('max_duration').value = items.maximumTrackDuration.as_str;
        document.getElementById('allow_playlists').checked = items.allowPlaylists;
        document.getElementById('allow_reposts').checked = items.allowReposts;
        document.getElementById('allow_promoted').checked = items.allowPromoted;
    });
}

function convertTimeFieldToSeconds(time_str) {
    var spl_time = time_str.split(":").reverse();
    var time = 0;
    var time_mod = [1, 60, 3600];
    for (var i=0; i < spl_time.length && i < time_mod.length; i++) {
        time += parseInt(spl_time[i]) * time_mod[i];
    }
    return time;
}

var input_ids = ['min_duration', 'max_duration', 'allow_playlists', 'allow_reposts', 'allow_promoted'];
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
        function() {
            var bad = false;
            for (var i=0; i<input_ids.length; i++) {
                if (!document.getElementById(input_ids[i]).checkValidity()) {
                    bad = true;
                }
            }
            if (!bad) {
                save_options();
            }
        });
