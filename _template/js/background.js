var currentTabId = -1;

var installTime = localStorage.getItem("install_time");
var installVersion = localStorage.getItem("install_version");

if (installTime === null)
{
    localStorage.setItem("install_time", new Date());
    localStorage.setItem("install_version", chrome.app.getDetails().version);

    chrome.tabs.create({ url: chrome.extension.getURL("src/welcome.html") });
}

// Purpose: ensure that pageaction is shown and that we know the tab id.
//
// This also allows making http requests via the background page
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    var response = {};

    chrome.pageAction.show(sender.tab.id);
    currentTabId = sender.tab.id;

    if (typeof(request["request_type"]) !== "undefined")
    {
        if (request["request_type"] === "get")
        {
            $.get(request["url"], function(res) {
                response['data'] = res;
                sendResponse(response);
            });
        }
        return true; // Needed to get contentscript to wait for async sendResponse
    } else
    {
        sendResponse(response);
    }
});
