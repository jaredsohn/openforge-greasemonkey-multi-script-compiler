var scriptsData_ = $SCRIPTS_JSON;

var profileName_ = "_unknown";
var keyName_ = "flix_plus " + profileName_ + " prefs";
var defaults_ = "$DEFAULT_SCRIPTS";
var keyboardShortcutsHelp_ = "";
var storageIsDefaults_ = false;
//console.log(scriptsData_.categories);

var initConfig = function(enabledScripts) {
  var enabledScriptsNull = false;

  console.log("enabledscripts on load");
  console.log(enabledScripts);

  if ((enabledScripts || null) === null) {
    enabledScriptsNull = true;
    enabledScripts = {};
  }

  //console.log("savedState_ = ");
  //console.log(savedState_);

  var scriptListNode = document.getElementById("script_list");
  //console.log("scriptListNode = ");
  //console.log(scriptListNode);

  // sort scriptsData_ based on the order attribute
  var keys = Object.keys(scriptsData_.userscripts);
  keys.sort(function(a, b) {
    return parseInt(scriptsData_.userscripts[a].order) -
           parseInt(scriptsData_.userscripts[b].order)
  });

  scriptsData_.categories.forEach(function(category) {
    var sectionNode = document.createElement("section");
    var h3Node = document.createElement("h3");
    h3Node.innerHTML = category;
    sectionNode.appendChild(h3Node);
    var brNode = document.createElement("br");
    sectionNode.appendChild(brNode);
    scriptListNode.appendChild(sectionNode);
    brNode = document.createElement("br");
    scriptListNode.appendChild(brNode);

    for (var keyIndex_ = 0; keyIndex_ < keys.length; keyIndex_++) {
      var key = keys[keyIndex_];
      if (scriptsData_.userscripts[keys[keyIndex_]].category === category) {
        var label = document.createElement("label");
        label.htmlFor = key;
        sectionNode.appendChild(label);

        var checkboxNode = document.createElement("input");
        checkboxNode.type = "CHECKBOX";
        checkboxNode.id = key;
        checkboxNode.className = "script_entry";
        if ((scriptsData_.userscripts[keys[keyIndex_]].functionalityDisabled || "") ===  "TRUE")
          checkboxNode.disabled = true;
        checkboxNode.addEventListener("change", onChecked);

        label.appendChild(checkboxNode);
        var str = scriptsData_.userscripts[keys[keyIndex_]].name;
//              var str = key + ": " + scriptsData_.userscripts[key].name;
        if ((scriptsData_.userscripts[keys[keyIndex_]].functionalityDisabled || "") ===  "TRUE")
          label.classList.add("option_disabled");
        label.appendChild(document.createTextNode(str));

        var iSpan = document.createElement('span');
        iSpan.className = "help_button";
        iSpan.appendChild(document.createTextNode(" (show)"));
        label.appendChild(iSpan);

        if (scriptsData_.userscripts[keys[keyIndex_]].configure.toUpperCase() !== "FALSE") {
          var iSpan = document.createElement('span');
          iSpan.className = "configure_button";
          $(iSpan).attr("data-filename", scriptsData_.userscripts[keys[keyIndex_]].configure);
          iSpan.appendChild(document.createTextNode(" (configure)"));
          sectionNode.appendChild(iSpan);
        }

        var br = document.createElement('br');
        sectionNode.appendChild(br);

        if (enabledScriptsNull)
          checkboxNode.checked = true;
        else if (enabledScripts.hasOwnProperty(key))
          checkboxNode.checked = !(enabledScripts[key] === "false");
        else
          checkboxNode.checked = false;
      }
    }
  });
  document.getElementById("check_all").addEventListener("click", onCheckAll);
  document.getElementById("uncheck_all").addEventListener("click", onUncheckAll);
  document.getElementById("restore_defaults").addEventListener("click", onRestoreDefaults);

  document.getElementById("save").addEventListener("click", onSave);
  var configureButtons = document.getElementsByClassName("configure_button");
  for (var i = 0; i < configureButtons.length; i++)
    configureButtons[i].addEventListener("click", onConfigure);

  document.body.onmouseover = function(e) {
    var previewImage = document.getElementById("preview_image");
    if ((e.target.nodeName == "SPAN" && e.target.parentNode.nodeName == "LABEL")) {
      if (e.target.innerText === " (show)") {
        var scriptInfo = scriptsData_.userscripts[[e.target.parentNode.firstChild.id]];
        //console.log(scriptInfo);
        previewImage.src = scriptInfo.screenshot;
        document.getElementById("feature_name").textContent = e.target.parentNode.childNodes[1].textContent;

        var desc = scriptInfo.description.replace("$KEYBOARD_SHORTCUTS_HELP", keyboardShortcutsHelp_);
        if ((scriptInfo.functionalityDisabled || "") ===  "TRUE")
          desc += "<br><br>This functionality is disabled since it still needs to be updated for Netflix's June 2015 update.";
        document.getElementById("feature_desc").innerHTML = desc;

        if (scriptInfo.author_url !== "")
          document.getElementById("author_credit").innerHTML = "Script by <a href='" + scriptInfo.author_url + "'>" + scriptInfo.author + "</a>";
        else
          document.getElementById("author_credit").innerHTML = "Script by " + scriptInfo.author;
      }
    }
  };

  window.onresize = function(event) {
    document.getElementById("column2").style.width = (window.innerWidth - $("#column1")[0].offsetWidth - $(".sideBar")[0].offsetWidth - 60 - $("#column2")[0].style.marginRight) + "px";
  };

  document.getElementById("column2").style.width = (window.innerWidth - $("#column1")[0].offsetWidth - $(".sideBar")[0].offsetWidth - 60 - $("#column2")[0].style.marginRight) + "px";
};

