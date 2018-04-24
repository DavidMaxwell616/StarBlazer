StarBlazer.Game = function (game) {
    
};

StarBlazer.Game.prototype = {
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.Level = 1;
        this.gameLost = false;
        this.gameWon = false;
        //this.WINDOW_WIDTH  =  64;   // size of window
        //this.WINDOW_HEIGHT =  48;

        // weapons defines
        this.LASER_STATE_OFF = false;   // this Laser is dead or off
        this.LASER_STATE_ON = true;   // this one is alive and in flight
        this.MAX_LASERS = 12;
        this.LASER_SPEED = 16;
        //enemy defines
        this.MAX_HOUSES = 12;
        this.NUM_AIRSHIPS = 3;
        this.NUM_JETS = 3;
        this.MAX_BALLOONS = 12;
        this.MAX_FUEL = 20000;
        this.MAX_STARS = 28;

        this.ENEMY_STATE_OFF = false;   // this enemy is dead or off
        this.ENEMY_STATE_ON = true;   // this one is alive
        this.SCRAMBLE_STATE_RETREATING = 2;

        this.MAX_ENEMY_LASERS = 12;
        this.ENEMY_LASER_STATE_OFF = false;   // this Laser is dead or off
        this.ENEMY_LASER_STATE_ON = true;   // this one is alive and in flight

        // explosion defines 
        this.MAX_EXPLOSIONS = 8;
        this.EXPLOSION_STATE_OFF = false;   // this Explosion is dead or off
        this.EXPLOSION_STATE_ON = true;   // this one is alive

        this.DEAD = 0;
        this.ALIVE = 1;

        this.KEYCODE_A = 65;
        this.KEYCODE_Z = 90;
        this.KEYCODE_UP = 38;
        this.KEYCODE_DOWN = 40;
        this.KEYCODE_LEFT = 37;
        this.KEYCODE_RIGHT = 39;
        this.KEYCODE_SPACE = 32;
        this.KEYCODE_P = 80;
        this.keyFire;
        this.keyUp;
        this.keyDown;
        this.keyUp2;
        this.keyDown2;
        this.keyLeft;
        this.keyRight;

        this.SCREEN_HEIGHT;
        this.SCREEN_WIDTH;
        this.GROUND;
        this.background;
        this.title;
        this.gameover = false;
        this.player;            // the player 

        this.lasers;    // Laser pulses
        this.bomb;    // Laser pulses
        this.enemy_missiles;    // Laser pulses
        this.enemy_Lasers;
        this.infoText;
        this.scoreText = [];

        this.houses;
        // this.splash;
        this.fuel_plane;
        this.fuel_tank;
        this.airships;
        this.balloons;
        this.jets;
        this.cactus;
        this.launch_pad;
        this.tank;
        this.showintro = 0;
        this.explosions;    // the explosion Explosions
        this.intro_state = 0;
        this.stars; // the star field
        this.counter;
        this.Fuel_Left = this.MAX_FUEL;
        this.radar_killed = 0;
        this.tank_killed = 0;
        this.icbm_killed = 0;
        this.headquarters_killed = 0;
        this.outoffuel = 0;
        this.attack_speed = 5;
        // player state variables
        this.player_score = 0;  // the score
        this.highscore = 0;  // the high score
        this.player_ships = 3;  // ships left
        this.player_damage = 0;  // damage of player
        this.player_counter = 0;  // used for state transition tracking
        this.player_regen_count = 0;  // used to regenerate player

        this.Init_Game();
        // hide the mouse
        //ShowCursor(FALSE);
    },

    Init_Game: function ()
    {
        this.gameLost = false;
        this.gameWon = false;
        // load the background bitmap in with all the graphics
        var background = this.add.image(0, 0, 'background');
        background.width = this.game.width;
        background.height = this.game.height;
        this.SCREEN_HEIGHT = this.game.height;
        this.SCREEN_WIDTH = this.game.width;
        this.GROUND = this.SCREEN_HEIGHT - 40;
        this.Init_Stars();
        this.counter = 0;
        this.player = this.add.sprite(20, 220, 'player');
        this.player.anchor.set(0.2, 0.5);
        this.player.xv = 0;
        this.player.yv = 0;
        this.player.animations.add('playerjet');

        this.player.animations.play('playerjet', 50, true);

        this.player.animations.currentAnim.onComplete.add(function () { this.change_state(1) }, this);
        this.player.state = this.ALIVE;
        this.Init_Laser();
        this.Init_Enemies();
        this.Initialize_Enemy_Positions();
        this.Init_Explosions();
        this.Init_Score();
        this.keyFire = this.game.input.keyboard.addKey(this.KEYCODE_SPACE);
        this.keyFire.onDown.add(this.Fire, this);
        this.keyUp = this.game.input.keyboard.addKey(this.KEYCODE_A);
        this.keyUp.onDown.add(this.MoveUp, this);
        this.keyDown = this.game.input.keyboard.addKey(this.KEYCODE_Z);
        this.keyDown.onDown.add(this.MoveDown, this);
        this.keyUp2 = this.game.input.keyboard.addKey(this.KEYCODE_UP);
        this.keyUp2.onDown.add(this.MoveUp, this);
        this.keyDown2 = this.game.input.keyboard.addKey(this.KEYCODE_DOWN);
        this.keyDown2.onDown.add(this.MoveDown, this);
        this.keyRight = this.game.input.keyboard.addKey(this.KEYCODE_RIGHT);
        this.keyRight.onDown.add(this.MoveRight, this);
        this.keyLeft = this.game.input.keyboard.addKey(this.KEYCODE_LEFT);
        this.keyLeft.onDown.add(this.MoveLeft, this);
    },

    Fire: function () {
        if (this.gameover) {
            this.gameover = false;
            this.Level = 1; 
            this.attack_speed = 5; 
            this.showintro = 0;
            this.airships_active = 1;
            this.player.state = this.ALIVE; 
            this.player_score = 0;
            this.player_ships = 3; 
            this.player_damage = 0;
            this.Fuel_Left = this.MAX_FUEL; 
            this.Regenerate_Player();
            this.state.start('Game');
            //this.state.start('MainMenu');
        }
        // test if player is firing

        // if (keyCode == this.KEYCODE_SPACE && this.intro_state == 0) {
        //     this.intro_state = 1;
        //     this.splash.visible = false;
        //     return;
        // }
        if (!this.gameover && this.player.y < this.SCREEN_HEIGHT - 150) {
            this.Fire_Laser(this.player.x + 16, this.player.y);
        }
        else
            //            if (this.player.y >= this.SCREEN_HEIGHT - 100)
            this.Drop_Bomb(this.player.x + 16, this.player.y, 1);
    },
    MoveUp: function ()
    {
        if (this.outoffuel == 0) {
            // move player up
            this.player.yv -= 1;

        } // end if
    },
    MoveDown: function (){
        if (this.outoffuel == 0) {
            // move player down
            this.player.yv += 1;
        } // end if
    },
    MoveRight: function ()
    {
        if(this.outoffuel == 0) 
            // move player to right
            this.player.xv += 1;
    },
    MoveLeft: function ()
    {
        if (this.outoffuel == 0) {
            // move player to left
            this.player.xv -= 1;
        } 
    },
    quit: function(){
        // check of user is trying to start over
        if (keyCode == this.KEYCODE_P && this.ready_state == 1 && this.player_ships == 0) {
            this.Level = 1; this.attack_speed = 5; this.showintro = 0;
            this.airships_active = 1;
            this.player.state = this.ALIVE; this.player_score = 0;
            this.player_ships = 3; this.player_damage = 0;
            this.Fuel_Left = this.MAX_FUEL; this.Regenerate_Player();
        }
    },

    update: function() {
        this.Game_Main();
    },


    Init_Stars: function()
    {
        // this function initializes all the stars in such a way
        // that their intensity is proportional to their 
        // velocity
        stars = this.game.add.group();
        stars.enableBody = true;
        stars.physicsBodyType = Phaser.Physics.ARCADE;
        stars.createMultiple(this.MAX_STARS, 'star');
        stars.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        stars.setAll('checkWorldBounds', true);
        stars.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);
        stars.setAll('x', this.SCREEN_WIDTH);
        stars.setAll('y', this.getRandomInt(0, this.SCREEN_HEIGHT));
        stars.forEach(function (star) {
            // random postion
            star.x = this.getRandomInt(0, this.SCREEN_WIDTH);
            star.y = this.getRandomInt(0, this.SCREEN_HEIGHT);

            // select star plane
            var plane = this.getRandomInt(1, 4); // (1..4)

            // based on plane select velocity and color
            star.xv = -plane*5;
            star.tint = Math.random() * 0xffffff;
            star.visible = true;
        }, this); // end for index

    }, // end Init_Stars

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    Move_Stars: function()
    {
        // this function moves all the stars

        stars.forEach(function(star) {
            // translate upward
            star.x+=star.xv;
     
            // test for collision with top of screen
            if (star.x <= 0)
                star.x =this.SCREEN_WIDTH;

        }, this); // end for index

    }, // end Move_Stars



    ///////////////////////////////////////////////////////////
    Init_Laser: function()
    {
        // this function initializes and loads all the Laser 
        // weapon pulses

        // now create and load each Laser pulse
        lasers = this.game.add.group();
        lasers.enableBody = true;
        lasers.physicsBodyType = Phaser.Physics.ARCADE;
        lasers.createMultiple(this.MAX_LASERS, 'laser');
        lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        lasers.setAll('checkWorldBounds', true);
        lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetLaser);
        lasers.setAll('state', this.DEAD);

        this.bomb = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'bomb');
        this.bomb.anchor.setTo(0.5, 0.5);
        this.bomb.state = this.DEAD;
        this.bomb.visible = false;
        //CREATE ENEMY MISSILES
        enemy_missiles = this.game.add.group();
        enemy_missiles.enableBody = true;
        enemy_missiles.physicsBodyType = Phaser.Physics.ARCADE;
        enemy_missiles.createMultiple(this.MAX_ENEMY_LASERS, 'enemy_missile');
        enemy_missiles.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        enemy_missiles.setAll('checkWorldBounds', true);
        enemy_missiles.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);
        enemy_missiles.setAll('state', this.DEAD);

        //CREATE ENEMY LASER PULSES
        enemy_lasers = this.game.add.group();
        enemy_lasers.enableBody = true;
        enemy_lasers.physicsBodyType = Phaser.Physics.ARCADE;
        enemy_lasers.createMultiple(this.MAX_ENEMY_LASERS, 'enemy_laser');
        enemy_lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        enemy_lasers.setAll('checkWorldBounds', true);
        enemy_lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);
        enemy_lasers.setAll('state', this.DEAD);


    },
    ///////////////////////////////////////////////////////////
    resetAirship: function (object) {
        object.reset();
    },
    resetObject: function (object) {
        object.state = this.DEAD;
        object.visible = false;
    },
    resetLaser: function (laser) {
        //laser.reset(0,0);
        //laser.visible = false;
        //console.log(laser);
        laser.kill();
    },
 

    ///////////////////////////////////////////////////////////

    Move_Laser: function() {
        // this function moves all the Laser pulses and checks for
        // collision with the enemies

        lasers.forEach(function(laser) {
            if (laser.state == this.ALIVE) {
                // move the pulse upward
                laser.x += laser.xv;
                if (laser.x > this.SCREEN_WIDTH)
                    this.resetLaser(laser);
                // test for collision with enemies
                //Laser COLLISION WITH JETS
                if (this.Level == 2 || this.Level == 4) {
                    jets.forEach(function (jet) {
                        if (jet.state == this.ALIVE) {
                            // test for collision 

                            if (this.Collision_Test(laser,jet)) {
                                // kill pulse

                                //laser hits jet
                                this.Start_Explosion(laser.x,
                                    laser.y,
                                    42,
                                    36,
                                    jet.xv *1,
                                    jet.yv *1);
                                laser.reset();

                                jet.x=this.SCREEN_WIDTH;
                                jet.y=this.getRandomInt(0, this.SCREEN_HEIGHT);
                                // update score
                                this.player_score += 100;
                            } // end if collision
                        } //end for jet
                    },
                        this); // end Level 3
                }
                    //Laser COLLISION WITH AIRSHIPS
                    if (this.Level == 3 || this.Level == 5) {
                        airships.forEach(function(airship) {
                            if (airship.state == this.ALIVE) {
                                // test for collision 
                                if (this.Collision_Test(laser,airship)) {
                                    // kill pulse

                                    this.Start_Explosion(laser.x - 10,
                                        laser.y - 50,
                                        42,
                                        36,
                                        airship.xv *.1,
                                        airship.yv *.1);

                                    laser.reset();
                                    airship.kill();
                                    airship.reset(this.SCREEN_WIDTH, this.getRandomInt(0, this.SCREEN_HEIGHT));
                                    // update score
                                    this.player_score += 10;
                                } // end if collision
                            } //end if airship
                        },
                            this); //end for airship

                        balloons.forEach(function(balloon) {
                            if (balloon.state == this.ALIVE) {
                                // test for collision 
                                if (this.Collision_Test(laser, balloon)) {
                                    // kill pulse
                                    laser.kill();

                                    balloon.state = this.DEAD;
                                    balloon.visible = false;
                                    //laser hits balloon
                                    this.Start_Explosion(laser.x - 10,
                                        laser.y - 20,
                                        42,
                                        36,
                                        balloon.xv *.1,
                                        balloon.yv *.1);

                                    // update score
                                    this.player_score += 10;
                                } // end if collision
                            } //end if airship


                        },
                            this); // end Level 3
                    }
                    if (this.Level == 4 || this.Level == 5) {
                        enemy_missiles.forEach(function(enemy_missile) {
                            if (enemy_missile.state == this.ENEMY_STATE_ON) {
                                enemy_missile.visible = true;
                                if (this.player.y < enemy_missile.y)
                                    enemy_missile.yv -= .1;
                                if (this.player.y > enemy_missile.y)
                                    enemy_missile.yv += .1;
                                // test for collision 
                                if (this.Collision_Test(laser,enemy_missile)) {
                                    // kill pulse

                                    //laser hits enemy missile
                                    this.Start_Explosion(laser.x,
                                        laser.y,
                                        42,
                                        36,
                                        enemy_missile.xv *.1,
                                        enemy_missile.yv *.1);
                                    laser.kill();

                                    enemy_missile.state = this.DEAD;
                                    enemy_missile.visible = false;

                                    // update score
                                    this.player_score += 100;
                                } // end if collision
                            } //end if airship


                        },
                            this); // end Level 4 or 5
                    }
            }
            // end if Laser
        },
            this); // end for Laser
        //CHECK IF BOMB IS DROPPING
        if (this.bomb.state == this.ALIVE) {
            this.bomb.yv+=.1;
            this.bomb.y += this.bomb.yv;

            // test for boundaries

            if (this.bomb.y >this.GROUND) {

                //bomb hits ground
                this.Start_Explosion(this.bomb.x - 10,
                    this.bomb.y - 44,
                    42,
                    36,
                    0,
                    0);
                // kill the bomb
                this.bomb.state = this.DEAD;
                this.bomb.visible = false;
            }

            // test for collision with enemies

            //BOMBS DROPPING ON HOUSES, RADAR
            if (this.Level == 1 || this.Level == 3 || this.Level == 5) {
                houses.forEach(function(house) {
                    if (house.state == this.ALIVE) {
                        // test for collision 
                       // console.log('bomb x' + this.bomb.x+' '+
                       //     'bomb y' + this.bomb.y + ' ' +
                       //     'bomb width' + this.bomb.width + ' ' +
                       //     'bomb height' + this.bomb.height + ' ' +
                       //     'house x' + house.x + ' ' +
                       //     'house y+60' + house.y + 60);
                        if (this.Collision_Test(this.bomb, house)) {
                            // kill pulse
                            if (house.frame != 1) house.state = this.DEAD;

                            if (house.frame != 1) {
                                this.Start_Explosion(this.bomb.x,
                                    this.bomb.y,
                                    42,
                                    36,
                                    0,
                                    0);
                            }
                            if (house.frame == 5) {
                                this.radar_killed = 1;
                                this.player_score += 100;
                            }
                            if (house.frame == 6) {
                                this.icbm_killed = 1;
                                this.player_score += 500;
                            }
                            if (house.frame == 7) {
                                this.headquarters_killed = 1; 
                                this.player_score += 1500;
                                house.state = this.DEAD;
                                house.visible = false;
                            }
                            house.reset();
                            this.bomb.visible = false;
                            this.bomb.state = this.DEAD;
                                // update score
                            this.player_score += 10;
                            this.bomb.reset();
                        } // end if collision
                    } //end for airship
                },
                    this); // end for Laser
            }

            if (this.Level == 2 || this.Level == 4) {
                if (this.tank.state == this.ALIVE) {
                    // test for collision 
                    if (this.Collision_Test(this.bomb, this.tank)) {
                        // kill pulse
                        this.bomb.state = this.DEAD;
                        this.Start_Explosion(this.bomb.x - 10,
                            this.bomb.y - 20,
                            42,
                            36,
                            this.tank.xv *.1,
                            this.tank.yv *.1);
                        // update score
                        this.tank_killed = 1;
                        this.player_score += 500;
                    } // end if collision
                } //end if airship
                if (this.cactus.state == this.ALIVE) {
                    // test for collision 
                    if (this.Collision_Test(this.bomb,this.cactus))
                        // kill pulse
                        this.bomb.state = this.DEAD;
                }
            } // end Level 2


        } //end bomb

        //MOVE ENEMY Laser
        if (this.Level == 4) {
            enemy_lasers.forEach(function(enemy_laser) {
                if (enemy_laser.state == this.ALIVE) {
                    enemy_laser.xv = this.LASER_SPEED*-1;
                    // move the pulse downward
                    enemy_laser.x += enemy_laser.xv;

                    // test for boundaries
                    if (enemy_laser.x < 10) {
                        // kill the pulse
                        //enemy_laser.state = this.DEAD;
                        enemy_laser.state = this.DEAD;
                        enemy_laser.visible = false;
                    } // end if

                    // test for collision with player
                    if (this.Collision_Test(enemy_laser,this.player) &&
                        this.player.state == this.ALIVE) {
                        this.Start_Explosion(enemy_laser.x,
                            enemy_laser.y,
                            68 + this.getRandomInt(0, 12),
                            54 + this.getRandomInt(1, 10),
                            enemy_laser.xv *.1,
                            enemy_laser.yv *.1);

                        // update players damage
                        this.player_damage += 100;


                        // kill the original
                        enemy_laser.state = this.DEAD;

                    } // end if collision

                } // end if
            },
                this); // end for Laser
        }

        //MOVE ENEMY MISSILES
        if (this.Level == 4 || this.Level == 5) {
            enemy_missiles.forEach(function(enemy_missile) {
                if (enemy_missile.state == this.ALIVE) {
                    enemy_missile.xv--;
                    if (this.player.y < enemy_missile.y) enemy_missile.y -= 3;
                    if (this.player.y > enemy_missile.y) enemy_missile.y += 3;
                    // move the pulse downward
                    enemy_missile.x += enemy_missile.xv;
                    enemy_missile.y += enemy_missile.yv;

                    // test for boundaries
                    if (enemy_missile.x < 10) {
                        // kill the pulse
                        enemy_missile.state = this.DEAD;
                        enemy_missile.visible = false;

                    } // end if

                    // test for collision with player
                    if (this.Collision_Test(enemy_missile,this.player) &&
                        this.player.state == this.ALIVE) {
                        this.Start_Explosion(enemy_missile.x,
                            enemy_missile.y,
                            68 + this.getRandomInt(1, 12),
                            54 + this.getRandomInt(1, 10),
                            enemy_missile.xv *.1,
                            enemy_missile.yv *.1);

                        // update players damage
                        this.player_damage += 100;


                        // kill the original
                        enemy_missile.state = this.DEAD;
                        enemy_missile.visible = false;

                    } // end if collision

                } // end if
            },
                this); // end for Laser
        } // end Move_Laser
    },
    //////////////////////////////////////////////////////////

    Collision_Test: function(object1, object2) 
    {
        var rect1 = { x: object1.x, y: object1.y, width: object1.width, height: object1.height }
        var rect2 = { x: object2.x, y: object2.y, width: object2.width, height: object2.height }
       
    //    var graphics = this.game.add.graphics(0, 0);
    //    graphics.lineStyle(2, 0x0000FF, 1);
    //    graphics.drawRect(rect1.x, rect1.y, rect1.width, rect1.height);
    //    graphics.drawRect(rect2.x, rect2.y, rect2.width, rect2.height);

        if (rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.height + rect1.y > rect2.y) {
            return true;
            // collision detected!
        }
        return false;
    }, // end Collision_Test


    ///////////////////////////////////////////////////////////

    Fire_Laser: function(x,y)
    {
        this.bomb.state = this.DEAD;
        this.bomb.visible = false;
        //console.log(lasers.children);
        var laser = lasers.getFirstExists(false);
        laser.xv = this.LASER_SPEED;
        laser.reset(x, y);
        laser.state = this.ALIVE;

    }, // end Fire_Laser

    ///////////////////////////////////////////////////////////

    Drop_Bomb: function(x,y, vel)
    {
        // this function fires a Laser pulse at the given starting
        // position and velocity, of course, one must be free for 
        // this to work
        if (this.bomb.state == this.ALIVE)
            return;
        this.bomb.reset(x, y);
        if(this.bomb.state==this.DEAD)// start this one up
        {
            this.bomb.x = x;
            this.bomb.y = y;
            this.bomb.xv = this.player.xv;
            this.bomb.yv = vel;
            this.bomb.state = this.ALIVE;
            this.bomb.visible = true;

        } // end if


    }, // end Drop_Bomb
    ///////////////////////////////////////////////////////////

    Send_Fuel_Plane: function()
    {
        if(this.fuel_plane.state==this.ALIVE)
        {
            this.fuel_plane.visible = true;
            this.fuel_plane.x = 5;
            this.fuel_plane.xv = 5;
            this.fuel_plane.x += this.fuel_plane.xv;
            this.fuel_plane.y = 20;
        }
        if (this.fuel_plane.x > this.SCREEN_WIDTH) {
            this.fuel_plane.state = this.DEAD;
            this.fuel_plane.x = 0;
        }
    }, // end Fire_Laser

    ///////////////////////////////////////////////////////////

    Fire_Enemy_Laser: function(x,y, vel)
    {
        //console.log('fire enemy laser');
        // this function fires a Laser pulse at the given starting
        // position and velocity, of course, one must be free for 
        // this to work
        enemy_lasers.forEach(function(enemy_laser) {
            // test if Laser pulse is in flight
            var fireOne = false;
            if (enemy_laser.state == this.DEAD && !fireOne)
            {
                // start this one up
                enemy_laser.x  = x;
                enemy_laser.y  = y;
                enemy_laser.xv = this.LASER_SPEED*-1
                enemy_laser.state =  this.ALIVE;
                enemy_laser.visible = true;
                // later
                fireOne=true;

            } // end if
        },
                this); // end for Laser


        }, // end Fire_Laser
