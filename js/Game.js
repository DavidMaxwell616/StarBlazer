﻿const game = new Phaser.Game(1000, 640, Phaser.BOX2D, 'game', {
  preload,
  create,
  update
});

function create() {
 mainMenuCreate();
}

function gameCreate() {
         game.physics.startSystem(Phaser.Physics.ARCADE);
 
        gameLost = false;
        gameWon = false;
        // load the background bitmap in with all the graphics
        var background = game.add.image(0, 0, 'background');
        background.width = game.width;
        background.height = game.height;
        SCREEN_HEIGHT = game.height;
        SCREEN_WIDTH = game.width;
        GROUND = SCREEN_HEIGHT - 40;
        Init_Stars();
        counter = 0;
        player = game.add.sprite(20, 220, 'player');
        player.anchor.set(0.2, 0.5);
        player.xv = 0;
        player.yv = 0;
        player.animations.add('playerjet');

        player.animations.play('playerjet', 50, true);

        player.animations.currentAnim.onComplete.add(function () { change_state(1) }, this);
        player.state = ALIVE;
        Init_Laser();
        Init_Enemies();
        Initialize_Enemy_Positions();
        Init_Explosions();
        Init_Score();
        setUpArrows();
        keyFire = game.input.keyboard.addKey(KEYCODE_SPACE);
        keyFire.onDown.add(Fire, this);
        keyUp = game.input.keyboard.addKey(KEYCODE_UP);
        keyUp.onDown.add(MoveUp, this);
        keyDown = game.input.keyboard.addKey(KEYCODE_DOWN);
        keyDown.onDown.add(MoveDown, this);
        keyRight = game.input.keyboard.addKey(KEYCODE_RIGHT);
        keyRight.onDown.add(MoveRight, this);
        keyLeft = game.input.keyboard.addKey(KEYCODE_LEFT);
        keyLeft.onDown.add(MoveLeft, this);
        game.input.onDown.add(TouchFire, this);
      };

      function setUpArrows(){
        for (let index = 0; index < arrows.length; index++) {
         var arrow = arrowStats[index];
         arrows[index] = game.add.image(0,0,'arrow');
          arrows[index].scale.setTo(.25);
          arrows[index].anchor.setTo(0.5, 0.5);
          arrows[index].xOffset = arrow.xOffset;  
          arrows[index].yOffSet = arrow.yOffset;  
          arrows[index].x = arrows[index].width*.25+40+arrow.xOffset;
          arrows[index].y =SCREEN_HEIGHT -arrows[index].width*.25+-40+arrow.yOffset;
          if(arrow.direction=='right' || arrow.direction=='left'){
          arrows[index].x += 900;
          arrows[index].y += 30;
          }
         arrows[index].name= arrow.direction;
         
         arrows[index].inputEnabled = true;
         arrows[index].angle =arrow.angle;  
        }
      }
