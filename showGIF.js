//Note that the gif_links variable already sent through background.js message script
//need to make sure not already showing a gif
//also trying to protect against multiple players choosing same site-- so, show multiple gifs
var gif_html = document.querySelectorAll(".foundGIF");
if(gif_html.length == 0){
	for(var g=0; g<gif_links.length; g++){
		showTheGif(gif_links[g]);
	}
}

function showTheGif(gif_link){
	var foundGIF = document.createElement("img");
	foundGIF.src = gif_link;
	foundGIF.setAttribute("class", "foundGIF");
	// foundGIF.id = "sampleGIF";
	foundGIF.style.position = "fixed";
	foundGIF.style.top = "0px";
	foundGIF.style.left = "0px";
	document.querySelector('body').appendChild(foundGIF);
	foundGIF.onload= function(){

		height = foundGIF.height;	
		width = foundGIF.width;

	// Will execute myCallback every 0.5 seconds 
		var intervalID = window.setInterval(myCallback, 1000);
	}

	function myCallback() {
		// console.log('callback');
	 	foundGIF.style.left = (Math.floor(Math.random()*(window.innerWidth-width))).toString() + "px";
	 	foundGIF.style.top = (Math.floor(Math.random()*(window.innerHeight-height))).toString() + "px";
	}
}
