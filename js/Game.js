StarBlazer.Game = function (game) {
    this.gameLost = false;
    this.gameWon = false;
    this.WINDOW_WIDTH  =  64;   // size of window
    this.WINDOW_HEIGHT =  48;

    // weapons defines
    this.LASER_STATE_OFF =  0;   // this Laser is dead or off
    this.LASER_STATE_ON  =  1;   // this one is alive and in flight
    this.MAX_LASERS =  12; 

    //enemy defines
    this.MAX_HOUSES   =       12;
    this.MAX_AIRSHIPS  =      12;
    this.MAX_JETS       =     12;
    this.MAX_BALLOONS    =    12;

    this.MAX_STARS = 28;

    this.ENEMY_STATE_OFF =    0;   // this enemy is dead or off
    this.ENEMY_STATE_ON  =    1;   // this one is alive
    this.SCRAMBLE_STATE_RETREATING =2;

    this.MAX_ENEMY_Laser  = 12; 
    this.ENEMY_LASER_STATE_OFF =  0;   // this Laser is dead or off
    this.ENEMY_LASER_STATE_ON  =  1;   // this one is alive and in flight

    // explosion defines 
    this.MAX_EXPLOSIONS      =    8;
    this.EXPLOSION_STATE_OFF  =   0;   // this Explosion is dead or off
    this.EXPLOSION_STATE_ON  =    1;   // this one is alive

    // defines for player states
    this.PLAYER_STATE_DEAD  =   0;
    this.PLAYER_STATE_ALIVE =   1; 
    
    this.KEYCODE_A = 65;
    this.KEYCODE_Z = 90;
    this.KEYCODE_LEFT = 37;
    this.KEYCODE_RIGHT = 39;
    this.KEYCODE_SPACE = 32;
    this.KEYCODE_P = 80;

    this.background;
    this.title;

    this.player;            // the player 

    this.Lasers=[];    // Laser pulses
    this.bomb;    // Laser pulses
    this.enemy_missiles=[];    // Laser pulses
    this.enemy_Lasers=[];

    this.houses=[];

    this.fuel_ship;
    this.fuel_tank;
    this.airships=[];
    this.balloons=[];
    this.jets=[];
    this.cactus;
    this.launch_pad;
    this.tank;
    this.showintro=0;
    this.explosions=[];    // the explosion Explosions
    this.intro_state=0;
    this.stars=[]; // the star field
    this.counter;
    this.Level=1,Fuel_Left=2000;
    this.radar_killed = 0;
    this.tank_killed = 0;
    this.icbm_killed = 0;
    this.headquarters_killed = 0;
    this.balloons_active = 5;
    this.jets_active = 5;
    this.airships_active = 1;
    this.outoffuel;
    this.attack_speed=5;
    // player state variables
    this.player_state       = this.PLAYER_STATE_ALIVE;
    this.player_score       = 0;  // the score
    this.highscore          = 0;  // the high score
    this.player_ships       = 3;  // ships left
    this.player_damage      = 0;  // damage of player
    this.player_counter     = 0;  // used for state transition tracking
    this.player_regen_count = 0;  // used to regenerate player
   
    window.addEventListener("keypress", this.myEventHandler, false);
    
};
StarBlazer.Game.prototype = {
    create: function() {
        this.Game_Init();
 
    },

    myEventHandler: function (e){
        var keyCode = e.keyCode;
    // test if player is moving
    if (keyCode == this.KEYCODE_RIGHT&&this.outoffuel==0)
    {
        // move player to right
        player.xv+=1;

    } // end if
    if (keyCode == this.KEYCODE_LEFT&&this.outoffuel==0)
    {
        // move player to left
        player.xv-=1;

    } // end if
    if (keyCode == this.KEYCODE_DOWN&&this.outoffuel==0)
    {
        // move player up
        player.yv-=1;

    } // end if
    if (keyCode == this.KEYCODE_DOWN&&this.outoffuel==0)
    {
        // move player down
        player.yv+=1;

    } // end if

    // test if player is firing
    if (keyCode == this.KEYCODE_SPACE &&this.player.y<360)
        this.Fire_Laser(this.player.x+16,this.player.y+15,26);

    if (keyCode == this.KEYCODE_SPACE&&this.player.y>=360)
        this.Drop_Bomb(this.player.x + 16, this.player.y + 15, 1);
        // check of user is trying to start over
    if (keyCode == this.KEYCODE_P && ready_state == 1 && player_ships == 0) {
        this.Level = 1; this.attack_speed = 5; this.showintro = 0;
        this.jets_active = 5; this.airships_active = 1;
        this.player_state = this.PLAYER_STATE_ALIVE; this.player_score = 0;
        this.player_ships = 3; this.player_damage = 0;
        this.Fuel_Left = 2000; this.Regenerate_Player();
    }


},
    Game_Init: function(){
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.gameLost = false;
        this.gameWon = false;

        // load the background bitmap in with all the graphics
        var background = this.add.image(0, 0, 'background');
        background.width = this.game.width;
        background.height = this.game.height;
       // this.spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);  
       // this.upKey = this.input.keyboard.addKey(Phaser.Keyboard.A);
       // this.downKey = this.input.keyboard.addKey(Phaser.Keyboard.Z);
       // this.leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
       // this.rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.player = this.add.sprite(220, 20, 'player');
        this.player.anchor.set(0.5, 0);

       this.player.animations.add('playerjet');

        this.player.animations.play('playerjet', 50, true);

        this.player.animations.currentAnim.onComplete.add(function () { this.change_state(1) }, this);
        this.Init_Laser();

        this.Init_Stars();

        this.Init_Enemies();
        this.Initialize_Enemy_Positions();

        this.Init_Explosions();

        // hide the mouse
        //ShowCursor(FALSE);
    },

    update: function() {
        this.Game_Main();
    },


    Init_Stars: function()
    {
        // this function initializes all the stars in such a way
        // that their intensity is proportional to their 
        // velocity
        this.stars = this.game.add.group();
        this.stars.enableBody = true;
        this.stars.physicsBodyType = Phaser.Physics.ARCADE;
        this.stars.createMultiple(this.MAX_STARS, 'star');
        this.stars.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.stars.setAll('checkWorldBounds', true);
        this.stars.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);

        this.stars.forEach(function(star) {
            // random postion
            star.x = this.getRandomInt(0, this.SCREEN_WIDTH);
            star.y = this.getRandomInt(0, this.SCREEN_HEIGHT);

            // select star plane
            var plane = this.getRandomInt(1, 4); // (1..4)

            // based on plane select velocity and color
            star.xv = -plane;
            //  stars[index].color = 25 - (plane*3);
            //star.color = color(this.getRandomInt(1, 255),
            //    this.getRandomInt(1, 255),
            //    this.getRandomInt(1, 255));
        }, this); // end for index

    }, // end Init_Stars

    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    Move_Stars: function()
    {
        // this function moves all the stars

        this.stars.forEach(function(star) {
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
        this.lasers = this.game.add.group();
        this.lasers.enableBody = true;
        this.lasers.physicsBodyType = Phaser.Physics.ARCADE;
        this.lasers.createMultiple(this.MAX_LASER, 'laser');
        this.lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.lasers.setAll('checkWorldBounds', true);
        this.lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);

        this.bomb = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'bomb');

        this.bomb.anchor.setTo(0.5, 0.5);
        this.bomb.visible = this.ENEMY_STATE_OFF;

        //CREATE ENEMY MISSILES
        this.enemy_missiles = this.game.add.group();
        this.enemy_missiles.enableBody = true;
        this.enemy_missiles.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemy_missiles.createMultiple(this.MAX_ENEMY_LASER, 'enemy_missile');
        this.enemy_missiles.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.enemy_missiles.setAll('checkWorldBounds', true);
        this.enemy_missiles.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);

        //CREATE ENEMY LASER PULSES
        this.enemy_lasers = this.game.add.group();
        this.enemy_lasers.enableBody = true;
        this.enemy_lasers.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemy_lasers.createMultiple(this.MAX_ENEMY_LASER, 'enemy_laser');
        this.enemy_lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        this.enemy_lasers.setAll('checkWorldBounds', true);
        this.enemy_lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);


    },
    ///////////////////////////////////////////////////////////
    resetObject: function(object) {
        // Destroy the laser
        object.kill();
    },

    ///////////////////////////////////////////////////////////

    Move_Laser: function() {
        // this function moves all the Laser pulses and checks for
        // collision with the enemies

        this.lasers.forEach(function(laser) {
            if (laser.state == LASER_STATE_ON) {
                // move the pulse upward
                laser.x += this.Laserspeed;

                // test for boundaries
                if (laser.x > this.SCREEN_WIDTH) {
                    // kill the pulse
                    laser.state = LASER_STATE_OFF;
                }

                // test for collision with enemies
                //Laser COLLISION WITH JETS
                if (this.Level == 2 || this.Level == 4) {
                    this.jets.forEach(function(jet) {
                        if (jet.state == this.ENEMY_STATE_ON) {
                            // test for collision 

                            if (this.Collision_Test(laser.x,
                                laser.y,
                                laser.width,
                                laser.height,
                                jet.x,
                                jet.y,
                                jet.width,
                                jet.height)) {
                                // kill pulse
                                laser.state = LASER_STATE_OFF;

                                jet.x = 700;

                                this.Start_Explosion(laser.x - 10,
                                    laser.y - 20,
                                    42,
                                    36,
                                    jet.xv >> 1,
                                    jet.yv >> 1);

                                // update score
                                this.player_score += 100;
                            } // end if collision
                        } //end for airship
                    },
                        this); // end Level 3

                    //Laser COLLISION WITH AIRSHIPS
                    if (this.Level == 3 || this.Level == 5) {
                        this.airships.forEach(function(airship) {
                            if (airship.state == this.ENEMY_STATE_ON) {
                                // test for collision 
                                if (this.Collision_Test(laser.x,
                                    laser.y,
                                    laser.width,
                                    laser.height,
                                    airship.x,
                                    airship.y,
                                    airship.width,
                                    airship.height)) {
                                    // kill pulse
                                    laser.state = LASER_STATE_OFF;

                                    airship.x = 700, airship.y = this.getRandomInt(0, 240);
                                    airship.xv = -1, airship.yv = -1;


                                    this.Start_Explosion(laser.x - 10,
                                        laser.y - 20,
                                        42,
                                        36,
                                        airship.xv >> 1,
                                        airship.yv >> 1);

                                    // update score
                                    this.player_score += 10;
                                } // end if collision
                            } //end if airship
                        },
                            this); //end for airship

                        this.balloons.forEach(function(balloon) {
                            if (balloon.state == this.ENEMY_STATE_ON) {
                                // test for collision 
                                if (this.Collision_Test(laser.x,
                                    laser.y,
                                    laser.width,
                                    laser.height,
                                    balloon.x,
                                    balloon.y,
                                    balloon.width,
                                    balloon.height)) {
                                    // kill pulse
                                    laser.state = LASER_STATE_OFF;

                                    balloon.state = this.ENEMY_STATE_OFF;

                                    this.Start_Explosion(laser.x - 10,
                                        laser.y - 20,
                                        42,
                                        36,
                                        balloon.xv >> 1,
                                        balloon.yv >> 1);

                                    // update score
                                    this.player_score += 10;
                                } // end if collision
                            } //end if airship


                        },
                            this); // end Level 3
                    }
                    if (this.Level == 4 || this.Level == 5) {
                        this.enemy_missiles.forEach(function(enemy_missile) {
                            if (enemy_missile.state == this.ENEMY_STATE_ON) {
                                // test for collision 
                                if (this.Collision_Test(laser.x,
                                    laser.y,
                                    laser.width,
                                    laser.height,
                                    enemy_missile.x,
                                    enemy_missile.y,
                                    enemy_missile.width,
                                    enemy_missile.height)) {
                                    // kill pulse
                                    laser.state = LASER_STATE_OFF;

                                    enemy_missile.state = this.ENEMY_STATE_OFF;

                                    this.Start_Explosion(laser.x - 10,
                                        laser.y - 20,
                                        42,
                                        36,
                                        enemy_missile.xv >> 1,
                                        enemy_missile.yv >> 1);

                                    // update score
                                    this.player_score += 100;
                                } // end if collision
                            } //end if airship


                        },
                            this); // end Level 4 or 5
                    }
                }
            }
            // end if Laser
        },
            this); // end for Laser

        //CHECK IF BOMB IS DROPPING
        if (this.bomb.state == this.LASER_STATE_ON) {
            this.bomb.yv++;
            this.bomb.y += this.bomb.yv;

            // test for boundaries
            if (this.bomb.y > 440) {
                // kill the pulse
                this.bomb.state = this.LASER_STATE_OFF;
                this.Start_Explosion(this.bomb.x - 10,
                    this.bomb.y - 24,
                    42,
                    36,
                    this.bomb.xv >> 1,
                    this.bomb.yv >> 1);
            }

            // test for collision with enemies

            //BOMBS DROPPING ON HOUSES, RADAR
            if (this.Level == 1 || this.Level == 3 || this.Level == 5) {
                this.houses.forEach(function(house) {
                    if (house.state == this.ENEMY_STATE_ON) {
                        // test for collision 
                        if (this.Collision_Test(this.bomb.x,
                            this.bomb.y,
                            this.bomb.width,
                            this.bomb.height,
                            house.x,
                            house.y + 60,
                            house.width,
                            house.height)) {
                            // kill pulse
                            this.bomb.state = this.LASER_STATE_OFF;

                            if (house.curr_frame != 1) house.state = this.ENEMY_STATE_OFF;

                            if (house.curr_frame != 1)
                                this.Start_Explosion(bomb.x - 10,
                                    this.bomb.y - 20,
                                    42,
                                    36,
                                    house.xv >> 1,
                                    house.yv >> 1);
                            if (house.curr_frame == 5) this.radar_killed = 1, this.player_score += 100;
                            if (house.curr_frame == 6) this.icbm_killed = 1, this.player_score += 500;
                            if (house.curr_frame == 7) this.headquarters_killed = 1, this.player_score += 1500;
                            // update score
                            this.player_score += 10;
                        } // end if collision
                    } //end for airship
                },
                    this); // end for Laser
            }

            if (this.Level == 2 || this.Level == 4) {
                if (this.tank.state == this.ENEMY_STATE_ON) {
                    // test for collision 
                    if (this.Collision_Test(this.bomb.x,
                        this.bomb.y,
                        this.bomb.width,
                        this.bomb.height,
                        this.tank.x,
                        this.tank.y,
                        this.tank.width,
                        this.tank.height)) {
                        // kill pulse
                        this.bomb.state = this.LASER_STATE_OFF;
                        this.Start_Explosion(this.bomb.x - 10,
                            this.bomb.y - 20,
                            42,
                            36,
                            this.tank.xv >> 1,
                            this.tank.yv >> 1);
                        // update score
                        this.tank_killed = 1, this.player_score += 500;
                    } // end if collision
                } //end if airship
                if (this.cactus.state == this.ENEMY_STATE_ON) {
                    // test for collision 
                    if (this.Collision_Test(this.bomb.x,
                        this.bomb.y,
                        this.bomb.width,
                        this.bomb.height,
                        this.cactus.x,
                        this.cactus.y,
                        this.cactus.width,
                        this.cactus.height))
                        // kill pulse
                        this.bomb.state = this.LASER_STATE_OFF;
                }
            } // end Level 2


        } //end bomb

        //MOVE ENEMY Laser
        if (this.Level == 4) {
            this.enemy_lasers.forEach(function(enemy_laser) {
                if (enemy_laser.state == ENEMY_LASER_STATE_ON) {
                    enemy_laser.xv = -30;
                    // move the pulse downward
                    enemy_laser.x += enemy_laser.xv;

                    // test for boundaries
                    if (enemy_laser.x < 10) {
                        // kill the pulse
                        enemy_laser.state = ENEMY_LASER_STATE_OFF;

                    } // end if

                    // test for collision with player
                    if (this.Collision_Test(enemy_laser.x,
                            enemy_laser.y,
                            enemy_laser.width,
                            enemy_laser.height,
                            player.x,
                            player.y,
                            player.width,
                            player.height) &&
                        this.player_state == this.PLAYER_STATE_ALIVE) {
                        this.Start_Explosion(enemy_laser.x,
                            enemy_laser.y,
                            68 + this.getRandomInt(0, 12),
                            54 + this.getRandomInt(1, 10),
                            enemy_laser.xv >> 1,
                            enemy_laser.yv >> 1);

                        // update players damage
                        this.player_damage += 100;


                        // kill the original
                        enemy_laser.state = ENEMY_LASER_STATE_OFF;

                    } // end if collision

                } // end if
            },
                this); // end for Laser
        }

        //MOVE ENEMY MISSILES
        if (this.Level == 4 || this.Level == 5) {
            this.enemy_missiles.forEach(function(enemy_missile) {
                if (enemy_missile.state == ENEMY_LASER_STATE_ON) {
                    enemy_missile.xv--;
                    if (player.y < enemy_missile.y) enemy_missile.y -= 3;
                    if (player.y > enemy_missile.y) enemy_missile.y += 3;
                    // move the pulse downward
                    enemy_missile.x += enemy_missile.xv;
                    enemy_missile.y += enemy_missile.yv;

                    // test for boundaries
                    if (enemy_missile.x < 10) {
                        // kill the pulse
                        enemy_missile.state = ENEMY_LASER_STATE_OFF;

                    } // end if

                    // test for collision with player
                    if (this.Collision_Test(enemy_missile.x,
                            enemy_missile.y,
                            enemy_missile.width,
                            enemy_missile.height,
                            player.x,
                            player.y,
                            player.width,
                            player.height) &&
                        player_state == PLAYER_STATE_ALIVE) {
                        Start_Explosion(enemy_missile.x,
                            enemy_missile.y,
                            68 + this.getRandomInt(1, 12),
                            54 + this.getRandomInt(1, 10),
                            enemy_missile.xv >> 1,
                            enemy_missile.yv >> 1);

                        // update players damage
                        this.player_damage += 100;


                        // kill the original
                        enemy_missile.state = ENEMY_LASER_STATE_OFF;

                    } // end if collision

                } // end if
            },
                this); // end for Laser
        } // end Move_Laser
    },
    //////////////////////////////////////////////////////////

    Collision_Test: function(x1,y1,w1,h1,x2,y2,w2,h2) 
    {
        // this function tests if the two rects overlap

        // get the radi of each rect
        var width1  = (w1>>1) - (w1>>3);
        var height1 = (h1>>1) - (h1>>3);

        var width2  = (w2>>1) - (w2>>3);
        var height2 = (h2>>1) - (h2>>3);

        // compute center of each rect
        var cx1 = x1 + width1;
        var cy1 = y1 + height1;

        var cx2 = x2 + width2;
        var cy2 = y2 + height2;

        // compute deltas
        var dx = Math.abs(cx2 - cx1);
        var dy = Math.abs(cy2 - cy1);

        // test if rects overlap
        if (dx < (width1+width2) && dy < (height1+height2))
            return(1);
        else
            // else no collision
            return(0);

    }, // end Collision_Test

    //////////////////////////////////////////

    Draw_Laser: function()
    {
        /*
        // this function draws all the Laser pulses
    
        // test if Laser pulse is in flight
        for (var index=0;index<this.MAX_LASER;index++)
        {
            if (Laser[index].state == LASER_STATE_ON)
        {
            // draw the pulse
                Laser[index].visible = true;
        } // end if
       
    }
      
    if (bomb.state == LASER_STATE_ON)
    {
        // draw the pulse
        bomb.visible = true;
    } // end if
       
    
    for (index=0;index<this.MAX_ENEMY_Laser;index++)
    {
        if (enemy_laser.state == ENEMY_LASER_STATE_ON)
        {
            // draw the pulse
            enemy_laser.visible = true;
        } // end if
    }
    for (index=0;index<this.MAX_ENEMY_Laser;index++)
    {
        if (enemy_missile[index].state == ENEMY_LASER_STATE_ON)
        {
            // draw the pulse
            enemy_missile[index].visible = true;
        } // end if
    }
    */
    }, // end Draw_Laser

    ///////////////////////////////////////////////////////////

    Fire_Laser: function(x,y,vel)
    {
        // this function fires a Laser pulse at the given starting
        // position and velocity, of course, one must be free for 
        // this to work

        // test if Laser pulse is in flight
        this.lasers.forEach(function(laser) {
            if (laser.state == this.LASER_STATE_OFF)
            {
                // start this one up
                laser.x = x;
                laser.y = y;
                laser.xv = vel;
                laser.state = this.LASER_STATE_ON;
       
                // later
                return 1;

            } // end if
        },
    this); // end for Laser


    }, // end Fire_Laser

    ///////////////////////////////////////////////////////////

    Drop_Bomb: function(x,y, vel)
    {
        // this function fires a Laser pulse at the given starting
        // position and velocity, of course, one must be free for 
        // this to work

        if(bomb.state==LASER_STATE_OFF)// start this one up
        {
            bomb.x  = x;
            bomb.y  = y;
            bomb.xv = this.player.xv;
            bomb.yv = vel;
            bomb.state =  LASER_STATE_ON;
            // later
            return;

        } // end if


    }, // end Drop_Bomb
    ///////////////////////////////////////////////////////////

    Send_Fuel_Ship: function()
    {
        if(this.fuel_ship.state==this.PLAYER_STATE_ALIVE)
        {
            this.fuel_ship.visible = true;
            this.fuel_ship.x+=this.fuel_ship.xv;
            this.fuel_ship.xv=5;
            this.fuel_ship.y=20;
        }
        // start this one up
        if (this.fuel_tank.state == this.PLAYER_STATE_DEAD) this.fuel_tank.x = this.fuel_ship.x, this.fuel_tank.y = this.fuel_ship.y;
        if(this.fuel_ship.x>600)this.fuel_ship.state=PLAYER_STATE_DEAD,this.fuel_ship.x=0;
        if(this.fuel_ship.x==320)fuel_tank.state=PLAYER_STATE_ALIVE;
        if(fuel_tank.state==PLAYER_STATE_ALIVE)
        {
            fuel_tank.yv=5;
            fuel_tank.xv=-1;
            fuel_tank.x+=fuel.tank.xv;
            fuel_tank.y+=fuel.tank.yv;
            fuel_tank.visible = true;

            if (this.Collision_Test(fuel_tank.x, fuel_tank.y,
           fuel_tank.width, fuel_tank.height,
           player.x, player.y, player.width, player.height))
            {
                fuel_tank.state=PLAYER_STATE_DEAD;
                Fuel_Left=2000;
            }

            if (fuel_tank.y>400) 
            {
                fuel_tank.state=PLAYER_STATE_DEAD;
                Start_Explosion(fuel_tank.x, fuel_tank.y, 
                                    68+this.getRandomInt(1,12),54+this.getRandomInt(1,10),
                                  fuel_tank.xv>>1, fuel_tank.yv>>1);
            }
        }
    }, // end Fire_Laser

    ///////////////////////////////////////////////////////////

    Fire_Enemy_Laser: function(x,y, vel)
    {
        // this function fires a Laser pulse at the given starting
        // position and velocity, of course, one must be free for 
        // this to work
        this.enemy_lasers.forEach(function(enemy_laser) {
            // test if Laser pulse is in flight
            if (enemy_laser.state == ENEMY_LASER_STATE_OFF)
            {
                // start this one up
                enemy_laser.x  = x;
                enemy_laser.y  = y;
                enemy_laser.xv = -vel;
                enemy_laser.state =  ENEMY_LASER_STATE_ON;
       
                // later
                return;

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

    this.enemy_missiles.forEach(function(enemy_missile) {
        // test if Laser pulse is in flight
if (enemy_missile.state == this.ENEMY_LASER_STATE_OFF)
{
    // start this one up
    enemy_missile.x  = x;
    enemy_missile.y  = y;
    enemy_missile.xv = -8;
    enemy_missile.state =  this.ENEMY_LASER_STATE_ON;
       
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
    
    this.houses = this.game.add.group();
    this.houses.enableBody = true;
    this.houses.physicsBodyType = Phaser.Physics.ARCADE;
    this.houses.createMultiple(this.MAX_HOUSES, 'level_1_enemies');
    this.houses.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    this.houses.setAll('checkWorldBounds', true);
    this.houses.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);


     // set state to off
    this.houses.setAll('state',this.ENEMY_STATE_ON);
    this.houses.setAll('y',390);	
    this.houses.setAll('x',600);
    this.houses.setAll('xv',-8);


//CREATE JETS
    this.jets = this.game.add.group();
    this.jets.enableBody = true;
    this.jets.physicsBodyType = Phaser.Physics.ARCADE;
    this.jets.createMultiple(this.MAX_JETS, 'jet');
    this.jets.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    this.jets.setAll('checkWorldBounds', true);
    this.jets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);

//CREATE TANK
      this.tank = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'tank');
      this.tank.anchor.setTo(0.5, 0.5);
      this.tank.visible = false;

//CREATE CACTUS
      this.cactus = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'cactus');
      this.cactus.anchor.setTo(0.5, 0.5);
      this.cactus.visible = false;


//CREATE AIRSHIPS
    this.airships = this.game.add.group();
    this.airships.enableBody = true;
    this.airships.physicsBodyType = Phaser.Physics.ARCADE;
    this.airships.createMultiple(this.MAX_AIRSHIPS, 'airship');
    this.airships.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    this.airships.setAll('checkWorldBounds', true);
    this.airships.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);

//CREATE BALLOONS
    this.balloons = this.game.add.group();
    this.balloons.enableBody = true;
    this.balloons.physicsBodyType = Phaser.Physics.ARCADE;
    this.balloons.createMultiple(this.MAX_BALLOONS, 'balloon');
    this.balloons.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    this.balloons.setAll('checkWorldBounds', true);
    this.balloons.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetObject);

    //CREATE FUEL SHIP
    this.fuel_ship = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'this.fuel_ship');
    this.fuel_ship.anchor.setTo(0.5, 0.5);
    this.fuel_ship.visible = false;
    this.fuel_ship.state = this.PLAYER_STATE_DEAD;
	
    //CREATE FUEL_TANK
    this.fuel_tank = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'fuel_tank');
    this.fuel_tank.anchor.setTo(0.5, 0.5);
    this.fuel_tank.visible = false;
    // set state to off
    this.fuel_tank.state = this.PLAYER_STATE_DEAD;
	
  
    //CREATE LAUNCH PAD
    this.launch_pad = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'launch_pad');
    this.launch_pad.anchor.setTo(0.5, 0.5);
    this.launch_pad.visible = false;
    // set state to off
    this.launch_pad.state = this.ENEMY_STATE_OFF;

}, // end Init_enemies

    ///////////////////////////////////////////////////////////
