// content-script.ts
let hideShorts = false;
let blockShorts = false;
let observerActive = false;
let isRedirecting = false; // Flag to prevent redirect loops
let redirectTimeout: number | null = null;

// Load saved settings
chrome.storage.local.get(['hideShorts', 'blockShorts'], (result) => {
    hideShorts = result.hideShorts || false;
    blockShorts = result.blockShorts || false;

    // Apply settings immediately
    if (hideShorts) hideShortsElements();
    if (blockShorts) blockShortsElements();

    // Start observing for dynamic content
    setupMutationObserver();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === "HIDE_SHORTS_TOGGLE") {
        hideShorts = message.payload;
        if (hideShorts) {
            hideShortsElements();
        } else {
            showShortsElements();
        }
        setupMutationObserver();
    } else if (message.type === "BLOCK_SHORTS_TOGGLE") {
        blockShorts = message.payload;
        if (blockShorts) {
            blockShortsElements();
        } else {
            unblockShortsElements();
        }
        setupMutationObserver();
    }

    // Send response to confirm receipt
    sendResponse({ success: true });
    return true;
});

// Function to safely handle redirects
function safeRedirect(url: string) {
    if (isRedirecting) return;
    
    isRedirecting = true;
    
    // Clear any existing timeout
    if (redirectTimeout !== null) {
        clearTimeout(redirectTimeout);
    }
    
    // Set a timeout to reset the redirect flag
    redirectTimeout = setTimeout(() => {
        isRedirecting = false;
        redirectTimeout = null;
    }, 2000) as unknown as number;
    
    // Perform the redirect
    window.location.replace(url);
}

// Function to hide shorts elements
function hideShortsElements() {
    // Hide shorts button in sidebar
    const sidebarButtons = document.querySelector('#items.style-scope.ytd-guide-section-renderer');
    Array.from(sidebarButtons?.children || []).forEach(button => {
        const title = button.querySelector('.title.style-scope.ytd-guide-entry-renderer');
        if (title && title.textContent?.includes('Shorts')) {
            (button as HTMLElement).style.display = 'none';
        }
    });

    // Hide shorts in home feed
    const shortsShelf = document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer');
    shortsShelf.forEach(shelf => {
        (shelf as HTMLElement).style.display = 'none';
    });

    // Hide shorts in search results and recommendations
    const videoItems = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');
    videoItems.forEach(item => {
        const link = item.querySelector('a#thumbnail');
        if (link && (link as HTMLAnchorElement).href && (link as HTMLAnchorElement).href.includes('/shorts/')) {
            (item as HTMLElement).style.display = 'none';
        }
    });

    // Hide shorts tab in channel pages
    const tab = document.querySelector('yt-tab-shape[tab-title="Shorts"]');
    if (tab?.textContent?.includes('Shorts')) {
        (tab as HTMLElement).style.display = 'none';
    }
}

// Function to restore shorts elements
function showShortsElements() {
    // Show shorts button in sidebar
    const sidebarButtons = document.querySelector('#items.style-scope.ytd-guide-section-renderer');
    Array.from(sidebarButtons?.children || []).forEach(button => {
        const title = button.querySelector('.title.style-scope.ytd-guide-entry-renderer');
        if (title && title.textContent?.includes('Shorts')) {
            (button as HTMLElement).style.display = '';
        }
    });

    // Show shorts in home feed
    const shortsShelf = document.querySelectorAll('ytd-rich-section-renderer, ytd-reel-shelf-renderer');
    shortsShelf.forEach(shelf => {
        (shelf as HTMLElement).style.display = '';
    });

    // Show shorts in search results and recommendations
    const videoItems = document.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer');
    videoItems.forEach(item => {
        const link = item.querySelector('a#thumbnail');
        if (link && (link as HTMLAnchorElement).href && (link as HTMLAnchorElement).href.includes('/shorts/')) {
            (item as HTMLElement).style.display = '';
        }
    });

    // Show shorts tab in channel pages
    const tab = document.querySelector('yt-tab-shape[tab-title="Shorts"]');
    if (tab?.textContent?.includes('Shorts')) {
        (tab as HTMLElement).style.display = '';
    }
}

