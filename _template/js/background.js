var current_tab_id = -1;

var install_time = localStorage.getItem("install_time")
var install_version = localStorage.getItem("install_version")

if (install_time === null)
{
 	localStorage.setItem("install_time", new Date());
 	localStorage.setItem("install_version", chrome.app.getDetails().version);

    chrome.tabs.create({ url: chrome.extension.getURL("src/welcome.html") });
}


// purpose: ensure that pageaction is shown and that we know the tab id.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    chrome.pageAction.show(sender.tab.id);
    current_tab_id = sender.tab.id;

    sendResponse({});
});