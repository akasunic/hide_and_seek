// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });


// NOTE!!!! INSTEAD OF SENDING MESSAGE-- might decide to constantly check from background script. But that will put a lot of extra load on the game... 
// Maybe for now, keep it how it is
console.log('running background script');

chrome.runtime.onMessage.addListener(
    function(message) {
      if (message == 'showgif'){
      	console.log('running listener script')
        chrome.tabs.executeScript({
          file: 'showGIF.js'
        });
        // chrome.tabs.executeScript({
        //   file: 'src/showGIF.js'
        // });
      }
   });