///////////////////////////////////////////////////////////
Fire_Enemy_Missile: function(x,y)
{
// this function fires a Laser pulse at the given starting
// position and velocity, of course, one must be free for 
// this to work

    enemy_missiles.forEach(function(enemy_missile) {
        // test if Laser pulse is in flight
if (enemy_missile.state == this.DEAD)
{
    // start this one up
    enemy_missile.x  = x;
    enemy_missile.y  = y;
    enemy_missile.xv = 0;
    enemy_missile.yv = 0;
    enemy_missile.state = this.ALIVE;
       
    // later
    return;

} // end if
    },
                this); // end for Laser


}, // end Fire_Enemy_Missile

///////////////////////////////////////////////////////////
Init_Enemies: function()
{
    // this function initializes and loads all the enemies 


    //CREATE HOUSES,TREES, TOWERS, RADAR
    
    houses = this.game.add.group();
    houses.enableBody = true;
    houses.physicsBodyType = Phaser.Physics.ARCADE;
    houses.createMultiple(this.MAX_HOUSES, 'level_1_enemies');
    houses.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    houses.setAll('checkWorldBounds', true);
    houses.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);


     // set alive to off
    houses.setAll('alive', this.ENEMY_STATE_ON);
    houses.setAll('visible', true);
    houses.setAll('y', this.GROUND);
    houses.setAll('x',this.SCREEN_WIDTH);
    houses.setAll('xv',-8);