Initialize_Enemy_Positions: function()
{
    //HOUSES
    this.houses.forEach(function(house) {
  
    house.state = this.ENEMY_STATE_ON;
    house.xv=-5;
    house.curr_frame=this.getRandomInt(1,5);
    house.x=640+this.getRandomInt(1,600);
    house.y=390;
    },
this); // end for Laser
    //JETS
    this.jets.forEach(function(jet) {
jet.state = this.ENEMY_STATE_ON;
jet.xv=-5;
jet.x=500+this.getRandomInt(1,100);
jet.y=this.getRandomInt(1,240);
    },
this);

this.tank.state = this.ENEMY_STATE_ON;
this.tank.xv=-5;
this.tank.x=600;
this.tank,y=425;

    //AIRSHIPS
this.airships.forEach(function(airship) {
    airship.state = this.ENEMY_STATE_ON;
    airship.yv=1;
    airship.xv=-5;
    airship.x=600;
    airship.y=this.getRandomInt(1,240);
},
this);

this.balloons.forEach(function(balloon) {
    balloon.state = this.ENEMY_STATE_OFF;
    balloon.x=600;
    balloon.y=this.getRandomInt(1,240);
    },
    this);
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
    this.fuel_ship.kill();
}, // end Delete_enemies

    ///////////////////////////////////////////////////////////