function TouchFire(pointer){
const arrowsRight = arrows[0].x+arrows[0].width/2;
const arrowsTop = arrows[3].y-arrows[3].height/2;
if(pointer.x>arrowsRight)
Fire();
}

      function Fire() {
        if (gameover) {
            gameover = false;
            Level = 1; 
            attack_speed = 5; 
            showintro = 0;
            airships_active = 1;
            player.state = ALIVE; 
            player_score = 0;
            player_ships = 3; 
            player_damage = 0;
            Fuel_Left = MAX_FUEL; 
            Regenerate_Player();
            state.start('Game');
            //state.start('MainMenu');
        }
        // test if player is firing

        // if (keyCode == KEYCODE_SPACE && intro_state == 0) {
        //     intro_state = 1;
        //     splash.visible = false;
        //     return;
        // }
        if (!gameover && player.y < SCREEN_HEIGHT - 150) {
            Fire_Laser(player.x + 50, player.y+4);
        }
        else
            //            if (player.y >= SCREEN_HEIGHT - 100)
            Drop_Bomb(player.x + 16, player.y, 1);
    };

    function MoveUp()
    {
        if (outoffuel == 0) {
            // move player up
            player.yv -= 1;

        } 
    };
    function MoveDown(){
        if (outoffuel == 0) {
            // move player down
            player.yv += 1;
        } 
    };
    function MoveRight()
    {
        if(outoffuel == 0) 
            // move player to right
            player.xv += 1;
    };
    function MoveLeft()
    {
        if (outoffuel == 0) {
            // move player to left
            player.xv -= 1;
        } 
    };
    function Quit(){
        // check of user is trying to start over
        if (keyCode == KEYCODE_P && ready_state == 1 && player_ships == 0) {
            Level = 1; attack_speed = 5; showintro = 0;
            airships_active = 1;
            player.state = ALIVE; player_score = 0;
            player_ships = 3; player_damage = 0;
            Fuel_Left = MAX_FUEL; Regenerate_Player();
        }
    };

    function update() {
      if(!startGame){
        mainMenuUpdate();
        return;
      }
        Game_Main();
    };


    function Init_Stars()
    {
        // this function initializes all the stars in such a way
        // that their intensity is proportional to their 
        // velocity
        stars = game.add.group();
        stars.enableBody = true;
        stars.physicsBodyType = Phaser.Physics.ARCADE;
        stars.createMultiple(MAX_STARS, 'star');
        stars.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        stars.setAll('checkWorldBounds', true);
        stars.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetObject);
        stars.setAll('x', SCREEN_WIDTH);
        stars.setAll('y', getRandomInt(0, SCREEN_HEIGHT));
        stars.forEach(function (star) {
            // random postion
            star.x = getRandomInt(0, SCREEN_WIDTH);
            star.y = getRandomInt(0, SCREEN_HEIGHT);

            // select star plane
            var plane = getRandomInt(1, 4); // (1..4)

            // based on plane select velocity and color
            star.xv = -plane*5;
            star.tint = Math.random() * 0xffffff;
            star.visible = true;
        }, this); 

    }; 

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    function Move_Stars()
    {
        // this function moves all the stars

        stars.forEach(function(star) {
            // translate upward
            star.x+=star.xv;
     
            // test for collision with top of screen
            if (star.x <= 0)
                star.x =SCREEN_WIDTH;

        }, this); 

    }; 

    function Init_Laser()
    {
        // this function initializes and loads all the Laser 
        // weapon pulses

        // now create and load each Laser pulse
        lasers = game.add.group();
        lasers.enableBody = true;
        lasers.physicsBodyType = Phaser.Physics.ARCADE;
        lasers.createMultiple(MAX_LASERS, 'laser');
        lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        lasers.setAll('checkWorldBounds', true);
        lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetLaser);
        lasers.setAll('state', DEAD);

        bomb = game.add.sprite(game.width / 2, game.height / 2, 'bomb');
        bomb.anchor.setTo(0.5, 0.5);
        bomb.state = DEAD;
        bomb.visible = false;
        //CREATE ENEMY MISSILES
        enemy_missiles = game.add.group();
        enemy_missiles.enableBody = true;
        enemy_missiles.physicsBodyType = Phaser.Physics.ARCADE;
        enemy_missiles.createMultiple(MAX_ENEMY_LASERS, 'enemy_missile');
        enemy_missiles.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        enemy_missiles.setAll('checkWorldBounds', true);
        enemy_missiles.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetObject);
        enemy_missiles.setAll('state', DEAD);

        //CREATE ENEMY LASER PULSES
        enemy_lasers = game.add.group();
        enemy_lasers.enableBody = true;
        enemy_lasers.physicsBodyType = Phaser.Physics.ARCADE;
        enemy_lasers.createMultiple(MAX_ENEMY_LASERS, 'enemy_laser');
        enemy_lasers.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
        enemy_lasers.setAll('checkWorldBounds', true);
        enemy_lasers.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetObject);
        enemy_lasers.setAll('state', DEAD);


    };

    function resetAirship(object) {
        object.reset();
    };

    function resetObject(object) {
        object.state = DEAD;
        object.visible = false;
    };
    function resetLaser(laser) {
        //laser.reset(0,0);
        //laser.visible = false;
        //console.log(laser);
        laser.kill();
    };
 

    ///////////////////////////////////////////////////////////

    function Move_Laser() {
        // this function moves all the Laser pulses and checks for
        // collision with the enemies

        lasers.forEach(function(laser) {
            if (laser.state == ALIVE) {
                // move the pulse upward
                laser.x += laser.xv;
                if (laser.x > SCREEN_WIDTH)
                    resetLaser(laser);
                // test for collision with enemies
                //Laser COLLISION WITH JETS
                if (Level == 2 || Level == 4) {
                    jets.forEach(function (jet) {
                        if (jet.state == ALIVE) {
                            // test for collision 

                            if (Collision_Test(laser,jet)) {
                                // kill pulse

                                //laser hits jet
                                Start_Explosion(laser.x,
                                    laser.y,
                                    42,
                                    36,
                                    jet.xv *1,
                                    jet.yv *1);
                                laser.reset();

                                jet.x=SCREEN_WIDTH;
                                jet.y=getRandomInt(0, SCREEN_HEIGHT);
                                // update score
                                player_score += 100;
                            } 
                        } 
                    },
                        this); 
                }
                    //Laser COLLISION WITH AIRSHIPS
                    if (Level == 3 || Level == 5) {
                        airships.forEach(function(airship) {
                            if (airship.state == ALIVE) {
                                // test for collision 
                                if (Collision_Test(laser,airship)) {
                                    // kill pulse

                                    Start_Explosion(laser.x - 10,
                                        laser.y - 50,
                                        42,
                                        36,
                                        airship.xv *.1,
                                        airship.yv *.1);

                                    laser.reset();
                                    airship.kill();
                                    airship.reset(SCREEN_WIDTH, getRandomInt(0, SCREEN_HEIGHT));
                                    // update score
                                    player_score += 10;
                                } 
                            } 
                        },
                            this); 

                        balloons.forEach(function(balloon) {
                            if (balloon.state == ALIVE) {
                                // test for collision 
                                if (Collision_Test(laser, balloon)) {
                                    // kill pulse
                                    laser.kill();

                                    balloon.state = DEAD;
                                    balloon.visible = false;
                                    //laser hits balloon
                                    Start_Explosion(laser.x - 10,
                                        laser.y - 20,
                                        42,
                                        36,
                                        balloon.xv *.1,
                                        balloon.yv *.1);

                                    // update score
                                    player_score += 10;
                                } 
                            } 


                        },
                            this); 
                    }
                    if (Level == 4 || Level == 5) {
                        enemy_missiles.forEach(function(enemy_missile) {
                            if (enemy_missile.state == ENEMY_STATE_ON) {
                                enemy_missile.visible = true;
                                if (player.y < enemy_missile.y)
                                    enemy_missile.yv -= .1;
                                if (player.y > enemy_missile.y)
                                    enemy_missile.yv += .1;
                                // test for collision 
                                if (Collision_Test(laser,enemy_missile)) {
                                    // kill pulse

                                    //laser hits enemy missile
                                    Start_Explosion(laser.x,
                                        laser.y,
                                        42,
                                        36,
                                        enemy_missile.xv *.1,
                                        enemy_missile.yv *.1);
                                    laser.kill();

                                    enemy_missile.state = DEAD;
                                    enemy_missile.visible = false;

                                    // update score
                                    player_score += 100;
                                } 
                            } 


                        },
                            this); 
                    }
            }
        },
            this); 
        //CHECK IF BOMB IS DROPPING
        if (bomb.state == ALIVE) {
            bomb.yv+=.1;
            bomb.y += bomb.yv;

            // test for boundaries

            if (bomb.y >GROUND) {

                //bomb hits ground
                Start_Explosion(bomb.x - 10,
                    bomb.y - 44,
                    42,
                    36,
                    0,
                    0);
                // kill the bomb
                bomb.state = DEAD;
                bomb.visible = false;
            }

            // test for collision with enemies

            //BOMBS DROPPING ON HOUSES, RADAR
            if (Level == 1 || Level == 3 || Level == 5) {
                houses.forEach(function(house) {
                    if (house.state == ALIVE) {
                        // test for collision 
                       // console.log('bomb x' + bomb.x+' '+
                       //     'bomb y' + bomb.y + ' ' +
                       //     'bomb width' + bomb.width + ' ' +
                       //     'bomb height' + bomb.height + ' ' +
                       //     'house x' + house.x + ' ' +
                       //     'house y+60' + house.y + 60);
                        if (Collision_Test(bomb, house)) {
                            // kill pulse
                            if (house.frame != 1) house.state = DEAD;

                            if (house.frame != 1) {
                                Start_Explosion(bomb.x,
                                    bomb.y,
                                    42,
                                    36,
                                    0,
                                    0);
                            }
                            if (house.frame == 5) {
                                radar_killed = 1;
                                player_score += 100;
                            }
                            if (house.frame == 6) {
                                icbm_killed = 1;
                                player_score += 500;
                            }
                            if (house.frame == 7) {
                                headquarters_killed = 1; 
                                player_score += 1500;
                                house.state = DEAD;
                                house.visible = false;
                            }
                            house.reset();
                            bomb.visible = false;
                            bomb.state = DEAD;
                                // update score
                            player_score += 10;
                            bomb.reset();
                        } 
                    } 
                },
                    this); 
            }

            if (Level == 2 || Level == 4) {
                if (tank.state == ALIVE) {
                    // test for collision 
                    if (Collision_Test(bomb, tank)) {
                        // kill pulse
                        bomb.state = DEAD;
                        Start_Explosion(bomb.x - 10,
                            bomb.y - 20,
                            42,
                            36,
                            tank.xv *.1,
                            tank.yv *.1);
                        // update score
                        tank_killed = 1;
                        player_score += 500;
                    } 
                } 
                if (cactus.state == ALIVE) {
                    // test for collision 
                    if (Collision_Test(bomb,cactus))
                        // kill pulse
                        bomb.state = DEAD;
                }
            } 

        } 

        //MOVE ENEMY Laser
        if (Level == 4) {
            enemy_lasers.forEach(function(enemy_laser) {
                if (enemy_laser.state == ALIVE) {
                    enemy_laser.xv = LASER_SPEED*-1;
                    // move the pulse downward
                    enemy_laser.x += enemy_laser.xv;

                    // test for boundaries
                    if (enemy_laser.x < 10) {
                        // kill the pulse
                        //enemy_laser.state = DEAD;
                        enemy_laser.state = DEAD;
                        enemy_laser.visible = false;
                    } 

                    // test for collision with player
                    if (Collision_Test(enemy_laser,player) &&
                        player.state == ALIVE) {
                        Start_Explosion(enemy_laser.x,
                            enemy_laser.y,
                            68 + getRandomInt(0, 12),
                            54 + getRandomInt(1, 10),
                            enemy_laser.xv *.1,
                            enemy_laser.yv *.1);

                        // update players damage
                        player_damage += 100;


                        // kill the original
                        enemy_laser.state = DEAD;

                    } 

                } 
            },
                this); 
        }

        //MOVE ENEMY MISSILES
        if (Level == 4 || Level == 5) {
            enemy_missiles.forEach(function(enemy_missile) {
                if (enemy_missile.state == ALIVE) {
                    enemy_missile.xv--;
                    if (player.y < enemy_missile.y) enemy_missile.y -= 3;
                    if (player.y > enemy_missile.y) enemy_missile.y += 3;
                    // move the pulse downward
                    enemy_missile.x += enemy_missile.xv;
                    enemy_missile.y += enemy_missile.yv;

                    // test for boundaries
                    if (enemy_missile.x < 10) {
                        // kill the pulse
                        enemy_missile.state = DEAD;
                        enemy_missile.visible = false;

                    } 

                    // test for collision with player
                    if (Collision_Test(enemy_missile,player) &&
                        player.state == ALIVE) {
                        Start_Explosion(enemy_missile.x,
                            enemy_missile.y,
                            68 + getRandomInt(1, 12),
                            54 + getRandomInt(1, 10),
                            enemy_missile.xv *.1,
                            enemy_missile.yv *.1);

                        // update players damage
                        player_damage += 100;


                        // kill the original
                        enemy_missile.state = DEAD;
                        enemy_missile.visible = false;

                    } 

                } 
            },
                this); 
        } 
    };
    //////////////////////////////////////////////////////////

    function Collision_Test (object1, object2) 
    {
        var rect1 = { x: object1.x, y: object1.y, width: object1.width, height: object1.height }
        var rect2 = { x: object2.x, y: object2.y, width: object2.width, height: object2.height }
       
    //    var graphics = game.add.graphics(0, 0);
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
    }; 

    function Fire_Laser(x,y)
    {
        bomb.state = DEAD;
        bomb.visible = false;
        //console.log(lasers.children);
        var laser = lasers.getFirstExists(false);
        laser.xv = LASER_SPEED;
        laser.reset(x, y);
        laser.state = ALIVE;

    }; 

    function Drop_Bomb(x,y, vel)
    {
        // this function fires a Laser pulse at the given starting
        // position and velocity, of course, one must be free for 
        // this to work
        if (bomb.state == ALIVE)
            return;
        bomb.reset(x, y);
        if(bomb.state==DEAD)// start this one up
        {
            bomb.x = x;
            bomb.y = y;
            bomb.xv = player.xv;
            bomb.yv = vel;
            bomb.state = ALIVE;
            bomb.visible = true;

        } 


    }; 
    
    function Send_Fuel_Plane()
    {
        if(fuel_plane.state==ALIVE)
        {
            fuel_plane.visible = true;
            fuel_plane.x = 5;
            fuel_plane.xv = 5;
            fuel_plane.x += fuel_plane.xv;
            fuel_plane.y = 20;
        }
        if (fuel_plane.x > SCREEN_WIDTH) {
            fuel_plane.state = DEAD;
            fuel_plane.x = 0;
        }
    }; 

    function Fire_Enemy_Laser(x,y, vel)
    {
        //console.log('fire enemy laser');
        // this function fires a Laser pulse at the given starting
        // position and velocity, of course, one must be free for 
        // this to work
        enemy_lasers.forEach(function(enemy_laser) {
            // test if Laser pulse is in flight
            var fireOne = false;
            if (enemy_laser.state == DEAD && !fireOne)
            {
                // start this one up
                enemy_laser.x  = x;
                enemy_laser.y  = y;
                enemy_laser.xv = LASER_SPEED*-1
                enemy_laser.state =  ALIVE;
                enemy_laser.visible = true;
                // later
                fireOne=true;

            } 
        },
                this);


        }; 