//CREATE JETS
    jets = this.game.add.group();
    jets.enableBody = true;
    jets.physicsBodyType = Phaser.Physics.ARCADE;
    jets.createMultiple(this.NUM_JETS, 'jet');
    jets.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    //jets.setAll('checkWorldBounds', true);
    //jets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);
    jets.setAll('y', this.getRandomInt(1, 240));
    jets.setAll('x', this.SCREEN_WIDTH-20);
    jets.setAll('xv', -8);
    jets.setAll('yv', 0);   

//CREATE TANK
      this.tank = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'tank');
      this.tank.anchor.setTo(0.5, 0.5);
      this.tank.visible = false;

//CREATE CACTUS
      this.cactus = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'cactus');
      this.cactus.anchor.setTo(0.5, 0.5);
      this.cactus.state = this.DEAD;
      this.cactus.visible = false;


//CREATE AIRSHIPS
    airships = this.game.add.group();
    airships.enableBody = true;
    airships.physicsBodyType = Phaser.Physics.ARCADE;
    airships.createMultiple(this.NUM_AIRSHIPS, 'airship');
    airships.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    //airships.setAll('checkWorldBounds', true);
    //airships.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetAirship);


//CREATE BALLOONS
    balloons = this.game.add.group();
    balloons.enableBody = true;
    balloons.physicsBodyType = Phaser.Physics.ARCADE;
    balloons.createMultiple(this.MAX_BALLOONS, 'balloon');
    balloons.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    balloons.setAll('checkWorldBounds', true);
    balloons.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);

    //CREATE fuel plane
    this.fuel_plane = this.game.add.sprite(5, 20, 'fuel_plane');
    this.fuel_plane.anchor.setTo(0.5, 0.5);
    this.fuel_plane.visible = false;
    this.fuel_plane.state = this.DEAD;
	
    //CREATE FUEL_TANK
    this.fuel_tank = this.game.add.sprite(5, 20, 'fuel_tank');
    this.fuel_tank.anchor.setTo(0.5, 0.5);
    this.fuel_tank.visible = false;
    // set alive to off
    this.fuel_tank.state = this.DEAD;
	
  
    //CREATE LAUNCH PAD
    this.launch_pad = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'launch_pad');
    this.launch_pad.anchor.setTo(0.5, 0.5);
    this.launch_pad.visible = false;
    // set alive to off
    this.launch_pad.state = this.DEAD;

}, // end Init_enemies

    ///////////////////////////////////////////////////////////
