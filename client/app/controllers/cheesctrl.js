angular.module('ChessCtrls', [])
.controller('ChessMultplyPlayer', ['$scope', '$timeout', '$location',  function($scope, $timeout, $location) {
  $scope.moveHistory = [];
  var rotated = false;
  var moveColor;
  var board;


  $scope.initGame = function() {
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');


	// do not pick up pieces if the game is over
	// only pick up pieces for the side to move
	var onDragStart = function(source, piece, position, orientation) {
	  if (game.game_over() === true ||
	      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
	      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
	    return false;
	  }
	};

	var onDrop = function(source, target) {
	  // see if the move is legal
	  var move = game.move({
	    from: source,
	    to: target,
	    promotion: 'q' // NOTE: always promote to a queen for example simplicity
	  });

	  // illegal move
	  if (move === null) return 'snapback';

	  // handleMove(source, target);
	};

	// update the board position after the piece snap
	// for castling, en passant, pawn promotion
	var onSnapEnd = function() {
	  board.position(game.fen())
	};

	var updateStatus = function() {
	  var status = '';

	  moveColor = 'White';
	  if (game.turn() === 'b') {
	    moveColor = 'Black';
	  }

	  // checkmate?
	  if (game.in_checkmate() === true) {
	    status = 'Game over, ' + moveColor + ' is in checkmate.';
	  }

	  // draw?
	  else if (game.in_draw() === true) {
	    status = 'Game over, drawn position';
	  }

	  // game still on
	  else {
	    status = moveColor + ' to move';

	    // check?
	    if (game.in_check() === true) {
	      status += ', ' + moveColor + ' is in check';
	    }
	  }

	  statusEl.html(status);
	  fenEl.html(game.fen());
	  pgnEl.html(game.pgn());
	};

	var cfg = {
               orientation: 'white',
	  draggable: true,
	  position: 'start',
	  onDragStart: onDragStart,
	  onDrop: handleMove,
	  onSnapEnd: onSnapEnd
	};

	board = ChessBoard('board1', cfg);
              document.getElementById('flipButton').addEventListener('click', board.flip);
	game = new Chess();
	updateStatus();
	};
  var socket = io();
console.log(socket);
  var handleMove = function(source, target) {
  	console.log("DOING NOTHING");
    var move = game.move({from: source, to: target});
    socket.emit('move', move);
    // console.log("wyatt can you see me?")
	}

	$scope.message;
  $scope.rooms = [];

//Sends chat message to io server
   $scope.groupChat = function(event) {
    socket.emit('chat message', $scope.message);
    $scope.message = '';
    
  };
//Client response when user connects to server
  socket.on('user connected', function(users) {
    console.log(users, "inside user connected");
    $scope.users = users;
    socket.emit('adduser');
  })
	  
//Posts messages from server to chatbox
  socket.on('chat message', function(msg, tokenName){
    chatWindow = $('#groupChat')
    
    isScrolledToBottom = chatWindow[0].scrollHeight - chatWindow.outerHeight() <= chatWindow.scrollTop() + 1;
    if (tokenName) {
    	chatWindow.append($('<p>').text(tokenName + ":  " + msg));
    } else {
    	chatWindow.append($('<p>').text("guest:  " + msg));
    }

    if(isScrolledToBottom) {
      scrollWindow();
    }
  })

  // socket.on('updaterooms', function(rooms, current_room) {
  //   $scope.rooms = rooms;
  //   console.log(rooms, current_room);
  // })

  socket.on('move', function (msg) {
    $scope.moveHistory.unshift(msg);
    game.move(msg);
    // board.position(game.fen()); // fen is the board layout
	});
$scope.switchRoom = function(room) {
    socket.emit('switchRoom', room);
    console.log('Hola', room);
  }
//What happens when user leaves room
  socket.on('user leave', function(users) {
    console.log('user left')
    $scope.objKeys = Object.keys(users);
  })

  var scrollWindow = function() {
    var chatWindow = $('#groupChat');
    chatWindow[0].scrollTop = chatWindow[0].scrollHeight - chatWindow.outerHeight();
  }

  $timeout(function(){
      if($location.path() === '/multi-player1') {
        $scope.switchRoom('1')
      }
  }, 700)

}])
.controller('DashBoardCtrl', ['$scope', 'Auth', function($scope, Auth) {
	console.log(Auth.getToken());
	var board,
  	game = new Chess();


	var makeRandomMove = function() {
	  var possibleMoves = game.moves();

	  // exit if the game is over
	  if (game.game_over() === true ||
	    game.in_draw() === true ||
	    possibleMoves.length === 0) return;

	  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
	  game.move(possibleMoves[randomIndex]);
	  board.position(game.fen());

	  window.setTimeout(makeRandomMove, 500);
	};

	board = ChessBoard('board', 'start');

	window.setTimeout(makeRandomMove, 500);
}])


