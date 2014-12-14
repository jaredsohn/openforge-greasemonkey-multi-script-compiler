var scripts_data = $SCRIPTS_JSON;

var profile_name = "_unknown";
var KEY_NAME = "flix_plus " + profile_name + " prefs"; // Note: even though in all caps, this is a 'constant' that is initialized later on
var defaults = "$DEFAULT_SCRIPTS";
var _keyboard_shortcuts_help = "";
//console.log(scripts_data.categories);

init_config = function(saved_state)
{
	var saved_state_null = false;
	
	if (saved_state === null)
		saved_state_null = true;
    if (typeof(saved_state) === "undefined")
        saved_state = {};

    //console.log("saved_state = ");
    //console.log(saved_state);

	var script_list = document.getElementById("script_list");
	//console.log("scriptlist = ");
	//console.log(script_list);


	// sort scripts_data based on the order attribute
	var keys = Object.keys(scripts_data.userscripts);
	keys.sort(function(a,b) { return parseInt(scripts_data.userscripts[a].order) -  parseInt(scripts_data.userscripts[b].order) });

	for (var category_index = 0; category_index < scripts_data.categories.length; category_index++)
	{
		var category = scripts_data.categories[category_index];
		//console.log(category);

		var section_node = document.createElement("section");
		var h3_node = document.createElement("h3");
		h3_node.innerHTML = category;
		section_node.appendChild(h3_node);
		script_list.appendChild(section_node);


		for (var key_index = 0; key_index < keys.length; key_index++)
		{
			var key = keys[key_index];
			if (scripts_data.userscripts[keys[key_index]].category === category)
			{
				var label = document.createElement("label");
				label.htmlFor = key;	
				section_node.appendChild(label);

				var checkbox_node = document.createElement("input");
				checkbox_node.type = "CHECKBOX";
				checkbox_node.id = key;
				checkbox_node.className = "script_entry";
				label.appendChild(checkbox_node);
				var str = scripts_data.userscripts[keys[key_index]].name;
//				var str = key + ": " + scripts_data.userscripts[key].name;
				label.appendChild(document.createTextNode(str));

				var iSpan = document.createElement('span');
				iSpan.style.color = "#999";
				iSpan.style.cursor = "help";
				iSpan.appendChild(document.createTextNode(" (show)"));
				label.appendChild(iSpan);

				if (scripts_data.userscripts[keys[key_index]].configure.toUpperCase() !== "FALSE")
				{
					var iSpan = document.createElement('span');
					iSpan.style.color = "#999";
					iSpan.style.cursor = "pointer";
					iSpan.className = "configure_button";
					$(iSpan).attr("data-filename", scripts_data.userscripts[keys[key_index]].configure);
					iSpan.appendChild(document.createTextNode(" (configure)"));
					section_node.appendChild(iSpan);
				}

				var br = document.createElement('br');
				section_node.appendChild(br);

				if (saved_state_null)
					checkbox_node.checked = true;
				else if (saved_state.hasOwnProperty(key))
					checkbox_node.checked = !(saved_state[key] === "false");
				else
					checkbox_node.checked = false;
			}
		}
	}
	document.getElementById("check_all").addEventListener("click", on_check_all);
	document.getElementById("uncheck_all").addEventListener("click", on_uncheck_all);
	document.getElementById("save").addEventListener("click", on_save);
	var configure_buttons = document.getElementsByClassName("configure_button");
	for (i = 0; i < configure_buttons.length; i++)
		configure_buttons[i].addEventListener("click", on_configure);

	document.body.onmouseover = function (e) {
		var preview_image = document.getElementById("preview_image");
		if ((e.target.nodeName == "SPAN" && e.target.parentNode.nodeName == "LABEL"))
		{
			if (e.target.innerText === " (show)")
			{
	            var script_info = scripts_data.userscripts[[e.target.parentNode.firstChild.id]];
	            //console.log(script_info);
	            preview_image.src = script_info.screenshot;
	            document.getElementById("feature_name").textContent = e.target.parentNode.childNodes[1].textContent;
				document.getElementById("feature_desc").innerHTML = script_info.description.replace("$KEYBOARD_SHORTCUTS_HELP", _keyboard_shortcuts_help);

	            if (script_info.author_url !== "")
	            	document.getElementById("author_credit").innerHTML = "Script by <a href='" + script_info.author_url + "'>" + script_info.author + "</a>";
	            else
	            	document.getElementById("author_credit").innerHTML = "Script by " + script_info.author;
	        }
		}
	};

    window.onresize = function(event) {
        document.getElementById("column2").style.width = (window.innerWidth - 600) + "px";
    };

    document.getElementById("column2").style.width = (window.innerWidth - 600) + "px";  
}

