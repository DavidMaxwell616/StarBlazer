function mainMenuCreate() {

        var background = game.add.image(0, 0, 'background');
        background.width = game.game.width;
        background.height = game.game.height;
        game.add.image(game.game.width * .82, game.game.height * .95, 'maxxdaddy');

	    splash = game.add.image(60, 20, 'splash');
		splash.width = game.game.width*.9;
		splash.height = game.game.height*.9
        
		game.input.onDown.addOnce(game.startGame, this);
		game.spaceKey = game.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	};

	function mainMenuUpdate() {
	    if (game.spaceKey.isDown) {
	        game.spaceKey = null;
	        splash.visible = false;
	        startGame=true;
	    }

	};

	function startGame() {
	    splash.visible = false;
      startGame=true;

	}
