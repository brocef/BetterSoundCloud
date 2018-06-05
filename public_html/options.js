/* 
 * Copyright (C) 2018 Brian Cefali
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
/* global chrome, DEFAULT_OPTIONS */

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
	var token = Math.random();
	status_span.setAttribute('token', token);
	setTimeout(function() {
		var cur_token = status_span.getAttribute('token');
		if (cur_token == token) {
			status_span.innerHTML = '&nbsp;';
		}
	}, 3000);
}

function save_options() {
    var min_duration_str = document.getElementById('min_duration').value;
    var max_duration_str = document.getElementById('max_duration').value;
    var allow_playlists = document.getElementById('allow_playlists').checked;
    var allow_reposts = document.getElementById('allow_reposts').checked;
    var allow_promoted = document.getElementById('allow_promoted').checked;
	var remove_filtered = document.getElementById('remove_filtered').checked;
    var only_filter_stream = document.getElementById('only_filter_stream').checked;
    
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
        allowReposts: allow_reposts,
        allowPromoted: allow_promoted,
		removeFiltered: remove_filtered,
        onlyFilterStream: only_filter_stream
    }, function () {
        setStatus("New BSC configuration was applied. Refresh any SoundCloud tabs now.", "info");
    });
}

function restore_options() {
    chrome.storage.sync.get(DEFAULT_OPTIONS, function (items) {
        if (items.last_version !== DEFAULT_OPTIONS.last_version) {
            items = DEFAULT_OPTIONS;
            setStatus("BSC was updated... resetting options to defaults", "warn");
        }
        /* document.getElementById('min_duration').value = items.minimumTrackDuration.as_str;
        document.getElementById('max_duration').value = items.maximumTrackDuration.as_str;
        document.getElementById('allow_playlists').checked = items.allowPlaylists;
        document.getElementById('allow_reposts').checked = items.allowReposts;
        document.getElementById('allow_promoted').checked = items.allowPromoted;
		document.getElementById('remove_filtered').checked = items.removeFiltered; */
		set_options(items);
    });
}

function set_options(opts) {
	if ('minimumTrackDuration' in opts)
		document.getElementById('min_duration').value = opts.minimumTrackDuration.as_str;
	if ('maximumTrackDuration' in opts)
		document.getElementById('max_duration').value = opts.maximumTrackDuration.as_str;
	if ('allowPlaylists' in opts)
		document.getElementById('allow_playlists').checked = opts.allowPlaylists;
	if ('allowReposts' in opts)
		document.getElementById('allow_reposts').checked = opts.allowReposts;
	if ('allowPromoted' in opts)
		document.getElementById('allow_promoted').checked = opts.allowPromoted;
	if ('removeFiltered' in opts)
		document.getElementById('remove_filtered').checked = opts.removeFiltered;
    if ('onlyFilterStream' in opts)
        document.getElementById('only_filter_stream').checked = opts.onlyFilterStream;
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

var input_ids = ['min_duration', 'max_duration', 'allow_playlists', 'allow_reposts', 'allow_promoted', 'remove_filtered', 'only_filter_stream'];
document.addEventListener('DOMContentLoaded', function() {
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
	document.getElementById('config_select').value = '-';
	document.getElementById('apply_preset_config_btn').addEventListener('click', function(evt) {
		var sel_cfg = document.getElementById('config_select');
		var sel_i = sel_cfg.selectedIndex;
		if (sel_i != -1) {
			var opts = {};
			var val = sel_cfg.value;
			if (val == 'all') {
				opts['minimumTrackDuration'] = {
					as_str: "00:00",
					as_int: 0
				};
				opts['maximumTrackDuration'] = {
					as_str: "2:00:00",
					as_int: 3600 * 2
				}
				opts['allowPlaylist'] = true;
				opts['allowReposts'] = true;
				opts['allowPromoted'] = true;
				opts['removeFiltered'] = false;
                opts['onlyFilterStream'] = false;
			} else if(val == 'mixes') {
				opts['minimumTrackDuration'] = {
					as_str: "20:00",
					as_int: 20 * 60
				};
				opts['maximumTrackDuration'] = {
					as_str: "4:00:00",
					as_int: 4 * 60 * 60
				}
				opts['allowPlaylist'] = false;
				opts['allowReposts'] = true;
				opts['allowPromoted'] = false;
				opts['removeFiltered'] = true;
                opts['onlyFilterStream'] = false;
			} else if(val == 'playlists') {
				opts['minimumTrackDuration'] = {
					as_str: "00:00",
					as_int: 0
				};
				opts['maximumTrackDuration'] = {
					as_str: "2:00:00",
					as_int: 3600 * 2
				}
				opts['allowPlaylist'] = true;
				opts['allowReposts'] = true;
				opts['allowPromoted'] = false;
				opts['removeFiltered'] = true;
                opts['onlyFilterStream'] = false;
			} else if(val == 'noreposts') {
				opts['minimumTrackDuration'] = {
					as_str: "00:00",
					as_int: 0
				};
				opts['maximumTrackDuration'] = {
					as_str: "2:00:00",
					as_int: 3600 * 2
				}
				opts['allowPlaylist'] = true;
				opts['allowReposts'] = false;
				opts['allowPromoted'] = false;
				opts['removeFiltered'] = true;
                opts['onlyFilterStream'] = false;
			}
			set_options(opts);
			setStatus("Preset Configuration Applied", "info")
		}
	});
	if (chrome && chrome.storage && chrome.storage.sync) {
		restore_options();
	}
});