Initialize_Enemy_Positions: function()
{

    if (this.Level == 1 || this.Level == 3 || this.Level == 5) {
        //HOUSES
        houses.forEach(function (house) {
            house.state = this.ALIVE;
            house.visible = true;
            house.xv = -5;
            house.frame = this.getRandomInt(1, 5);
            house.x = this.getRandomInt(1, this.SCREEN_WIDTH);
            house.y = this.GROUND-30;
        },
    this);
    }

    if (this.Level == 2 || this.Level == 4) {

        //JETS
        jets.forEach(function (jet) {
            jet.state = this.ALIVE;
            jet.visible = true;
            jet.x=this.SCREEN_WIDTH;
            jet.y= this.getRandomInt(1, 300);
            jet.xv = -8;
            jet.yv = 0;
        },
    this);

        this.tank.state = this.ENEMY_STATE_ON;
        this.tank.visible = true;
        this.tank.xv=-5;
        this.tank.reset(this.SCREEN_WIDTH,this.GROUND - 10);
    }
if (this.Level == 3 || this.Level == 5) {
    //AIRSHIPS
    airships.forEach(function (airship) {
        airship.state = this.ALIVE;
        airship.visible = true;
        airship.reset(this.SCREEN_WIDTH,this.getRandomInt(1, 300));
        airship.yv = 0;
        airship.xv = 0;
    },
    this);

    balloons.forEach(function (balloon) {
        balloon.state = this.DEAD;
        balloon.visible = false;
        balloon.x = this.SCREEN_WIDTH;
        balloon.y = this.getRandomInt(1, 240);
    },
        this);
}
},
    //////////////////////////////////////////////////