function Fire_Enemy_Missile(x,y)
{
// this function fires a Laser pulse at the given starting
// position and velocity, of course, one must be free for 
// this to work

    enemy_missiles.forEach(function(enemy_missile) {
        // test if Laser pulse is in flight
if (enemy_missile.state == DEAD)
{
    // start this one up
    enemy_missile.x  = x;
    enemy_missile.y  = y;
    enemy_missile.xv = 0;
    enemy_missile.yv = 0;
    enemy_missile.state = ALIVE;
       
    // later
    return;

} 
    },
                this); 


}; 

function Init_Enemies()
{
    // this function initializes and loads all the enemies 


    //CREATE HOUSES,TREES, TOWERS, RADAR
    
    houses = game.add.group();
    houses.enableBody = true;
    houses.physicsBodyType = Phaser.Physics.ARCADE;
    houses.createMultiple(MAX_HOUSES, 'level_1_enemies');
    houses.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    houses.setAll('checkWorldBounds', true);
    houses.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetObject);


     // set alive to off
    houses.setAll('alive', ENEMY_STATE_ON);
    houses.setAll('visible', true);
    houses.setAll('y', GROUND);
    houses.setAll('x',SCREEN_WIDTH);
    houses.setAll('xv',-8);


//CREATE JETS
    jets = game.add.group();
    jets.enableBody = true;
    jets.physicsBodyType = Phaser.Physics.ARCADE;
    jets.createMultiple(NUM_JETS, 'jet');
    jets.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    //jets.setAll('checkWorldBounds', true);
    //jets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetObject);
    jets.setAll('y', getRandomInt(1, 240));
    jets.setAll('x', SCREEN_WIDTH-20);
    jets.setAll('xv', -8);
    jets.setAll('yv', 0);   