// Function to block shorts pages
function blockShortsElements() {
    // If we're on a shorts page, redirect to homepage
    if (window.location.pathname.includes('/shorts/')) {
        safeRedirect('https://www.youtube.com/');
        return;
    }
    
    // Add overlay to Shorts buttons instead of removing them
    addShortsButtonOverlays();

    // Add click listener to catch shorts links
    document.addEventListener('click', interceptShortsClicks, true);
}

// Function to add overlays to shorts buttons to prevent clicks
function addShortsButtonOverlays() {
    // Block sidebar shorts button
    const sidebarButtons = document.querySelector('#items.style-scope.ytd-guide-section-renderer');
    if (sidebarButtons) {
        Array.from(sidebarButtons.children).forEach(button => {
            const title = button.querySelector('.title.style-scope.ytd-guide-entry-renderer');
            if (title && title.textContent?.includes('Shorts')) {
                // Don't modify display style, just prevent clicks
                if (!button.hasAttribute('data-shorts-blocked')) {
                    button.setAttribute('data-shorts-blocked', 'true');
                    
                    // Create an invisible overlay
                    const overlay = document.createElement('div');
                    overlay.style.position = 'absolute';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.zIndex = '9999';
                    overlay.style.cursor = 'not-allowed';
                    
                    // Make button position relative to host the overlay
                    if ((button as HTMLElement).style.position !== 'relative') {
                        (button as HTMLElement).style.position = 'relative';
                    }
                    
                    // Add the blocking click handler
                    overlay.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Blocked Shorts button click');
                        return false;
                    }, true);
                    
                    button.appendChild(overlay);
                }
            }
        });
    }
}

// Function to remove overlays from shorts buttons
function removeShortsButtonOverlays() {
    // Remove overlays from sidebar shorts buttons
    const blockedButtons = document.querySelectorAll('[data-shorts-blocked="true"]');
    blockedButtons.forEach(button => {
        button.removeAttribute('data-shorts-blocked');
        
        // Remove the overlay
        const overlay = button.querySelector('div[style*="position: absolute"]');
        if (overlay) {
            button.removeChild(overlay);
        }
        
        // Reset position if needed
        (button as HTMLElement).style.position = '';
    });
}

// Function to unblock shorts pages
function unblockShortsElements() {
    // Remove the click interceptor
    document.removeEventListener('click', interceptShortsClicks, true);
    
    // Remove button overlays
    removeShortsButtonOverlays();
    
    // Reset redirect flag and clear timeout
    isRedirecting = false;
    if (redirectTimeout !== null) {
        clearTimeout(redirectTimeout);
        redirectTimeout = null;
    }
}

// Function to intercept clicks on shorts links
function interceptShortsClicks(e: MouseEvent) {
    const target = (e.target as HTMLElement).closest('a');
    if (target && (target as HTMLAnchorElement).href && 
        ((target as HTMLAnchorElement).href.includes('/shorts/') || 
         (target as HTMLAnchorElement).href.match(/youtube\.com\/shorts\/?/))) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Blocked navigation to shorts!');
        return false;
    }
}

// Setup mutation observer to handle dynamically loaded content
function setupMutationObserver() {
    if (observerActive) return;

    observerActive = true;
    let pendingChanges = false;

    const observer = new MutationObserver(() => {
        // Debounce the changes to avoid excessive processing
        if (!pendingChanges) {
            pendingChanges = true;
            
            setTimeout(() => {
                processChanges();
                pendingChanges = false;
            }, 100);
        }
    });

    function processChanges() {
        if (hideShorts) hideShortsElements();
        
        // Handle shorts blocking for dynamic content
        if (blockShorts) {
            // Check for new buttons that might need overlays
            addShortsButtonOverlays();
            
            // Check if we're on shorts and need to redirect
            if (window.location.pathname.includes('/shorts/')) {
                safeRedirect('https://www.youtube.com/');
            }
        }
    }

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initial run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (hideShorts) hideShortsElements();
        if (blockShorts) blockShortsElements();
        setupMutationObserver();
    });
} else {
    if (hideShorts) hideShortsElements();
    if (blockShorts) blockShortsElements();
    setupMutationObserver();
}