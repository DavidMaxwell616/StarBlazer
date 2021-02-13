var Level = 1;
var gameLost = false;
var gameWon = false;
//var WINDOW_WIDTH  =  64;   // size of window
//var WINDOW_HEIGHT =  48;
var  music = null;
var playButton = null;
var splash;
var spaceKey;
// weapons defines
var LASER_STATE_OFF = false;   // this Laser is dead or off
var LASER_STATE_ON = true;   // this one is alive and in flight
var MAX_LASERS = 12;
var LASER_SPEED = 16;
//enemy defines
var MAX_HOUSES = 12;
var NUM_AIRSHIPS = 3;
var NUM_JETS = 3;
var MAX_BALLOONS = 12;
var MAX_FUEL = 20000;
var MAX_STARS = 28;

var ENEMY_STATE_OFF = false;   // this enemy is dead or off
var ENEMY_STATE_ON = true;   // this one is alive
var SCRAMBLE_STATE_RETREATING = 2;

var MAX_ENEMY_LASERS = 12;
var ENEMY_LASER_STATE_OFF = false;   // this Laser is dead or off
var ENEMY_LASER_STATE_ON = true;   // this one is alive and in flight

// explosion defines 
var MAX_EXPLOSIONS = 8;
var EXPLOSION_STATE_OFF = false;   // this Explosion is dead or off
var EXPLOSION_STATE_ON = true;   // this one is alive

var DEAD = 0;
var ALIVE = 1;

var KEYCODE_A = 65;
var KEYCODE_Z = 90;
var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;
var KEYCODE_SPACE = 32;
var KEYCODE_P = 80;
var keyFire;
var keyUp;
var keyDown;
var keyUp2;
var keyDown2;
var keyLeft;
var keyRight;

var SCREEN_HEIGHT;
var SCREEN_WIDTH;
var GROUND;
var background;
var title;
var gameover = false;
var player;            // the player 

var lasers;    // Laser pulses
var bomb;    // Laser pulses
var enemy_missiles;    // Laser pulses
var enemy_Lasers;
var infoText;
var scoreText = [];

var houses;
// var splash;
var fuel_plane;
var fuel_tank;
var airships;
var balloons;
var jets;
var cactus;
var launch_pad;
var tank;
var showintro = 0;
var explosions;    // the explosion Explosions
var intro_state = 0;
var stars; // the star field
var counter;
var Fuel_Left = MAX_FUEL;
var radar_killed = 0;
var tank_killed = 0;
var icbm_killed = 0;
var headquarters_killed = 0;
var outoffuel = 0;
var attack_speed = 5;
// player state variables
var player_score = 0;  // the score
var highscore = 0;  // the high score
var player_ships = 3;  // ships left
var player_damage = 0;  // damage of player
var player_counter = 0;  // used for state transition tracking
var player_regen_count = 0;  // used to regenerate player
var startGame = false;
var mouseDown;
var arrows =new Array(4);
var arrowStats = [
  {
    angle: 0,
  yOffset: 0,
  xOffset: 30,
  direction:'right',
  },
  {
    angle: 90,
  yOffset: 30,
  xOffset: 0,
  direction:'down',
  }  ,
  {
    angle: 180,
  yOffset: 0,
  xOffset: -30,
  direction:'left',
  }  ,
  {
    angle: 270,
  yOffset: -30,
  xOffset: 0,
  direction:'up',
  }  
  ];
  var arrowDown=false;