//CREATE TANK
      tank = game.add.sprite(game.width / 2, game.height / 2, 'tank');
      tank.anchor.setTo(0.5, 0.5);
      tank.visible = false;

//CREATE CACTUS
      cactus = game.add.sprite(game.width / 2, game.height / 2, 'cactus');
      cactus.anchor.setTo(0.5, 0.5);
      cactus.state = DEAD;
      cactus.visible = false;


//CREATE AIRSHIPS
    airships = game.add.group();
    airships.enableBody = true;
    airships.physicsBodyType = Phaser.Physics.ARCADE;
    airships.createMultiple(NUM_AIRSHIPS, 'airship');
    airships.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    //airships.setAll('checkWorldBounds', true);
    //airships.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetAirship);


//CREATE BALLOONS
    balloons = game.add.group();
    balloons.enableBody = true;
    balloons.physicsBodyType = Phaser.Physics.ARCADE;
    balloons.createMultiple(MAX_BALLOONS, 'balloon');
    balloons.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
    balloons.setAll('checkWorldBounds', true);
    balloons.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetObject);

    //CREATE fuel plane
    fuel_plane = game.add.sprite(5, 20, 'fuel_plane');
    fuel_plane.anchor.setTo(0.5, 0.5);
    fuel_plane.visible = false;
    fuel_plane.state = DEAD;
	
    //CREATE FUEL_TANK
    fuel_tank = game.add.sprite(5, 20, 'fuel_tank');
    fuel_tank.anchor.setTo(0.5, 0.5);
    fuel_tank.visible = false;
    // set alive to off
    fuel_tank.state = DEAD;
	
  
    //CREATE LAUNCH PAD
    launch_pad = game.add.sprite(game.width / 2, game.height / 2, 'launch_pad');
    launch_pad.anchor.setTo(0.5, 0.5);
    launch_pad.visible = false;
    // set alive to off
    launch_pad.state = DEAD;

}; 

