console.log('script in main folder running');
var sampleGIF = document.createElement("img");
sampleGIF.src = "https://www.google.com/imgres?imgurl=https%3A%2F%2Fimage.shutterstock.com%2Fimage-vector%2Fsample-stamp-grunge-texture-vector-260nw-1389188336.jpg&imgrefurl=https%3A%2F%2Fwww.shutterstock.com%2Fsearch%2Fsample&tbnid=Y_YW6-EhP5GqrM&vet=12ahUKEwi3x-u6v-joAhVuRDABHee5CMIQMygAegUIARDuAQ..i&docid=uebZI0kak767YM&w=520&h=280&q=sample%20image&ved=2ahUKEwi3x-u6v-joAhVuRDABHee5CMIQMygAegUIARDuAQ";
sampleGIF.id = "sampleGIF";
sampleGIF.style.position = "fixed";
sampleGIF.style.top = 0;
sampleGIF.style.left = 0;
document.querySelector('body').appendChild(sampleGIF);