Move_Enemies: function()
{
    // this function moves all the enemies pulses and checks for
    // collision with the enemies

    //MOVE HOUSES
if (this.Level==1 || this.Level==3 || this.Level==5)	
{
    this.houses.forEach(function(house) {
        if (house.state == this.ENEMY_STATE_ON)
        {
            if (this.Level == 1 && house.x < 10 && this.counter > 500 && this.getRandomInt(1, 1500) < 5) house.x = SCREEN_WIDTH, house.curr_frame = 5;
            if (this.Level == 3 && house.x < 10 && this.counter > 500 && this.getRandomInt(1, 1500) < 5) house.x = SCREEN_WIDTH, house.curr_frame = 6;
            if (this.Level == 5 && house.x < 10 && this.counter > 500 && this.getRandomInt(1, 5500) < 5) house.x = SCREEN_WIDTH, house.curr_frame = 7;
            if (this.counter > 500 && this.Level == 5 && this.getRandomInt(1, 500) < 5 && house.x < 10) house.x = this.SCREEN_WIDTH, house.curr_frame = 8;
            if(this.Level==5 && house.curr_frame==8 && this.getRandomInt(1,500)<5) Fire_Enemy_Missile(house.x,house.y);
            if (house.x < 10 && this.getRandomInt(1, 500) < 10) house.x = this.SCREEN_WIDTH, house.curr_frame = this.getRandomInt(1, 5);
            // test if enemies pulse is in flight
            // move the enemy
            house.x+=house.xv;
        }

    
    // test for collision with enemies
        if (this.Collision_Test(this.player.x, this.player.y,
                       this.player.width, this.player.height,
                       house.x, house.y,
                       house.width, house.height)
					   &&house.curr_frame==4&&player_state==PLAYER_STATE_ALIVE)
{
                   Start_Explosion(house.x, house.y, 
                               68+this.getRandomInt(1,12),54+this.getRandomInt(1,10),
                               house.xv>>1, house.yv>>1);
                   
    // update players damage
                    this.player_damage+=100;
                    this.counter = 0;
    // update score
                    this.player_score += 60;
                    this.house.state = this.ENEMY_STATE_OFF;
        } // end if collision
    },
        this);

}//Level 1

if (this.Level==2 || this.Level==4)	
{
    this.jets.forEach(function(jet) {
    // test if enemies pulse is in flight
	    if (jet.state == this.ENEMY_STATE_ON)
{
        if (jet.x<10)jet.x=600, jet.y=this.getRandomInt(1,300);
    // move the enemy
	 jet.xv=-20;
	 if (this.player.y < jet.y) jet.y -= 1;
	 if (this.player.y > jet.y) jet.y += 1;
	 jet.x+=jet.xv;
	 jet.y+=jet[index].yv;
 } // end for index

    
    // test for collision with enemies
	    if (this.Collision_Test(this.player.x, this.player.y,
                       this.player.width, this.player.height,
                       jet.x, jet.y,
                       jet.width, jet.height)
					   &&player_state==PLAYER_STATE_ALIVE)
{
	        this.Start_Explosion(jet.x, jet.y,
                               68+this.getRandomInt(1,12),54+this.getRandomInt(1,10),
                               jet.xv>>1, jet.yv>>1);
                   
    // update players damage
                   this.player_damage += 100;
    // update score
                   this.player_score += 60;
			   jet.x=700;
} // end if collision
    },
        this);

	if (tank.x>320 && player.x<tank.x && this.getRandomInt(1,100)<5)tank.xv=-3;
if (tank.x<320) tank.xv++;
if(player.x>tank.x-20) tank.xv+=3;
if (tank.x>700) tank.xv=-3;

tank.x+=tank.xv;

if (this.getRandomInt(1, 100) < 5 && cactus.state == this.ENEMY_STATE_OFF)
{
cactus.y=421;
cactus.x=SCREEN_WIDTH;
cactus.xv=-10;
cactus.state = this.ENEMY_STATE_ON;
}
if (cactus.state == this.ENEMY_STATE_ON)
{
    if (cactus.x < 10) cactus.state = this.ENEMY_STATE_OFF;
cactus.x+=cactus.xv;
} 

}//Level 2

if (this.Level==3 || this.Level==5)	
{
    if (this.counter == 500) airships_active++;
    if (this.counter == 100) airships_active++;
    if (this.counter == 1250) airships_active++;
    if (this.counter == 1300) airships_active++;
    if (this.counter == 1500) airships_active++;

    this.airships.forEach(function(airship) {
        // test if enemies pulse is in flight
	    if (airship.state == this.ENEMY_STATE_ON)
{
    // move the enemy
    //airship.xv=-20;
        if(player.y+50>airship.y && airship.y<400&&this.getRandomInt(1,100)<5)airship.yv++;
        if(player.y+50<airship.y && airship.y>10&&this.getRandomInt(1,100)<5)airship.yv--;
        if (airship.x>320 && player.x<airship.x && this.getRandomInt(1,100)<5)airship.xv--;
	 if (airship.x>680)airship.xv=-1,airship.yv=0;
	 if(airship.x<player.x )airship.xv++;
    //if(rand()%100==5&&airship.x>250)airship.xv--;
	 if(this.getRandomInt(1,100)<3)Release_Balloon(airship.x,airship.y);
	 if(airship.y>370 )airship.yv=-1;
	 if(airship.y<10 )airship.yv=1;
	 airship.x+=airship.xv;
	 airship.y+=airship.yv;
 } // end for index

    
    // test for collision with enemies
	    if (this.Collision_Test(this.player.x, this.player.y,
                       this.player.width, this.player.height,
                       airship.x, airship.y,
                       airship.width, airship.height)
					   && this.player_state == this.PLAYER_STATE_ALIVE)
{
	        this.Start_Explosion(airship.x, airship.y,
                               68+this.getRandomInt(1,12),54+this.getRandomInt(1,10),
                               airship.xv>>1, airship.yv>>1);
                   
    // update players damage
                   this.player_damage += 100;
    // update score
                   this.player_score += 60;
                   this.airships_active = 1;
                   this.airship.x = 700;
} // end if collision
    },
        this);

    this.baloons.forEach(function(baloon) {
        // test if enemies pulse is in flight
    if (balloon.state == this.ENEMY_STATE_ON)
{
    // move the enemy
	 balloon.xv=-20;
	 balloon.yv-=1;
	 if(balloon.x<10 || balloon.y<10)
{
		 balloon.state=ENEMY_STATE_OFF;
		 balloon.xv=0;
		 balloon.yv=0;
}
	 balloon.x+=balloon.xv;
	 balloon.y+=balloon.yv;
 } // end for index

    
    // test for collision with enemies
    if (this.Collision_Test(this.player.x, this.player.y,
                       this.player.width, this.player.height,
                       balloon.x, balloon.y,
                       balloon.width, balloon.height)
					   && this.player_state == this.PLAYER_STATE_ALIVE)
{
        this.Start_Explosion(balloon.x, balloon.y,
                               68+this.getRandomInt(1,12),54+this.getRandomInt(1,10),
                               balloon.xv>>1, balloon.yv>>1);
                   
    // update players damage
                   this.player_damage += 100;
    // update score
                   this.player_score += 60;
                   this.balloon.state = ENEMY_STATE_OFF;
} // end if collision

    },
         this);
}//Level 3

if (this.Level==4)	
{
    this.jets.forEach(function(jet) {
    // test if enemies pulse is in flight
	    if (jet.state == this.ENEMY_STATE_ON)
        if (this.getRandomInt(1,100)<5)Fire_Enemy_Laser(jet.x,jet.y,-16);

	if (this.getRandomInt(1,100)<5) Fire_Enemy_Missile(tank.x,tank.y);
},
     this);
}//Level 4



	return;

}, // end Move_enemies

    ///////////////////////////////////////////////////////////

