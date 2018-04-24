
StarBlazer.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;
	this.splash;
	this.spaceKey;

};

StarBlazer.MainMenu.prototype = {

	create: function () {

		// this.music = this.add.audio('titleMusic');
		// this.music.play();

        var background = this.add.image(0, 0, 'background');
        background.width = this.game.width;
        background.height = this.game.height;
        this.add.image(this.game.width * .82, this.game.height * .95, 'maxxdaddy');

	    splash = this.add.image(60, 20, 'splash');
		splash.width = this.game.width*.9;
		splash.height = this.game.height*.9
        
		this.input.onDown.addOnce(this.startGame, this);
		this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	},

	update: function () {
	    if (this.spaceKey.isDown) {
	        this.spaceKey = null;
	        splash.visible = false;
	        this.state.start('Game');
	    }

	},

	startGame: function (pointer) {
		// this.music.stop();
	    splash.visible = false;
		//	And start the actual game
		this.state.start('Game');

	}

};
