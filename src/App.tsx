import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [hideShorts, setHideShorts] = useState(false);
  const [blockShorts, setBlockShorts] = useState(false);

  // Load saved settings on popup open
  useEffect(() => {
    chrome.storage.local.get(['hideShorts', 'blockShorts'], (result) => {
      setHideShorts(result.hideShorts || false);
      setBlockShorts(result.blockShorts || false);
    });
  }, []);

  useEffect(() => {
    // When the toggle state changes, save it and send to content script
    chrome.storage.local.set({ hideShorts });
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id)
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: "HIDE_SHORTS_TOGGLE", 
          payload: hideShorts 
        });
    });
  }, [hideShorts])

  useEffect(() => {
    // When the toggle state changes, save it and send to content script
    chrome.storage.local.set({ blockShorts });
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id)
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: "BLOCK_SHORTS_TOGGLE", 
          payload: blockShorts 
        });
    });
  }, [blockShorts])

  return (
    <>
      <h1>YouTube Shorts Blocker</h1>

      <div className="buttons-container">
        <div className="button-container">
          <button
            className={`toggle-btn ${hideShorts ? 'toggled' : ''}`}
            onClick={() => setHideShorts(!hideShorts)}
          >
            <div className='thumb'></div>
          </button>

          <span>Hide shorts</span>
        </div>

        <div className="button-container">
          <button
            className={`toggle-btn ${blockShorts ? 'toggled' : ''}`}
            onClick={() => setBlockShorts(!blockShorts)}
          >
            <div className='thumb'></div>
          </button>

          <span>Block shorts</span>
        </div>
      </div>
    </>
  )
}

export default App