function Initialize_Enemy_Positions()
{

    if (Level == 1 || Level == 3 || Level == 5) {
        //HOUSES
        houses.forEach(function (house) {
            house.state = ALIVE;
            house.visible = true;
            house.xv = -5;
            house.frame = getRandomInt(1, 4);
            if(getRandomInt(1, 20)==20)
            house.frame = 5;
            house.x = getRandomInt(1, SCREEN_WIDTH);
            house.y = GROUND-30;
        },
    this);
    }

    if (Level == 2 || Level == 4) {

        //JETS
        jets.forEach(function (jet) {
            jet.state = ALIVE;
            jet.visible = true;
            jet.x=SCREEN_WIDTH;
            jet.y= getRandomInt(1, 300);
            jet.xv = -8;
            jet.yv = 0;
        },
    this);

        tank.state = ENEMY_STATE_ON;
        tank.visible = true;
        tank.xv=-5;
        tank.reset(SCREEN_WIDTH,GROUND - 10);
    }
if (Level == 3 || Level == 5) {
    //AIRSHIPS
    airships.forEach(function (airship) {
        airship.state = ALIVE;
        airship.visible = true;
        airship.reset(SCREEN_WIDTH,getRandomInt(1, 300));
        airship.yv = 0;
        airship.xv = 0;
    },
    this);

    balloons.forEach(function (balloon) {
        balloon.state = DEAD;
        balloon.visible = false;
        balloon.x = SCREEN_WIDTH;
        balloon.y = getRandomInt(1, 240);
    },
        this);
}
};
    //////////////////////////////////////////////////
