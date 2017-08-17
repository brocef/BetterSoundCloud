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
/* global chrome, DEFAULT_OPTIONS */

/**
 * Ignore this function--its a fancy way to do something when the document is loaded and ready.
 * Equivalent to jQuery's $.ready()
 * 
 * @param {type} funcName
 * @param {type} baseObj
 * @returns {undefined}
 */
(function (funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if (document.readyState === "complete") {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function (callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function () {
                callback(context);
            }, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    };
})("docReady", window);

function parseTimeString(hms_time) {
    var dur_split = /(?:(\d+):)?(\d+):(\d+)/.exec(hms_time);
    var hours = dur_split[1];
    if (hours !== undefined) {
        hours = parseInt(hours);
    } else {
        hours = 0;
    }
    var minutes = dur_split[2];
    minutes = parseInt(minutes);
    var seconds = dur_split[3];
    seconds = parseInt(seconds);

    return seconds + (minutes * 60) + (hours * 60 * 60);
}

function parseFancyNumber(num) {
    var spl = /^([\d,.]+)([MK])?$/.exec(num);
    if (!spl) {
        return -1;
    }
    num = spl[1].split(",").join("");
    num = parseFloat(num);
    if (spl[2] === "K") {
        num = num * 1000;
    } else if (spl[2] === "M") {
        num = num * 1000000;
    }
    return num;
}

function processSCItemWhenLoaded(sc_item, cfg) {
    var getDurCanvas = function () {
        return sc_item.querySelector("div.sound__waveform div.waveform > div.waveform__layer > canvas.bscInitialized");
    };
    var waitForCanvas = function () {
        if (getDurCanvas())
        {
            processSCItem(sc_item, cfg);
            return 0;
        }
        setTimeout(waitForCanvas, 5); // 5 ms
    };
    return waitForCanvas();
}

function parseSCItem(sc_item) {
    var sel = function (selector) {
        return sc_item.querySelector(selector);
    };

    var artist_a = sel("div.soundTitle__secondary > a.soundTitle__username");

    var poster_parent = sel("div.soundTitle__secondary > div.soundTitle__info, div.activity > div.streamContext > div.soundContext > span.soundContext__line");
    var poster_a = poster_parent.querySelector("a:first-child");
    var is_repost = poster_parent.querySelector("span.soundContext__repost") !== null;

    var is_promoted = sel("span.sc-promoted-icon") !== null;

    var track_a = sel("div.soundTitle__titleContainer > div > a.soundTitle__title");
    var post_time = sel("div.soundTitle__titleContainer > div.soundTitle__additionalContainer > div.soundTitle__uploadTime > time, div.activity > div.streamContext > div.soundContext > span.soundContext__line time");
    var tags_a = sel("div.soundTitle__titleContainer > div.soundTitle__additionalContainer > div.soundTitle__tagContainer > a.soundTitle__tag");
    var like_btn = sel("div.sound__footer > div.sound__soundActions button.sc-button-like");
    var repost_btn = sel("div.sound__footer > div.sound__soundActions button.sc-button-repost");
    var dl_a = sel("div.sound__footer > div.sound__soundActions a.soundActions__purchaseLink");
    var plays_span = sel("div.sound__footer > div.sound__footerRight div.sound__soundStats li:nth-child(1) > span > span:nth-child(2)");
    var comments_li = sel("div.sound__footer > div.sound__footerRight div.sound__soundStats li:nth-child(2) > a > span:nth-child(2)");
    var duration_canvas = sel("div.sound__waveform div.waveform > div.waveform__layer > canvas.bscInitialized");

    var is_playlist = sel("div > div.playlist") !== null;

    var artist = {
        name: artist_a.textContent.trim(),
        link: artist_a.href
    };

    var poster = {
        name: poster_a.textContent.trim(),
        link: poster_a.href
    };

    var track = {
        name: track_a.textContent.trim(),
        link: track_a.href
    };

    if (post_time !== null) {
        var timestamp = {
            time: post_time.getAttribute('datetime')
        };
    } else {
        var timestamp = null;
    }

    var tags = [];
    if (tags_a !== null) {
        tags.push(tags_a.textContent.trim());
    }

    var likes = parseFancyNumber(like_btn.textContent.trim());

    var reposts = parseFancyNumber(repost_btn.textContent.trim());

    if (dl_a !== null) {
        var download = {
            text: dl_a.textContent.trim(),
            link: dl_a.href
        };
    } else {
        var download = null;
    }

    if (plays_span) {
        var plays = parseFancyNumber(plays_span.textContent.trim());
    } else {
        var plays = -1;
    }

    if (comments_li !== null) {
        var comments = parseFancyNumber(comments_li.textContent.trim());
    } else {
        var comments = -1;
    }

    var dur_raw = duration_canvas.getAttribute("duration").trim();
    var dur = parseTimeString(dur_raw);
    var duration = {
        duration_raw: dur_raw,
        duration: dur
    };

    return {
        dom: {
            sc_item: sc_item,
            artist_a: artist_a,
            poster_a: poster_a,
            track_a: track_a,
            post_time: post_time,
            tags_a: tags_a,
            like_btn: like_btn,
            repost_btn: repost_btn,
            dl_a: dl_a,
            plays_li: plays_span,
            comments_li: comments_li,
            duration_canvas: duration_canvas
        },
        values: {
            artist: artist,
            poster: poster,
            track: track,
            post_time: timestamp,
            tags: tags,
            likes: likes,
            reposts: reposts,
            download: download,
            plays: plays,
            comments: comments,
            duration: duration
        },
        playlist: is_playlist,
        is_repost: is_repost,
        is_promoted: is_promoted
    };
}

function processSCItem(sc_item, cfg) {
    var sc_obj = parseSCItem(sc_item);

    var filter_list = filter_hanndler.getFilterList();
    for (var i = 0; i < filter_list.length; i++) {
        var r = filter_list[i](sc_obj, cfg);
        if (!r) {
            continue;
        }
        var sc_item_div = sc_item.querySelector("div");
		sc_item_div.classList.add("filteredTrack");

		if (!cfg.removeFiltered) {
			var bsc_repl = document.createElement("div");
			bsc_repl.classList.add("filteredLineDiv");

			var bsc_repl_p = document.createElement("p");
			var bsc_repl_msg = document.createTextNode(r);
			bsc_repl_p.appendChild(bsc_repl_msg);

			var bsc_repl_show = document.createElement("span");
			bsc_repl_show.textContent = "[show]";
			bsc_repl_show.classList.add("bsc_show");
			bsc_repl_p.appendChild(bsc_repl_show);

			
			bsc_repl_show.addEventListener("click", mkHideShowClickListener(sc_item_div));

			sc_item.insertBefore(bsc_repl_p, sc_item_div);
		}
		
        break;
    }
}

function mkHideShowClickListener(sc_item_div) {
    var bsc = sc_item_div;
    return function (evt) {
        bsc.classList.toggle("filteredTrack");
        if (bsc.classList.contains("filteredTrack")) {
            evt.currentTarget.textContent = "[show]";
        } else {
            evt.currentTarget.textContent = "[hide]";
        }
    };
}

var filter_hanndler = (function() {
    var filters = {};
    
    filters.filter_promoted = function(sc_obj, cfg) {
        if (!cfg.allowPromoted && sc_obj.is_promoted) {
            return sc_obj.values.track.name + " was filtered out because it is a promoted track";
        }
        return false;
    };

    filters.filter_repost = function(sc_obj, cfg) {
        if (!cfg.allowReposts && sc_obj.is_repost) {
            return sc_obj.values.track.name + " was filtered out because it is a repost";
        }
        return false;
    };

    filters.filter_playlist = function(sc_obj, cfg) {
        if (!cfg.allowPlaylists && sc_obj.playlist) {
            return sc_obj.values.track.name + " was filtered out because it is a playlist";
        }
        return false;
    };

    filters.filter_trackDuration = function(sc_obj, cfg) {
        var sc_dur = sc_obj.values.duration.duration;
        if (cfg.minimumTrackDuration.as_int > 0 && sc_dur < cfg.minimumTrackDuration.as_int) {
            return sc_obj.values.track.name + " was filtered out because it is too short";
        } else if (cfg.maximumTrackDuration.as_int > 0 && sc_dur > cfg.maximumTrackDuration.as_int) {
            return sc_obj.values.track.name + " was filtered out because it is too long";
        }
        return false;
    };
    
    filters.getFilterList = function() {
        var filter_list = [];
        var keys = Object.keys(filters);
        for (var i=0; i<keys.length; i++) {
            var k = keys[i];
            if (k.startsWith("filter_")) {
                filter_list.push(filters[k]);
            }
        }
        return filter_list;
    };
    
    return filters;
})();

function initialParse(cfg) {
    var sc_items = document.querySelectorAll("li.soundList__item");
    for (var i = 0; i < sc_items.length; i++) {
        processSCItem(sc_items[i], cfg);
    }
}

function getTargetList() {
    return document.querySelector("body > div#app > div#content div.userStream__list > ul.soundList, body > div#app > div#content div.stream__list > div.lazyLoadingList > ul.lazyLoadingList__list");
}

function init() {
    chrome.storage.sync.get(DEFAULT_OPTIONS, function (cfg) {
        if (cfg.last_version !== DEFAULT_OPTIONS.last_version) {
            cfg = DEFAULT_OPTIONS;
            //TODO: Notify the user that the version changed and the settings were reste
        }
        
        var loopCond = function () {
            return getTargetList() && document.querySelector("canvas.bscInitialized");
        };

        var loopBody = function () {
            var target = getTargetList();
            // create an observer instance
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    var new_nodes = mutation.addedNodes;
                    if (new_nodes.length !== 1) {
                        console.log("Warning! Unexpected number of new children in single mutation");
                    }
                    var sc_item = new_nodes.item(0);

                    processSCItemWhenLoaded(sc_item, cfg);
                });
            });

            var config = {
                attributes: false,
                childList: true,
                characterData: false
            };

            observer.observe(target, config);

            // observer.disconnect();

            initialParse(cfg);
        };

        loopInject(loopCond, loopBody, 5);
    });
}

var init_script = document.createElement("script");
init_script.src = chrome.runtime.getURL('/bsc_injected.js');

function loopInject(condition_fn, body_fn, timeout) {
    var lerp = function () {
        if (condition_fn())
        {
            body_fn();
            return 0;
        }
        setTimeout(lerp, timeout);
    };
    lerp();
}

loopInject(
        function () {
            return document.querySelector("#content");
        },
        function () {
            document.head.appendChild(init_script);
        }, 5);

/**
 * First time init
 * @returns {undefined}
 */
docReady(function () {
    loopInject(
            function () {
                return document.querySelector("#content");
            },
            function () {
                var content = document.querySelector("#content");
                var content_obs = new MutationObserver(function (mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                        if (mutations[i].removedNodes.length > 0) {
                            init();
                            return;
                        }
                    }
                });
                content_obs.observe(content, {
                    childList: true,
                    attributes: false,
                    characterData: false
                });
                init();
            }, 5);
});