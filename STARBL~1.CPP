// MAX'S THIRD DIRECTX GAME - STARBLAZER!
// remember to compile you need GPDUMB1.CPP and
// DirectDraw library DDRAW.LIB	 included in the project

// INCLUDES ///////////////////////////////////////////////

#define WIN32_LEAN_AND_MEAN  
#define INITGUID

#include <windows.h>   // include important windows stuff
#include <windowsx.h> 
#include <mmsystem.h>
#include <objbase.h>
#include <iostream.h> // include important C/C++ stuff
#include <conio.h>
#include <stdlib.h>
#include <malloc.h>
#include <memory.h>
#include <string.h>
#include <stdarg.h>
#include <stdio.h> 
#include <math.h>
#include <io.h>
#include <fcntl.h>

#include <ddraw.h>     // directX includes
#include "gpdumb1.h"

// DEFINES ////////////////////////////////////////////////

// defines for windows 
#define WINDOW_CLASS_NAME "WINXCLASS"  // class name

#define WINDOW_WIDTH    64   // size of window
#define WINDOW_HEIGHT   48

// weapons defines
#define PLASMA_STATE_OFF   0   // this plasma is dead or off
#define PLASMA_STATE_ON    1   // this one is alive and in flight
#define MAX_PLASMA   12 

//enemy defines
#define MAX_HOUSES          12
#define MAX_AIRSHIPS        12
#define MAX_JETS            12
#define MAX_BALLOONS        12

#define MAX_STARS  28

#define ENEMY_STATE_OFF     0   // this enemy is dead or off
#define ENEMY_STATE_ON      1   // this one is alive
#define SCRAMBLE_STATE_RETREATING 2

#define MAX_ENEMY_PLASMA   12 
#define ENEMY_PLASMA_STATE_OFF   0   // this plasma is dead or off
#define ENEMY_PLASMA_STATE_ON    1   // this one is alive and in flight

// explosion defines 
#define MAX_BURSTS          8
#define BURST_STATE_OFF     0   // this burst is dead or off
#define BURST_STATE_ON      1   // this one is alive

// defines for player states
#define PLAYER_STATE_DEAD     0
#define PLAYER_STATE_ALIVE    1 
// PROTOTYPES /////////////////////////////////////////////

// game console
int Game_Init(void *parms=NULL);
int Game_Shutdown(void *parms=NULL);
int Game_Main(void *parms=NULL);

// helper functions for game logic
void Regenerate_Player(void);
void Draw_Info(void);
void Start_Burst(int x, int y, int width, int height, int xv,int yv);
void Draw_Bursts(void);
void Delete_Bursts(void);
void Init_Bursts(void);
void Fire_Plasma(int x,int y, int vel);
void Release_Balloon(int x,int y);
void Fire_Enemy_Missile(int x,int y);
void Fire_Enemy_Plasma(int x,int y, int vel);
void Draw_Plasma(void);
void Drop_Bomb(void);
void Move_Plasma(void);
void Initialize_Enemy_Positions(void);
int Collision_Test(int x1, int y1, int w1, int h1, 
                   int x2, int y2, int w2, int h2);

void Delete_Plasma(void);
void Init_Plasma(void);

void Move_Enemies(void);
void Draw_Enemies(void);
void Init_Enemies(void);
void Delete_Enemies(void);
void Move_Stars(void);
void Draw_Stars(void);
void Init_Stars(void);

int Color_Scan(int x1, int y1, int x2, int y2, 
               UCHAR scan_start, UCHAR scan_end,
               UCHAR *scan_buffer, int scan_lpitch);

// TYPES //////////////////////////////////////////////////
// used to contain a single star
typedef struct STAR_TYP
    {
    UCHAR color;  
    int x,y;
    int velocity;
    } STAR, *STAR_PTR;


// GLOBALS ////////////////////////////////////////////////

HWND main_window_handle = NULL; // save the window handle
HINSTANCE main_instance = NULL; // save the instance
char buffer[80];                // used to print text

BITMAP_IMAGE background, title;

BOB player;            // the player 

BOB plasma[MAX_PLASMA];    // plasma pulses
BOB bomb;    // plasma pulses
BOB enemy_missile[MAX_ENEMY_PLASMA];    // plasma pulses
BOB enemy_plasma[MAX_ENEMY_PLASMA];

BOB house[MAX_HOUSES];

BOB fuel_ship;
BOB fuel_tank;
BOB airship[MAX_AIRSHIPS];
BOB balloon[MAX_BALLOONS];
BOB jet[MAX_JETS];
BOB cactus;
BOB launch_pad;
BOB tank;
int showintro=0;
BOB bursts[MAX_BURSTS];    // the explosion bursts
int intro_state=0;
STAR stars[MAX_STARS]; // the star field
int counter;
int Level=1,Fuel_Left=2000;
int radar_killed=0,tank_killed=0,
    icbm_killed=0, headquarters_killed=0,
	balloons_active=5, jets_active=5,airships_active=1;
int outoffuel;
int attack_speed=5;
// player state variables
int player_state       = PLAYER_STATE_ALIVE;
int player_score       = 0;  // the score
int highscore          = 0;  // the high score
int player_ships       = 3;  // ships left
int player_damage      = 0;  // damage of player
int player_counter     = 0;  // used for state transition tracking
int player_regen_count = 0;  // used to regenerate player

// PROTOTYPES //////////////////////////////////////////////

int Color_Scan(int x1, int y1, int x2, int y2, 
      UCHAR scan_start, UCHAR scan_end, 
      UCHAR *scan_buffer, int scan_lpitch);


// FUNCTIONS //////////////////////////////////////////////

LRESULT CALLBACK WindowProc(HWND hwnd, 
						    UINT msg, 
                            WPARAM wparam, 
                            LPARAM lparam)
{
// this is the main message handler of the system
PAINTSTRUCT	ps;		   // used in WM_PAINT
HDC			hdc;	   // handle to a device context

// what is the message 
switch(msg)
	{	
	case WM_CREATE: 
        {
		// do initialization stuff here
		return(0);
		} break;

    case WM_PAINT:
         {
         // start painting
         hdc = BeginPaint(hwnd,&ps);

         // end painting
         EndPaint(hwnd,&ps);
         return(0);
        } break;

	case WM_DESTROY: 
		{
		// kill the application			
		PostQuitMessage(0);
		return(0);
		} break;

	default:break;

    } // end switch

// process any messages that we didn't take care of 
return (DefWindowProc(hwnd, msg, wparam, lparam));

} // end WinProc

// WINMAIN ////////////////////////////////////////////////

int WINAPI WinMain(	HINSTANCE hinstance,
					HINSTANCE hprevinstance,
					LPSTR lpcmdline,
					int ncmdshow)
{
// this is the winmain function

WNDCLASS winclass;	// this will hold the class we create
HWND	 hwnd;		// generic window handle
MSG		 msg;		// generic message
//HDC      hdc;       // generic dc
//PAINTSTRUCT ps;     // generic paintstruct

// first fill in the window class stucture
winclass.style			= CS_DBLCLKS | CS_OWNDC | 
                          CS_HREDRAW | CS_VREDRAW;
winclass.lpfnWndProc	= WindowProc;
winclass.cbClsExtra		= 0;
winclass.cbWndExtra		= 0;
winclass.hInstance		= hinstance;
winclass.hIcon			= LoadIcon(NULL, IDI_APPLICATION);
winclass.hCursor		= LoadCursor(NULL, IDC_ARROW);
winclass.hbrBackground	= GetStockObject(BLACK_BRUSH);
winclass.lpszMenuName	= NULL; 
winclass.lpszClassName	= WINDOW_CLASS_NAME;

// register the window class
if (!RegisterClass(&winclass))
	return(0);

// create the window, note the use of WS_POPUP
if (!(hwnd = CreateWindow(WINDOW_CLASS_NAME, // class
						  "WinX Game Console",	 // title
						  WS_POPUP | WS_VISIBLE,
					 	  0,0,	   // x,y
						  WINDOW_WIDTH,  // width
                          WINDOW_HEIGHT, // height
						  NULL,	   // handle to parent 
						  NULL,	   // handle to menu
						  hinstance,// instance
						  NULL)))	// creation parms
return(0);

// save the window handle and instance in a global
main_window_handle = hwnd;
main_instance      = hinstance;

// perform all game console specific initialization
Game_Init();

// enter main event loop
while(1)
	{
	if (PeekMessage(&msg,NULL,0,0,PM_REMOVE))
		{ 
		// test if this is a quit
        if (msg.message == WM_QUIT)
           break;
	
		// translate any accelerator keys
		TranslateMessage(&msg);

		// send the message to the window proc
		DispatchMessage(&msg);
		} // end if
    
    // main game processing goes here
    Game_Main();

	} // end while

// shutdown game and release all resources
Game_Shutdown();

// return to Windows like this
return(msg.wParam);

} // end WinMain

