var currentTabId = -1;

var installTime = localStorage.getItem("install_time");
var installVersion = localStorage.getItem("install_version");

if (installTime === null)
{
    localStorage.setItem("install_time", new Date());
    localStorage.setItem("install_version", chrome.app.getDetails().version);

    chrome.tabs.create({ url: chrome.extension.getURL("src/welcome.html") });
}


// purpose: ensure that pageaction is shown and that we know the tab id.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    chrome.pageAction.show(sender.tab.id);
    currentTabId = sender.tab.id;

    sendResponse({});
});
