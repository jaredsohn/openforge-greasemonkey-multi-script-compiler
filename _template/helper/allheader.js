document_$START_OR_END_code = function() {

if (location.host === "dvd.netflix.com") {
  consolelog("DVD pages not supported");
  return; // do not affect dvd pages except for the search page
}

// Get /KidsMovie URLs to look nicer since its CSS is broken; we change some links to go there.
if (location.pathname.indexOf("/KidsMovie") === 0)
  $.each($(".boxShot-hd"), function() {this.classList.remove("boxShot-hd"); this.classList.add("boxShot-sd"); });

extlib.addStyle("fp_main_stylesheet", chrome.extension.getURL('../src/css/flixplus.css'));

// Make sure that page icon appears to show preferences
chrome.runtime.sendMessage({}, function(response) { });

var startTime = new Date();
var __debug_level = 0;
var __enabledScripts = {};
var defaultScripts = "$DEFAULT_SCRIPTS";

var loadEnabledScripts = function(profileName, defaultScripts, callback) {
  var keyname = "$EXTSHORTNAME " + profileName + " prefs";

  fplib.syncGet(keyname, function(items) {
    var allPrefs = items[keyname];
    if (typeof(allPrefs) === 'undefined') // do not set to defaults if it exists but has all scripts disabled
      allPrefs = defaultScripts;
    var enabledScripts = {};

    (allPrefs.split(",")).forEach(function(prefId) {
      enabledScripts[prefId] = "true";
    });

    callback(enabledScripts);
  });
};

function stackTrace() {
  console.log((new Error).stack);
}

function consolelogExt(msg) {
  consolelog(3, msg);
}
function consoleAllHeader(msg) {
  consolelog(1, msg);
}
function consolelog(level, msg) {
  // Levels:
  // -- -1 = force it to show even when messages are supressed
  // --  0 = no messages
  // --  1 = just high level messages (produced by compiler)
  // --  2 = less important messages (produced by compiler)
  // --  3 = all messages (produced by userscripts)
  if (level <= __debug_level)
    console.log(msg);
}

var main = function(callback) {
  __debug_level = localStorage["$EXTSHORTNAME debug_level"] || 0;

  var profileName = fplib.getProfileName();
  consolelog(1, "profile name is " + profileName);

  loadEnabledScripts(profileName, defaultScripts, function(enabledScriptsParam) {
    consoleAllHeader(enabledScriptsParam);
    __enabledScripts = enabledScriptsParam;

    var settingsLoadedTime = new Date();
    consolelog(1, 'settings loaded time = ' + (settingsLoadedTime - startTime) + 'ms');

    callback();
  });
};

runScripts = function()
{