///////////////////////////////////////////////////////////

int Color_Scan(int x1, int y1, int x2, int y2, 
               UCHAR scan_start, UCHAR scan_end,
               UCHAR *scan_buffer, int scan_lpitch)
{
// this function implements a crude collision technique
// based on scanning for a range of colors within a rectangle

// clip rectangle

// x coords first    
if (x1 >= SCREEN_WIDTH)
   x1=SCREEN_WIDTH-1;
else
if (x1 < 0)
   x1=0;

if (x2 >= SCREEN_WIDTH)
   x2=SCREEN_WIDTH-1;
else
if (x2 < 0)
   x2=0;

// now y-coords
if (y1 >= SCREEN_HEIGHT)
   y1=SCREEN_HEIGHT-1;
else
if (y1 < 0)
   y1=0;

if (y2 >= SCREEN_HEIGHT)
   y2=SCREEN_HEIGHT-1;
else
if (y2 < 0)
   y2=0;

// scan the region
scan_buffer +=y1*scan_lpitch;

for (int scan_y=y1; scan_y<=y2; scan_y++)
    {
    for (int scan_x=x1; scan_x<=x2; scan_x++)
        {
        if (scan_buffer[scan_x] >= scan_start && scan_buffer[scan_x] <= scan_end )
            return(1);
        } // end for x

    // move down a line
    scan_buffer+=scan_lpitch;

    } // end for y

// return failure
return(0);

} // end Color_Scan

///////////////////////////////////////////////////////////

int Collision_Test(int x1, int y1, int w1, int h1, 
                   int x2, int y2, int w2, int h2) 
{
// this function tests if the two rects overlap

// get the radi of each rect
int width1  = (w1>>1) - (w1>>3);
int height1 = (h1>>1) - (h1>>3);

int width2  = (w2>>1) - (w2>>3);
int height2 = (h2>>1) - (h2>>3);

// compute center of each rect
int cx1 = x1 + width1;
int cy1 = y1 + height1;

int cx2 = x2 + width2;
int cy2 = y2 + height2;

// compute deltas
int dx = abs(cx2 - cx1);
int dy = abs(cy2 - cy1);

// test if rects overlap
if (dx < (width1+width2) && dy < (height1+height2))
   return(1);
else
// else no collision
return(0);

} // end Collision_Test

///////////////////////////////////////////////////////////

void Init_Stars(void)
{
// this function initializes all the stars in such a way
// that their intensity is proportional to their 
// velocity

for (int index=0; index<MAX_STARS; index++)
    {
    // random postion
    stars[index].x = rand()%SCREEN_WIDTH;
    stars[index].y = rand()%SCREEN_HEIGHT;

    // select star plane
   int plane = rand()%4; // (1..4)

    // based on plane select velocity and color
    stars[index].velocity = -plane;
  //  stars[index].color = 25 - (plane*3);
	stars[index].color = rand()%16;
    } // end for index

} // end Init_Stars

///////////////////////////////////////////////////////////

void Move_Stars(void)
{
// this function moves all the stars

for (int index=0; index<MAX_STARS; index++)
    {
    // translate upward
    stars[index].x+=stars[index].velocity;
     
    // test for collision with top of screen
    if (stars[index].x <= 0)
        stars[index].x =SCREEN_WIDTH;

    } // end for index

} // end Move_Stars

///////////////////////////////////////////////////////////

void Draw_Stars(void)
{
// this function draws all the stars

// lock back surface
DD_Lock_Back_Surface();

// draw all the stars
for (int index=0; index<MAX_STARS; index++)
    {
    // draw stars 
    Draw_Pixel(stars[index].x,stars[index].y, stars[index].color,back_buffer, back_lpitch);

    } // end for index

// unlock the secondary surface
DD_Unlock_Back_Surface();

} // end Draw_Stars


///////////////////////////////////////////////////////////
void Init_Plasma(void)
{
// this function initializes and loads all the plasma 
// weapon pulses

// now create and load each plasma pulse
    Create_BOB(&plasma[0],0,0,40,10,1,
               BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
               DDSCAPS_SYSTEMMEMORY);
 
    // load animation frames
         Load_Frame_BOB(&plasma[0],&bitmap8bit,0,300,0,BITMAP_EXTRACT_MODE_ABS);  

    // set state to off
    plasma[0].state = PLASMA_STATE_OFF;
for(int pulse=0;pulse<MAX_PLASMA;pulse++)
    {
    memcpy(&plasma[pulse], &plasma[0], sizeof(BOB));
    }

    Create_BOB(&bomb,0,0,20,10,1,
               BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
               DDSCAPS_SYSTEMMEMORY);
 
    // load animation frames
         Load_Frame_BOB(&bomb,&bitmap8bit,0,400,0,BITMAP_EXTRACT_MODE_ABS);  

    // set state to off
    bomb.state = ENEMY_STATE_OFF;

//CREATE ENEMY PLASMA PULSES
    Create_BOB(&enemy_missile[0],0,0,20,10,1,
               BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
               DDSCAPS_SYSTEMMEMORY);
 
    // load animation frames
         Load_Frame_BOB(&enemy_missile[0],&bitmap8bit,0,370,0,BITMAP_EXTRACT_MODE_ABS);  

    // set state to off
    enemy_missile[0].state = ENEMY_STATE_OFF;

for(pulse=0;pulse<MAX_ENEMY_PLASMA;pulse++)
    {
    memcpy(&enemy_missile[pulse], &enemy_missile[0], sizeof(BOB));
    }

    Create_BOB(&enemy_plasma[0],0,0,40,10,1,
               BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
               DDSCAPS_SYSTEMMEMORY);
 
    // load animation frames
         Load_Frame_BOB(&enemy_plasma[0],&bitmap8bit,0,300,0,BITMAP_EXTRACT_MODE_ABS);  

    // set state to off
    enemy_plasma[0].state = ENEMY_PLASMA_STATE_OFF;
for(pulse=0;pulse<MAX_ENEMY_PLASMA;pulse++)
    {
    memcpy(&enemy_plasma[pulse], &enemy_plasma[0], sizeof(BOB));
    }

}
///////////////////////////////////////////////////////////

void Delete_Plasma(void)
{
// this function simply deletes all memory and surfaces
// related to the plasma pulses

for(int pulse=0;pulse<MAX_PLASMA;pulse++)
    {
    Destroy_BOB(&enemy_plasma[pulse]);
    Destroy_BOB(&plasma[pulse]);
    Destroy_BOB(&enemy_missile[pulse]);
    }
    Destroy_BOB(&bomb);


} // end Delete_Plasma

///////////////////////////////////////////////////////////

