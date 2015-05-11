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

// Sockets
var store = {
  correct: 0,
  lives: 10,
  guessed: [],
  word: 'nemo'
};

io.on('connection', function(socket){
  // Emit store state on first connection
  socket.emit('newGame', store);

  socket.on('guess', function(data){
    console.log('hi', data.letter);
    var letter = data.letter;
    if(store.guessed.indexOf(letter) == -1){
      store.guessed.push(letter);
      if(store.word.indexOf(letter) != -1){
        store.correct++;
        if(store.correct === store.word.length) {
          socket.emit('win', store);
        }else{
          socket.emit('correctGuess', store);
        }
        
      }else{
        store.lives--;
        if (store.lives < 1) {
          socket.emit('lose', store);
        }else{
          socket.emit('incorrectGuess', store);
        }
      }
    }
  });
});

http.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});