Delete_Enemies: function()
{
    // this function simply deletes all memory and surfaces
    // related to the enemies pulses

    for (var index=0; index<this.MAX_HOUSES; index++)
    {
        house[index].kill();
        airship[index].kill();
        jet[index].kill();
        balloon[index].kill();
    }
    cactus.kill();
    fuel_tank.kill();
    tank.kill();
    launch_pad.kill();
    this.fuel_plane.kill();
}, // end Delete_enemies

    ///////////////////////////////////////////////////////////

Move_Enemies: function()
{

    // this function moves all the enemies pulses and checks for
    // collision with the enemies
    //MOVE HOUSES
if (this.Level==1 || this.Level==3 || this.Level==5)	
{
    houses.forEach(function(house) {
        if (house.state == this.ALIVE)
        {
            if (this.Level == 1 && house.x < 10 && this.counter > 500 && this.getRandomInt(1, 1500) < 5) { house.x = this.SCREEN_WIDTH; house.frame = 5; }
            if (this.Level == 3 && house.x < 10 && this.counter > 500 && this.getRandomInt(1, 1500) < 5) { house.x = this.SCREEN_WIDTH; house.frame = 6; }
            if (this.Level == 5 && house.x < 10 && this.counter > 500 && this.getRandomInt(1, 5500) < 5) { house.x = this.SCREEN_WIDTH; house.frame = 7; }
            if (this.counter > 500 && this.Level == 5 && this.getRandomInt(1, 500) < 5 && house.x < 10) { house.x = this.SCREEN_WIDTH; house.frame = 8; }
            if(this.Level==5 && house.frame==8 && this.getRandomInt(1,500)<5) this.Fire_Enemy_Missile(house.x,house.y);
            if (house.x < 10 && this.getRandomInt(1, 500) < 10) { house.x = this.SCREEN_WIDTH; house.frame = this.getRandomInt(1, 5); }
            // test if enemies pulse is in flight
            // move the enemy
            house.x+=house.xv;
        }

    // test for collision with enemies
        if (this.Collision_Test(this.player,house)
					   && house.frame == 4
                       && this.player.state == this.ALIVE)
{
            //this.Start_Explosion(this.player.x, this.player.y,
            //            68 + this.getRandomInt(1, 12), 54 + this.getRandomInt(1, 10),
            //           this.player.xv, this.player.yv);
            this.Start_Explosion(house.x, house.y-20,
                               68+this.getRandomInt(1,12),54+this.getRandomInt(1,10),
                               house.xv, house.yv);
                   
    // update players damage
                    this.player_damage+=100;
                    this.counter = 0;
    // update score
                    this.player_score += 60;
                    house.reset();
        } // end if collision
    },
        this);

}//Level 1

if (this.Level==2 || this.Level==4)	
{
    if (this.counter == 500) this.Add_Jet();
    if (this.counter == 1000) this.Add_Jet();
    if (this.counter == 1250) this.Add_Jet();
    if (this.counter == 1300) this.Add_Jet();
    if (this.counter == 1500) this.Add_Jet();
    jets.forEach(function (jet) {
        if (jet.state == this.ALIVE) {
            jet.visible = true;
            jet.x += jet.xv;
            jet.y += jet.yv;
            // move the enemy
            if (jet.y>this.player.y ) jet.yv -= .01;
            if (jet.y < this.player.y) jet.yv += .01;
            if (jet.y > this.GROUND - 50) jet.yv = 0;
            if (jet.x < 10) {
                //jet.reset(this.SCREEN_WIDTH - 20, this.getRandomInt(1, 240));
                jet.x = this.SCREEN_WIDTH-20;
                jet.y = this.getRandomInt(1, 240);
                //jet.yv = 0;
            }
            // test for collision with enemies
            if (this.Collision_Test(this.player, jet)
                           && this.player.state == this.ALIVE) {
                this.Start_Explosion(jet.x, jet.y,
                                   68 + this.getRandomInt(1, 12), 54 + this.getRandomInt(1, 10),
                                   jet.xv *.1, jet.yv *.1);

                // update players damage
                this.player_damage += 100;
                // update score
                this.player_score += 60;
                jet.x=this.SCREEN_WIDTH;
                jet.y=this.getRandomInt(0, this.SCREEN_HEIGHT);
            } // end if collision
        }
    },
             this);

    if (this.tank.x > this.SCREEN_WIDTH / 2 && this.player.x < this.tank.x && this.getRandomInt(1, 100) < 5) this.tank.xv = -3;
if (this.tank.x < this.SCREEN_WIDTH/2) this.tank.xv++;
if (this.player.x > this.tank.x - 20) this.tank.xv += 3;
if (this.tank.x > this.SCREEN_WIDTH) this.tank.xv = -3;

this.tank.x += this.tank.xv;
if (this.getRandomInt(1, 100) < 5 && this.cactus.state == this.DEAD)
{
    this.cactus.visible = true;
    this.cactus.y = this.GROUND-10;
    this.cactus.x = this.SCREEN_WIDTH;
    this.cactus.xv = -10;
    this.cactus.state = this.ALIVE;
}
if (this.cactus.state == this.ALIVE)
{
    if (this.cactus.x < 10) {
        this.cactus.state = this.DEAD;
        this.cactus.visible = false;
    }
    this.cactus.x += this.cactus.xv;
} 

}//Level 2

if (this.Level==3 || this.Level==5)	
{
    if (this.counter == 500) this.Add_Airship();
   if (this.counter == 100) this.Add_Airship();
    if (this.counter == 1250) this.Add_Airship();
    if (this.counter == 1300) this.Add_Airship();
    if (this.counter == 1500) this.Add_Airship();
    airships.forEach(function(airship) {
        // test if enemies pulse is in flight
        if (airship.state == this.ALIVE) {
            // move the enemy
            //airship.xv=-20;
//            console.log(airship.z + ' ' + airship.alive);
            var airShipMove = .5;
            if (this.player.y > airship.y && airship.y < this.GROUND - 50 && airship.yv<1 && this.getRandomInt(1, 100) < 5) {
                airship.y += airShipMove;
            }
            if (this.player.y < airship.y && airship.y > 10 && airship.yv > -1 && this.getRandomInt(1, 100) < 5) {
                airship.y -= airShipMove;
            }
            if ((airship.x > this.SCREEN_WIDTH / 2) && this.player.x < airship.x && airship.xv > -1 && this.getRandomInt(1, 100) < 5) {
               airship.x -= airShipMove;
            }
            if (airship.x < this.player.x) 
                airship.x += airShipMove;
            if(airship.x >this.SCREEN_WIDTH)
                airship.x = this.SCREEN_WIDTH;

            if (airship.x < 0) {
                airship.state = this.ALIVE;
                airship.visible = true;
                airship.reset(this.SCREEN_WIDTH, this.getRandomInt(1, 300));
                airship.yv = 0;
                airship.xv = 0;
            }
            
            //if(rand()%100==5&&airship.x>250)airship.xv--;
            if (this.getRandomInt(1, 100) < 3) this.Release_Balloon(airship.x, airship.y);
            if (airship.y > this.GROUND-50) airship.y -= airShipMove;
            //airship.x += airship.xv;
            //airship.y += airship.yv;

            // test for collision with enemies
            if (this.Collision_Test(this.player, airship)
                           && this.player.state == this.ALIVE) {
                this.Start_Explosion(airship.x, airship.y,
                                   68 + this.getRandomInt(1, 12), 54 + this.getRandomInt(1, 10),
                                   airship.xv * .1, airship.yv * .1);

                // update players damage
                this.player_damage += 100;
                // update score
                this.player_score += 60;
                this.airships_active = 1;
                airship.x = this.SCREEN_WIDTH;
            } // end if collision
        }
    },
        this);

    balloons.forEach(function (balloon) {
        // test if enemies pulse is in flight
        if (balloon.state == this.ALIVE)
    {
    // move the enemy
	 balloon.xv=-10;
	 balloon.yv-=.1;

	 balloon.x+=balloon.xv;
	 balloon.y += balloon.yv;
	 if (balloon.y < 0) {
	     balloon.state = this.DEAD;
	     balloon.visible = false;
	 }
 } // end for index

    
    // test for collision with enemies
    if (this.Collision_Test(this.player,balloon)
					   && this.player.state == this.ALIVE)
{
        this.Start_Explosion(balloon.x, balloon.y,
                               68+this.getRandomInt(1,12),54+this.getRandomInt(1,10),
                               balloon.xv*.1, balloon.yv*.1);
                   
    // update players damage
                   this.player_damage += 100;
    // update score
                   this.player_score += 60;
                   balloon.reset();
} // end if collision

    },
         this);
}//Level 3

if (this.Level==4)	
{
    jets.forEach(function(jet) {
    // test if enemies pulse is in flight
        if (jet.state == this.ENEMY_STATE_ON) {
            if (this.getRandomInt(1, 100) < 5) this.Fire_Enemy_Laser(jet.x, jet.y, -16);

            if (this.getRandomInt(1, 100) < 5) this.Fire_Enemy_Missile(this.tank.x, this.tank.y);
        }
    },
     this);
}//Level 4


}, // end Move_enemies