void Move_Plasma(void)
{
// this function moves all the plasma pulses and checks for
// collision with the enemies

for(int pulse=0;pulse<MAX_PLASMA;pulse++)
    {
     if (plasma[pulse].state == PLASMA_STATE_ON)
        {
          // move the pulse upward
          Move_BOB(&plasma[pulse]);
  
          // test for boundaries
          if (plasma[pulse].x > SCREEN_WIDTH )
            {
            // kill the pulse
            plasma[pulse].state = PLASMA_STATE_OFF;
		    }

		  // test for collision with enemies
//PLASMA COLLISION WITH JETS
if (Level==2 || Level == 4)
              {
	for (int enemy=0; enemy<jets_active; enemy++)
                {
            if (jet[enemy].state==ENEMY_STATE_ON)
                  {
                // test for collision 
					if (Collision_Test(plasma[pulse].x, plasma[pulse].y, 
                                   plasma[pulse].width, plasma[pulse].height,
                                   jet[enemy].x, jet[enemy].y,
                                   jet[enemy].width, jet[enemy].height))
                     {
                    // kill pulse
                    plasma[pulse].state = PLASMA_STATE_OFF;
  
                    jet[enemy].x = 700;
  
                    Start_Burst(plasma[pulse].x-10, plasma[pulse].y-20, 
                               42,36,
                               jet[enemy].xv>>1, jet[enemy].yv>>1);

                    // update score
                    player_score+=100;
				      } // end if collision
                   } //end if airship
				} //end for airship
				} // end Level 3

//PLASMA COLLISION WITH AIRSHIPS
if (Level==3 || Level ==5)
              {
	for (int enemy=0; enemy<airships_active; enemy++)
                {
            if (airship[enemy].state==ENEMY_STATE_ON)
                  {
                // test for collision 
					if (Collision_Test(plasma[pulse].x, plasma[pulse].y, 
                                   plasma[pulse].width, plasma[pulse].height,
                                   airship[enemy].x, airship[enemy].y,
                                   airship[enemy].width, airship[enemy].height))
                     {
                    // kill pulse
                    plasma[pulse].state = PLASMA_STATE_OFF;
  
                    airship[enemy].x=700,airship[enemy].y=rand()%240;
  					airship[enemy].xv=-1,airship[enemy].yv=-1;
  

                    Start_Burst(plasma[pulse].x-10, plasma[pulse].y-20, 
                               42,36,
                               airship[enemy].xv>>1, airship[enemy].yv>>1);

                    // update score
                    player_score+=10;
				      } // end if collision
                   } //end if airship
				} //end for airship


	for (enemy=0; enemy<balloons_active; enemy++)
                {
            if (balloon[enemy].state==ENEMY_STATE_ON)
                  {
                // test for collision 
					if (Collision_Test(plasma[pulse].x, plasma[pulse].y, 
                                   plasma[pulse].width, plasma[pulse].height,
                                   balloon[enemy].x, balloon[enemy].y,
                                   balloon[enemy].width, balloon[enemy].height))
                     {
                    // kill pulse
                    plasma[pulse].state = PLASMA_STATE_OFF;
  
                    balloon[enemy].state = ENEMY_STATE_OFF;
  
                    Start_Burst(plasma[pulse].x-10, plasma[pulse].y-20, 
                               42,36,balloon[enemy].xv>>1, balloon[enemy].yv>>1);

                    // update score
                    player_score+=10;
				      } // end if collision
                   } //end if airship
				} //end for airship


	} // end Level 3

if(Level==4 || Level==5)
{
		for (int enemy=0; enemy<MAX_ENEMY_PLASMA; enemy++)
                {
            if (enemy_missile[enemy].state==ENEMY_STATE_ON)
                  {
                // test for collision 
					if (Collision_Test(plasma[pulse].x, plasma[pulse].y, 
                                   plasma[pulse].width, plasma[pulse].height,
                                   enemy_missile[enemy].x, enemy_missile[enemy].y,
                                   enemy_missile[enemy].width, enemy_missile[enemy].height))
                     {
                    // kill pulse
                    plasma[pulse].state = PLASMA_STATE_OFF;
  
                    enemy_missile[enemy].state = ENEMY_STATE_OFF;
  
                    Start_Burst(plasma[pulse].x-10, plasma[pulse].y-20, 
                               42,36,enemy_missile[enemy].xv>>1, enemy_missile[enemy].yv>>1);

                    // update score
                    player_score+=100;
				      } // end if collision
                   } //end if airship
				} //end for airship


	} // end Level 4 or 5

     } // end if plasma
}//end for plasma


//CHECK IF BOMB IS DROPPING
if (bomb.state == PLASMA_STATE_ON)
        {
          bomb.yv++;
		  Move_BOB(&bomb);
  
          // test for boundaries
          if (bomb.y > 440 )
            {
            // kill the pulse
            bomb.state = PLASMA_STATE_OFF;
            Start_Burst(bomb.x-10, bomb.y-24, 
            42,36,bomb.xv>>1, bomb.yv>>1);
            }

		  // test for collision with enemies

//BOMBS DROPPING ON HOUSES, RADAR
if (Level==1 || Level == 3 || Level == 5)
              {
	for (int enemy=0; enemy<MAX_HOUSES; enemy++)
                  {
            if (house[enemy].state==ENEMY_STATE_ON)
                  {
                // test for collision 
					if (Collision_Test(bomb.x, bomb.y, 
                                   bomb.width, bomb.height,
                                   house[enemy].x, house[enemy].y+60,
                                   house[enemy].width, house[enemy].height))
								   
				  {
					// kill pulse
                    bomb.state = PLASMA_STATE_OFF;
  
                    if(house[enemy].curr_frame!=1)house[enemy].state = ENEMY_STATE_OFF;
  
                    if(house[enemy].curr_frame!=1)Start_Burst(bomb.x-10, bomb.y-20, 
                               42,36, house[enemy].xv>>1, house[enemy].yv>>1);
					if (house[enemy].curr_frame==5) radar_killed=1,player_score+=100;
					if (house[enemy].curr_frame==6) icbm_killed=1,player_score+=500;
					if (house[enemy].curr_frame==7) headquarters_killed=1,player_score+=1500;
                    // update score
                    player_score+=10;
				  } // end if collision
                } //end if airship
			} //end for airship
		} // end Level 1

if (Level==2 || Level==4)
              {
         if (tank.state==ENEMY_STATE_ON)
                  {
                // test for collision 
					if (Collision_Test(bomb.x, bomb.y, 
                                   bomb.width, bomb.height,
                                   tank.x, tank.y,
                                   tank.width, tank.height))
								   
				  {
					// kill pulse
                    bomb.state = PLASMA_STATE_OFF;
                   Start_Burst(bomb.x-10, bomb.y-20, 
                    42,36, tank.xv>>1, tank.yv>>1);
                    // update score
					tank_killed=1,player_score+=500;
				  } // end if collision
                } //end if airship
		if (cactus.state==ENEMY_STATE_ON)
                  {
                // test for collision 
					if (Collision_Test(bomb.x, bomb.y, 
                                   bomb.width, bomb.height,
                                   cactus.x, cactus.y,
                                   cactus.width, cactus.height))
								   
				  	// kill pulse
                    bomb.state = PLASMA_STATE_OFF;
		}
         } // end Level 2


}//end bomb
  
//MOVE ENEMY PLASMA
if(Level==4)
{
	for (int index=0;index<MAX_ENEMY_PLASMA;index++)
	{
		if (enemy_plasma[index].state == ENEMY_PLASMA_STATE_ON)
        {
        enemy_plasma[index].xv=-30;
		// move the pulse downward
        Move_BOB(&enemy_plasma[index]);
  							
        // test for boundaries
        if (enemy_plasma[index].x <10)
            {
            // kill the pulse
            enemy_plasma[index].state = ENEMY_PLASMA_STATE_OFF;

            } // end if

        // test for collision with player
        if (Collision_Test(enemy_plasma[index].x, enemy_plasma[index].y,
            enemy_plasma[index].width, enemy_plasma[index].height,
			player.x, player.y, player.width, player.height)&&player_state==PLAYER_STATE_ALIVE)
                        {
                   Start_Burst(enemy_plasma[index].x, enemy_plasma[index].y, 
                             68+rand()%12,54+rand()%10,
                           enemy_plasma[index].xv>>1, enemy_plasma[index].yv>>1);
                   
                    // update players damage
                    player_damage+=100;


                // kill the original
                enemy_plasma[index].state = ENEMY_PLASMA_STATE_OFF;     

                        } // end if collision

       } // end if
}//end for
}

//MOVE ENEMY MISSILES
 if (Level==4 || Level==5)
 {
	 for (int index=0;index<MAX_ENEMY_PLASMA;index++)
	{
		if (enemy_missile[index].state == ENEMY_PLASMA_STATE_ON)
        {
     enemy_missile[index].xv--;
	 if(player.y<enemy_missile[index].y)enemy_missile[index].y-=3;
	 if(player.y>enemy_missile[index].y)enemy_missile[index].y+=3;
	 // move the pulse downward
        Move_BOB(&enemy_missile[index]);
  							
        // test for boundaries
        if (enemy_missile[index].x <10)
            {
            // kill the pulse
            enemy_missile[index].state = ENEMY_PLASMA_STATE_OFF;

            } // end if

        // test for collision with player
        if (Collision_Test(enemy_plasma[index].x, enemy_missile[index].y,
            enemy_missile[index].width, enemy_missile[index].height,
			player.x, player.y, player.width, player.height)&&player_state==PLAYER_STATE_ALIVE)
                        {
                   Start_Burst(enemy_missile[index].x, enemy_missile[index].y, 
                             68+rand()%12,54+rand()%10,
                           enemy_missile[index].xv>>1, enemy_missile[index].yv>>1);
                   
                    // update players damage
                    player_damage+=100;


                // kill the original
                enemy_missile[index].state = ENEMY_PLASMA_STATE_OFF;     

                        } // end if collision

       } // end if
	}//end for
}
} // end Move_Plasma

