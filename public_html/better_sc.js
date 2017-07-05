/* global chrome */

/**
 * Ignore this function--its a fancy way to do something when the document is loaded and ready.
 * Equivalent to jQuery's $.ready()
 * 
 * @param {type} funcName
 * @param {type} baseObj
 * @returns {undefined}
 */
(function(funcName, baseObj) {
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
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
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
    var getDurCanvas = function() {
        return sc_item.querySelector("div.sound__waveform > div.waveform > div.waveform__layer > canvas.bscInitialized");
    };
    var waitForCanvas = function(){
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
    var sel = function(selector) {
        return sc_item.querySelector(selector);
    };
    
    var is_playlist = sel("div > div.playlist") !== null;
    if (is_playlist) {
        return {playlist: true};
    }
    
    var artist_a = sel("div.soundTitle__secondary > a.soundTitle__username");
    var reposter_a = sel("div.soundTitle__secondary > div.soundTitle__info > a.actorUser, div.activity > div.streamContext > div.soundContext > span.soundContext__line > a:first-child");
    var track_a = sel("div.soundTitle__titleContainer > div > a.soundTitle__title");
    var post_time = sel("div.soundTitle__titleContainer > div.soundTitle__additionalContainer > div.soundTitle__uploadTime > time, div.activity > div.streamContext > div.soundContext > span.soundContext__line time");
    var tags_a = sel("div.soundTitle__titleContainer > div.soundTitle__additionalContainer > div.soundTitle__tagContainer > a.soundTitle__tag");
    var like_btn = sel("div.sound__footer > div.sound__soundActions button.sc-button-like");
    var repost_btn = sel("div.sound__footer > div.sound__soundActions button.sc-button-repost");
    var dl_a = sel("div.sound__footer > div.sound__soundActions a.soundActions__purchaseLink");
    var plays_span = sel("div.sound__footer > div.sound__footerRight div.sound__soundStats li:nth-child(1) > span > span:nth-child(2)");
    var comments_li = sel("div.sound__footer > div.sound__footerRight div.sound__soundStats li:nth-child(2) > a > span:nth-child(2)");
    var duration_canvas = sel("div.sound__waveform > div.waveform > div.waveform__layer > canvas.bscInitialized");
    
    var artist = {
        name: artist_a.textContent.trim(),
        link: artist_a.href
    };
    
    var reposter = {
        name: reposter_a.textContent.trim(),
        link: reposter_a.href
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
    
    var plays = parseFancyNumber(plays_span.textContent.trim());
    
    if (comments_li !== null) {
        var comments = parseFancyNumber(comments_li.textContent.trim());
    } else {
        var comments = null;
    }
    
    var dur_raw = duration_canvas.getAttribute("duration").trim();
    var dur = parseTimeString(dur_raw);
    var duration = {
        duration_raw: dur_raw,
        duration: dur
    };
    
    return {
        dom: {
            artist_a: artist_a,
            reposter_a: reposter_a,
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
            reposer: reposter,
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
        playlist: false
    };
}

function processSCItem(sc_item, cfg) {
    var sc_obj = parseSCItem(sc_item);
    console.log(sc_obj);
}

function initialParse(cfg) {
    var sc_items = document.querySelectorAll("li.soundList__item");
    for (var i=0; i<sc_items.length; i++) {
        processSCItem(sc_items[i], cfg);
    }
}

function getTargetList() {
    return document.querySelector("body > div#app > div#content div.userStream__list > ul.soundList, body > div#app > div#content div.stream__list > div.lazyLoadingList > ul.lazyLoadingList__list");
}

function init() {
    chrome.storage.sync.get({
		minimumTrackDuration: 0,
		maximumTrackDuration: -1
	}, function(cfg) {
	
        var loopInject = function(){
            if (getTargetList() && document.querySelector("canvas.bscInitialized"))
            {   
                var target = getTargetList();
                // create an observer instance
                var observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                                var new_nodes = mutation.addedNodes;
                                if (new_nodes.length !== 1) {
                                        console.log("Warning! Unexpected number of new children in single mutation");
                                }
                                var sc_item = new_nodes.item(0);
                                
                                processSCItemWhenLoaded(sc_item, cfg);
                        });
                });

                // configuration of the observer:
                var config = { attributes: false, childList: true, characterData: false };

                // pass in the target node, as well as the observer options
                observer.observe(target, config);

                // later, you can stop observing
                // observer.disconnect();

                initialParse(cfg);
                return 0;
            }
            setTimeout(loopInject, 5); // 5 ms
        };
        loopInject();
    });
}

var init_script = document.createElement("script");
init_script.src = "chrome-extension://" + chrome.runtime.id + "/bsc_injected.js";
// TODO: Better logic for inserting new script
// Should probably insert into HEAD not HTML, but who knows what exists at the time
var loopInject = function(){
    if (document.head)
    {   
        document.head.appendChild(init_script);
        return 0;
    }
    setTimeout(loopInject, 5); // 5 ms
};
loopInject();

docReady(init);