Draw_Enemies: function()
{
    // this function draws all the enemies 
/*
    //DRAW HOUSES ETC.
if(Level==1 || Level==3 ||Level==5)
{
	for (var index=0; index<this.MAX_HOUSES; index++)
{
    // test if enemies pulse is in flight
	    if (house[index].state == this.ENEMY_STATE_ON)
{
           house[index].visible = true;

} // end if
} // end for index
}//Level1

if(Level==2 || Level==4)
{
	for (var index=0; index<jets_active; index++)
{
    // test if enemies pulse is in flight
	    if (jet[index].state == this.ENEMY_STATE_ON)
{
           jet[index].visible = true;

} // end if

} // end for index
	tank.visible = true;

	if(cactus.state==ENEMY_STATE_ON) 
	    cactus.visible = true;

}//Level2

    //DRAW AIRSHIPS, BALLOONS.
if(Level==3 || Level == 5)
{

	for (var index=0; index<airships_active; index++)
{
    // test if enemies pulse is in flight
	    if (airship[index].state == this.ENEMY_STATE_ON)
{
        airship[index].visible = true;

} // end if

} // end for index
	for (index=0; index<balloons_active; index++)
{
    // test if enemies pulse is in flight
	    if (balloon[index].state == this.ENEMY_STATE_ON)
{
        balloon[index].visible = true;

} // end if

} // end for index
}//Level3

*/

}, // end Draw_enemies
    ///////////////////////////////////////////////////////////