//////////////////////////////////////////////////////////

void Draw_Plasma(void)
{
// this function draws all the plasma pulses

    // test if plasma pulse is in flight
for (int index=0;index<MAX_PLASMA;index++)
{
    if (plasma[index].state == PLASMA_STATE_ON)
        {
        // draw the pulse
        Draw_BOB(&plasma[index],lpddsback);
        } // end if
   
}
  
    if (bomb.state == PLASMA_STATE_ON)
        {
        // draw the pulse
        Draw_BOB(&bomb,lpddsback);
        } // end if
   

for (index=0;index<MAX_ENEMY_PLASMA;index++)
{
	if (enemy_plasma[index].state == ENEMY_PLASMA_STATE_ON)
        {
        // draw the pulse
        Draw_BOB(&enemy_plasma[index],lpddsback);
        } // end if
}
for (index=0;index<MAX_ENEMY_PLASMA;index++)
{
	if (enemy_missile[index].state == ENEMY_PLASMA_STATE_ON)
        {
        // draw the pulse
        Draw_BOB(&enemy_missile[index],lpddsback);
        } // end if
}
} // end Draw_Plasma

///////////////////////////////////////////////////////////

void Fire_Plasma(int x,int y, int vel)
{
// this function fires a plasma pulse at the given starting
// position and velocity, of course, one must be free for 
// this to work

      // test if plasma pulse is in flight
for (int index=0;index<MAX_PLASMA;index++)
    if (plasma[index].state == PLASMA_STATE_OFF)
       {
       // start this one up
       plasma[index].x  = x;
       plasma[index].y  = y;
       plasma[index].xv = vel;
       plasma[index].state =  PLASMA_STATE_ON;
       
       // later
       return;

       } // end if


} // end Fire_Plasma

///////////////////////////////////////////////////////////

void Drop_Bomb(int x,int y, int vel)
{
// this function fires a plasma pulse at the given starting
// position and velocity, of course, one must be free for 
// this to work

       if(bomb.state==PLASMA_STATE_OFF)// start this one up
       {
	   bomb.x  = x;
       bomb.y  = y;
       bomb.xv = player.xv;
       bomb.yv = vel;
       bomb.state =  PLASMA_STATE_ON;
       // later
       return;

       } // end if


} // end Drop_Bomb
///////////////////////////////////////////////////////////

void Send_Fuel_Ship(void)
{
        if(fuel_ship.state==PLAYER_STATE_ALIVE)
		{
			Draw_BOB(&fuel_ship,lpddsback);
            Move_BOB(&fuel_ship);
		    fuel_ship.xv=5;
       	    fuel_ship.y=20;
       	}
			// start this one up
       if(fuel_tank.state==PLAYER_STATE_DEAD)fuel_tank.x=fuel_ship.x,fuel_tank.y=fuel_ship.y;
	   if(fuel_ship.x>600)fuel_ship.state=PLAYER_STATE_DEAD,fuel_ship.x=0;
       if(fuel_ship.x==320)fuel_tank.state=PLAYER_STATE_ALIVE;
	   if(fuel_tank.state==PLAYER_STATE_ALIVE)
	   {
		fuel_tank.yv=5;
	    fuel_tank.xv=-1;
	    Move_BOB(&fuel_tank);
		Draw_BOB(&fuel_tank,lpddsback);

		if (Collision_Test(fuel_tank.x, fuel_tank.y,
       fuel_tank.width, fuel_tank.height,
	   player.x, player.y, player.width, player.height))
		{
		fuel_tank.state=PLAYER_STATE_DEAD;
		Fuel_Left=2000;
		}

	   if (fuel_tank.y>400) 
	 {
		 fuel_tank.state=PLAYER_STATE_DEAD;
	     Start_Burst(fuel_tank.x, fuel_tank.y, 
                             68+rand()%12,54+rand()%10,
                           fuel_tank.xv>>1, fuel_tank.yv>>1);
     }
	   }
} // end Fire_Plasma

///////////////////////////////////////////////////////////

void Fire_Enemy_Plasma(int x,int y, int vel)
{
// this function fires a plasma pulse at the given starting
// position and velocity, of course, one must be free for 
// this to work

 for (int index=0;index<MAX_ENEMY_PLASMA;index++)
	     // test if plasma pulse is in flight
    if (enemy_plasma[index].state == ENEMY_PLASMA_STATE_OFF)
       {
       // start this one up
       enemy_plasma[index].x  = x;
       enemy_plasma[index].y  = y;
       enemy_plasma[index].xv = -vel;
       enemy_plasma[index].state =  ENEMY_PLASMA_STATE_ON;
       
       // later
       return;

       } // end if


} // end Fire_Plasma

///////////////////////////////////////////////////////////
void Fire_Enemy_Missile(int x,int y)
{
// this function fires a plasma pulse at the given starting
// position and velocity, of course, one must be free for 
// this to work

 for (int index=0;index<MAX_ENEMY_PLASMA;index++)
	     // test if plasma pulse is in flight
    if (enemy_missile[index].state == ENEMY_PLASMA_STATE_OFF)
       {
       // start this one up
       enemy_missile[index].x  = x;
       enemy_missile[index].y  = y;
       enemy_missile[index].xv = -8;
       enemy_missile[index].state =  ENEMY_PLASMA_STATE_ON;
       
       // later
       return;

       } // end if


} // end Fire_Enemy_Missile

