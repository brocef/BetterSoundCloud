/* global chrome */

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


function parseSCItem(sc_item) {
    var sel = function(selector) {
        return sc_item.querySelector(selector);
    };
    
    var artist_a = sel("div.soundTitle__secondary > a.soundTitle__username");
    var reposter_a = sel("div.soundTitle__secondary > div.soundTitle__info > a.actorUser, div.activity > div.streamContext > div.soundContext > span.soundContext__line > a:first-child");
    var track_a = sel("div.soundTitle__titleContainer > div > a.soundTitle__title");
    var repost_time = sel("div.soundTitle__titleContainer > div.soundTitle__additionalContainer > div.soundTitle__uploadTime > time, div.activity > div.streamContext > div.soundContext > span.soundContext__line time");
    var tags_a = sel("div.soundTitle__titleContainer > div.soundTitle__additionalContainer > div.soundTitle__tagContainer > a.soundTitle__tag");
    var like_btn = sel("div.sound__footer > div.sound__soundActions button.sc-button-like");
    var repost_btn = sel("div.sound__footer > div.sound__soundActions button.sc-button-repost");
    var dl_a = sel("div.sound__footer > div.sound__soundActions a.soundActions__purchaseLink");
    var plays_li = sel("div.sound__footer > div.sound__footerRight div.sound__soundStats li:nth-child(1)");
    var comments_li = sel("div.sound__footer > div.sound__footerRight div.sound__soundStats li:nth-child(2)");
    
    
    return {
        artist_a: artist_a,
        reposter_a: reposter_a,
        track_a: track_a,
        repost_time: repost_time,
        tags_a: tags_a,
        like_btn: like_btn,
        repost_btn: repost_btn,
        dl_a: dl_a,
        plays_li: plays_li,
        comments_li: comments_li
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
            if (getTargetList())
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

                                processSCItem(sc_item, cfg);
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