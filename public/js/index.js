window.onload = function() {
  var socket = io();
  var resetGame = 0;

  var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
    'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
    't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];

  var categories; // Array of topics
  var chosenCategory; // Selected catagory
  var guess; // Guess
  var guesses = []; // Stored guesses

  // Get elements
  var showLives = document.getElementById("mylives");
  var showCatagory = document.getElementById("scatagory");

  // create alphabet ul
  var buttons = function(word) {
    myButtons = document.getElementById('buttons');
    letters = document.createElement('ul');
    myButtons.innerHTML = '';
    letters.innerHTML = '';
    for (var i = 0; i < alphabet.length; i++) {
      letters.id = 'alphabet';
      list = document.createElement('li');
      list.id = alphabet[i];
      list.innerHTML = alphabet[i];
      check(word);
      myButtons.appendChild(letters);
      letters.appendChild(list);
    }
  }

  // Select Catagory
  var selectCat = function(category) {
    catagoryName.innerHTML = category;
  }

  // Create guesses ul
  updatePlaceholders = function(word) {
    wordHolder = document.getElementById('hold');
    correct = document.createElement('ul');
    guesses = [];
    wordHolder.innerHTML = '';
    for (var i = 0; i < word.length; i++) {
      correct.setAttribute('id', 'my-word');
      guess = document.createElement('li');
      guess.setAttribute('class', 'guess');
      if (word[i] === "-") {
        guess.innerHTML = "-";
      } else {
        guess.innerHTML = "_";
      }
      guesses.push(guess);
      wordHolder.appendChild(correct);
      correct.appendChild(guess);
    }
  }

  // Show lives
  updateLives = function(lives) {
    showLives.innerHTML = "You have " + lives + " lives";
  }

  updateCorrectLetters = function(stateArr){
    for (var i = 0; i < stateArr.length; i++) {
      guesses[i].innerHTML = stateArr[i];
    }
  }

  updateButtonLetter = function(letter){
    var guess = $('#' + letter);
    guess.attr("class", "active");
    guess.prop("onclick", null);
  }

  
  // OnClick Function
  check = function(word) {
    list.onclick = function() {
      var guess = (this.innerHTML);
      // Emit guess to server
      socket.emit('guess', {letter: guess});

    }
  }

  // Play
  play = function(store) {
    updatePlaceholders(store.word);
    buttons(store.word);
    updateCorrectLetters(store.state);
    for(i in store.guessed){
      updateButtonLetter(store.guessed[i]);
    }
    selectCat(store.hint);
  }

  // Sockets
  socket.on('newGame', function(data){
    console.log('newgame', data);
    updateLives(data.lives);
    play(data);
  });

  socket.on('correctGuess', function(data){
    console.log("correct", data);
    updateLives(data.lives);
    updateCorrectLetters(data.state)
  });

  socket.on('incorrectGuess', function(data){
    console.log("incorrect", data);
    updateLives(data.lives);
  });

  socket.on('updateLetters', function(data){
    updateButtonLetter(data.letter);
  });

  socket.on('win', function(data){
    updateCorrectLetters(data.state)
    showLives.innerHTML = "You Win!";
    setTimeout(function(){
      console.log('Resetting game');
      socket.emit('resetGame', resetGame);
    }, 3000)
  });

  socket.on('lose', function(data){
    showLives.innerHTML = "Game Over";
    setTimeout(function(){
      console.log('Resetting game');
      socket.emit('resetGame', resetGame);
    }, 3000)
  });

  socket.on('updateConnected', function(data){
    $("#connected").text(data);
  });

}