function preload() {
  game.load.onLoadStart.add(loadStart, game);
  game.load.onLoadComplete.add(loadComplete, game);
  loadText = game.add.text(32, 32, '', {
    fill: '#ffffff',
  });
  game.load.image('bomb', 'assets/images/bomb.png');
  game.load.image('background', 'assets/images/StarblazerBkgd.bmp');
  game.load.image('maxxdaddy', 'assets/images/maxxdaddy.gif');
  game.load.image('splash', 'assets/images/StarblazerSplash.bmp');
  game.load.spritesheet('player', 'assets/images/player.png', 70, 12, 3);
  game.load.image('laser', 'assets/images/laser.png');
  game.load.image('enemy_laser', 'assets/images/laser.png');
  game.load.image('enemy_missile', 'assets/images/enemy_missile.png');
  game.load.spritesheet('explosion', 'assets/images/explosion.png', 40, 50, 14);
  game.load.spritesheet('level_1_enemies', 'assets/images/level_1_enemies.png', 70, 57, 9);
  game.load.image('tank', 'assets/images/tank.png');
  game.load.image('cactus', 'assets/images/cactus.png');
  game.load.image('jet', 'assets/images/jet.png');
  game.load.image('fuel_plane', 'assets/images/fuel_plane.png');
  game.load.image('airship', 'assets/images/airship.png');
  game.load.image('balloon', 'assets/images/balloon.png');
  game.load.image('fuel_tank', 'assets/images/fuel_tank.png');
  game.load.image('star', 'assets/images/star.png');

  game.load.onLoadStart.add(loadStart, this);
  game.load.onLoadComplete.add(loadComplete, this);
  game.loadText = game.add.text(32, 32, '', {
    fill: '#ffffff'
  });
}

function loadStart() {
  loadText.setText('Loading ...');
}

function loadComplete() {
  loadText.setText('Load Complete');
}