var on_configure = function(e)
{
	console.log("configure!");
	console.log(e);
	window.open(e.target.getAttribute("data-filename"));
}

var on_check_all = function()
{
	var elements = document.getElementsByClassName("script_entry");
	var i;
	for (i = 0; i < elements.length; i++)
	{
		elements[i].checked = true;
	}
};

var on_uncheck_all = function()
{
	var elements = document.getElementsByClassName("script_entry");
	var i;
	for (i = 0; i < elements.length; i++)
	{
		elements[i].checked = false;
	}
};

var on_save = function()
{
	var elements = document.getElementsByClassName("script_entry");
    //console.log(elements);

    var enabled_scripts = {};
    var enabled_scripts_array = [];
	for (i = 0; i < elements.length; i++)
	{
        //console.log(i);
        //console.log(enabled_scripts_array);
        if (elements[i].checked === true)
        {
            enabled_scripts_array.push(elements[i].id);
        }

        enabled_scripts[elements[i].id] = elements[i].checked.toString();
	}

    var enabled_scripts_str = enabled_scripts_array.toString();
    console.log(enabled_scripts_str);

    //var prefs_key = "reed prefs";
    //var obj = {};
    //obj[prefs_key] = enabled_scripts_str;

//console.log("KEY_NAME: ");
//console.log(KEY_NAME);
	var obj = {};
	obj[KEY_NAME] = enabled_scripts_str;
	chrome.storage.sync.set(obj, function() 
	{
		console.log("preferences stored");
	
		window.close();

		// Force reload.  Chrome only.
		chrome.tabs.reload(_tabId);
	});
}


//// Actually do stuff /////
chrome.storage.local.get("flix_plus profilename", function(items)
{
	var profile_name = items["flix_plus profilename"];

	if (typeof(profile_name) === "undefined")
	{
		document.getElementById("column1-wrap").style.display = "none";
		document.getElementById("column2").style.display = "none";
		document.getElementById("instructions").innerHTML = "<BR><BR><BR><B>You must log in to Netflix prior to setting preferences.<br><br><br>If you just installed, you may need to reload the Netflix Instant homepage so that the active Netflix profile can be detected.<br><br><br>If after doing this you still get this message, try switching Netflix profiles.</B><BR><BR>";
		return;
	}
	console.log("profile name is " + profile_name);


	KEY_NAME = "flix_plus " + profile_name + " prefs";

	// We want the tab id so that we can refresh the window that launched this
	var bg = chrome.extension.getBackgroundPage();
	_tabId = bg.current_tab_id;

	chrome.storage.sync.get(KEY_NAME, function(items)
	{
		//var all_prefs = localStorage["$EXTSHORTNAME " + profile_name + " prefs"];
		var all_prefs = items[KEY_NAME];
		if (typeof(all_prefs) === 'undefined')
			all_prefs = defaults;

		var enabled_scripts = {};
		var all_prefs_array = all_prefs.split(",");
		for (i = 0; i < all_prefs_array.length; i++)
		{
		  if (all_prefs_array[i] !== "")
		    enabled_scripts[all_prefs_array[i]] = "true";
		}
		//console.log("enabled_scripts = ");
		//console.log(enabled_scripts);
		init_config(enabled_scripts);
	});

	keyboard_shortcuts_info.load_shortcut_keys("flix_plus " + profile_name + " keyboard_shortcuts", function(keyboard_shortcut_to_id_dict, keyboard_id_to_shortcut_dict)
	{
	    _keyboard_shortcuts_help = keyboard_shortcuts_info.get_help_text(keyboard_id_to_shortcut_dict, true);
	    console.log(_keyboard_shortcuts_help);
	});
});
