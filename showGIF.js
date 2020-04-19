var height, width;

console.log('showing gif');
console.log(gif_link);
var foundGIF = document.createElement("img");
foundGIF.src = gif_link;
foundGIF.setAttribute("class", "found-player-gif");
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