Add_Jet: function()
{
    var jet = this.game.add.sprite(this.SCREEN_WIDTH, this.getRandomInt(1, 240), 'jet');
    jet.state = this.ALIVE;
    jet.visible = true;
    //  And then add it to the group
    jets.add(jet);
},

Add_Airship: function()
{
    var airship = this.game.add.sprite(this.SCREEN_WIDTH, this.getRandomInt(1, 240), 'airship');
    airship.state = this.ALIVE;
    airship.visible = true;
    //  And then add it to the group
    airships.add(airship);
},
    ///////////////////////////////////////////////////////////


Init_Explosions: function()
{
    // this function initializes and loads all the Explosions 

    // create the first Explosion 
    explosions = this.game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(this.MAX_EXPLOSIONS, 'explosions');
    explosions.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    explosions.setAll('xv', -5);

    //new Animation(game, parent, name, frameData, frames, frameRate, loop, loop)
    var frameNames = Phaser.Animation.generateFrameNames('explosion', 0, 14, '', 4);
    explosions.callAll('animations.add', 'animations', 'explode', frameNames, 14, true, false);
    
    //


}, // end Init_Explosions

    ///////////////////////////////////////////////////////////


Start_Explosion: function(x, y, width, height, xv,yv)
{

        var explosion = explosions.create(x, y, 'explosion');

        explosion.animations.add('explode');

        explosion.play('explode',20, false, true);
       explosion.state = this.ALIVE;
          
    // later
       return;

 

}, // end Start_Explosion

    ///////////////////////////////////////////////////////////