function Delete_Enemies()
{
    // this function simply deletes all memory and surfaces
    // related to the enemies pulses

    for (var index=0; index<MAX_HOUSES; index++)
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
    fuel_plane.kill();
}; 

 function Move_Enemies()
{

    // this function moves all the enemies pulses and checks for
    // collision with the enemies
    //MOVE HOUSES
if (Level==1 || Level==3 || Level==5)	
{
    houses.forEach(function(house) {
        if (house.state == ALIVE)
        {
            if (Level == 1 && house.x < 10 && counter > 500 && getRandomInt(1, 1500) < 5) { house.x = SCREEN_WIDTH; house.frame = 5; }
            if (Level == 3 && house.x < 10 && counter > 500 && getRandomInt(1, 1500) < 5) { house.x = SCREEN_WIDTH; house.frame = 6; }
            if (Level == 5 && house.x < 10 && counter > 500 && getRandomInt(1, 5500) < 5) { house.x = SCREEN_WIDTH; house.frame = 7; }
            if (counter > 500 && Level == 5 && getRandomInt(1, 500) < 5 && house.x < 10) { house.x = SCREEN_WIDTH; house.frame = 8; }
            if(Level==5 && house.frame==8 && getRandomInt(1,500)<5) Fire_Enemy_Missile(house.x,house.y);
            if (house.x < 10 && getRandomInt(1, 500) < 10) { house.x = SCREEN_WIDTH; house.frame = getRandomInt(1, 5); }
            // test if enemies pulse is in flight
            // move the enemy
            house.x+=house.xv;
        }

    // test for collision with enemies
        if (Collision_Test(player,house)
					   && house.frame == 4
                       && player.state == ALIVE)
{
            //Start_Explosion(player.x, player.y,
            //            68 + getRandomInt(1, 12), 54 + getRandomInt(1, 10),
            //           player.xv, player.yv);
            Start_Explosion(house.x, house.y-20,
                               68+getRandomInt(1,12),54+getRandomInt(1,10),
                               house.xv, house.yv);
                   
    // update players damage
                    player_damage+=100;
                    counter = 0;
    // update score
                    player_score += 60;
                    house.reset();
        } 
    },
        this);

}

if (Level==2 || Level==4)	
{
    if (counter == 500) Add_Jet();
    if (counter == 1000) Add_Jet();
    if (counter == 1250) Add_Jet();
    if (counter == 1300) Add_Jet();
    if (counter == 1500) Add_Jet();
    jets.forEach(function (jet) {
        if (jet.state == ALIVE) {
            jet.visible = true;
            jet.x += jet.xv;
            jet.y += jet.yv;
            // move the enemy
            if (jet.y>player.y ) jet.yv -= .01;
            if (jet.y < player.y) jet.yv += .01;
            if (jet.y > GROUND - 50) jet.yv = 0;
            if (jet.x < 10) {
                //jet.reset(SCREEN_WIDTH - 20, getRandomInt(1, 240));
                jet.x = SCREEN_WIDTH-20;
                jet.y = getRandomInt(1, 240);
                //jet.yv = 0;
            }
            // test for collision with enemies
            if (Collision_Test(player, jet)
                           && player.state == ALIVE) {
                Start_Explosion(jet.x, jet.y,
                                   68 + getRandomInt(1, 12), 54 + getRandomInt(1, 10),
                                   jet.xv *.1, jet.yv *.1);

                // update players damage
                player_damage += 100;
                // update score
                player_score += 60;
                jet.x=SCREEN_WIDTH;
                jet.y=getRandomInt(0, SCREEN_HEIGHT);
            } 
        }
    },
             this);

    if (tank.x > SCREEN_WIDTH / 2 && player.x < tank.x && getRandomInt(1, 100) < 5) tank.xv = -3;
if (tank.x < SCREEN_WIDTH/2) tank.xv++;
if (player.x > tank.x - 20) tank.xv += 3;
if (tank.x > SCREEN_WIDTH) tank.xv = -3;

tank.x += tank.xv;
if (getRandomInt(1, 100) < 5 && cactus.state == DEAD)
{
    cactus.visible = true;
    cactus.y = GROUND-10;
    cactus.x = SCREEN_WIDTH;
    cactus.xv = -10;
    cactus.state = ALIVE;
}
if (cactus.state == ALIVE)
{
    if (cactus.x < 10) {
        cactus.state = DEAD;
        cactus.visible = false;
    }
    cactus.x += cactus.xv;
} 

}//Level 2

if (Level==3 || Level==5)	
{
    if (counter == 500) Add_Airship();
   if (counter == 100) Add_Airship();
    if (counter == 1250) Add_Airship();
    if (counter == 1300) Add_Airship();
    if (counter == 1500) Add_Airship();
    airships.forEach(function(airship) {
        // test if enemies pulse is in flight
        if (airship.state == ALIVE) {
            // move the enemy
            //airship.xv=-20;
//            console.log(airship.z + ' ' + airship.alive);
            var airShipMove = .5;
            if (player.y > airship.y && airship.y < GROUND - 50 && airship.yv<1 && getRandomInt(1, 100) < 5) {
                airship.y += airShipMove;
            }
            if (player.y < airship.y && airship.y > 10 && airship.yv > -1 && getRandomInt(1, 100) < 5) {
                airship.y -= airShipMove;
            }
            if ((airship.x > SCREEN_WIDTH / 2) && player.x < airship.x && airship.xv > -1 && getRandomInt(1, 100) < 5) {
               airship.x -= airShipMove;
            }
            if (airship.x < player.x) 
                airship.x += airShipMove;
            if(airship.x >SCREEN_WIDTH)
                airship.x = SCREEN_WIDTH;

            if (airship.x < 0) {
                airship.state = ALIVE;
                airship.visible = true;
                airship.reset(SCREEN_WIDTH, getRandomInt(1, 300));
                airship.yv = 0;
                airship.xv = 0;
            }
            
            //if(rand()%100==5&&airship.x>250)airship.xv--;
            if (getRandomInt(1, 100) < 3) Release_Balloon(airship.x, airship.y);
            if (airship.y > GROUND-50) airship.y -= airShipMove;
            //airship.x += airship.xv;
            //airship.y += airship.yv;

            // test for collision with enemies
            if (Collision_Test(player, airship)
                           && player.state == ALIVE) {
                Start_Explosion(airship.x, airship.y,
                                   68 + getRandomInt(1, 12), 54 + getRandomInt(1, 10),
                                   airship.xv * .1, airship.yv * .1);

                // update players damage
                player_damage += 100;
                // update score
                player_score += 60;
                airships_active = 1;
                airship.x = SCREEN_WIDTH;
            } 
        }
    },
        this);

    balloons.forEach(function (balloon) {
        // test if enemies pulse is in flight
        if (balloon.state == ALIVE)
    {
    // move the enemy
	 balloon.xv=-10;
	 balloon.yv-=.1;

	 balloon.x+=balloon.xv;
	 balloon.y += balloon.yv;
	 if (balloon.y < 0) {
	     balloon.state = DEAD;
	     balloon.visible = false;
	 }
 } 
    
    // test for collision with enemies
    if (Collision_Test(player,balloon)
					   && player.state == ALIVE)
{
        Start_Explosion(balloon.x, balloon.y,
                               68+getRandomInt(1,12),54+getRandomInt(1,10),
                               balloon.xv*.1, balloon.yv*.1);
                   
    // update players damage
                   player_damage += 100;
    // update score
                   player_score += 60;
                   balloon.reset();
} 

    },
         this);
}//Level 3

if (Level==4)	
{
    jets.forEach(function(jet) {
    // test if enemies pulse is in flight
        if (jet.state == ENEMY_STATE_ON) {
            if (getRandomInt(1, 100) < 5) Fire_Enemy_Laser(jet.x, jet.y, -16);

            if (getRandomInt(1, 100) < 5) Fire_Enemy_Missile(tank.x, tank.y);
        }
    },
     this);
}//Level 4


}; 

function Add_Jet()
{
    var jet = game.add.sprite(SCREEN_WIDTH, getRandomInt(1, 240), 'jet');
    jet.state = ALIVE;
    jet.visible = true;
    //  And then add it to the group
    jets.add(jet);
};

function Add_Airship()
{
    var airship = game.add.sprite(SCREEN_WIDTH, getRandomInt(1, 240), 'airship');
    airship.state = ALIVE;
    airship.visible = true;
    //  And then add it to the group
    airships.add(airship);
};
    ///////////////////////////////////////////////////////////


function Init_Explosions()
{
    // this function initializes and loads all the Explosions 

    // create the first Explosion 
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(MAX_EXPLOSIONS, 'explosions');
    explosions.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    explosions.setAll('xv', -5);

    //new Animation(game, parent, name, frameData, frames, frameRate, loop, loop)
//     var frameNames = Phaser.Animation.generateFrameNames('explosion', 0, 14, '', 4);
//     console.log(frameNames);
//  explosions.forEach(explosion => {
//   explosion.animations.add('explode', frameNames);
   
 //});
    //


}; 