Init_Explosions: function()
{
    // this function initializes and loads all the Explosions 

    // create the first Explosion 

    this.Explosions = this.game.add.group();
    this.Explosions.enableBody = true;
    this.Explosions.physicsBodyType = Phaser.Physics.ARCADE;
    this.Explosions.createMultiple(this.MAX_EXPLOSIONS, 'explosions');
    this.Explosions.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
 

}, // end Init_Explosions

    ///////////////////////////////////////////////////////////

Delete_Explosions: function()
{
    // this function simply deletes all memory and surfaces
    // related to the Explosions pulses

//for (var index=0; index<this.MAX_EXPLOSIONS; index++)
    Explosions.kill;

}, // end Delete_Explosions

    ///////////////////////////////////////////////////////////

Draw_Explosions: function()
{
    // this function draws all the Explosions 
//for (var index=0; index<this.MAX_EXPLOSIONS; index++)
//{
    // test if Explosions pulse is in flight
//    if (Explosions[index].state == EXPLOSION_STATE_ON)
//{
//           Explosions[index].visible = true;
        
    // Set_Anim_Speed_var(&Explosions[index],1);
    // animate the explosion
     //   Animate_var(&Explosions[index]);
//	if (Explosions[index].curr_frame >= Explosions[index].num_frames-1) Explosions[index].state=EXPLOSION_STATE_OFF;
    
//} // end if

//} // end for index

}, // end Draw_Explosions

    ///////////////////////////////////////////////////////////