///////////////////////////////////////////////////////////
void Init_Enemies(void)
{
// this function initializes and loads all the enemies 


//CREATE HOUSES,TREES, TOWERS, RADAR
Create_BOB(&house[0],0,0,70,60,9,
            BOB_ATTR_VISIBLE | BOB_ATTR_MULTI_FRAME,
            DDSCAPS_SYSTEMMEMORY);

// load animation frames
for (int frame=0; frame < 9; frame++)
     Load_Frame_BOB(&house[0],&bitmap8bit,frame,frame,1,BITMAP_EXTRACT_MODE_CELL);  

// set state to off
house[0].state = ENEMY_STATE_ON;
house[0].y=390;	
house[0].x=600;
house[0].xv=-8;
for (int enemy=1; enemy<MAX_HOUSES; enemy++)
    {
    memcpy(&house[enemy], &house[0], sizeof(BOB));
	} // end for enemy


//CREATE JETS
Create_BOB(&jet[0],0,0,40,15,1,
            BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
            DDSCAPS_SYSTEMMEMORY);

Load_Frame_BOB(&jet[0],&bitmap8bit,0,0,145,BITMAP_EXTRACT_MODE_ABS);  

for (enemy=1; enemy<MAX_JETS; enemy++)
    {
    memcpy(&jet[enemy], &jet[0], sizeof(BOB));
	} // end for enemy

//CREATE TANK
Create_BOB(&tank,0,0,45,25,1,
            BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
            DDSCAPS_SYSTEMMEMORY);

Load_Frame_BOB(&tank,&bitmap8bit,0,75,145,BITMAP_EXTRACT_MODE_ABS);  

//CREATE CACTUS
Create_BOB(&cactus,0,0,30,30,1,
            BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
            DDSCAPS_SYSTEMMEMORY);

Load_Frame_BOB(&cactus,&bitmap8bit,0,140,140,BITMAP_EXTRACT_MODE_ABS);  

//CREATE AIRSHIPS
Create_BOB(&airship[0],0,0,65,30,1,
            BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
            DDSCAPS_SYSTEMMEMORY);

Load_Frame_BOB(&airship[0],&bitmap8bit,0,0,265,BITMAP_EXTRACT_MODE_ABS);  
	
for (enemy=1; enemy<MAX_AIRSHIPS; enemy++)
    {
    memcpy(&airship[enemy], &airship[0], sizeof(BOB));

	} // end for enemy

//CREATE BALLOONS
    Create_BOB(&balloon[0],0,0,30,30,1,
               BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
               DDSCAPS_SYSTEMMEMORY);
 
    // load animation frames
         Load_Frame_BOB(&balloon[0],&bitmap8bit,0,90,265,BITMAP_EXTRACT_MODE_ABS);  

    // set state to off
    balloon[0].state = ENEMY_STATE_OFF;
for(int pulse=0;pulse<MAX_BALLOONS;pulse++)
    {
    memcpy(&balloon[pulse], &balloon[0], sizeof(BOB));
    }

//CREATE FUEL SHIP
Create_BOB(&fuel_ship,0,0,65,20,1,
            BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
            DDSCAPS_SYSTEMMEMORY);

Load_Frame_BOB(&fuel_ship,&bitmap8bit,0,0,10,BITMAP_EXTRACT_MODE_CELL);  

fuel_ship.state = PLAYER_STATE_DEAD;
	
//CREATE FUEL_TANK
Create_BOB(&fuel_tank,0,0,30,30,1,
            BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
            DDSCAPS_SYSTEMMEMORY);

Load_Frame_BOB(&fuel_tank,&bitmap8bit,0,90,210,BITMAP_EXTRACT_MODE_ABS);  

// set state to off
fuel_tank.state = PLAYER_STATE_DEAD;
	
  
//CREATE LAUNCH PAD
Create_BOB(&launch_pad,0,0,45,10,1,
            BOB_ATTR_VISIBLE | BOB_ATTR_SINGLE_FRAME,
            DDSCAPS_SYSTEMMEMORY);

Load_Frame_BOB(&launch_pad,&bitmap8bit,0,90,210,BITMAP_EXTRACT_MODE_ABS);  

// set state to off
launch_pad.state = ENEMY_STATE_OFF;
	
	
	
} // end Init_enemies

///////////////////////////////////////////////////////////
void Initialize_Enemy_Positions(void)
{
//HOUSES
for (int enemy=0; enemy<MAX_JETS; enemy++)
    {
house[enemy].state = ENEMY_STATE_ON;
house[enemy].xv=-5;
house[enemy].curr_frame=rand()%5;
Set_Pos_BOB(&house[enemy], 640+rand()%600,390);
	}
//JETS
for (enemy=0; enemy<jets_active; enemy++)
    {
jet[enemy].state = ENEMY_STATE_ON;
jet[enemy].xv=-5;
Set_Pos_BOB(&jet[enemy], 500+rand()%100,rand()%240);
tank.state = ENEMY_STATE_ON;
tank.xv=-5;
Set_Pos_BOB(&tank, 600,425);
	}

//AIRSHIPS
for (enemy=0; enemy<MAX_AIRSHIPS; enemy++)
    {
airship[enemy].state = ENEMY_STATE_ON;
airship[enemy].yv=1;
airship[enemy].xv=-5;
Set_Pos_BOB(&airship[enemy], 600,rand()%240);
	} // end for enemy

for (enemy=0; enemy<MAX_BALLOONS; enemy++)
    {
balloon[enemy].state = ENEMY_STATE_OFF;
Set_Pos_BOB(&balloon[enemy], 600,rand()%240);
	} // end for enemy
}
//////////////////////////////////////////////////
void Delete_Enemies(void)
{
// this function simply deletes all memory and surfaces
// related to the enemies pulses

for (int index=0; index<MAX_HOUSES; index++)
{
	Destroy_BOB(&house[index]),
	Destroy_BOB(&airship[index]),
	Destroy_BOB(&jet[index]),
    Destroy_BOB(&balloon[index]);
}
	Destroy_BOB(&cactus),
    Destroy_BOB(&fuel_tank),
    Destroy_BOB(&tank),
    Destroy_BOB(&launch_pad);
    Destroy_BOB(&fuel_ship);


} // end Delete_enemies

///////////////////////////////////////////////////////////

