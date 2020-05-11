var gameCode, yourName, yourSite, hangoutLink, yourClue, gameDomain;
var currCode, currHangout, currName, currSite, currClue;
//event listener booleans... false indicates does not have event listener attached currently
var showStartEvent = false;
var showJoinEvent = false;
var joinEvent = false;
var createEvent = false;
var searchEvent = false;
var leaveEvent = false;
var endEvent = false;
var keyUpEvent = false;
var clueCountKeyEvent = false;
var editClueEvent = false;
var updateClueEvent = false;
var endEvent = false;
var maxClueChars = 700;
var thresholdClueChars = 100;
var maxPlayers = 20; //change this later if you want

//these are the site domains in which players are allowed to play
var domains = ['yt', 'wk', 'rd', 'ig', 'am', 'nf', 'wc'];

//don't run until window loaded to accurately access dom

window.onload = function() {


    //thanks to trick from https://stackoverflow.com/questions/2315863/does-onbeforeunload-event-trigger-for-popup-html-in-a-google-chrome-extension
    var background = chrome.extension.getBackgroundPage();
    var codeDom = document.querySelector('#joinCode');
    var hangoutDom = document.querySelector('#hangout');
    var nameDom = document.querySelector('#name');
    var siteDom = document.querySelector('#site');
    var clueDom = document.querySelector('#clue');
    var gifSearchDom = document.querySelector('#gif_search');

    var formInputsDict = {'currCode': codeDom, 'currHangout': hangoutDom, 'currName': nameDom, 'currSite': siteDom, 'currClue': clueDom, 'currGifSearch': gifSearchDom};
    updateFormMemory(); //always do this
    function addBlur(domEl, keyName){ //every time leave focus event on form, update the value for that particular input (in storage)
        domEl.addEventListener("blur", function(event){
            var val = domEl.value;
            chrome.storage.sync.set({
                [keyName]: val
            });
        });
    }



    function updateFormMemory(){
        var formInputsArray = Object.keys(formInputsDict);
        //give event listeners to all the text inputs
        formInputsArray.forEach(function(item){     
            addBlur(formInputsDict[item], item);
          
        });
        //get info from chrome storage memory and fill in the form with last inputs
        chrome.storage.sync.get(formInputsArray, function(results){
            background.console.log(results);

            formInputsArray.forEach(function(item){
                background.console.log(results[item]);
                if(results[item] != undefined){ //if exists in chrome storage
                    formInputsDict[item].value = results[item]; //then set the input to the last value that had been stored 
                }
            });
   
        });


    }

        var welcome = document.querySelector('#welcome');

        //to avoid rewriting document.querySelector
        var gameInProgress = document.querySelector('#gameInProgress');
        var startButton = document.querySelector('#start');
        var joinButton = document.querySelector('#join');


        //Load and define modal

        var modal = document.getElementById("myModal");
        var confirmModal = document.getElementById('myConfirm');


        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        //get the cancel button for the confirm modal
        var cancelDelete = document.getElementById('cancelDelete');

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        };

        // When the user clicks on cancel, close the confirm modal
        cancelDelete.onclick = function() {
            confirmModal.style.display = "none";
        };

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        //see if there's a game in progress being stored through chrome
        chrome.storage.sync.get(['gameCode', 'name', 'site', 'hangout', 'clue'], function(items) {
            gameCode = items.gameCode;
            //if there is one, then make sure it actually exists in the db
            if (gameCode != undefined) {
                db.collection("games").doc(gameCode.toLowerCase()).get()
                    .then(function(results) {
                        if (results.exists) {

                            //if it does exist, find out your name and hiding place site so we can use it in the dom
                            //then make the play screen
                            yourName = items.name;
                            yourSite = items.site;
                            yourClue = items.clue;
                            hangoutLink = items.hangout;
                            makePlayScreen();

                        } else {
                            //if you have a game code stored, but it doesn't exist in the database, clear storage, and reload the welcome screen 
                            chrome.storage.sync.clear();
                            document.querySelector('#modalText').innerHTML = "Sorry, the game you were playing no longer exists.";
                            modal.style.display = "block";
                            // alert("Sorry, the game you were playing no longer exists.");
                            //keep as an alert or modal
                            makeWelcomeScreen();

                        }
                    }).catch(function(error) {
                        console.log(error);
                        chrome.storage.sync.clear();
                        document.querySelector('#modalText').innerHTML = "Sorry, the game you were playing no longer exists.";
                        modal.style.display = "block";
                        //keep as an alert or modal
                        makeWelcomeScreen();
                    });
            } else { //set up a new game if gameCode is undefined
                makeWelcomeScreen();
            }
        });

        //general helper function (stole from a stack overflow post, useful)
        function hasClass(elem, className) {
            return elem.classList.contains(className);
        }


        function makeWelcomeScreen() {
            // resetGameInputs();
            welcome.style.display = "block";
            document.querySelector('#startOrJoin').style.display = "none";
            gameInProgress.style.display = "none";
            if (showStartEvent == false) {
                startButton.addEventListener('click', function() {
                    makeNewGameScreen('create');
                });
                showStartEvent = true;

            }

            if (showJoinEvent == false) {
                joinButton.addEventListener('click', function() {
                    makeNewGameScreen('join');
                });
                showJoinEvent = true;
            }
        }


        //takes a string argument that should be either "create" or "join "
        function makeNewGameScreen(createOrJoin) {
            //shows the create game interface
            // console.log(createOrJoin);
            countClue();
            //user can enter name, set game time, and choose website and GIF to display
            //all this then creates a new game on firestore and allows an autogenerated code to appear
            welcome.style.display = "none";
            document.querySelector('#startOrJoin').style.display = "block";
            var joinOnlys = document.querySelectorAll('.joinOnly');
            var startOnlys = document.querySelectorAll('.startOnly');
            if (createOrJoin == 'create') {
                for (var a = 0; a < joinOnlys.length; a++) {
                    joinOnlys[a].style.display = "none";
                }
                for (var c = 0; c < startOnlys.length; c++) {
                    startOnlys[c].style.display = "block";
                }
                // document.querySelector('#create').style.display = "block";

                if (createEvent == false) {
                    document.querySelector('#create').addEventListener('click', createGame);
                    createEvent = true;
                }
                // onetime(document.querySelector("#create"), "click", createGame);

            } else if (createOrJoin == "join") {
                document.querySelector('#create').style.display = "none";
                for (var b = 0; b < joinOnlys.length; b++) {
                    joinOnlys[b].style.display = "block";
                }
                for (var d = 0; d < startOnlys.length; d++) {
                    startOnlys[d].style.display = "none";
                }
                if (joinEvent == false) {
                    document.querySelector('#joinButton').addEventListener('click', joinGame);
                    joinEvent = true;
                }


                // onetime(document.querySelector("#joinButton"), "click", joinGame);

            }

            gameInProgress.style.display = "none";

            //execute search button click if user presses enter
            if (keyUpEvent == false) {
                document.querySelector("#gif_search").addEventListener("keyup", function(event) {
                    if (event.keyCode === 13) {
                        document.querySelector('#search').click();
                    }
                });
                keyUpEvent = true;

            }

            if (searchEvent == false) {
                document.querySelector('#search').addEventListener('click', function() {
                    implement_search_gif()
                });
                searchEvent = true;
            }

        }

        function resetGameInputs() {

            // gameCode = undefined; yourName = undefined, yourSite = undefined;
            var inputs = document.querySelectorAll('input');
            [].forEach.call(inputs, function(el) {
                el.value = '';
            });
            document.querySelector('#search_results').innerHTML = '';
            var statsDiv = document.querySelector('#gameStats');
            statsDiv.innerHTML = "";
            var cluesDiv = document.querySelector('#clues');
            cluesDiv.innerHTML = "";

        }

        /*function to end game for all players
        note that the players subcollection will still exist--can just periodically clean out the database manually
         */
        function endGame() {


            document.querySelector('#confirmText').innerHTML = "Are you sure? This will end the game for ALL players!!";
            confirmModal.style.display = "block";
            //if clicks button to quit, code here
            // if (confirmResults == true) {
            if (endEvent == false) {
                document.querySelector('#endForAll').addEventListener('click', function() {
                    //first delete all players
                    db.collection("games").doc(gameCode.toLowerCase())
                        .collection("players").get().then(function(results) {
                            results.forEach(function(doc) {
                                doc.ref.delete();
                            });
                        }).catch(function(error) {
                            console.log(error)
                        });
                    //then delete the game
                    db.collection("games").doc(gameCode.toLowerCase()).delete()
                        .catch(function(error) {
                            console.log(error)
                        });
                    chrome.storage.sync.clear();
                    //then close the modal
                    confirmModal.style.display = "none";
                    makeWelcomeScreen();

                });
                endEvent = true;
            }
        }

        /*delete this player from the game*/
        function leaveGame() {
            // alert("Sorry to see you go, " + yourName + "! You can always re-enter while the game is still in play.");
            //keep as alert or modal
            document.querySelector('#modalText').innerHTML = "Sorry to see you go, " + yourName + "! You can always re-enter while the game is still in play.";
            modal.style.display = "block";
            db.collection("games").doc(gameCode.toLowerCase())
                .collection("players").doc(yourName).delete().catch(function(error) {
                    console.log(error)
                });

            chrome.storage.sync.clear();
            // resetGameInputs();
            makeWelcomeScreen();
        }


        /*shows the correct screen for a game in progress*/
        function makePlayScreen() {
            resetGameInputs();
            countClue();
            welcome.style.display = "none";
            document.querySelector('#startOrJoin').style.display = "none";
            gameInProgress.style.display = "block";
            // console.log(hangoutLink);

            // CHECK HANGOUT LINK HERE!!! IF NOT VALID< DON'T SHOW!!!
            if (hangoutLink != undefined && isHangoutValid(hangoutLink)) {
                document.querySelector('#hangoutLink').href = hangoutLink;
            } else {
                document.querySelector('#hangoutP').style.display = "none";
            }
            document.querySelector('#yourClue').innerHTML = yourClue;
            document.querySelector('#newClue').value = yourClue;
            document.querySelector('#gameCode').innerHTML = gameCode.toLowerCase();
            document.querySelector('#yourName').innerHTML = yourName;
            document.querySelector('#hidingPlace').href = yourSite;

            if (editClueEvent == false) {
                document.querySelector("#editClue").addEventListener('click', function() {

                    document.querySelector('#clueDialogue').style.display = "block";


                });
            }

            if (updateClueEvent == false) {
                document.querySelector("#updateClue").addEventListener('click', function() {
                    document.querySelector('#clueUpdateError').innerHTML = "";
                    document.querySelector('#newClue').classList.remove('invalid');
                    var newClue = document.querySelector('#newClue').value;
                    document.querySelector('#yourClue').innerHTML = newClue;
                    if (validateClue(newClue, '#newClue') != true) {
                        document.querySelector('#clueUpdateError').innerHTML = validateClue(newClue, '#newClue');
                    } else {
                        document.querySelector('#clueUpdateError').value = "";
                        db.collection("games").doc(gameCode.toLowerCase())
                            .collection("players").doc(yourName).set({
                                clue: newClue,
                            }, {
                                merge: true
                            });
                        chrome.storage.sync.set({
                            clue: newClue
                        });
                        document.querySelector('#clueDialogue').style.display = "none";
                        //    	var clueSuccess = document.getElementById('clueSuccess');
                        // clueSuccess.style.display = "inline-block";
                        showClueSuccess();
                        // fadeoutClueSuccess();


                        window.setTimeout(fadeoutClueSuccess, 2000); //display for 2 secs before fading back out
                        // clueSuccess.style.display = "inline-block";
                        // alert('Your clue has been changed to ' + newClue + ".");
                        //change the above to a fadeout text, "clue successfully updated"

                    }

                });
            }
            if (leaveEvent == false) {
                document.querySelector('#leaveGame').addEventListener('click', leaveGame);
                leaveEvent = true;
            }

            if (endEvent == false) {
                document.querySelector('#quitGame').addEventListener('click', endGame);
            }
            searchForPlayers();
        }

        function fadeoutClueSuccess() {

            var clueSuccess = document.getElementById('clueSuccess');
            // clueSuccess.style.display = "inline-block";
            clueSuccess.style.opacity = '0';
        }

        function showClueSuccess() {
            var clueSuccess = document.getElementById('clueSuccess');
            // clueSuccess.style.display = "none";
            clueSuccess.style.opacity = 1;
        }

        function isHangoutValid(hangoutLink) {
            if (hangoutLink.includes("hangouts.google.com") && isURL(hangoutLink)) {
                return true;
            }
            return false;
        }





        /*used in searchForPlayers to determine whether the url of current tab and players' hiding places match*/
        function compareURLS(url1, url2, domain) {
            // console.log(url1, "<current tab", url2);
            var prefix = /^https?:\/\/(www.)?/;
            var ending = /\/$/;
            url1 = url1.replace(prefix, '');
            url2 = url2.replace(prefix, '');
            url1 = url1.replace(ending, '');
            url2 = url2.replace(ending, '');
            // console.log(url1, url2);
            if (url1 == url2) {
                // console.log('urls match');
                return true;
            }
            return false;
        }

        function makeClueDiv(name, clue) {
            var statsDiv = document.querySelector('#gameStats');
            var clueDiv = document.createElement('div');
            // clueDiv.setAttribute("class", "clue_div");
            clueDiv.setAttribute("class", "clue_div");
            clueDiv.id = "clue_" + name;
            var clueP = document.createElement('p');
            clueP.setAttribute("class", "tooltiptext");
            clueP.innerHTML = clue;
            //thinking that maybe buttons.clue could have specific style, not sure
            clueP.setAttribute('class', 'clue');
            // var showClue = document.createElement('button');

            // clueDiv.appendChild(showClue);
            clueDiv.appendChild(clueP);
            // clueDiv.appendChild(hideClue);
            document.getElementById(name).appendChild(clueDiv);


            // Need to use event delegation bc dynamically added. Get the parent DIV, add click listener...
            //referenced: https://davidwalsh.name/event-delegate
            document.getElementById('gameStats').addEventListener("click", function(e) {
                //e.target is the clicked child element inside 
                if (hasClass(e.target, 'hide_clue')) {
                    var parent = e.target.parentNode;
                    parent.querySelector('.show_clue').style.display = 'block';
                    parent.querySelector('.clue').style.display = 'none';
                    parent.querySelector('.hide_clue').style.display = 'none';
                } else if (hasClass(e.target, 'show_clue')) {
                    var parent = e.target.parentNode;
                    parent.querySelector('.hide_clue').style.display = 'block';
                    parent.querySelector('.show_clue').style.display = 'none';
                    parent.querySelector('.clue').style.display = 'block';

                }
            });
        }


        /*Shows for each player who they've been found by.
        Note that I chose to only have this function run when pressing browser icon (not updated continuously through an interval ftn)
        */
        function updateStats() {
            // console.log('running updateStats');

            db.collection("games").doc(gameCode.toLowerCase())
                .collection("players").get()
                .then(function(results) {
                    var statsDiv = document.querySelector('#gameStats');
                    statsDiv.innerHTML = "";
                    var toFind = [];
                    results.forEach(function(doc) {
                        var hasHave = 'has';
                        var wasWere = 'was';

                        var player = doc.data()['name'];

                        var foundBy = doc.data()['foundBy'];
                        var clue = doc.data()['clue'];
                        var player_span = document.createElement('span');
                        player_span.setAttribute('class', 'player');
                        if (player == yourName) {
                            player_span.setAttribute('class', 'found_player');
                            player_span.id = 'you';
                            // player_span.setAttribute('class', 'you');
                            player = 'you';
                            hasHave = 'have';
                            wasWere = 'were';
                        }
                        player_span.innerHTML = player;
                        //THIS IS FOR THE TOOL TIP!!!
                        var clue = document.createElement('span');
                        clue.innerHTML = doc.data()['clue'];
                        clue.setAttribute('class', 'tooltiptext');
                        player_span.appendChild(clue);
                        var p = document.createElement('p');
                        var foundBy_span = document.createElement('span');
                        foundBy_span.setAttribute('class', 'foundBy');


                        if (foundBy.length == 0) {
                            p.appendChild(player_span);
                            var notFound = document.createTextNode(" " + hasHave + " not been found by anyone yet!");
                            p.appendChild(notFound);
                        } else if (foundBy.length >= 1) {
                            p.appendChild(player_span);
                            var txt_btwn = document.createTextNode(" " + wasWere + " found by ");
                            p.appendChild(txt_btwn);
                            if (foundBy.length == 1) {
                                if (foundBy[0] == yourName) {
                                    foundBy_span.innerHTML = "you";
                                    player_span.setAttribute('class', 'found_player');

                                } else {
                                    foundBy_span.innerHTML = foundBy[0];
                                }
                                p.appendChild(foundBy_span);

                            } else {
                                for (var f = 0; f < foundBy.length - 1; f++) {
                                    if (foundBy[f] == yourName) {
                                        foundBy[f] = "you";
                                        player_span.setAttribute('class', 'found_player');
                                    }

                                    if (f != foundBy.length - 2) {
                                        foundBy_span.innerHTML += foundBy[f] + ", "
                                    } else {
                                        foundBy_span.innerHTML += foundBy[f] + " & "
                                    }
                                }
                                if (foundBy[foundBy.length - 1] == yourName) {
                                    foundBy[foundBy.length - 1] = "you";
                                    player_span.setAttribute('class', 'found_player');
                                }
                                foundBy_span.innerHTML += foundBy[foundBy.length - 1];
                                p.appendChild(foundBy_span);

                            }
                        }
                        if (player_span.classList.contains('found_player') == false) {
                            toFind.push(player);

                        }
                        var playerDiv = document.createElement('div');
                        playerDiv.id = player;
                        playerDiv.appendChild(p);
                        statsDiv.appendChild(playerDiv);
                        if (player_span.classList.contains('found_player') == false) { //only make clue divs for players you haven't found yet
                            makeClueDiv(player, clue);
                        }

                    });
                    // console.log('toFind:', toFind.length);
                    if (toFind.length == 0) {
                        if (results.length > 1) {
                            statsDiv.innerHTML += "<h3>You found all the players!</h3>";
                        } else {
                            statsDiv.innerHTML += "<h3>There are no other players to find yet.</h3>";
                        }

                    } else {
                        statsDiv.innerHTML += '<h3>You still need to find ' + toFind.join(" and ") + '!</h3>';
                    }

                }).catch(function(error) {
                    console.log(error);
                });


        }


        /* See if any players in your game are "hiding" on the current tab
        Run each time browser icon is clicked (when a game is in progress)
        */
        function searchForPlayers() {
            // var playerFound;
            var thisUrl;
            //get current tab url, and see if there are any players in db that are hiding there.
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                // since only one tab should be active and in the current window at once
                // the return variable should only have one entry
                thisUrl = tabs[0].url.toLowerCase();
                // console.log(thisUrl);
            });
            db.collection("games").doc(gameCode.toLowerCase())
                .collection("players").get()
                .then(function(results) {
                    var links = [];
                    results.forEach(function(doc) {
                        // console.log(yourName);
                        // console.log(doc.data());
                        var data = doc.data();
                        var site = data['hidingPlace'].toLowerCase();
                        var gif = data['gif'];
                        var playerName = data['name'];
                        if (yourName != playerName && compareURLS(thisUrl, site, domain)) { //don't add if it's yourName
                            //show the GIF associated with that player
                            links.push(gif);

                            //update message to show you found the player
                            //update db to show that player found by another player (if not already marked)
                            var playerFound = data['name'];
                            db.collection("games").doc(gameCode.toLowerCase())
                                .collection("players").doc(playerFound).set({
                                    foundBy: firebase.firestore.FieldValue.arrayUnion(yourName),
                                }, {
                                    merge: true
                                });
                        }
                    });
                    //tell backgruond.js that we need to show gifs. 
                    //links includes any gif links (if more than one player chose the same hiding place site)
                    chrome.runtime.sendMessage({
                        task: "showgif",
                        links: links
                    });
                    updateStats();
                }).catch(function(error) {
                    console.log(error);
                });
        }

        /* Function to generate game codes
        stole from: https://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js*/
        function generateUID() {
            // generate the UID from two parts here 
            // to ensure the random number provide enough bits.
            var firstPart = (Math.random() * 46656) | 0;
            var secondPart = (Math.random() * 46656) | 0;
            firstPart = ("000" + firstPart.toString(36)).slice(-3);
            secondPart = ("000" + secondPart.toString(36)).slice(-3);
            return firstPart + secondPart;
        }

        //Used to validate input for hidingPlace. for both regexp/url checkers, i just looked on stack overflow
        function isURL(url_string) {
            regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
            return regexp.test(url_string);
        }


        //Used to validate input for GIF. for both regexp/url checkers, i just looked on stack overflow
        function isGIF(gif_string) {
            regexp = /\.(jpg|png|gif|mov)$/;
            if (isURL(gif_string)) {
                return regexp.test(gif_string);
            }
            return false;
        }


        /* use the following function to help with verifying for joining or creating a game 
        basically just sees if doc already exists 
        (if doesn't, can't join)
        [note that security rules in firestore should also check for this]*/
        function safeJoinCode(someCode) {
            // var return_statement;
            return db.collection("games").doc(someCode.toLowerCase()).get().then(function(doc) {
                if (doc.exists) {
                    // console.log('doc exists!!');
                    return true;
                } else {
                    return false;
                }
            }).catch(function(error) {
                console.log(error);
                // console.log("doc must not exist...");
                return false;
            });
        }

        //CHANGE SO WORKS FOR CLUE ALSO...
        function countClue() {
            if (clueCountKeyEvent == false) {
                countClueHelper('#clue', '#countChars');
                countClueHelper('#newClue', '#countCharsUpdate');
                clueCountKeyEvent = true;
            }
        }

        function countClueHelper(clueHash, countCharsHash) {
            document.querySelector(clueHash).addEventListener("keyup", function(event) {
                var numChars = document.querySelector(clueHash).value.length;
                var threshold = maxClueChars - thresholdClueChars;

                if (numChars > threshold && numChars < maxClueChars) {
                    document.querySelector(countCharsHash).innerHTML = " Careful, only " + (maxClueChars - numChars).toString() + " characters left.";
                } else if (numChars == maxClueChars) {
                    document.querySelector(countCharsHash).innerHTML = " Max characters reached.";
                } else if (numChars > maxClueChars) {
                    document.querySelector(countCharsHash).innerHTML = " " + (numChars - maxClueChars).toString() + " too many characters in your clue.";
                } else {
                    document.querySelector(countCharsHash).innerHTML = "";
                }
            });

        }

        ///includes hashtag so can use on update page as well
        function validateClue(clue, hashTag) {
            if (clue == undefined || clue == "" || typeof clue != "string") {
                document.querySelector(hashTag).setAttribute('class', 'invalid');
                return "You must provide at least one clue.";
            } else if (clue.length > maxClueChars) {
                return "Please provide a clue of " + maxClueChars.toString() + " characters or less. Your clue is " + clue.length.toString() + " characters.";
            } else {
                return true;
            }
        }

        /*front end validation for game creation*/
        function validateGameCreation(joinOrCreate, joinCode, name, site, gif, clue, domain) {
            if (joinOrCreate == "create" && domains.includes(domain)==false){
                document.querySelector('#domain').setAttribute('class', 'invalid');
                return "You must choose a domain from the dropdown list.";
            }
            if (joinCode == '' && joinOrCreate == 'join') {
                document.querySelector('#joinCode').setAttribute('class', 'invalid');
                return "You must enter a join code.";
            } else if (name == '' || typeof name != 'string') { //name should be a non-empty string. Maybe also check if name already in game but let's do that leter
                document.querySelector('#name').setAttribute('class', 'invalid');
                return "You must enter a name.";
            } else if (isURL(site) == false) { //site should be a real site
                document.querySelector('#site').setAttribute('class', 'invalid');
                return "You must enter a valid website as your hiding place.";
            } else if (validateClue(clue, '#clue') != true) { //should have a clue, and clue should not be too long
                return validateClue(clue, '#clue');
            } else if (isGIF(gif) == false) { //gif should be a displayable gif, not sure how to test
                return "You must select a GIF.";
                // if want to be more specifc, could change tostarts with https://media.tenor.com/
                // and ends in tenor.gif
                //but currently using a generic gif/png/img checker
                //thanks to https://stackoverflow.com/questions/169625/regex-to-check-if-valid-url-that-ends-in-jpg-png-or-gif
            } else {

                return true;
            }
        }

        //helper functions for newGame (didn't think things through initially...)
        function joinGame() {
            newGame("join");

        }

        function createGame() {
            newGame("create");
        }


        /*creates a new game. Arguments should be either "join" or "create" */
        function newGame(joinOrCreate) {

            //first remove any existing invalid flags and messages
            document.querySelector('#newGameError').innerHTML = '';
            var invalids = document.querySelectorAll(".invalid");

            [].forEach.call(invalids, function(el) {
                el.classList.remove("invalid");
            });

            var name, site, gif, code, joinCode, clue, hangout, domain;
            name = document.querySelector('#name').value.trim();
            site = document.querySelector('#site').value.trim();
            joinCode = document.querySelector('#joinCode').value.trim();
            clue = document.querySelector('#clue').value.trim();
            hangout = document.querySelector('#hangout').value.trim();
            domain = document.querySelector('#domain').value;
            // console.log(joinCode);
            var gif = document.querySelector('#selected_gif');
            if (gif != undefined) {
                gif = gif.src;
            }
            if (validateGameCreation(joinOrCreate, joinCode, name, site, gif, clue, domain) == true) { //valid, so go ahead and create game
                if (joinOrCreate == "create") {
                    code = generateUID(); //for new game
                    db.collection("games").doc(code.toLowerCase()).set({
                            code: code,
                            time_created: firebase.firestore.Timestamp.fromDate(new Date()),
                            hangout: hangout

                        })
                        .then(function() {
                            db.collection("games").doc(code.toLowerCase())
                                .collection("players").doc(name).set({
                                    name: name,
                                    hidingPlace: site,
                                    gif: gif,
                                    clue: clue,
                                    foundBy: []
                                });
                            // console.log(name);
                        })
                        .then(function() { //waiting until it was successfully added to db before I then move onto the next screen
                            // alert("Copy and share the following game code with your friends: " + code);
                            document.querySelector('#modalText').innerHTML = "Copy and share the following game code with your friends: " + '<span style="color:var(--danger-color)">' + code + '</span>';
                            modal.style.display = "block";
                            //keep as an alert or modal
                            setChromeStorage(code, name, site, hangout, clue, domain);

                        }).catch(function(error) {
                            console.log(error);
                        });
                } //ends the create only code

                //If valid, and join
                else if (joinOrCreate == "join") {

                    safeJoinCode(joinCode.toLowerCase()).then(function(value) {
                        // console.log(value);
                        if (value == false) { //extra check: can only join if already exists in db 

                            document.querySelector('#newGameError').innerHTML = "This is not a valid join code.";
                            document.querySelector('#joinCode').setAttribute('class', 'invalid');
                            onetime(document.querySelector("#joinButton"), "click", joinGame);
                        } else {

                            //make sure there aren't too many players in the game already, using max number of players. currently set to 20
                            //make sure it matches with firestore security rules

                            db.collection('games').doc(joinCode.toLowerCase()).collection("players").get().then(snap => {
                                var size = snap.size;
                                if (size >= maxPlayers) {
                                    document.querySelector('#modalText').innerHTML = "I'm sorry, virtual hide-and-go-seek only allows a maximum of " + maxPlayers + " players per game.";
                                    modal.style.display = "block";
                                    // alert("I'm sorry, virtual hide-and-go-seek only allows a maximum of " + maxPlayers + " players per game.");
                                    //keep as an alert or modal
                                    // resetGameInputs();
                                    makeWelcomeScreen();
                                } else { //if not exceeding max players
                                    db.collection("games").doc(joinCode.toLowerCase())
                                        .collection("players").doc(name).get().then(function(doc) {
                                            if (doc.exists) {
                                                name = name + "_again";

                                            } //ends what to do if name already in group
                                        }).then(function() {
                                            db.collection("games").doc(joinCode.toLowerCase())
                                                .collection("players").doc(name).set({
                                                    name: name,
                                                    hidingPlace: site,
                                                    gif: gif,
                                                    clue: clue,
                                                    foundBy: []
                                                })
                                        })
                                        .then(function() {
                                            db.collection("games").doc(joinCode.toLowerCase()).get().then(function(doc) {
                                                try{
                                                    hangoutLink = doc.data()['hangout'];
                                            }
                                            catch(err){
                                                hangoutLink= undefined;
                                                // console.log("HANGOUT", hangoutLink);
                                            }
                                            }).then(function() {
                                                setChromeStorage(joinCode, name, site, hangoutLink, clue, domain);
                                            });
                                        })
                                        .catch(function(error) {
                                            console.log(error);
                                            document.querySelector('#newGameError').innerHTML = "There was an error joining this game. If this was unexpected, please contact the developer for support.";
                                        });
                                    // }); //ends the then function after we checked if the doc exists

                                } //ends else clause for if not exceeding max players
                            }); //ends the code to check size of player collection
                        } //ends else statement that applies to validated join game
                    }); //ends safeJoinCode part
                } //ends else if join code 
                //should move to the next screen and show the code
            } //ends game validaiton code
            else { //if not valid, stay on same screen
                document.querySelector('#newGameError').innerHTML = validateGameCreation(joinOrCreate, joinCode, name, site, gif, clue, domain);
                // if (joinOrCreate == "create") {
                //     onetime(document.querySelector("#create"), "click", createGame);
                // } else if (joinOrCreate == "join") {
                //     onetime(document.querySelector("#joinButton"), "click", joinGame);

                // }
            }
        }

        function setChromeStorage(code, name, site, hangoutLink, clue, domain) {
            //doesnt make sense, but im putting hangout link here...
            hangoutLink = hangoutLink;
            gameCode = code.toLowerCase();
            yourName = name;
            yourSite = site;
            yourClue = clue;
            gameDomain = domain;
            if (yourSite.substring(0, 4) != "http") {
                yourSite = "http://" + site;
            }
            chrome.storage.sync.set({
                gameCode: gameCode,
                name: yourName,
                site: yourSite,
                hangout: hangoutLink,
                clue: yourClue,
                domain: gameDomain 
            });
            makePlayScreen();

        }

        //the following code adapted from the sample code given in the tenor documentation (used for searching for and selecting GIFs)
        // url Async requesting function
        function httpGetAsync(theUrl, callback) {
            // create the request object
            var xmlHttp = new XMLHttpRequest();

            // set the state change callback to capture when the response comes in
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    callback(xmlHttp.responseText);
                }
            }

            // open as a GET call, pass in the url and set async = True
            xmlHttp.open("GET", theUrl, true);

            // call send with no params as they were passed in on the url string
            xmlHttp.send(null);

            return;
        }

        // callback for the top x GIFs of search
        function tenorCallback_search(responsetext) {
            var searchResults = document.querySelector('#search_results');
            try {
                // parse the json response
                var response_objects = JSON.parse(responsetext);

                top_gifs = response_objects["results"];

                searchResults.innerHTML = '<h4 style="font-weight:bold">Click a GIF below to select.</h4>';

                // searchResults 
                // load the GIFs --
                if (top_gifs.length > 0) {
                    for (var i = 0; i < top_gifs.length; i++) {
                        var img = document.createElement('img');
                        img.src = top_gifs[i]["media"][0]["tinygif"]["url"];
                        img.setAttribute('class', 'unselected');
                        searchResults.appendChild(img);
                        img.addEventListener('click', function() {
                            // console.log('registering image click');
                            // console.log(img.src);
                            searchResults.querySelector('h4').innerHTML = "You've selected this GIF:";
                            this.removeAttribute('class', 'unselected');
                            this.id = "selected_gif";
                            Array.from(document.getElementsByClassName('unselected')).forEach(function(image) {
                                image.style.display = 'none';
                            });
                        });
                    }
                } else {
                    searchResults.innerHTML = '<h4>No GIFs match your search terms.</h4>';
                }
            } catch (err) {
                //if response_objects is undefined because there are no results
                searchResults.innerHTML = '<h4>No GIFs match your search terms.</h4>';

            }

            return;
        }


        // function to call the search endpoint
        function implement_search_gif() {
            // set the apikey and limit
            var apikey = "BKY4AB64N333";
            var lmt = 10;

            // get search term from input
            var search_term = document.querySelector('#gif_search').value;

            // using default locale of en_US
            var search_url = "https://api.tenor.com/v1/search?q=" + search_term + "&key=" +
                apikey + "&limit=" + lmt;

            httpGetAsync(search_url, tenorCallback_search);

            // data will be loaded by each call's callback
            return;
        }


} //ends window on load...
