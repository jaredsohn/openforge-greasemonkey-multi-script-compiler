// Written by Jared Sohn / Lifehacker for Flix Plus.
//
// Functions in this class should not be specific to Netflix.
// 
// License: Apache.  Some of the code may have come from userscripts used in Flix Plus, but it likely
// originated from Stackoverflow

var extlib = extlib || {};
var _extlib = function()
{
	var self = this;
	//////////////////////////////////////////////////////////////////////////////////////////////////
	// CSS Selectors
	//////////////////////////////////////////////////////////////////////////////////////////////////

	// came from userscripts
	this.addGlobalStyle = function(css) {
	    var head = document.getElementsByTagName('head')[0];
	    if (!head) { return; }
	    var style = document.createElement('style');
	    style.type = 'text/css';
	    style.innerHTML = css;
	    head.appendChild(style);
	}

	//Where el is the DOM element you'd like to test for visibility.  Do not use for fixed elements.
	this.isHidden = function(el) {
    	return (el.offsetParent === null)
	}

	// from Stackoverflow
	this.hasClass = function(element, cls) {
	    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////
	// CSS
	///////////////////////////////////////////////////////////////////////////////////////////////////
	// Derived from code from Stackoverflow
	this.initButtonCss = function()
	{
		var css = ".extlib_button {";;
		css += "font: bold 11px Arial;";
		css +=   "text-decoration: none;";
		css +=   "background-color: #EEEEEE;";
		css +=   "color: #333333;";
		css +=   "padding: 2px 6px 2px 6px;";
		css +=   "border-top: 1px solid #CCCCCC;";
		css +=  "border-right: 1px solid #333333;";
		css +=   "border-bottom: 1px solid #333333;";
		css +=   "border-left: 1px solid #CCCCCC;";
		css +=   "margin-left: 5px;";
		css +=   "cursor: pointer; cursor: hand;";
		css +=   "display:inline";
		css += "}";
		this.addGlobalStyle(css);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// Mouse events
	//////////////////////////////////////////////////////////////////////////////////////////////////

	this.simulateEvent = function(elem, event)
	{
	    if ((event === "mouseover") && (typeof(elem) !== "undefined") && (elem !== null))
	        elem = elem.getElementsByTagName("a")[0];

	    if ((document.createEvent) && (typeof(elem) !== "undefined") && (elem != null)) {
	        var e = document.createEvent("MouseEvents");

	        e.initMouseEvent(event, true, true, window,
	        0, 0, 0, 80, 20, false, false, false, false, 0, null);

	        elem.dispatchEvent(e);
	    }
	}

	this.simulateClick = function(elem)
	{
	    if (elem) {
	        this.simulateEvent(elem, "mouseover");
	        this.simulateEvent(elem, "click");
	    }
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// Utils
	//////////////////////////////////////////////////////////////////////////////////////////////////

	// from Stackoverflow
	this.stackTrace = function()
	{
		 console.log((new Error).stack);
	}

	function consolelog(msg)
	{
		if (typeof(localStorage["extlib debug"]) !== "undefined")
		    console.log(msg);
	}
	
	// From Stackoverflow
	this.cumulativeOffset = function(element) {
	    var top = 0, left = 0;
	    do {
	        top += element.offsetTop  || 0;
	        left += element.offsetLeft || 0;
	        element = element.offsetParent;
	    } while(element);

	    return {
	        top: top,
	        left: left
	    };
	};	
	// We call a function to get more data only if it has been five minutes since last time and gets full data if it has been 28 hours
	// since the last time we did that (in case older data was undone). Uses localStorage.
	//
	// The calling code should ensure the new data is written to localStorage (possibly merged with existing data)
	// This code was written for Flix Plus
	this.checkForNewData = function(keyname, wait_in_s, full_wait_in_s, ajax_call, callback) {
		var now = new Date().getTime();

		var last_full_check = localStorage[keyname + "_last_full_check"];
		if (typeof(last_full_check) === "undefined")
			last_full_check = 0;

		var history_last_checked = localStorage[keyname + "_last_checked"];
		if (typeof(history_last_checked) === "undefined")
		{
			delete localStorage[keyname];
			history_last_checked = 0;
		}

		var old_data = localStorage[keyname];

		var long_enough_since_update = new Date(parseInt(history_last_checked)).getTime() + (wait_in_s * 1000);
		var long_enough_since_update2 = new Date(parseInt(last_full_check)).getTime() + (full_wait_in_s * 1000);

		if (long_enough_since_update2 < now)
		{
			consolelog("getting all data from scratch again for " + keyname);
			history_last_checked = 0;
		}

		if (Math.min(long_enough_since_update, long_enough_since_update2) < now)
		{
			consolelog("checking " + keyname + "_last_checked");

			ajax_call(history_last_checked, function(data)
			{
				if (typeof(old_data) !== "undefined")
					data = old_data + "," + data;
				//localStorage[keyname] = data;
				if (callback !== null)
					callback(data);
			});

			localStorage[keyname + "_last_checked"] = now;

			if (history_last_checked === 0)
			{
				localStorage[keyname + "_last_full_check"] = now;
				localStorage[keyname] = ""; // don't merge with old data
			}

		} else
		{
			var data = localStorage[keyname];
			if (typeof(data) === "undefined")
				data = "";

			if (callback !== null)
				callback(data); 
		}
	};
}
_extlib.call(extlib);