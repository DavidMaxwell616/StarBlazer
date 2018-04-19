
StarBlazer.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;


};

StarBlazer.MainMenu.prototype = {

	create: function () {

		// this.music = this.add.audio('titleMusic');
		// this.music.play();

        var background = this.add.image(0, 0, 'background');
        background.width = this.game.width;
        background.height = this.game.height;
        this.add.image(360, 350, 'maxxdaddy');

	    var splash = this.add.image(50, 50, 'splash');
		splash.width = this.game.width*.75;
		splash.height = this.game.height*.75

		this.input.onDown.addOnce(this.startGame, this);

	},

	update: function () {

	},

	startGame: function (pointer) {

		// this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	}

};
