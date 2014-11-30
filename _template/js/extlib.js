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
		 consolelog((new Error).stack);
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
	//
	// keynames can be an array or a string.  Only the first keyname will be used with last_full_check and _last_checked but
	// it will otherwise work with data for all keys.  The callback will pass back an array if keynames was an array and otherwise passes
	// back a string.
	//
	// This code was written for Flix Plus
	this.checkForNewData = function(keynames, wait_in_s, full_wait_in_s, ajax_call, callback) {
		consolelog("keynames = ");
		consolelog(keynames);
		var now = new Date().getTime();
		var keynames_array = keynames;

		if (keynames.constructor === String)
			keynames_array = [keynames];

		var len = keynames_array.length;

		var last_full_check = localStorage[keynames_array[0] + "_last_full_check"];
		if (typeof(last_full_check) === "undefined")
			last_full_check = 0;

		var history_last_checked = localStorage[keynames_array[0] + "_last_checked"];
		if (typeof(history_last_checked) === "undefined")
		{
			for (i = 0; i < len; i++)
				delete localStorage[keynames_array[i]];
			history_last_checked = 0;
		}

		var old_datas = [];
		for (i = 0; i < len; i++)
			old_datas.push(localStorage[keynames_array[i]]);

		var long_enough_since_update = new Date(parseInt(history_last_checked)).getTime() + (wait_in_s * 1000);
		var long_enough_since_update2 = new Date(parseInt(last_full_check)).getTime() + (full_wait_in_s * 1000);

		if (long_enough_since_update2 < now)
		{
			for (i = 0; i < len; i++)
				consolelog("getting all data from scratch again for " + keynames_array[i]);
			history_last_checked = 0;
		}

		if (Math.min(long_enough_since_update, long_enough_since_update2) < now)
		{
			consolelog("checking " + keynames_array[0] + "_last_checked");

			ajax_call(history_last_checked, function(datas)
			{
				if (keynames.constructor === String)
					datas = old_datas[0] + "," + datas;
				else if (typeof(old_datas) !== "undefined")
				{
					for (i = 0; i < len; i++)
						datas[i] = old_datas[i] + "," + datas[i];
				}

				//localStorage[keynames_array[0]] = data;
				if (callback !== null)
					callback(datas);
			});

			localStorage[keynames_array[0] + "_last_checked"] = now;

			if (history_last_checked === 0)
			{
				localStorage[keynames_array[0] + "_last_full_check"] = now;
				for (i = 0; i < len; i++)
					localStorage[keynames_array[i]] = ""; // don't merge with old data
			}

		} else
		{
			var datas = [];
			for (i = 0; i < len; i++)
			{
				var data = localStorage[keynames_array[i]];
				if (typeof(data) === "undefined")
					data = "";
				datas.push(data);
			}

			if (keynames.constructor === String)
				datas = datas[0];

			if (callback !== null)
				callback(datas); 
		}
	};

	// from netflix-rate userscript
	this.endsWith = function(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	// Helper function for escaping API urls
	// from netflix-rate userscript
	this.escapeHTML = function(str) {
	    return str.replace(/[&"<>]/g, function(m) {
	        return { 
	            "&": "&amp;",
	            '"': "&quot;",
	            "<": "&lt;",
	            ">": "&gt;",
	        }[m];
	    });
	}

	// from netflix-rate userscript
	this.addStyle = function(style_id, css_url)
	{
	    if (!$('#' + style_id).length) {
    	    $("head").append("<link id='fp_rating_overlay' href='" + css_url + "' type='text/css' rel='stylesheet' />");
    	}
    }

    // returns array of length two with the range (as integers); if part of range doesn't exist, set value to null
    this.parse_year_range = function(year_str)
    {
        if ((year_str === null) || (year_str.trim() === ""))
            return [null, null];

    	try
    	{
	        var years = [];

	        if (year_str.indexOf("-") !== -1)
	        {
	            var year_parts = year_str.split("-");
	            years = [parseInt(year_parts[0]), parseInt(year_parts[1])];
	        } else
	            years = [parseInt(year_str), null];

		} catch (ex)
		{
			consolelog(ex);
			years = [null, null];
		}

        return years;
    }
}
_extlib.call(extlib);