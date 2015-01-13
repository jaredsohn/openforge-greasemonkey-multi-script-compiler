// Written by Jared Sohn / Lifehacker for Flix Plus.
//
// Functions in this class should not be specific to Netflix.
//
// License: MIT/GPL.  Some of the code may have come from userscripts used in Flix Plus, but it likely
// originated from Stackoverflow

var extlib = extlib || {};
var extlib_ = function()
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
    };

    //Where el is the DOM element you'd like to test for visibility.  Do not use for fixed elements.
    this.isHidden = function(el) {
        return ((el.offsetParent === null) || (!document.contains(el)));
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // CSS
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    // Derived from code from Stackoverflow
    this.initButtonCss = function()
    {
        var css = "";
        css += ".extlib_button {";
        css += "font: bold 11px Arial;";
        css += "text-decoration: none;";
        css += "background-color: #EEEEEE;";
        css += "color: #333333;";
        css += "padding: 2px 6px 2px 6px;";
        css += "border-top: 1px solid #CCCCCC;";
        css += "border-right: 1px solid #333333;";
        css += "border-bottom: 1px solid #333333;";
        css += "border-left: 1px solid #CCCCCC;";
        css += "margin-left: 5px;";
        css += "cursor: pointer; cursor: hand;";
        css += "display:inline";
        css += "}";
        this.addGlobalStyle(css);
    };

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
    };

    this.simulateClick = function(elem)
    {
        if (elem) {
            this.simulateEvent(elem, "mouseover");
            this.simulateEvent(elem, "click");
        }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // Utils
    //////////////////////////////////////////////////////////////////////////////////////////////////

    // from Stackoverflow
    this.stackTrace = function()
    {
        console.trace("stacktrace");
        consolelog((new Error).stack);
    };

    function consolelog(msg)
    {
        if (typeof(localStorage["extlib debug"]) !== "undefined")
            console.log(msg);
    }

    // From Stackoverflow
    this.cumulativeOffset = function(element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);

        return {
            top: top,
            left: left
        };
    };
    // We call a function to get more data only if a certain amount of time has lapsed since the last time and
    // get full data after another time period (in case older data was removed).
    //
    // The calling code should ensure the new data is written to localStorage (possibly merged with existing data)
    //
    // keynames can be an array or a string.  Only the first keyname will be used with last_full_check and _last_checked but
    // it will otherwise work with data for all keys.  The callback will pass back an array if keynames was an array and otherwise passes
    // back a string.
    //
    // This code was written for Flix Plus by Lifehacker
    this.checkForNewData = function(keynames, waitInS, fullWaitInS, ajaxCall, callback) {
        consolelog("checkForNewData keynames = ");
        consolelog(keynames);

        var now = new Date().getTime();
        var keynamesArray = keynames;

        if (keynames.constructor === String)
            keynamesArray = [keynames];

        var len = keynamesArray.length;

        var lastFullCheck = localStorage[keynamesArray[0] + "_last_full_check"];
        if (typeof(lastFullCheck) === "undefined")
            lastFullCheck = 0;

        var historyLastChecked = localStorage[keynamesArray[0] + "_last_checked"];
        if (typeof(historyLastChecked) === "undefined")
        {
            for (i = 0; i < len; i++)
                delete localStorage[keynamesArray[i]];
            historyLastChecked = 0;
        }

        var oldDatas = [];
        for (i = 0; i < len; i++)
            oldDatas.push(localStorage[keynamesArray[i]]);

        var longEnoughSinceUpdate = new Date(parseInt(historyLastChecked)).getTime() + (waitInS * 1000);
        var longEnoughSinceUpdate2 = new Date(parseInt(lastFullCheck)).getTime() + (fullWaitInS * 1000);

        if (longEnoughSinceUpdate2 < now)
        {
            for (i = 0; i < len; i++)
                consolelog("getting all data from scratch again for " + keynamesArray[i]);
            historyLastChecked = 0;
        }

        if (Math.min(longEnoughSinceUpdate, longEnoughSinceUpdate2) < now)
        {
            consolelog("requesting new data");

            ajaxCall(historyLastChecked, function(datas)
            {
                // Append the data and act on it
                if (keynames.constructor === String)
                    datas = oldDatas[0] + "," + datas;
                else if (typeof(oldDatas) !== "undefined")
                {
                    for (i = 0; i < len; i++)
                        datas[i] = oldDatas[i] + "," + datas[i];
                }

                if (callback !== null)
                    callback(datas);
            });

            // Keep track of history
            localStorage[keynamesArray[0] + "_last_checked"] = now;
            if (historyLastChecked === 0)
            {
                localStorage[keynamesArray[0] + "_last_full_check"] = now;
                for (i = 0; i < len; i++)
                    localStorage[keynamesArray[i]] = ""; // don't merge with old data
            }

        } else
        {
            var datas = [];
            for (i = 0; i < len; i++)
            {
                var data = localStorage[keynamesArray[i]];
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
    };

    // Helper function for escaping API urls
    // from netflix-rate userscript
    this.escapeHTML = function(str) {
        return str.replace(/[&"<>]/g, function(m) {
            return {
                "&": "&amp;",
                '"': "&quot;",
                "<": "&lt;",
                ">": "&gt;"
            }[m];
        });
    };

    // from netflix-rate userscript
    this.addStyle = function(styleId, cssUrl)
    {
        if (!$('#' + styleId).length) {
            $("head").append("<link id='" + styleId + "' href='" + cssUrl + "' type='text/css' rel='stylesheet' />");
        }
    };

    // returns array of length two with the range (as integers); if part of range doesn't exist, set value to null
    this.parseYearRange = function(yearStr)
    {
        if ((yearStr === null) || (yearStr.trim() === ""))
            return [null, null];

        try
        {
            var years = [];

            if (yearStr.indexOf("-") !== -1)
            {
                var yearParts = yearStr.split("-");
                years = [parseInt(yearParts[0]), parseInt(yearParts[1])];
            } else
                years = [parseInt(yearStr), null];

        } catch (ex)
        {
            consolelog(ex);
            years = [null, null];
        }

        return years;
    };
};
extlib_.call(extlib);
