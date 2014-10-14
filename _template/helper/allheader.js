document_$START_OR_END_code = function() {

if ((location.host === "dvd.netflix.com") && location.pathname.indexOf("/Search") !== 0)
{
  consolelog("DVD pages not supported (except search)");
  return; // do not affect dvd pages except for the search page
}

// Make sure that page icon appears to show preferences
chrome.runtime.sendMessage({}, function(response) { });

var startTime = new Date();
var __debug_level = 0;
var enabled_scripts = {};
var default_scripts = "$DEFAULT_SCRIPTS";

load_enabled_scripts = function(profile_name, default_scripts, callback)
{
  consolelog("load_enabled_scripts");
  var keyname = "$EXTSHORTNAME " + profile_name + " prefs";
  consolelog(keyname);  
  var _callback = callback;

  fplib.syncGet(keyname, function(items)
  {
    consolelog("found prefs:");
    consolelog(items);
    //var all_prefs = localStorage["$EXTSHORTNAME " + profile_name + " prefs"];
    var all_prefs = items[keyname];
    if (typeof(all_prefs) === 'undefined')
      all_prefs = default_scripts;
    var enabled_scripts = {};
  
    var all_prefs_array = all_prefs.split(",");
    for (i = 0; i < all_prefs_array.length; i++)
    {
      if (all_prefs_array[i] !== "")
        enabled_scripts[all_prefs_array[i]] = "true";
    }
    consolelog(2, enabled_scripts);

    callback(enabled_scripts);
  });
}

function consolelog(msg)
{
    consolelog(0, msg);
}
function consolelog(level, msg)
{
    // Levels:
    // -- 0 = no messages
    // -- 1 = just high level messages (produced by compiler)
    // -- 2 = less important messages (produced by compiler)
    // -- 3 = all messages (produced by userscripts)

    if (level <= __debug_level)
        console.log(msg);
}

main = function(callback)
{
  __debug_level = localStorage["$EXTSHORTNAME debug_level"];
  if(typeof(__debug_level) === "undefined")
    __debug_level = 0;

  var profile_name = fplib.getProfileName();
  consolelog(1, "profile name is " + profile_name);

  consolelog(2,"Loading prefs");
  consolelog(default_scripts);
  load_enabled_scripts(profile_name, default_scripts, function(enabled_scripts_param)
  {
//    console.log("param = ");
    consolelog("enabled_scripts = ");
    consolelog(enabled_scripts_param);
    enabled_scripts = enabled_scripts_param;
    // extra code for getting scripts to work with each other
    if ((enabled_scripts === null) || (enabled_scripts["id_darker_netflix"]))
    {
      consolelog("changing css for extlib_button to match darker_netflix");
      extlib.addGlobalStyle('.extlib_button { background-color: #333333 !important ; color: #EEEEEE; !important  }');
      extlib.addGlobalStyle('.flix_plus_shownsectionbutton, .flix_plus_hiddensectionbutton, .flix_plus_scrolls_shown_button, .flix_plus_all_shown_button { -webkit-filter: invert(100%); }');

      // Added by jaredsohn-netflix so that 'kids' doesn't show up twice in menu
      if ((location.host === "dvd.netflix.com") && location.pathname.indexOf("/Search") === 0)
      {
        if ($(".kids a").length)
          $(".kids a")[0].innerText = ""; 
      }

    }
    var settings_loaded_time = new Date();
    consolelog(1, 'settings loaded time = ' + (settings_loaded_time-startTime) + 'ms');

    callback();
  });
}

run_scripts = function()
{



