//SAMPLE FILE SHOULD BE IDENTICAL BUT SHOULDNT INCLUDE SECRET KEY
console.log('script in main folder running');
var sampleGIF = document.createElement("img");
sampleGIF.src = "https://media.giphy.com/media/eh7nOwlu16eq7mXd0b/source.gif";
sampleGIF.id = "sampleGIF";
sampleGIF.style.position = "fixed";
sampleGIF.style.top = "0px";
sampleGIF.style.left = "0px";



document.querySelector('body').appendChild(sampleGIF);




sampleGIF.onload= function(){


	var height = sampleGIF.height;
	var width = sampleGIF.width;


// Will execute myCallback every 0.5 seconds 
	var intervalID = window.setInterval(myCallback, 1000);

function myCallback() {
	// console.log('callback');
 	sampleGIF.style.left = (Math.floor(Math.random()*(window.innerWidth-width))).toString() + "px";
 	sampleGIF.style.top = (Math.floor(Math.random()*(window.innerHeight-height))).toString() + "px";
//  	console.log("width = ", width, ". height = ", height);
//  	console.log("width is ", sampleGIF.style.left);
//  	console.log("height is ", sampleGIF.style.top);
}
};