Start_Explosion: function(x, y, width, height, xv,yv)
{
    // this function starts a Explosion up

    // now test if it's time to add a new Explosion to the list

    // scan for a Explosion to initialize
    this.explosions.forEach(function(explosion) {
    // is this Explosion available?
    if (explosion.state == EXPLOSION_STATE_OFF)
{
        // set animation rate
       // explosion.animations.add('explode');

       // explosion.animations.play('explode', 9, true);
       // explosion.animations.currentAnim.onComplete.add(change_state, { x: 1 });
       explosion.curr_frame = 0;
    
    
    // set position
       explosion.x=x;
       explosions.y=y;
    

    // turn Explosion on
       explosions.state = EXPLOSION_STATE_ON;
          
    // later
       return;

} // end if
 
    },
     this);

}, // end Start_Explosion

    ///////////////////////////////////////////////////////////

Release_Balloon: function(x,y)
{
    // this function starts a Explosion up

    // now test if it's time to add a new Explosion to the list

    // scan for a Explosion to initialize
    this.balloons.forEach(function(ball) {
        // is this Explosion available?
    if (balloon.state == this.ENEMY_STATE_OFF)
{
    // set position
       balloon.x= x;
       balloon.y= y;
    

    // turn Explosion on
       balloon.state = this.ENEMY_STATE_ON;
          
    // later
       return;

} // end if
 
    },
     this);

}, // end Start_Explosion

    ///////////////////////////////////////////////////////////