function Start_Explosion (x, y, width, height, xv,yv)
{

        var explosion = explosions.create(x, y, 'explosion');
        explosion.animations.add('explode');

        explosion.play('explode',20, false, true);
       explosion.state = ALIVE;
          
    // later
       return;

 

}; 

function Release_Balloon(x,y)
{
    var balloon = balloons.getFirstExists(false); 
    // test if Laser pulse is in flight
        var released = false;
    if (balloon.state==DEAD && !released) {
        balloon.state = ALIVE;
        balloon.visible = true;
        balloon.x = x
        balloon.y = y;
        balloon.xv = -10;
        balloon.yv = -1;
        released = true;
    }

}; 

function Init_Score()
{
    var f = '16pt Arial';
    var color = ' rgb(0,255,0)';
    var t = game.add.text(10, 10, "", { fill: color, font: f });
    scoreText.push(t);        
    var t = game.add.text(game.width*.2, 10, "", { fill: color, font: f });
    scoreText.push(t);
    var t = game.add.text(game.width*.5, 10, "", { fill: color, font: f });
    scoreText.push(t);
    var t = game.add.text(game.width*.8, 10, "", { fill: color, font: f });
    scoreText.push(t);
};

function Draw_Score()
{
    // this function draws all the information at the top of the screen

    Update_Score_Text(0,"SCORE: " + player_score);

    Update_Score_Text(1,"HIGH SCORE: " + highscore);

    Update_Score_Text(2,"FUEL LEFT: " + Fuel_Left);

    Update_Score_Text(3,"SHIPS: " + player_ships);

}; 

function Regenerate_Player()
{
    //++player_counter > 60 && 
    if (player_ships > 0)
{
    // set state to ready
        player.state = ALIVE;
        player.x = 20
        player.y = 220;
        Fuel_Left = MAX_FUEL;
        outoffuel = 0;
        player.xv = 0;
        player.yv = 0;
        showintro = 0;
        counter = 0;
        radar_killed = 0;
        tank_killed = 0;
        icbm_killed = 0;
        player_damage = 0;
        player.anchor.set(0.3, 0.5);
        Initialize_Enemy_Positions();
    // stop the intro if not already
}
};
    ///////////////////////////////////////////////////////////
//Game_Intro: function()
//{

//    while (intro_state == 0)
//{

//        splash.visible = true;
 
//}
//return(1);
//},

///////////////////////////////////////////////////////////

