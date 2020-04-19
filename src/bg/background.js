// NOTE!!!! INSTEAD OF SENDING MESSAGE-- might decide to constantly check from background script. But that will put a lot of extra load on the game... 
// Maybe for now, keep it how it is

//some help (maybe if works) from https://stackoverflow.com/questions/17567624/pass-a-parameter-to-a-content-script-injected-using-chrome-tabs-executescript
chrome.runtime.onMessage.addListener(
    function(message) {
      if (message.task == 'showgif'){
      	// console.log('should show gif');

      	var gif_link = message.link;
      	chrome.tabs.executeScript({
      	  code: 'var gif_link = ' + JSON.stringify(gif_link)
         }, function(){
         	chrome.tabs.executeScript({file:'showGIF.js'});
		});
      }
   });


