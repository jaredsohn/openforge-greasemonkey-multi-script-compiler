// Written by Jared Sohn / Lifehacker for Flix Plus.
//
// Functions in this class should not be specific to Netflix.
//
// License: MIT/GPL.  Some of the code may have come from userscripts used in Flix Plus, but it likely
// originated from Stackoverflow

var extlib = extlib || {};
var extlib_ = function() {
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

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Mouse events
  //////////////////////////////////////////////////////////////////////////////////////////////////

  this.simulateEvent = function(elem, event) {
    if ((event === "mouseover") && ((elem || null) !== null))
      elem = elem.getElementsByTagName("a")[0];

    if ((document.createEvent) && ((elem || null) !== null)) {
      var e = document.createEvent("MouseEvents");

      e.initMouseEvent(event, true, true, window,
      0, 0, 0, 80, 20, false, false, false, false, 0, null);

      elem.dispatchEvent(e);
    }
  };

  this.simulateClick = function(elem) {
    if (elem) {
      this.simulateEvent(elem, "mouseover");
      this.simulateEvent(elem, "click");
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Utils
  //////////////////////////////////////////////////////////////////////////////////////////////////

  // From http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
  this.isElementInViewport = function(el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
  }

  // Adapted to ignore vertical component
  this.isElementInViewportHorizontal = function(el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
      rect.left >= 0 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
  }

  // from Stackoverflow
  this.stackTrace = function() {
    consolelog((new Error).stack);
  };

  function consolelog(msg) {
    if ((localStorage["extlib debug"] || null) !== null)
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
  // keyNames is an array.  Only the first keyname will be used with last_full_check and _last_checked but
  // it will otherwise work with data for all keys.  The callback passes back an array with data corresponding to
  // each keyname.
  //
  // This code was written for Flix Plus by Lifehacker
  this.checkForNewData = function(keyNames, waitInS, fullWaitInS, ajaxCall, callback, doneCallback) {
    consolelog("checkForNewData keyNames = ");
    consolelog(keyNames);

    var now = new Date().getTime();

    var lastFullCheck = localStorage[keyNames[0] + "_last_full_check"] || 0;
    var historyLastChecked = localStorage[keyNames[0] + "_last_checked"] || 0;

    if (historyLastChecked === 0) {
      keyNames.forEach(function(keyName) {
        delete localStorage[keyName];
      });
    }

    var oldDatas = [];
    keyNames.forEach(function(keyName) {
      oldDatas.push(localStorage[keyName] || "");
    });

   function finishCheckForNewData() {
      var longEnoughSinceUpdate = new Date(parseInt(historyLastChecked)).getTime() + (waitInS * 1000);
      var longEnoughSinceFullUpdate = new Date(parseInt(lastFullCheck)).getTime() + (fullWaitInS * 1000);

      if (longEnoughSinceFullUpdate < now) {
        for (i = 0; i < keyNames.length; i++)
          consolelog("getting all data from scratch again for " + keyNames[i]);
        historyLastChecked = 0;
      }

      if (Math.min(longEnoughSinceUpdate, longEnoughSinceFullUpdate) < now) {
        //consolelog("requesting new data");

        if (historyLastChecked === 0) {
          for (i = 0; i < keyNames.length; i++)
            localStorage[keyNames[i]] = ""; // don't merge with old data
        }

        ajaxCall(historyLastChecked, function(datas) {
          // Append the data and act on it
          if ((oldDatas || null) !== null) {
            for (var i = 0; i < keyNames.length; i++) {
              datas[i] = oldDatas[i] + "," + datas[i];
              if (datas[i][0] === ",")
                datas[i] = datas[i].substring(1);
            }
          }

          //consolelog("ajax done - datas2");
          //consolelog(datas);

          // Keep track of history (after we have stored the data in localstorage)
          localStorage[keyNames[0] + "_last_checked"] = now;
          if (historyLastChecked === 0)
            localStorage[keyNames[0] + "_last_full_check"] = now;

          if (callback !== null)
            callback(datas, doneCallback);
          else if (doneCallback !== null)
            doneCallback();
        });
      } else {
        //consolelog("for last callback");
        //consolelog(keyNames);

        var datas = [];
        for (var i = 0; i < keyNames.length; i++)
          datas.push(localStorage[keyNames[i]] || "");

        if (callback !== null)
          callback(datas, doneCallback);
        else if (doneCallback !== null)
          doneCallback();
      }
    }

    // Return the data we have now.  We may need to update and return the data again later.
    //console.log("returning data that was stored before");
    if (callback !== null)
      callback(oldDatas, finishCheckForNewData);
    else {
      finishCheckForNewData();
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
  this.addStyle = function(styleId, cssUrl) {
    if (!$('#' + styleId).length) {
      $("head").append("<link id='" + styleId + "' href='" + cssUrl + "' type='text/css' rel='stylesheet' />");
    }
  };

  // returns array of length two with the range (as integers); if part of range doesn't exist, set value to null
  this.parseYearRange = function(yearStr) {
    if ((yearStr || null) === null)
      return [null, null];

    try {
      var years = [];

      if (yearStr.indexOf("-") !== -1) {
        var yearParts = yearStr.split("-");
        years = [parseInt(yearParts[0]), parseInt(yearParts[1])];
      } else
        years = [parseInt(yearStr), null];

    } catch (ex) {
      consolelog(ex);
      years = [null, null];
    }

    return years;
  };

  // Also note that the id is actually a string used within the button and command.
  this.createButton = function(uniqueClassName, label, isDark, clickHandler) {
    if (uniqueClassName.indexOf(" ") !== -1) {
      console.error("uniqueClassName should not include any spaces");
      return null;
    }

    var exportButton = document.createElement("a");
    exportButton.setAttribute("href", '#');
    exportButton.appendChild(document.createTextNode(label));
    exportButton.classList.add("extlib_button");
    exportButton.classList.add(uniqueClassName);
    if (isDark)
      exportButton.classList.add("extlib_button_dark");

    exportButton.addEventListener("click", clickHandler);

    return exportButton;
  };

  // from stackoverflow
  this.saveData = (function() {
    var a = document.createElement("a");
    var appended = false;
    a.style = "display: none";
    return function(data, fileName) {
      if (!appended) {
        document.body.appendChild(a);
        appended = true;
      }

      var json = JSON.stringify(data),
        blob = new Blob([json], {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    };
  }());
};
extlib_.call(extlib);
