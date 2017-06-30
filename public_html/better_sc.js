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
    }
})("docReady", window);

function filterSCItems(filterParams) {
	var items = document.getElementsByClassName("soundList__item");
	
	for (var i=0; i<items.length; i++) {
		var sc_item = items[i];
		sc_item_map[sc_item] = {
			visible: true,
			parsed: false
		};
		parseSCResult(sc_item, filterParams, processSCObject);
	}
}

function processSCObject(sc_obj, filterParams) {
	var min_duration_ms = filterParams.minimumTrackDuration * 1000;
	var max_duration_ms = filterParams.maximumTrackDuration * 1000;

	if (sc_obj.success) {
		var t_dur = sc_obj.track.duration;
		sc_obj.title_a.classList.toggle('errTitle', false);
		if (t_dur < min_duration_ms || (max_duration_ms > 0 && t_dur > max_duration_ms)) {
			hideSCResult(sc_obj, false, 'Duration out of range');
		} else {
			sc_obj.title_a.classList.add('seenTitle');
		}
	} else {
		hideSCResult(sc_obj, true, "Error");
	}
}

function showSCResult(sc_obj) {
	
}

function hideSCResult(sc_obj, is_err, reason) {
	if (!sc_item_map[sc_obj.sc_item].visible) return;
	sc_item_map[sc_obj.sc_item].visible = false;
	
	var sc_activity = sc_obj.sc_item.childNodes[0];
	sc_activity.classList.add('filteredTrack');
	
	var line = document.createElement("div");
	sc_obj.sc_item.insertBefore(line, sc_activity);
	
	line.innerHTML = reason;
	
	line.classList.add('filteredLineDiv');
}

function parseSCResult(sc_item, filterParams, cb) {
	var title_a = sc_item.querySelector(".soundTitle__title");
	title_a.classList.add('errTitle');
	
	SC.resolve(title_a.href).then(function(track) {
		cb({
			success: true,
			sc_item: sc_item,
			track: track,
			title_a: title_a
		}, filterParams);
	}, function(err) {
		cb({
			success: false,
			sc_item: sc_item,
			title_a: title_a,
			err: err
		}, filterParams);
	});
}

function getTargetList() {
    return document.querySelector("#content .lazyLoadingList ul");
}

SC.initialize({
  client_id: '5e776e8712475f822a3c91be4b547e0a'
//	  client_secret: '334f743e9007a2a5e8b114dba590be42',
//	  redirect_uri: 'http://localhost:5000'
});

var sc_objs = [];
if (getTargetList() === null) {
    docReady(function() {	
            init();
    });
} else {
    init();
}

function init() {
    chrome.storage.sync.get({
		minimumTrackDuration: 0,
		maximumTrackDuration: -1
	}, function(settings) {
	
	var target = getTargetList();
	
	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		
		mutations.forEach(function(mutation) {
			var new_nodes = mutation.addedNodes;
			if (new_nodes.length != 1) {
				console.log("Warning! Unexpected number of new children in single mutation");
			}
			var sc_item = new_nodes.item(0);
			sc_item_map[sc_item] = {
				visible: true,
				parsed: false
			};
			parseSCResult(sc_item, settings, processSCObject);
		});
		
		console.log(Object.keys(sc_item_map).length);
		console.log(document.querySelectorAll(".soundList__item"));
		
		
	});
	
	// configuration of the observer:
	var config = { attributes: false, childList: true, characterData: false }
	 
	// pass in the target node, as well as the observer options
	observer.observe(target, config);
	 
	// later, you can stop observing
	// observer.disconnect();
	
	filterSCItems(settings);
    });
}