void Move_Enemies(void)
{
// this function moves all the enemies pulses and checks for
// collision with the enemies

//MOVE HOUSES
if (Level==1 || Level==3 || Level==5)	
{
	for (int index=0; index<MAX_HOUSES; index++)
    {
    if (house[index].state == ENEMY_STATE_ON)
        {
	if(Level==1 && house[index].x<10 && counter>500 && rand()%1500<5 )house[index].x=SCREEN_WIDTH,house[index].curr_frame=5;
	if(Level==3 && house[index].x<10 && counter>500 && rand()%1500<5 )house[index].x=SCREEN_WIDTH,house[index].curr_frame=6;
	if(Level==5 && house[index].x<10 && counter>500 && rand()%5500<5 )house[index].x=SCREEN_WIDTH,house[index].curr_frame=7;
    if(counter>500 && Level==5 && rand()%500<5&& house[index].x<10)house[index].x=SCREEN_WIDTH, house[index].curr_frame=8;
	if(Level==5 && house[index].curr_frame==8 && rand()%500<5) Fire_Enemy_Missile(house[index].x,house[index].y);
    if(house[index].x<10 && rand()%500<10)house[index].x=SCREEN_WIDTH,house[index].curr_frame=rand()%5;
		// test if enemies pulse is in flight
	// move the enemy
	Move_BOB(&house[index]);
      } // end for index

    
           // test for collision with enemies
        if (Collision_Test(player.x, player.y, 
                       player.width, player.height,
                       house[index].x, house[index].y,
                       house[index].width, house[index].height)
					   &&house[index].curr_frame==4&&player_state==PLAYER_STATE_ALIVE)
        {
                   Start_Burst(house[index].x, house[index].y, 
                               68+rand()%12,54+rand()%10,
                               house[index].xv>>1, house[index].yv>>1);
                   
                    // update players damage
                    player_damage+=100;
				    counter=0;
                // update score
                player_score+=60;
			   house[index].state=ENEMY_STATE_OFF;
            } // end if collision
	}
}//Level 1

if (Level==2 || Level==4)	
{
	for (int index=0; index<jets_active; index++)
    {
    // test if enemies pulse is in flight
    if (jet[index].state == ENEMY_STATE_ON)
        {
     if (jet[index].x<10)jet[index].x=600, jet[index].y=rand()%300;
	// move the enemy
	 jet[index].xv=-20;
	 if(player.y<jet[index].y)jet[index].y-=1;
	 if(player.y>jet[index].y)jet[index].y+=1;
	 Move_BOB(&jet[index]);
      } // end for index

    
           // test for collision with enemies
        if (Collision_Test(player.x, player.y, 
                       player.width, player.height,
                       jet[index].x, jet[index].y,
                       jet[index].width, jet[index].height)
					   &&player_state==PLAYER_STATE_ALIVE)
        {
                   Start_Burst(jet[index].x, jet[index].y, 
                               68+rand()%12,54+rand()%10,
                               jet[index].xv>>1, jet[index].yv>>1);
                   
                    // update players damage
                    player_damage+=100;
                // update score
                player_score+=60;
			   jet[index].x=700;
            } // end if collision
	}

if (tank.x>320 && player.x<tank.x && rand()%100<5)tank.xv=-3;
if (tank.x<320) tank.xv++;
if(player.x>tank.x-20) tank.xv+=3;
if (tank.x>700) tank.xv=-3;

Move_BOB(&tank);

if (rand()%100<5 && cactus.state==ENEMY_STATE_OFF)
{
cactus.y=421;
cactus.x=SCREEN_WIDTH;
cactus.xv=-10;
	cactus.state=ENEMY_STATE_ON;
}
if (cactus.state==ENEMY_STATE_ON)
{
if (cactus.x<10) cactus.state=ENEMY_STATE_OFF;
Move_BOB(&cactus);
} 

}//Level 2

if (Level==3 || Level==5)	
{
if(counter==500) airships_active++;
if(counter==100) airships_active++;
if(counter==1250) airships_active++;
if(counter==1300) airships_active++;
if(counter==1500) airships_active++;

{
	for (int index=0; index<airships_active; index++)
    {
    // test if enemies pulse is in flight
    if (airship[index].state == ENEMY_STATE_ON)
        {
	// move the enemy
	 //airship[index].xv=-20;
	 if(player.y+50>airship[index].y && airship[index].y<400&&rand()%100<5)airship[index].yv++;
	 if(player.y+50<airship[index].y && airship[index].y>10&&rand()%100<5)airship[index].yv--;
     if (airship[index].x>320 && player.x<airship[index].x && rand()%100<5)airship[index].xv--;
	 if (airship[index].x>680)airship[index].xv=-1,airship[index].yv=0;
	 if(airship[index].x<player.x )airship[index].xv++;
	 //if(rand()%100==5&&airship[index].x>250)airship[index].xv--;
	 if(rand()%100<3)Release_Balloon(airship[index].x,airship[index].y);
	 if(airship[index].y>370 )airship[index].yv=-1;
	 if(airship[index].y<10 )airship[index].yv=1;
	 Move_BOB(&airship[index]);
      } // end for index

    
           // test for collision with enemies
        if (Collision_Test(player.x, player.y, 
                       player.width, player.height,
                       airship[index].x, airship[index].y,
                       airship[index].width, airship[index].height)
					   &&player_state==PLAYER_STATE_ALIVE)
        {
                   Start_Burst(airship[index].x, airship[index].y, 
                               68+rand()%12,54+rand()%10,
                               airship[index].xv>>1, airship[index].yv>>1);
                   
                    // update players damage
                    player_damage+=100;
                // update score
                player_score+=60;
			   airships_active=1;
			   airship[index].x=700;
            } // end if collision
	}

for (index=0; index<balloons_active; index++)
    {
    // test if enemies pulse is in flight
    if (balloon[index].state == ENEMY_STATE_ON)
        {
	// move the enemy
	 balloon[index].xv=-20;
	 balloon[index].yv-=1;
	 if(balloon[index].x<10 || balloon[index].y<10)
	 {
		 balloon[index].state=ENEMY_STATE_OFF;
		 balloon[index].xv=0;
		 balloon[index].yv=0;
	 }
	 Move_BOB(&balloon[index]);
      } // end for index

    
           // test for collision with enemies
        if (Collision_Test(player.x, player.y, 
                       player.width, player.height,
                       balloon[index].x, balloon[index].y,
                       balloon[index].width, balloon[index].height)
					   &&player_state==PLAYER_STATE_ALIVE)
        {
                   Start_Burst(balloon[index].x, balloon[index].y, 
                               68+rand()%12,54+rand()%10,
                               balloon[index].xv>>1, balloon[index].yv>>1);
                   
                    // update players damage
                    player_damage+=100;
                // update score
                player_score+=60;
			   balloon[index].state=ENEMY_STATE_OFF;
            } // end if collision
	}

}
}//Level 3

if (Level==4)	
{
	for (int index=0; index<jets_active; index++)
    {
    // test if enemies pulse is in flight
    if (jet[index].state == ENEMY_STATE_ON)
       if (rand()%100<5)Fire_Enemy_Plasma(jet[index].x,jet[index].y,-16);
	}

if (rand()%100<5) Fire_Enemy_Missile(tank.x,tank.y);
}//Level 4



	return;

} // end Move_enemies

///////////////////////////////////////////////////////////

void Draw_Enemies(void)
{
// this function draws all the enemies 

//DRAW HOUSES ETC.
if(Level==1 || Level==3 ||Level==5)
{
	for (int index=0; index<MAX_HOUSES; index++)
    {
    // test if enemies pulse is in flight
    if (house[index].state == ENEMY_STATE_ON)
        {
           Draw_BOB(&house[index],lpddsback);

        } // end if
	} // end for index
}//Level1

if(Level==2 || Level==4)
{
	for (int index=0; index<jets_active; index++)
    {
    // test if enemies pulse is in flight
    if (jet[index].state == ENEMY_STATE_ON)
        {
           Draw_BOB(&jet[index],lpddsback);

        } // end if

    } // end for index
Draw_BOB(&tank,lpddsback);

if(cactus.state==ENEMY_STATE_ON) Draw_BOB(&cactus,lpddsback);

}//Level2

//DRAW AIRSHIPS, BALLOONS.
if(Level==3 || Level == 5)
{

	for (int index=0; index<airships_active; index++)
    {
    // test if enemies pulse is in flight
    if (airship[index].state == ENEMY_STATE_ON)
        {
           Draw_BOB(&airship[index],lpddsback);

        } // end if

    } // end for index
	for (index=0; index<balloons_active; index++)
    {
    // test if enemies pulse is in flight
    if (balloon[index].state == ENEMY_STATE_ON)
        {
     	   Draw_BOB(&balloon[index],lpddsback);

        } // end if

    } // end for index
}//Level3



} // end Draw_enemies
///////////////////////////////////////////////////////////

void Init_Bursts(void)
{
// this function initializes and loads all the bursts 

// create the first burst bob
Create_BOB(&bursts[0],0,0,42,36,14,
            BOB_ATTR_VISIBLE | BOB_ATTR_MULTI_FRAME,
            DDSCAPS_SYSTEMMEMORY);


// load animation frames
for (int frame=0; frame < 14; frame++)
     Load_Frame_BOB(&bursts[0],&bitmap8bit,frame,frame,12,BITMAP_EXTRACT_MODE_CELL);  


// set animation rate
Set_Anim_Speed_BOB(&bursts[0],5);


// set state to off
bursts[0].state = BURST_STATE_OFF;

for (int burst=1; burst<MAX_BURSTS; burst++)
    {
    memcpy(&bursts[burst], &bursts[0], sizeof(BOB));
    } // end for burst

} // end Init_Bursts

