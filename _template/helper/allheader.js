document_$START_OR_END_code = function() {

if ((location.host === "dvd.netflix.com") && location.pathname.indexOf("/Search") !== 0)
{
    consolelog("DVD pages not supported (except search)");
    return; // do not affect dvd pages except for the search page
}

// Redirect WiAltGenre page to WiGenre
if (window.location.href.indexOf("WiGenre") !== -1) {
    document.removeChild(document.documentElement);
    window.location.href = window.location.href.replace("WiGenre", "WiAltGenre");
}

extlib.addStyle("fp_main_stylesheet", chrome.extension.getURL('../src/css/flixplus.css'));


// Make sure that page icon appears to show preferences
chrome.runtime.sendMessage({}, function(response) { });

var startTime = new Date();
var __debug_level = 0;
var __enabledScripts = {};
var defaultScripts = "$DEFAULT_SCRIPTS";

var loadEnabledScripts = function(profileName, defaultScripts, callback)
{
    consolelog("loadEnabledScripts");
    var keyname = "$EXTSHORTNAME " + profileName + " prefs";
    consolelog(keyname);
    var _callback = callback;

    fplib.syncGet(keyname, function(items)
    {
        consolelog("found prefs:");
        consolelog(items);
        //var all_prefs = localStorage["$EXTSHORTNAME " + profile_name + " prefs"];
        var allPrefs = items[keyname];
        if (typeof(allPrefs) === 'undefined')
            allPrefs = defaultScripts;
        var enabledScripts = {};

        var allPrefsArray = allPrefs.split(",");
        for (i = 0; i < allPrefsArray.length; i++)
        {
            if (allPrefsArray[i] !== "")
                enabledScripts[allPrefsArray[i]] = "true";
        }
        consolelog(2, enabledScripts);

        callback(enabledScripts);
    });
};

function stackTrace()
{
    console.log((new Error).stack);
}

function consolelog(msg)
{
    consolelog(0, msg);
}
function consolelog(level, msg)
{
    // Levels:
    // -- -1 = force it to show even when messages are supressed
    // --  0 = no messages
    // --  1 = just high level messages (produced by compiler)
    // --  2 = less important messages (produced by compiler)
    // --  3 = all messages (produced by userscripts)
    if (level <= __debug_level)
        console.log(msg);
}

main = function(callback)
{
    __debug_level = localStorage["$EXTSHORTNAME debug_level"];
    if (typeof(__debug_level) === "undefined")
        __debug_level = 0;

    var profileName = fplib.getProfileName();
    consolelog(1, "profile name is " + profileName);

    consolelog(2, "Loading prefs");
    consolelog(defaultScripts);
    loadEnabledScripts(profileName, defaultScripts, function(enabledScriptsParam)
    {
//    console.log("param = ");
        consolelog("__enabledScripts = ");
        consolelog(enabledScriptsParam);
        __enabledScripts = enabledScriptsParam;
        // extra code for getting scripts to work with each other
        if ((__enabledScripts === null) || (__enabledScripts["id_darker_netflix"]))
        {
            consolelog("changing css for extlib_button to match darker_netflix");
            extlib.addGlobalStyle('.extlib_button { background-color: #333333 !important ; color: #EEEEEE; !important  }');
            extlib.addGlobalStyle('.fp_button, .flix_plus_shownsectionbutton, .flix_plus_hiddensectionbutton, .flix_plus_scrolls_shown_button, .flix_plus_all_shown_button { -webkit-filter: invert(100%); }');

            // Added by jaredsohn-netflix so that 'kids' doesn't show up twice in menu
            if ((location.host === "dvd.netflix.com") && location.pathname.indexOf("/Search") === 0)
            {
                if ($(".kids a").length)
                    $(".kids a")[0].innerText = "";
            }

        }
        var settingsLoadedTime = new Date();
        consolelog(1, 'settings loaded time = ' + (settingsLoadedTime - startTime) + 'ms');

        callback();
    });
};

runScripts = function()
{



