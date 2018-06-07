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

var DEFAULT_OPTIONS = {
        last_version: "0.0.0",
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
        allowPromoted: false,
		removeFiltered: false,
        onlyFilterStream: false,
		blockedRepostUsers: {}
    };

if (chrome && chrome.runtime) {	
	var manifest = chrome.runtime.getManifest();
	DEFAULT_OPTIONS['last_version'] = manifest.version;
}