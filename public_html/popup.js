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

var options_url = chrome.runtime.getURL('/options.html');
var opts_a = document.querySelectorAll('.options_page_prelink');
for (var i=0; i<opts_a.length; i++) {
    opts_a[i].href = options_url;
    opts_a[i].classList.remove('options_page_prelink');
}

var manifest = chrome.runtime.getManifest();
document.getElementById("version").textContent = "v"+manifest.version;