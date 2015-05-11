window.onload = function() {
  var socket = io();

  var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
    'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
    't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];

  var categories; // Array of topics
  var chosenCategory; // Selected catagory
  var getHint; // Word getHint
  var word; // Selected word
  var guess; // Guess
  var guesses = []; // Stored guesses
  var space; // Number of spaces in word '-'

  // Get elements
  var showLives = document.getElementById("mylives");
  var showCatagory = document.getElementById("scatagory");
  var getHint = document.getElementById("hint");
  var showClue = document.getElementById("clue");

  // create alphabet ul
  var buttons = function() {
    myButtons = document.getElementById('buttons');
    letters = document.createElement('ul');

    for (var i = 0; i < alphabet.length; i++) {
      letters.id = 'alphabet';
      list = document.createElement('li');
      list.id = 'letter';
      list.innerHTML = alphabet[i];
      check();
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

  // Animate man
  var animate = function(lives) {
    drawArray[lives]();
  }

  // Hangman
  canvas = function() {

    myStickman = document.getElementById("stickman");
    context = myStickman.getContext('2d');
    context.beginPath();
    context.strokeStyle = "#fff";
    context.lineWidth = 2;
  };

  head = function() {
    myStickman = document.getElementById("stickman");
    context = myStickman.getContext('2d');
    context.beginPath();
    context.arc(60, 25, 10, 0, Math.PI * 2, true);
    context.stroke();
  }

  draw = function($pathFromx, $pathFromy, $pathTox, $pathToy) {

    context.moveTo($pathFromx, $pathFromy);
    context.lineTo($pathTox, $pathToy);
    context.stroke();
  }

  frame1 = function() {
    draw(0, 150, 150, 150);
  };

  frame2 = function() {
    draw(10, 0, 10, 600);
  };

  frame3 = function() {
    draw(0, 5, 70, 5);
  };

  frame4 = function() {
    draw(60, 5, 60, 15);
  };

  torso = function() {
    draw(60, 36, 60, 70);
  };

  rightArm = function() {
    draw(60, 46, 100, 50);
  };

  leftArm = function() {
    draw(60, 46, 20, 50);
  };

  rightLeg = function() {
    draw(60, 70, 100, 100);
  };

  leftLeg = function() {
    draw(60, 70, 20, 100);
  };

  drawArray = [rightLeg, leftLeg, rightArm, leftArm, torso, head, frame4, frame3, frame2, frame1];

  // OnClick Function
  check = function() {
    list.onclick = function() {
      var guess = (this.innerHTML);
      this.setAttribute("class", "active");
      this.onclick = null;
      for (var i = 0; i < word.length; i++) {
        if (word[i] === guess) {
          guesses[i].innerHTML = guess;
        }
      }
     
      // Emit guess to server
      var guessobj = {
        letter: guess
      }
      socket.emit('guess', guessobj);

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
    word = chosenCategory[Math.floor(Math.random() * chosenCategory.length)];
    word = word.replace(/\s/g, "-");
    console.log(word);

    updatePlaceholders(store.word);
    buttons();
    guesses = [];
    space = 0;
    selectCat();
    canvas();
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
    if(data.lives < 10) animate(data.lives);
    play(data);
  });

  socket.on('correctGuess', function(data){
    console.log("correct", data);
    updateLives(data.lives);
  });

  socket.on('incorrectGuess', function(data){
    console.log("incorrect", data);
    updateLives(data.lives);
    animate(data.lives);
  });

  socket.on('win', function(data){
    showLives.innerHTML = "You Win!";
  });

  socket.on('lose', function(data){
    showLives.innerHTML = "Game Over";
  });

}