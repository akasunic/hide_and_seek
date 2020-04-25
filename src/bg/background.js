//Receive a message from browser_action.js with all the gifs to show for the current tab
//some help from https://stackoverflow.com/questions/17567624/pass-a-parameter-to-a-content-script-injected-using-chrome-tabs-executescript
chrome.runtime.onMessage.addListener(
    function(message) {
      if (message.task == 'showgif'){
      	// console.log('should show gif');
      	// console.log('received showgif message');

      	var gif_links = message.links;
      	chrome.tabs.executeScript({
      	  code: 'var gif_links = ' + JSON.stringify(gif_links)
         }, function(){
         	chrome.tabs.executeScript({file:'showGIF.js'});
		});
      }
   });