Draw_Info: function()
{
    // this function draws all the information at the top of the screen

    this.Draw_Text("SCORE: " + this.player_score, 10, 10, 'rgb(0,255,0)');

    // draw damage
    this.Draw_Text("HIGH SCORE: " + this.highscore, 170, 10, 'rgb(0,255,0)');

    this.Draw_Text("FUEL LEFT: " + this.Fuel_Left, 360, 10, 'rgb(0,255,0)');

    // draw ships
    this.Draw_Text("SHIPS: " + this.player_ships, 500, 10, 'rgb(0,255,0)');

}, // end Draw_Info

    ///////////////////////////////////////////////////////////
Regenerate_Player: function()
{
    if (++this.player_counter > 60 && this.player_ships > 0)
{
    // set state to ready
        this.player_state = this.PLAYER_STATE_ALIVE;
        this.player.x = 20
        this.player.y = 220;
        this.Fuel_Left = 2000;
        this.outoffuel = 0;
        this.player.xv = 0;
        this.player.yv = 0;
        this.showintro = 0;
        this.counter = 0;
        this.radar_killed = 0, this.tank_killed = 0, this.icbm_killed = 0,
this.Initialize_Enemy_Positions();
        this.player_damage = 0;
    // stop the intro if not already
}
},
    ///////////////////////////////////////////////////////////
Game_Intro: function()
{

    while (this.intro_state == 0)
{

   // if (this.spaceKey.isDown)
   // {
        this.intro_state = 1;
   // }
//DRAW SPLASH SCREEN
    var splash = this.add.image(0, 0, 'splash');
    splash.width = this.game.width;
    splash.height = this.game.height;

}
return(1);
},

///////////////////////////////////////////////////////////

