function mainMenuCreate() {
        var background = game.add.image(0, 0, 'background');
        background.width = game.width;
        background.height = game.height;
        game.add.image(game.width * .82, game.height * .95, 'maxxdaddy');

	    splash = game.add.image(60, 20, 'splash');
		splash.width = game.width*.9;
		splash.height = game.height*.9;
 		game.input.onDown.addOnce(gameStart, this);
		game.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	};

	function mainMenuUpdate() {
	    if (game.spaceKey.isDown) {
	        game.spaceKey = null;
	        splash.visible = false;
          startGame=true;
          gameCreate();
   
	    }

	};

	 function gameStart() {
	     splash.visible = false;
       startGame=true;
       gameCreate();

	 }