var onConfigure = function(e) {
  console.log("configure!");
  console.log(e);
  window.open(e.target.getAttribute("data-filename"));
};

var onChecked = function() {
  console.log("onchecked!");
  storageIsDefaults_ = false;
};

var onCheckAll = function() {
  [].slice.call(document.getElementsByClassName("script_entry")).forEach(function(elem) {
    elem.checked = true;
  });
  storageIsDefaults_ = false;
};

var onUncheckAll = function() {
  [].slice.call(document.getElementsByClassName("script_entry")).forEach(function(elem) {
    elem.checked = false;
  });
  storageIsDefaults_ = false;
};

var onRestoreDefaults = function() {
  $("#script_list")[0].innerHTML = "";
  initUiForPrefs(defaults_);
  storageIsDefaults_ = true;
};

var onSave = function() {
  if (storageIsDefaults_) {
    chrome.storage.sync.remove(keyName_, function(items) {
      console.log("preferences stored as 'use default'");
      window.close();

      // Force reload.
      chrome.tabs.reload(tabId_);
    });
  } else {
    var enabledScripts = {};
    var enabledScriptsArray = [];

    [].slice.call(document.getElementsByClassName("script_entry")).forEach(function(elem) {
      if (elem.checked)
        enabledScriptsArray.push(elem.id);

      enabledScripts[elem.id] = elem.checked.toString();
    });
    console.log("writing...");
    console.log(enabledScripts);

    var enabledScriptsStr = enabledScriptsArray.toString();
    console.log(enabledScriptsStr);

    var obj = {};
    obj[keyName_] = enabledScriptsStr;
    chrome.storage.sync.set(obj, function() {
      console.log("preferences stored");

      window.close();

      // Force reload.  Chrome only.
      chrome.tabs.reload(tabId_);
    });
  }
};

var initUiForPrefs = function(allPrefs) {
  var enabledScripts = {};
  var allPrefsArray = allPrefs.split(",");
  for (var i = 0; i < allPrefsArray.length; i++) {
    if (allPrefsArray[i] !== "")
      enabledScripts[allPrefsArray[i]] = "true";
  }
  console.log("enabledScripts = ");
  console.log(enabledScripts);
  initConfig(enabledScripts);
}

var loadSettings = function() {
  chrome.storage.sync.get(keyName_, function(items) {
    console.log("loaded:");
    console.log(items);
    storageIsDefaults_ = (typeof(items[keyName_]) === "undefined");
    var allPrefs = storageIsDefaults_ ? defaults_ : items[keyName_];

    initUiForPrefs(allPrefs);
  });

  keyboardShortcutsInfo.loadShortcutKeys("flix_plus " + profileName_ + " keyboard_shortcuts", function(keyboardShortcutToIdDict, keyboardIdToShortcutDict) {
    keyboardShortcutsHelp_ = keyboardShortcutsInfo.getHelpText(keyboardIdToShortcutDict, "all");
    console.log(keyboardShortcutsHelp_);
  });
}

//// Actually do stuff /////
chrome.storage.local.get("flix_plus profilename", function(items) {
  var profileName = items["flix_plus profilename"];

  if ((profileName || null) === null) {
    document.getElementById("column1-wrap").style.display = "none";
    document.getElementById("column2").style.display = "none";
    document.getElementById("instructions").innerHTML = "<BR><BR><BR><B>" +
      "You must log in to Netflix prior to setting preferences.<br><br><br>" +
      "If you just installed, you may need to reload the Netflix Instant " +
      "homepage so that the active Netflix profile can be detected.<br><br>" +
      "<br>If after doing this you still get this message, try switching " +
      "Netflix profiles or disable " +
      "<a href='https://www.netflix.com/DoNotTest?fullpage=true'>Netflix test" +
      "participation</a>.</B><BR><BR>";
    return;
  }
  console.log("profile name is " + profileName);
  profileName_ = profileName;
  $("#profilename")[0].innerHTML = "for profile " + profileName_;


  keyName_ = "flix_plus " + profileName + " prefs";

  // We want the tab id so that we can refresh the window that launched this
  var bg = chrome.extension.getBackgroundPage();
  tabId_ = bg.currentTabId;

  loadSettings();
});