function Do_Intro()
{
    // the world's simplest intro
    Draw_Info_Text("LEVEL:" + Level, 300, 200, 32, 'rgb(0,255,0)', 'Impact');

if (Level==1)
    Draw_Info_Text("DESTROY THE RADAR", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (Level==2)
    Draw_Info_Text("WASTE THE TANK", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (Level==3)
    Draw_Info_Text("BOMB THE ICBM", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (Level==4)
    Draw_Info_Text("DEMOLISH THE TANK AGAIN", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
if (Level==5)
    Draw_Info_Text("WIPE OUT THE HEADQUARTERS", 300, 250, 32, 'rgb(0,255,0)', 'Impact');
}; 

function Game_Shutdown()
{
    // this function is where you shutdown your game and
    // release all resources that you allocated

    // delete all the explosions
Delete_Explosions();
    
    // delete the player
player.kill;

    // the delete all the enemies
Delete_Enemies();

    // delete all the Laser pulses
Delete_Laser();


    // return success
return(1);
}; 

function Game_Main()
{
    // this is the workhorse of your game it will be called
    // continuously in real-time this is like main() in C
    // all the calls for you game go here!
    var ready_counter = 0; // used to draw a little "get ready"
    var ready_state   = 1;
    if (showintro == 1) {
        Do_Intro();
        showintro = 0;
    }
    // start the timing clock
//Start_Clock();

//if (intro_state == 0) Game_Intro();
    // only process player if alive
if (player.state == ALIVE)
{
   player.x += player.xv;
   player.y += player.yv;
counter++;
if (Fuel_Left == MAX_FUEL/2) {
    fuel_plane.state = ALIVE;
    Send_Fuel_Plane();

}

 arrows.forEach(arrow => {
  arrow.events.onInputDown.add(arrowClick, this);
});

if (fuel_plane.state == ALIVE || fuel_tank.state == ALIVE) {
    fuel_plane.x += fuel_plane.xv;
    if (fuel_plane.state == ALIVE && fuel_tank.state == DEAD)
        fuel_tank.x = fuel_plane.x;

    if (fuel_plane.x > SCREEN_WIDTH / 2 && fuel_tank.state == DEAD) fuel_tank.state = ALIVE;
    if (fuel_tank.state == ALIVE) {
        fuel_tank.yv = 1;
        fuel_tank.xv = -1;
        fuel_tank.x += fuel_tank.xv;
        fuel_tank.y += fuel_tank.yv;
        fuel_tank.visible = true;

        if (Collision_Test(fuel_tank, player)) {
            fuel_tank.state = DEAD;
            Fuel_Left = MAX_FUEL;
        }

        if (fuel_tank.y > GROUND) {
            fuel_tank.state = DEAD;
            Start_Explosion(fuel_tank.x, fuel_tank.y - 50,
                                68 + getRandomInt(1, 12), 54 + getRandomInt(1, 10),
                              fuel_tank.xv *.1, fuel_tank.yv *.1);
        }
    }

}
    if (Fuel_Left > 0) Fuel_Left -= 5;
    if (Fuel_Left == 0) outoffuel = 1;
    if (outoffuel == 1) {
    player.y += 5;
    Draw_Info_Text("OUT OF FUEL", 300, 250, 32, 'rgb(255,0,0)', 'Impact');
}
    // do bounds check
if(player.x>10)player.x--;

if (player.x < 10)
    player.x = 10;
else
    if (player.x > (SCREEN_WIDTH - 100))
        player.x = (SCREEN_WIDTH - 100);

if (player.y < 10)
    player.y = 10;

if (player.y > SCREEN_HEIGHT - 80 && outoffuel == 0)
    player.y = SCREEN_HEIGHT - 80;
if (player.y > SCREEN_HEIGHT - 80 && outoffuel == 1)
    player_damage = 100;
    // test for dying state transition
if (player_damage >= 100)
{
    // kill player
    player.state = DEAD;
    player.visible = false;
    player_ships--;
    // set counter to 0
    player_counter = 0;
} 
} 


if (player.state == DEAD)
{ 
    // player is dead
    if ((getRandomInt(1, 4) % 4) == 1 && player_counter < 60)
        Start_Explosion(player.x - 16 + getRandomInt(1, 40), player.y - 50 + getRandomInt(1, 8),
                   player.width, player.height,
                   -4+getRandomInt(1,8),2+getRandomInt(1,4));    

    Regenerate_Player();
    ready_state = 1;
    ready_counter = 0;
    // set position
} 

    //GAME OVER ?
if (player.state == DEAD && player_ships == 0)
{
    // player is dead
    ready_state = 1;
    gameover = true;
    // draw text
    Draw_Info_Text("G A M E    O V E R",
                 320,
                 200, 32, 'rgb(255,0,0)', 'Impact');
    Draw_Info_Text("Press spacebar play again",
                 220,
                 280, 32, 'rgb(255,0,0)', 'Impact');
} 


    //NEXT LEVEL?

if (radar_killed&&Level==1)
{
    Level = 2;
    Regenerate_Player();
    houses.callAll('kill'); 
	ready_state = 1;
	ready_counter = 0;
	showintro = 1;
}

if (tank_killed && Level == 2)
{
    Level = 3;
    Regenerate_Player();
    jets.callAll('kill');
    tank.kill();
    cactus.kill();
    ready_state = 1;
    ready_counter = 0;
    showintro = 1;
}

if (icbm_killed && Level==3)
{
    Level = 4;
    Regenerate_Player();
    houses.callAll('kill');
    ready_state = 1;
    ready_counter = 0;
    showintro = 1;
}

if (tank_killed && Level == 4)
{
    Level = 5;
    cactus.kill();
    jets.callAll('kill');
    tank.kill();
    Regenerate_Player();
    ready_state = 1;
    ready_counter = 0;
    showintro = 1;
}

if (headquarters_killed)
{
    //ready_state = 1;
    //gameover = true;

    // draw text
    var str = "C O N G R A T U L A T I O N S !";
    var n = str.length;
    Draw_Info_Text(str,SCREEN_WIDTH-6*n/2,200,'rgb(255,0,0)','Impact');
    str = "You Have Completed Your Mission";
    n = str.length;
    Draw_Info_Text(str, SCREEN_WIDTH - (6 * n) / 2,220, 'rgb(255,0,0)', 'Impact');
    str = "Hit Escape to Exit";
    n = str.length;
    Draw_Info_Text(str, SCREEN_WIDTH - (6 * n) / 2, 240, 'rgb(255,0,0)', 'Impact');
    str = "Or P to Play Again";
    n = str.length;
    Draw_Info_Text(str, SCREEN_WIDTH - (6 * n) / 2, 260, 'rgb(255,0,0)', 'Impact');
}

if (player_score > highscore) highscore = player_score;
    // draw the player if alive
if (player.state == ALIVE)
{
    player.visible = true;
} 

    // move the Laser
Move_Laser();
    // move the asteroids
Move_Enemies();


    // move the stars
Move_Stars();

    // draw the enemies
if (showintro > 59) Draw_Enemies();

    // draw the Laser
//Draw_Laser();

    // draw the stars
//Draw_Stars();

    // draw explosions last
//Draw_Explosions();

    // draw the score and ships left
Draw_Score();

    // check of user is trying to exit
//if (KEY_DOWN(VK_ESCAPE))
//    PostMessage(main_window_handle, WM_DESTROY,0,0);

    // return success
return(1);

}; 

function Update_Score_Text(index,text)
{
    scoreText[index].text = text;
    //= add.text(x, y, text, { fill: color, font: size + 'pt ' + font });
        scoreText[index].updateText();
};

function Draw_Info_Text(text,x,y,size,color,font)
{
    infoText = game.add.text(game.world.centerX, y, text, { fill: color, font: size + 'pt ' + font });
    infoText.updateText();
    //infoText.anchor.setTo(0.5, 0.5);
    game.time.events.add(5000, infoText.destroy, infoText);
    infoText.anchor.setTo(0.5);
}

function arrowClick(gameObject)
{
  switch (gameObject.name) {
    case 'right':
      MoveRight();
    break;
    case 'left':
      MoveLeft();
    break;
    case 'up':
      MoveUp();
    break;
    case 'down':
      MoveDown();
      break;
    default:
      break;
  } 
  }