///////////////////////////////////////////////////////////

void Delete_Bursts(void)
{
// this function simply deletes all memory and surfaces
// related to the bursts pulses

for (int index=0; index<MAX_BURSTS; index++)
    Destroy_BOB(&bursts[index]);

} // end Delete_Bursts

///////////////////////////////////////////////////////////

void Draw_Bursts(void)
{
// this function draws all the bursts 
for (int index=0; index<MAX_BURSTS; index++)
    {
    // test if bursts pulse is in flight
    if (bursts[index].state == BURST_STATE_ON)
        {
           Draw_BOB(&bursts[index],lpddsback);
        
     Set_Anim_Speed_BOB(&bursts[index],1);
        // animate the explosion
        Animate_BOB(&bursts[index]);
	if (bursts[index].curr_frame >= bursts[index].num_frames-1) bursts[index].state=BURST_STATE_OFF;
    
        } // end if

    } // end for index

} // end Draw_Bursts

///////////////////////////////////////////////////////////

void Start_Burst(int x, int y, int width, int height, int xv,int yv)
{
// this function starts a burst up

// now test if it's time to add a new burst to the list

// scan for a burst to initialize
for (int index=0; index<MAX_BURSTS; index++)
    {
    // is this burst available?
    if (bursts[index].state == BURST_STATE_OFF)
       {
       // set animation rate
       Set_Anim_Speed_BOB(&bursts[index],1);
       bursts[index].curr_frame = 0;
    
    
       // set position
       Set_Pos_BOB(&bursts[index], x,y);
    

       // turn burst on
       bursts[index].state = BURST_STATE_ON;
          
       // later
       return;

       } // end if
 
    } // end for index

} // end Start_Burst

///////////////////////////////////////////////////////////

void Release_Balloon(int x, int y)
{
// this function starts a burst up

// now test if it's time to add a new burst to the list

// scan for a burst to initialize
for (int index=0; index<balloons_active; index++)
    {
    // is this burst available?
    if (balloon[index].state == ENEMY_STATE_OFF)
       {
       // set position
       Set_Pos_BOB(&balloon[index], x,y);
    

       // turn burst on
       balloon[index].state = ENEMY_STATE_ON;
          
       // later
       return;

       } // end if
 
    } // end for index

} // end Start_Burst

///////////////////////////////////////////////////////////
void Draw_Info(void)
{
// this function draws all the information at the top of the screen

char score[16]; // hold score
char hscore[16];
// build up score string
sprintf(score,"0000000%d",player_score);
sprintf(hscore,"0000000%d",highscore);

// build up final string
sprintf(buffer,"SCORE: %s",&score[strlen(score)-8]);
Draw_Text_GDI(buffer,10,10,RGB(0,255,0),lpddsback);

// draw damage
sprintf(buffer,"HIGH SCORE: %s",&hscore[strlen(score)-8]);
Draw_Text_GDI(buffer,170,10,RGB(0,255,0),lpddsback);
//sprintf(buffer,"FUEL LEFT: %d",showintro);
//Draw_Text_GDI(buffer,170,10,RGB(0,255,0),lpddsback);

// Level
sprintf(buffer,"FUEL LEFT: %d",Fuel_Left);
Draw_Text_GDI(buffer,360,10,RGB(0,255,0),lpddsback);

// draw ships
sprintf(buffer,"SHIPS: %d",player_ships);
Draw_Text_GDI(buffer,500,10,RGB(0,255,0),lpddsback);

} // end Draw_Info

///////////////////////////////////////////////////////////
void Regenerate_Player(void)
{
	   if (++player_counter > 60 && player_ships>0)
      {
      // set state to ready
player_state=PLAYER_STATE_ALIVE;
Set_Pos_BOB(&player,20,220);
Fuel_Left=2000;
outoffuel=0;
player.xv=0;
player.yv=0;
showintro=0;
counter=0;
radar_killed=0,tank_killed=0, icbm_killed=0, 
Initialize_Enemy_Positions();
player_damage=0;
      // stop the intro if not already
   }
}
///////////////////////////////////////////////////////////
int Game_Intro(void)
{

while (intro_state==0)
{

if(KEY_DOWN(VK_SPACE))intro_state=1;
// lock back buffer
DD_Lock_Back_Surface(),

// draw background
Draw_Bitmap(&title,back_buffer,back_lpitch,0),

// unlock back buffer
DD_Unlock_Back_Surface();
DD_Flip();
}
return(1);
}///////////////////////////////////////////////////////////

void Do_Intro(void)
{
// the world's simplest intro
sprintf(buffer,"LEVEL: %d",Level);
Draw_Text_GDI(buffer,220,250,RGB(0,255,0),lpddsback);

if (Level==1)
Draw_Text_GDI("DESTROY THE RADAR",300, 250,RGB(0,255,0),lpddsback);
if (Level==2)
Draw_Text_GDI("WASTE THE TANK",300, 250,RGB(0,255,0),lpddsback);
if (Level==3)
Draw_Text_GDI("BOMB THE ICBM",300, 250,RGB(0,255,0),lpddsback);
if (Level==4)
Draw_Text_GDI("DEMOLISH THE TANK AGAIN",300, 250,RGB(0,255,0),lpddsback);
if (Level==5)
Draw_Text_GDI("WIPE OUT THE HEADQUARTERS",300, 250,RGB(0,255,0),lpddsback);
} // end Do_Intro


// WINX GAME PROGRAMMING CONSOLE FUNCTIONS ////////////////

int Game_Init(void *parms)
{
// this function is where you do all the initialization 
// for your game


// initialize directdraw
DD_Init(SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_BPP);

// load the player ship
Load_Bitmap_File(&bitmap8bit, "STARBLAZER.BMP");

// set the palette to background image palette
Set_Palette(bitmap8bit.palette);

// now create the player
Create_BOB(&player,0,0,70,30,3,
           BOB_ATTR_VISIBLE | BOB_ATTR_MULTI_FRAME,
           DDSCAPS_SYSTEMMEMORY);

// load starblazer frames
for(int index=0;index<3;index++)
     Load_Frame_BOB(&player,&bitmap8bit,index,index,0,BITMAP_EXTRACT_MODE_CELL);  

// set position
Set_Pos_BOB(&player,20,220);

//Set_Anim_Speed_BOB(&player,10);
// initialize the plasma pulses
Init_Plasma();

// initialize all the stars
Init_Stars();

// init enemies
Init_Enemies();
Initialize_Enemy_Positions();
// init all the explosions
Init_Bursts();


// unload data infile
Unload_Bitmap_File(&bitmap8bit);

// load the background bitmap in with all the graphics
Load_Bitmap_File(&bitmap8bit, "STARBLAZER2.BMP");
Set_Palette(bitmap8bit.palette);
Create_Bitmap(&background, 0,0, 640, 480);
Load_Image_Bitmap(&background,&bitmap8bit,0,0,BITMAP_EXTRACT_MODE_ABS);
Unload_Bitmap_File(&bitmap8bit);

// load the background bitmap in with all the graphics
Load_Bitmap_File(&bitmap8bit, "STARBLAZER3.BMP");
Set_Palette(bitmap8bit.palette);
Create_Bitmap(&title, 0,0, 640, 480);
Load_Image_Bitmap(&title,&bitmap8bit,0,0,BITMAP_EXTRACT_MODE_ABS);
Unload_Bitmap_File(&bitmap8bit);
// mess up at edges

RECT screen_rect = {0,0,screen_width,screen_height};
lpddclipper = DD_Attach_Clipper(lpddsback,1,&screen_rect);

// seed random number generate
srand(Start_Clock());

// hide the mouse
ShowCursor(FALSE);


// return success
return(1);

} // end Game_Init

