chrome.runtime.onInstalled.addListener(() => {
    // Initialize settings
    chrome.storage.local.set({
        hideShorts: false,
        blockShorts: false
    });
});

// Listen for tab updates to re-apply settings
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
        chrome.storage.local.get(['hideShorts', 'blockShorts'], (result) => {
            chrome.tabs.sendMessage(tabId, {
                type: "HIDE_SHORTS_TOGGLE",
                payload: result.hideShorts || false
            });
            chrome.tabs.sendMessage(tabId, {
                type: "BLOCK_SHORTS_TOGGLE",
                payload: result.blockShorts || false
            });
        });
    }
});