Release_Balloon: function(x,y)
{
    var balloon = balloons.getFirstExists(false); 
    // test if Laser pulse is in flight
        var released = false;
    if (balloon.state==this.DEAD && !released) {
        balloon.state = this.ALIVE;
        balloon.visible = true;
        balloon.x = x
        balloon.y = y;
        balloon.xv = -10;
        balloon.yv = -1;
        released = true;
    }

}, // end Start_Explosion

    ///////////////////////////////////////////////////////////
Init_Score: function()
{
    var f = '16pt Arial';
    var color = ' rgb(0,255,0)';
    var t = this.add.text(10, 10, "", { fill: color, font: f });
    this.scoreText.push(t);        
    var t = this.add.text(170, 10, "", { fill: color, font: f });
    this.scoreText.push(t);
    var t = this.add.text(360, 10, "", { fill: color, font: f });
    this.scoreText.push(t);
    var t = this.add.text(600, 10, "", { fill: color, font: f });
    this.scoreText.push(t);
},

Draw_Score: function ()
{
    // this function draws all the information at the top of the screen

    this.Update_Score_Text(0,"SCORE: " + this.player_score);

    this.Update_Score_Text(1,"HIGH SCORE: " + this.highscore);

    this.Update_Score_Text(2,"FUEL LEFT: " + this.Fuel_Left);

    this.Update_Score_Text(3,"SHIPS: " + this.player_ships);

}, // end Draw_Info

    ///////////////////////////////////////////////////////////
Regenerate_Player: function()
{
    //++this.player_counter > 60 && 
    if (this.player_ships > 0)
{
    // set state to ready
        this.player.state = this.ALIVE;
        this.player.x = 20
        this.player.y = 220;
        this.Fuel_Left = this.MAX_FUEL;
        this.outoffuel = 0;
        this.player.xv = 0;
        this.player.yv = 0;
        this.showintro = 0;
        this.counter = 0;
        this.radar_killed = 0;
        this.tank_killed = 0;
        this.icbm_killed = 0;
        this.player_damage = 0;
        this.player.anchor.set(0.3, 0.5);
        this.Initialize_Enemy_Positions();
    // stop the intro if not already
}
},
    ///////////////////////////////////////////////////////////
//Game_Intro: function()
//{

//    while (this.intro_state == 0)
//{

//        this.splash.visible = true;
 
//}
//return(1);
//},

///////////////////////////////////////////////////////////

