
StarBlazer.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

StarBlazer.Preloader.prototype = {

	preload: function () {

	    this.load.image('preloaderBar', 'assets/images/preload.png');
	    this.preloadBar = this.add.sprite(0, 100, 'preloaderBar');

		this.load.setPreloadSprite(this.preloadBar);
		var stamp = '?' + new Date().getTime();

		this.load.image('bomb', 'assets/images/bomb.png');
		this.load.image('background', 'assets/images/StarblazerBkgd.bmp');
		this.load.image('maxxdaddy', 'assets/images/maxxdaddy.gif');
		this.load.image('splash', 'assets/images/StarblazerSplash.bmp');
		this.load.spritesheet('player', 'assets/images/player.png', 70, 12, 3);
		this.load.image('laser', 'assets/images/laser.png');
		this.load.image('enemy_laser', 'assets/images/laser.png');
		this.load.image('enemy_missile', 'assets/images/enemy_missile.png');
		this.load.spritesheet('explosion', 'assets/images/explosion.png', 40, 50, 14);
		this.load.spritesheet('level_1_enemies', 'assets/images/level_1_enemies.png', 70, 57, 9);
		this.load.image('tank', 'assets/images/tank.png');
		this.load.image('cactus', 'assets/images/cactus.png');
		this.load.image('jet', 'assets/images/jet.png');
		this.load.image('fuel_plane', 'assets/images/fuel_plane.png');
		this.load.image('airship', 'assets/images/airship.png');
		this.load.image('balloon', 'assets/images/balloon.png');
		this.load.image('fuel_tank', 'assets/images/fuel_tank.png');
		this.load.image('star', 'assets/images/star.png');


	},

	create: function () {

		this.preloadBar.cropEnabled = false;

		this.state.start('MainMenu');

	},

	update: function () {

		// if (this.cache.isSoundDecoded('titleMusic') && this.ready == false)
		// {
			// this.ready = true;
			// this.state.start('MainMenu');
		// }

	}

};
