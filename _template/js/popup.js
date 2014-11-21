window.onload = function()
{
	document.getElementById("webstore").addEventListener("click", goto_webstore);
	document.getElementById("feedback").addEventListener("click", goto_feedback);
	document.getElementById("more_info").addEventListener("click", goto_more_info);
	document.getElementById("options").addEventListener("click", goto_options);
	setTimeout(function() { document.getElementById("options").focus(); }, 100);
}

var goto_webstore = function()
{
	window.open("$WEBSTORE_URL");
}

var goto_feedback = function()
{
	window.open("$FEEDBACK_URL");
}

var goto_more_info = function()
{
	window.open("$MORE_INFO_URL");
}

var goto_options = function()
{
	window.open(chrome.extension.getURL("src/options.html"));
}