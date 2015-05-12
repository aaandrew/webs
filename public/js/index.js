window.onload = function() {
  var socket = io();

  var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
    'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
    't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];

  var categories; // Array of topics
  var chosenCategory; // Selected catagory
  var getHint; // Word getHint
  var guess; // Guess
  var guesses = []; // Stored guesses
  var space; // Number of spaces in word '-'

  // Get elements
  var showLives = document.getElementById("mylives");
  var showCatagory = document.getElementById("scatagory");
  var getHint = document.getElementById("hint");
  var showClue = document.getElementById("clue");

  // create alphabet ul
  var buttons = function(word) {
    myButtons = document.getElementById('buttons');
    letters = document.createElement('ul');

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
  var selectCat = function() {
    if (chosenCategory === categories[0]) {
      catagoryName.innerHTML = "The Chosen Category Is Premier League Football Teams";
    } else if (chosenCategory === categories[1]) {
      catagoryName.innerHTML = "The Chosen Category Is Films";
    } else if (chosenCategory === categories[2]) {
      catagoryName.innerHTML = "The Chosen Category Is Cities";
    }
  }

  // Create guesses ul
  updatePlaceholders = function(word) {
    wordHolder = document.getElementById('hold');
    correct = document.createElement('ul');

    for (var i = 0; i < word.length; i++) {
      correct.setAttribute('id', 'my-word');
      guess = document.createElement('li');
      guess.setAttribute('class', 'guess');
      if (word[i] === "-") {
        guess.innerHTML = "-";
        space = 1;
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
    categories = [
      ["everton", "liverpool", "swansea", "chelsea", "hull", "manchester-city", "newcastle-united"],
      ["alien", "dirty-harry", "gladiator", "finding-nemo", "jaws"],
      ["manchester", "milan", "madrid", "amsterdam", "prague"]
    ];

    chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    //word = chosenCategory[Math.floor(Math.random() * chosenCategory.length)];
    //word = word.replace(/\s/g, "-");
    //console.log(word);

    updatePlaceholders(store.word);
    buttons(store.word);
    updateCorrectLetters(store.state);
    for(i in store.guessed){
      updateButtonLetter(store.guessed[i]);
    }

    space = 0;
    selectCat();
  }

  // Hint
  hint.onclick = function() {

    hints = [
      ["Based in Mersyside", "Based in Mersyside", "First Welsh team to reach the Premier Leauge", "Owned by A russian Billionaire", "Once managed by Phil Brown", "2013 FA Cup runners up", "Gazza's first club"],
      ["Science-Fiction horror film", "1971 American action film", "Historical drama", "Anamated Fish", "Giant great white shark"],
      ["Northern city in the UK", "Home of AC and Inter", "Spanish capital", "Netherlands capital", "Czech Republic capital"]
    ];

    var catagoryIndex = categories.indexOf(chosenCategory);
    var hintIndex = chosenCategory.indexOf(word);
    showClue.innerHTML = "Clue: - " + hints[catagoryIndex][hintIndex];
  };

  // Reset

  document.getElementById('reset').onclick = function() {
    correct.parentNode.removeChild(correct);
    letters.parentNode.removeChild(letters);
    showClue.innerHTML = "";
    context.clearRect(0, 0, 400, 400);
    play();
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
  });

  socket.on('lose', function(data){
    showLives.innerHTML = "Game Over";
  });

}