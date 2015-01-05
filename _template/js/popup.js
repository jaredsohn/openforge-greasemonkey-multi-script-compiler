window.onload = function()
{
    document.getElementById("webstore").addEventListener("click", gotoWebstore);
    document.getElementById("feedback").addEventListener("click", gotoFeedback);
    document.getElementById("more_info").addEventListener("click", gotoMoreInfo);
    document.getElementById("options").addEventListener("click", gotoOptions);
    setTimeout(function() { document.getElementById("options").focus(); }, 100);
};

var gotoWebstore = function()
{
    window.open("$WEBSTORE_URL");
};

var gotoFeedback = function()
{
    window.open("$FEEDBACK_URL");
};

var gotoMoreInfo = function()
{
    window.open("$MORE_INFO_URL");
};

var gotoOptions = function()
{
    window.open(chrome.extension.getURL("src/options.html"));
};
