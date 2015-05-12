var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Configures the Template engine
app.engine('handlebars', handlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

// Routes
app.get('/', function(req, res){
  res.render('index');
});

// Store functions
var categories = [
      ["everton", "liverpool", "swansea", "chelsea", "hull", "manchester-city", "newcastle-united"],
      ["alien", "dirty-harry", "gladiator", "finding-nemo", "jaws"],
      ["manchester", "milan", "madrid", "amsterdam", "prague"]
    ];

var store = {
  correct: 0,
  lives: 10,
  guessed: [],
  word: '',
  hint: '',
  state: []
};

// Game State:
// 1 - Running
// 0 - Win/Lose
var logistics = {
  gameState: 0,
  numConnected: 0
};

var newGame = function(){
  // Get category and hint
  var chosenCategory = categories[Math.floor(Math.random() * categories.length)];
  var hint = 'The category is ';
  if (chosenCategory === categories[0]) {
    hint += "Premier League Football Teams";
  } else if (chosenCategory === categories[1]) {
    hint += "Films";
  } else if (chosenCategory === categories[2]) {
    hint += "Cities";
  }
  store.hint = hint;
  // Get the word
  store.word = chosenCategory[Math.floor(Math.random() * chosenCategory.length)];
  // Set the state
  var tempState = []
  var lettersLeft = 0;
  for(var i in store.word){
    if(store.word[i] != '-' && store.word[i] != ' '){
      tempState.push('_');
      lettersLeft++;
    }else{
      tempState.push(' ');
    }
  }
  store.state = tempState;
  // Reset variables
  store.correct = lettersLeft;
  store.lives = 10;
  store.guessed = [];
}

// Start the game for the first time
newGame();
logistics.gameState = 1;

// Sockets
io.on('connection', function(socket){
  // Emit store state on first connection
  logistics.numConnected++;
  socket.emit('newGame', store);
  io.emit('updateConnected', logistics.numConnected);

  socket.on('disconnect', function () {
    logistics.numConnected--;
    io.emit('updateConnected', logistics.numConnected);
  });

  socket.on('guess', function(data){
    if(logistics.gameState != 1) return;

    var letter = data.letter;
    store.letter = letter;
    if(store.guessed.indexOf(letter) == -1){
      store.guessed.push(letter);
      if(store.word.indexOf(letter) != -1){
        for (var i = 0; i < store.word.length; i++) {
          if (store.word[i] === letter) {
            store.state[i] = letter;
            store.correct--;
          }
        }
        if(store.correct <= 0) {
          io.emit('win', store);
          logistics.gameState = 0;
        }else{
          io.emit('correctGuess', store);
        }
        
      }else{
        store.lives--;
        if (store.lives < 1) {
          io.emit('lose', store);
          logistics.gameState = 0;
        }else{
          io.emit('incorrectGuess', store);
        }
      }
    }
    io.emit('updateLetters', store);
  });

  // Reset Game
  socket.on('resetGame', function(data){
    console.log("resetGame", data);
    if(data === 0){
      logistics.gameState = 1;
      newGame();
      socket.emit('newGame', store);
    }
  });

});

http.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});