Do_Intro: function()
{
    // the world's simplest intro
    this.Draw_Info_Text("LEVEL:" + this.Level, 300, 200, 32, 'rgb(0,255,0)', 'Impact');

if (this.Level==1)
    this.Draw_Info_Text("DESTROY THE RADAR", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (this.Level==2)
    this.Draw_Info_Text("WASTE THE TANK", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (this.Level==3)
    this.Draw_Info_Text("BOMB THE ICBM", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (this.Level==4)
    this.Draw_Info_Text("DEMOLISH THE TANK AGAIN", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (this.Level==5)
    this.Draw_Info_Text("WIPE OUT THE HEADQUARTERS", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
}, // end Do_Intro


    ///////////////////////////////////////////////////////////

Game_Shutdown: function()
{
    // this function is where you shutdown your game and
    // release all resources that you allocated

    // delete all the explosions
Delete_Explosions();
    
    // delete the player
this.player.kill;

    // the delete all the enemies
Delete_Enemies();

    // delete all the Laser pulses
Delete_Laser();


    // return success
return(1);
}, // end Game_Shutdown

    ///////////////////////////////////////////////////////
Game_Main: function()
{
    // this is the workhorse of your game it will be called
    // continuously in real-time this is like main() in C
    // all the calls for you game go here!
    var ready_counter = 0; // used to draw a little "get ready"
    var ready_state   = 1;
    if (this.showintro == 1) {
        this.Do_Intro();
        this.showintro = 0;
    }
    // start the timing clock
//Start_Clock();

//if (this.intro_state == 0) this.Game_Intro();
    // only process player if alive
if (this.player.state == this.ALIVE)
{
   this.player.x += this.player.xv;
   this.player.y += this.player.yv;
this.counter++;
if (this.Fuel_Left == this.MAX_FUEL/2) {
    this.fuel_plane.state = this.ALIVE;
    this.Send_Fuel_Plane();

}

if (this.fuel_plane.state == this.ALIVE || this.fuel_tank.state == this.ALIVE) {
    this.fuel_plane.x += this.fuel_plane.xv;
    if (this.fuel_plane.state == this.ALIVE && this.fuel_tank.state == this.DEAD)
        this.fuel_tank.x = this.fuel_plane.x;

    if (this.fuel_plane.x > this.SCREEN_WIDTH / 2 && this.fuel_tank.state == this.DEAD) this.fuel_tank.state = this.ALIVE;
    if (this.fuel_tank.state == this.ALIVE) {
        this.fuel_tank.yv = 1;
        this.fuel_tank.xv = -1;
        this.fuel_tank.x += this.fuel_tank.xv;
        this.fuel_tank.y += this.fuel_tank.yv;
        this.fuel_tank.visible = true;

        if (this.Collision_Test(this.fuel_tank, this.player)) {
            this.fuel_tank.state = this.DEAD;
            this.Fuel_Left = this.MAX_FUEL;
        }

        if (this.fuel_tank.y > this.GROUND) {
            this.fuel_tank.state = this.DEAD;
            this.Start_Explosion(this.fuel_tank.x, this.fuel_tank.y - 50,
                                68 + this.getRandomInt(1, 12), 54 + this.getRandomInt(1, 10),
                              this.fuel_tank.xv *.1, this.fuel_tank.yv *.1);
        }
    }

}
    if (this.Fuel_Left > 0) this.Fuel_Left -= 5;
    if (this.Fuel_Left == 0) this.outoffuel = 1;
    if (this.outoffuel == 1) {
    this.player.y += 5;
    this.Draw_Info_Text("OUT OF FUEL", 300, 250, 32, 'rgb(255,0,0)', 'Impact');
}
    // do bounds check
if(this.player.x>10)this.player.x--;

if (this.player.x < 10)
    this.player.x = 10;
else
    if (this.player.x > (this.SCREEN_WIDTH - 100))
        this.player.x = (this.SCREEN_WIDTH - 100);

if (this.player.y < 10)
    this.player.y = 10;

if (this.player.y > this.SCREEN_HEIGHT - 80 && this.outoffuel == 0)
    this.player.y = this.SCREEN_HEIGHT - 80;
if (this.player.y > this.SCREEN_HEIGHT - 80 && this.outoffuel == 1)
    this.player_damage = 100;
    // test for dying state transition
if (this.player_damage >= 100)
{
    // kill player
    this.player.state = this.DEAD;
    this.player.visible = false;
    this.player_ships--;
    // set counter to 0
    this.player_counter = 0;
} // end if
} // end if player alive


if (this.player.state == this.DEAD)
{ 
    // player is dead
    if ((this.getRandomInt(1, 4) % 4) == 1 && this.player_counter < 60)
        this.Start_Explosion(this.player.x - 16 + this.getRandomInt(1, 40), this.player.y - 50 + this.getRandomInt(1, 8),
                   this.player.width, this.player.height,
                   -4+this.getRandomInt(1,8),2+this.getRandomInt(1,4));    

    this.Regenerate_Player();
    this.ready_state = 1;
    this.ready_counter = 0;
    // set position
} // end if

    //GAME OVER ?
if (this.player.state == this.DEAD && this.player_ships == 0)
{
    // player is dead
    this.ready_state = 1;
    this.gameover = true;
    // draw text
    this.Draw_Info_Text("G A M E    O V E R",
                 320,
                 200, 32, 'rgb(255,0,0)', 'Impact');
    this.Draw_Info_Text("Press spacebar play again",
                 220,
                 280, 32, 'rgb(255,0,0)', 'Impact');
} // end if


    //NEXT LEVEL?

if (this.radar_killed&&this.Level==1)
{
    this.Level = 2;
    this.Regenerate_Player();
    houses.callAll('kill'); 
	this.ready_state = 1;
	this.ready_counter = 0;
	this.showintro = 1;
}

if (this.tank_killed && this.Level == 2)
{
    this.Level = 3;
    this.Regenerate_Player();
    jets.callAll('kill');
    this.tank.kill();
    this.cactus.kill();
    this.ready_state = 1;
    this.ready_counter = 0;
    this.showintro = 1;
}

if (this.icbm_killed && this.Level==3)
{
    this.Level = 4;
    this.Regenerate_Player();
    houses.callAll('kill');
    this.ready_state = 1;
    this.ready_counter = 0;
    this.showintro = 1;
}

if (this.tank_killed && this.Level == 4)
{
    this.Level = 5;
    this.cactus.kill();
    jets.callAll('kill');
    this.tank.kill();
    this.Regenerate_Player();
    this.ready_state = 1;
    this.ready_counter = 0;
    this.showintro = 1;
}

if (this.headquarters_killed)
{
    //this.ready_state = 1;
    //this.gameover = true;

    // draw text
    var str = "C O N G R A T U L A T I O N S !";
    var n = str.length;
    this.Draw_Info_Text(str,this.SCREEN_WIDTH-6*n/2,200,'rgb(255,0,0)','Impact');
    str = "You Have Completed Your Mission";
    n = str.length;
    this.Draw_Info_Text(str, this.SCREEN_WIDTH - (6 * n) / 2,220, 'rgb(255,0,0)', 'Impact');
    str = "Hit Escape to Exit";
    n = str.length;
    this.Draw_Info_Text(str, this.SCREEN_WIDTH - (6 * n) / 2, 240, 'rgb(255,0,0)', 'Impact');
    str = "Or P to Play Again";
    n = str.length;
    this.Draw_Info_Text(str, this.SCREEN_WIDTH - (6 * n) / 2, 260, 'rgb(255,0,0)', 'Impact');
}

if (this.player_score > this.highscore) this.highscore = this.player_score;
    // draw the player if alive
if (this.player.state == this.ALIVE)
{
    this.player.visible = true;
} // end if

    // move the Laser
this.Move_Laser();
    // move the asteroids
this.Move_Enemies();


    // move the stars
this.Move_Stars();

    // draw the enemies
if (this.showintro > 59) this.Draw_Enemies();

    // draw the Laser
//this.Draw_Laser();

    // draw the stars
//this.Draw_Stars();

    // draw explosions last
//this.Draw_Explosions();

    // draw the score and ships left
this.Draw_Score();

    // check of user is trying to exit
//if (KEY_DOWN(VK_ESCAPE))
//    PostMessage(main_window_handle, WM_DESTROY,0,0);

    // return success
return(1);

}, // end Game_Main

Update_Score_Text: function(index,text)
{
    this.scoreText[index].text = text;
    //= this.add.text(x, y, text, { fill: color, font: size + 'pt ' + font });
        this.scoreText[index].updateText();
},

Draw_Info_Text: function(text,x,y,size,color,font)
{
    this.infoText = this.add.text(this.game.world.centerX, y, text, { fill: color, font: size + 'pt ' + font });
    this.infoText.updateText();
    //this.infoText.anchor.setTo(0.5, 0.5);
    this.time.events.add(5000, this.infoText.destroy, this.infoText);
    this.infoText.anchor.setTo(0.5);
}

};