Do_Intro: function()
{
    // the world's simplest intro
this.Draw_Text("LEVEL:"+this.Level,220,250,'rgb(0,255,0)');

if (this.Level==1)
this.Draw_Text("DESTROY THE RADAR",300, 250,'rgb(0,255,0)');
if (this.Level==2)
this.Draw_Text("WASTE THE TANK",300, 250,'rgb(0,255,0)');
if (this.Level==3)
this.Draw_Text("BOMB THE ICBM",300, 250,'rgb(0,255,0)');
if (this.Level==4)
this.Draw_Text("DEMOLISH THE TANK AGAIN",300, 250,'rgb(0,255,0)');
if (this.Level==5)
this.Draw_Text("WIPE OUT THE HEADQUARTERS",300, 250,'rgb(0,255,0)');
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
    return;
var ready_counter = 0, // used to draw a little "get ready"
           ready_state   = 1;

 
    // start the timing clock
//Start_Clock();


if (this.intro_state == 0) this.Game_Intro();



if (this.showintro < 60) this.Do_Intro();
this.showintro++;

    // only process player if alive
if (this.player_state == this.PLAYER_STATE_ALIVE)
{

this.counter++;
if (this.Fuel_Left==1000)this.fuel_ship.state=this.PLAYER_STATE_ALIVE;
if (this.fuel_ship.state == this.PLAYER_STATE_ALIVE || this.fuel_tank.state == this.PLAYER_STATE_ALIVE)
    this.Send_Fuel_Ship();
if (this.Fuel_Left > 0) this.Fuel_Left -= 5;
if (this.Fuel_Left == 0) this.outoffuel = 1;
if (this.outoffuel == 1) this.player.y += 5, this.Draw_Text("OUT OF FUEL", 300, 250, 'rgb(255,0,0)');

    // do bounds check
if(this.player.x>10)this.player.x--;

if (this.player.x < 10)
    this.player.x = 10;
else
    if (this.player.x > (this.SCREEN_WIDTH - 100))
        this.player.x = (this.SCREEN_WIDTH - 100);

if (this.player.y < 10)
    this.player.y = 10;

if (this.player.y > this.SCREEN_HEIGHT - 100 && this.outoffuel == 0)
    this.player.y = this.SCREEN_HEIGHT - 100;
if (this.player.y > this.SCREEN_HEIGHT - 50 && this.outoffuel == 1)
    this.player_damage = 100;
    // test for dying state transition
if (this.player_damage >= 100)
{
    // kill player
    this.player_state = this.PLAYER_STATE_DEAD;
    this.player_ships--;
    // set counter to 0
    this.player_counter = 0;
} // end if

} // end if player alive

if (this.player_state == this.PLAYER_STATE_DEAD)
{ 
    // player is dead
    if ((this.getRandomInt(1, 4) % 4) == 1 && this.player_counter < 60)
        Start_Explosion(this.player.x - 16 + this.getRandomInt(1, 40), this.player.y - 5 + this.getRandomInt(1, 8),
                   this.player.width, this.player.height,
                   -4+this.getRandomInt(1,8),2+this.getRandomInt(1,4));    

    this.Regenerate_Player();
    this.ready_state = 1;
    this.ready_counter = 0;
    // set position
} // end if

    //GAME OVER ?
if (this.player_state == this.PLAYER_STATE_DEAD && this.player_ships == 0)
{
    // player is dead
    this.ready_state = 1;

    // draw text
   this.Draw_Text("G A M E    O V E R",
                 320-6*strlen("G A M E    O V E R")/2,
                 200,'rgb(255,0,0)');
   this.Draw_Text_GDI("Hit Escape to Exit",
                 320-6*strlen("Hit Escape to Exit")/2,
                 220,'rgb(255,0,0)');
   this.Draw_Text_GDI("Or P to Play Again",
                 320-6*strlen("Or P to Play Again")/2,
                 240,'rgb(255,0,0)');
} // end if


    //NEXT LEVEL?

if (this.radar_killed)
{
	  this.Level=2;
	  this.Regenerate_Player();
	  this.ready_state = 1;
	  this.ready_counter = 0;
	  this.showintro = 1;
}

if (this.tank_killed && Level == 2)
{
    this.Level = 3;
    this.Regenerate_Player();
    this.ready_state = 1;
    this.ready_counter = 0;
    this.showintro = 1;
}

if (this.icbm_killed)
{
    this.Level = 4;
    this.Regenerate_Player();
    this.ready_state = 1;
    this.ready_counter = 0;
    this.showintro = 1;
}

if (this.tank_killed && this.Level == 4)
{
    this.Level = 5;
    this.Regenerate_Player();
    this.ready_state = 1;
    this.ready_counter = 0;
    this.showintro = 1;
}

if (this.headquarters_killed)
{
    this.ready_state = 1;

    // draw text
   this.Draw_Text("C O N G R A T U L A T I O N S !",
                 320-6*strlen("C O N G R A T U L A T I O N S !")/2,
                 200,'rgb(255,0,0)');
   this.Draw_Text("You Have Completed Your Mission",
                 320-6*strlen("You Have Completed Your Mission")/2,
                 200,'rgb(255,0,0)');
   this.Draw_Text("Hit Escape to Exit",
                 320-6*strlen("Hit Escape to Exit")/2,
                 220,'rgb(255,0,0)');
   this.Draw_Text("Or P to Play Again",
                 320-6*strlen("Or P to Play Again")/2,
                 240,'rgb(255,0,0)');
}

if (this.player_score > this.highscore) this.highscore = this.player_score;
    // draw the player if alive
if (this.player_state == this.PLAYER_STATE_ALIVE)
{
    this.player.visible = true;
} // end if

    // move the Laser
this.Move_Laser();

    // move the asteroids
if (this.showintro > 59) this.Move_Enemies();


    // move the stars
this.Move_Stars();

    // draw the enemies
if (this.showintro > 59) this.Draw_Enemies();

    // draw the Laser
this.Draw_Laser();

    // draw the stars
//this.Draw_Stars();

    // draw explosions last
this.Draw_Explosions();

    // draw the score and ships left
this.Draw_Info();



 

    // check of user is trying to exit
//if (KEY_DOWN(VK_ESCAPE))
//    PostMessage(main_window_handle, WM_DESTROY,0,0);


    // return success
return(1);

}, // end Game_Main

Draw_Text: function(text,x,y,color)
{
    var t = this.add.text(x, y, text, { fill: color, font: '16pt Impact' });
    t.updateText();
}

};

    //////////////////////////////////////////////////////////