///////////////////////////////////////////////////////////

int Game_Shutdown(void *parms)
{
// this function is where you shutdown your game and
// release all resources that you allocated

// delete all the explosions
Delete_Bursts();
    
// delete the player
Destroy_BOB(&player);

// the delete all the enemies
Delete_Enemies();

// delete all the plasma pulses
Delete_Plasma();
Destroy_Bitmap(&background);

// shutdonw directdraw
DD_Shutdown();

// return success
return(1);
} // end Game_Shutdown

///////////////////////////////////////////////////////
int Game_Main(void *parms)
{
// this is the workhorse of your game it will be called
// continuously in real-time this is like main() in C
// all the calls for you game go here!

static int ready_counter = 0, // used to draw a little "get ready"
           ready_state   = 1;

 
// start the timing clock
Start_Clock();


// clear the drawing surface
DD_Fill_Surface(lpddsback, 0);

if (intro_state==0) Game_Intro();


// lock back buffer
DD_Lock_Back_Surface();

// draw background
Draw_Bitmap(&background,back_buffer,back_lpitch,0);

// unlock back buffer
DD_Unlock_Back_Surface();

if (showintro<60)Do_Intro();
showintro++;

// only process player if alive
if (player_state == PLAYER_STATE_ALIVE)
{

counter++;
if (Fuel_Left==1000)fuel_ship.state=PLAYER_STATE_ALIVE;
if(fuel_ship.state==PLAYER_STATE_ALIVE || fuel_tank.state==PLAYER_STATE_ALIVE)
    Send_Fuel_Ship();
if (Fuel_Left>0)Fuel_Left-=5;
if(Fuel_Left==0) outoffuel=1;
if (outoffuel==1)player.y+=5,Draw_Text_GDI("OUT OF FUEL",300, 250,RGB(255,0,0),lpddsback);

// test if player is moving
if (KEY_DOWN(VK_RIGHT)&&outoffuel==0)
    {
    // move player to right
    player.xv+=1;

    } // end if
if (KEY_DOWN(VK_LEFT)&&outoffuel==0)
    {
    // move player to left
    player.xv-=1;

    } // end if
if (KEY_DOWN(VK_UP)&&outoffuel==0)
    {
    // move player to left
    player.yv-=1;

    } // end if
if (KEY_DOWN(VK_DOWN)&&outoffuel==0)
    {
    // move player to left
    player.yv+=1;

    } // end if

Move_BOB(&player);
// test if player is firing
if (KEY_DOWN(VK_SPACE)&&player.y<360)
   Fire_Plasma(player.x+16,player.y+15,26);

if (KEY_DOWN(VK_SPACE)&&player.y>=360)
   Drop_Bomb(player.x+16,player.y+15,1);


// check of user is trying to exit
if (KEY_DOWN(VK_ESCAPE))
    PostMessage(main_window_handle, WM_DESTROY,0,0);

// do bounds check
if(player.x>10)player.x--;

if (player.x < 10)
   player.x = 10;
else
if (player.x > (SCREEN_WIDTH - 100))
   player.x = (SCREEN_WIDTH - 100);

if (player.y < 10)
   player.y = 10;

if (player.y > SCREEN_HEIGHT-100&& outoffuel==0)
   player.y = SCREEN_HEIGHT-100;
if (player.y>SCREEN_HEIGHT-50 && outoffuel==1)
    player_damage=100;
// test for dying state transition
if (player_damage >= 100)
    {
    // kill player
    player_state = PLAYER_STATE_DEAD;
    player_ships--;
    // set counter to 0
    player_counter = 0;
    } // end if

} // end if player alive

if (player_state == PLAYER_STATE_DEAD)
   { 
   // player is dead
   if ((rand()%4)==1 && player_counter<60)
        Start_Burst(player.x-16+rand()%40, player.y-5+rand()%8,
                   player.width,player.height, 
                   -4+rand()%8,2+rand()%4);    

     Regenerate_Player();
      ready_state = 1;
      ready_counter = 0;
      // set position
   } // end if

//GAME OVER ?
if (player_state == PLAYER_STATE_DEAD && player_ships==0)
   {
   // player is dead
   ready_state   = 1;

    // draw text
   Draw_Text_GDI("G A M E    O V E R",
                 320-6*strlen("G A M E    O V E R")/2,
                 200,RGB(255,0,0),lpddsback);
   Draw_Text_GDI("Hit Escape to Exit",
                 320-6*strlen("Hit Escape to Exit")/2,
                 220,RGB(255,0,0),lpddsback);
   Draw_Text_GDI("Or P to Play Again",
                 320-6*strlen("Or P to Play Again")/2,
                 240,RGB(255,0,0),lpddsback);
   } // end if


//NEXT LEVEL?

if (radar_killed) 
{
	  Level=2;
      Regenerate_Player();
      ready_state = 1;
      ready_counter = 0;
showintro=1;
}

if (tank_killed && Level==2) 
{
	  Level=3;
      Regenerate_Player();
      ready_state = 1;
      ready_counter = 0;
showintro=1;
}

if (icbm_killed) 
{
	  Level=4;
      Regenerate_Player();
      ready_state = 1;
      ready_counter = 0;
showintro=1;
}

if (tank_killed && Level==4) 
{
	  Level=5;
      Regenerate_Player();
      ready_state = 1;
      ready_counter = 0;
showintro=1;
}

if (headquarters_killed) 
{
   ready_state   = 1;

    // draw text
   Draw_Text_GDI("C O N G R A T U L A T I O N S !",
                 320-6*strlen("C O N G R A T U L A T I O N S !")/2,
                 200,RGB(255,0,0),lpddsback);
   Draw_Text_GDI("You Have Completed Your Mission",
                 320-6*strlen("You Have Completed Your Mission")/2,
                 200,RGB(255,0,0),lpddsback);
   Draw_Text_GDI("Hit Escape to Exit",
                 320-6*strlen("Hit Escape to Exit")/2,
                 220,RGB(255,0,0),lpddsback);
   Draw_Text_GDI("Or P to Play Again",
                 320-6*strlen("Or P to Play Again")/2,
                 240,RGB(255,0,0),lpddsback);
}
// check of user is trying to start over
if (KEY_DOWN('P') && ready_state==1 && player_ships==0)
    Level=1,attack_speed=5,	showintro=0, 
	jets_active=5, airships_active=1, 
	player_state = PLAYER_STATE_ALIVE, player_score=0, 
	player_ships=3, player_damage= 0,
    Fuel_Left=2000,Regenerate_Player();

if (player_score>highscore) highscore=player_score;
// draw the player if alive
if (player_state == PLAYER_STATE_ALIVE )
    {
   Draw_BOB(&player,lpddsback);
   Animate_BOB(&player);
   } // end if

// move the plasma
Move_Plasma();

// move the asteroids
if(showintro>59)Move_Enemies();


// move the stars
Move_Stars();

// draw the enemies
if(showintro>59)Draw_Enemies();

// draw the plasma
Draw_Plasma();

// draw the stars
Draw_Stars();

// draw explosions last
Draw_Bursts();

// draw the score and ships left
Draw_Info();



 
// flip the surfaces
DD_Flip();

// sync to 30ish fps
Wait_Clock(30);

// check of user is trying to exit
if (KEY_DOWN(VK_ESCAPE))
    PostMessage(main_window_handle, WM_DESTROY,0,0);


// return success
return(1);

} // end Game_Main

//////////////////////////////////////////////////////////