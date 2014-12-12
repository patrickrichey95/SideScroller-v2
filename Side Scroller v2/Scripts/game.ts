/* File: game.ts/game.js
 * Author: Tom Tsiliopulous
 * Last Modified By: Patrick Richey
 * Last Modified Date: December 11, 2014
 * Description: This file holds all the logic behind the star wars side scroller
 * game, as well as takes care of drawing images to the screen.
 */

// Stage variables
var stage: createjs.Stage;
var game: createjs.Container;
var queue;

// Game Objects
var player: Player;
var blaster: Blaster;
var blasters = [];
var size = blasters.length;
var republicCoin: Coin;
var enemies = [];
var space: Space;
var scoreboard: Scoreboard;
var lose: GameOver;
var mainMenu: Menu;
var instructions: InstructionsMenu;
var levels: LevelMenu;
var endMenu: GameOver;
var score;
var enemyNum: number = 1;
var playerLives: number = 5;
var enemyHP: number = 100;
var backState = 1;

// Game Constants
var GAME_FONT: string = "40px Consolas";
var BODY_FONT: string = "30px Consolas";
var DESC_FONT: string = "24px Consolas";
var FONT_COLOUR: string = "#FFFFFF";

//preloads assests for game
function preload(): void {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([
        { id: "xWing", src: "assets/images/xWing.png" },
        { id: "blaster", src: "assets/images/blaster.png" },
        { id: "logo", src: "assets/images/republicLogo.png" },
        { id: "tieInterceptor", src: "assets/images/tieInterceptor.png" },
        { id: "space", src: "assets/images/space.png" },
        { id: "title", src: "assets/images/starWarsLogo.png" },
        { id: "play", src: "assets/images/playButton.png" },
        { id: "instruction", src: "assets/images/instructionsButton.png" },
        { id: "easy", src: "assets/images/easyButton.png" },
        { id: "medium", src: "assets/images/mediumButton.png" },
        { id: "hard", src: "assets/images/hardButton.png" },
        { id: "menu", src: "assets/images/menuButton.png" },
        { id: "back", src: "assets/images/backButton.png" },
        { id: "coin", src: "assets/sounds/coin.mp3" },
        { id: "xExplode", src: "assets/sounds/X-Wing_explode.mp3" },
        { id: "xFire", src: "assets/sounds/X-Wing_fire.mp3" },
        { id: "tExplode", src: "assets/sounds/TIE_fighter_explode.mp3" },
        { id: "start", src: "assets/sounds/pod_music.mp3" },
        { id: "game", src: "assets/sounds/main_theme.mp3" },
        { id: "end", src: "assets/sounds/cantina_band.mp3" }
    ]);
}

//initialize function, starts the main menu
function init(): void {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.removeEventListener("tick", gameLoop);
    createjs.Ticker.addEventListener("tick", menuLoop);
    startMenu();
}

// Updates all game run functions
function gameLoop(event): void {
    space.update();
    republicCoin.update();
    player.update();
    for (var count = 0; count < blasters.length; count++) {
        blasters[count].update();
    }
    for (var count = 0; count < enemyNum; count++) {
        enemies[count].update();
    }
    collisionCheck();
    scoreboard.update();
    stage.update();
}

// updates all menu run functions
function menuLoop(event): void {
    space.update();
    stage.update();
}

// Player Class, controls information about the "avatar", X-Wing
class Player {
    image: createjs.Bitmap;
    width: number;
    height: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("xWing"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.image.x = 50;
        stage.addChild(this.image);
    }

    update() {
        this.image.y = stage.mouseY;
    }
}

//Blaster Class, controls information about the player's weapon
class Blaster {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("blaster"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.image.x = 62;
        this.dx = 20;
    }

    reset() {
        stage.removeChild(this.image);
        this.image.y = 5000;
    }

    update() {
        this.image.x += this.dx;
        if (this.image.x >= 960) {
            this.reset();
        }
    }
}

//if user clicks in game, fire blasters
function blasterClicked(event: MouseEvent) {
    var position = player.image.y - 33;
    createjs.Sound.play("xFire", "none", 0, 0, 0, 0.7, 0);
    for (var count = size + 1; count <= size + 2; count++) {
        console.log(count);
        blasters[count] = new Blaster();
        blasters[count].image.y = position;
        position += 66;
        stage.addChild(blasters[count].image);
    }
    size += 2;
}

// Coin Class, for generating points
class Coin {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("logo"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.dx = 5;
        stage.addChild(this.image);
    }

    reset() {
        this.image.x = stage.canvas.width + this.width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
    }

    update() {
        this.image.x -= this.dx;
        if (this.image.x <= (0 - this.width)) {
            this.reset();
        }
    }
}

// Enemy Class, Tie Interceptor -- avoid this
class Enemy {
    image: createjs.Bitmap;
    width: number;
    height: number;
    hp: number = enemyHP;
    dy: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("tieInterceptor"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.hp = enemyHP;
        this.image.x = stage.canvas.width + this.width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
        this.dx = Math.floor((Math.random() * 10.5) + 10.25);
        this.dy = Math.floor((Math.random() * 2) - 1);
    }

    update() {
        this.image.x -= this.dx;
        this.image.y -= this.dy;
        if (this.image.x <= (0 - this.width)) {
            this.reset();
        }
    }
}

// Space Class, scrolling background
class Space {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("space"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.dx = -10;
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.x = 0;
    }

    update() {
        this.image.x += this.dx;
        if (this.image.x <= -640) {
            this.reset();
        }
    }
}

//keeps track of players score
class Scoreboard {
    label: createjs.Text;
    labelString: string = "";
    lives: number = playerLives;
    score: number = 0;
    width: number;
    height: number;
    constructor() {
        this.label = new createjs.Text(this.labelString, GAME_FONT, FONT_COLOUR);
        this.update();
        this.width = this.label.getBounds().width;
        this.height = this.label.getBounds().height;

        stage.addChild(this.label);
    }

    update() {
        this.labelString = "Lives: " + this.lives.toString() + " Score: " + this.score.toString();
        this.label.text = this.labelString;
    }
}

// The Distance Utility Function
function distance(p1: createjs.Point, p2: createjs.Point):number {
    var firstPoint: createjs.Point;
    var secondPoint: createjs.Point;
    var theXs: number;
    var theYs: number;
    var result: number;

    firstPoint = new createjs.Point();
    secondPoint = new createjs.Point();
    firstPoint.x = p1.x;
    firstPoint.y = p1.y;
    secondPoint.x = p2.x;
    secondPoint.y = p2.y;
    theXs = secondPoint.x - firstPoint.x;
    theYs = secondPoint.y - firstPoint.y;
    theXs = theXs * theXs;
    theYs = theYs * theYs;
    result = Math.sqrt(theXs + theYs);
    return result;
}

// Check Collision between Player and Republic Coin
function playerAndCoin() {
    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();

    point1.x = player.image.x;
    point1.y = player.image.y;
    point2.x = republicCoin.image.x;
    point2.y = republicCoin.image.y;
    if (distance(point1, point2) <= ((player.height * 0.5) + (republicCoin.height * 0.5))) {
        createjs.Sound.play("coin", "none", 0, 0, 0, 1, 0);
        this.republicCoin.reset();
        scoreboard.score += 100;
    }
}

// Check Collision between Player and Enemy
function playerAndEnemy(interceptor:Enemy) {
    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();
    point1.x = player.image.x;
    point1.y = player.image.y;
    point2.x = interceptor.image.x;
    point2.y = interceptor.image.y;

    if (distance(point1, point2) < ((player.height * 0.5) + (interceptor.height * 0.5))) {
        createjs.Sound.play("xExplode", "none", 0, 0, 0, 0.5, 0);
        interceptor.reset();
        scoreboard.lives -= 1;
        if (scoreboard.lives == 0) {
            //go to game over state
            endGame();
        }
    }
}

////Check collision between Blaster and Enemy
function blasterAndEnemy(blaster: Blaster, interceptor: Enemy) {
    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();
    point1.x = blaster.image.x;
    point1.y = blaster.image.y;
    point2.x = interceptor.image.x;
    point2.y = interceptor.image.y;

    if (distance(point1, point2) < ((blaster.height * 0.5) + (interceptor.height * 0.5))) {
        blaster.reset();
        interceptor.hp -= 50;
        if (interceptor.hp <= 0) {
            interceptor.reset();
            createjs.Sound.play("tExplode", "none", 0, 0, 0, 0.5, 0);
            scoreboard.score += 50;
        }
        
    }
}

// Collision Check Utility Function 
function collisionCheck() {
    playerAndCoin();
    for (var count = 0; count < enemyNum; count++) {
        for (var count2 = 0; count2 < blasters.length; count2++) {
            blasterAndEnemy(blasters[count2], enemies[count]);
        }
    }
    for (var count = 0; count < enemyNum; count++) {
        playerAndEnemy(enemies[count]);
    }
}

////////////////////////////// Game State Information /////////////////////////////////

//function to create the start menu
function startMenu() {
    stage.cursor = 'default';
    createjs.Ticker.removeEventListener("tick", gameLoop);
    createjs.Ticker.addEventListener("tick", menuLoop);
    createjs.Sound.stop();
    stage.clear();
    createjs.Sound.play("start", "none", 0, 0, 100, 1, 0);
    space = new Space();
    mainMenu = new Menu();
    stage.update();
}

//class to hold information about the first menu
class Menu {
    titleImage: createjs.Bitmap;
    playImage: createjs.Bitmap;
    instructionsImage: createjs.Bitmap;
    constructor() {
        //shows the title image on the main menu
        var titleImage = new createjs.Bitmap(queue.getResult("title"));
        titleImage.x = (stage.canvas.width/2) - (titleImage.image.width/2);
        titleImage.y = (stage.canvas.height * 0.3) - (titleImage.image.height/2);
        stage.addChild(titleImage);

        //large play button under title image, allows user to proceed to choosing difficulty
        var playImage = new createjs.Bitmap(queue.getResult("play"));
        playImage.x = (stage.canvas.width / 2) - (playImage.image.width / 2);
        playImage.y = (stage.canvas.height * 0.7) - (playImage.image.height / 2);
        playImage.addEventListener("click", playButtonClicked);
        stage.addChild(playImage);

        //instructions button, goes to instructions page where user can read, then return with a back button click
        var instructionImage = new createjs.Bitmap(queue.getResult("instruction"));
        instructionImage.x = (stage.canvas.width / 2) - (instructionImage.image.width / 2);
        instructionImage.y = (stage.canvas.height * 0.85) - (instructionImage.image.height / 2);
        instructionImage.addEventListener("click", instructionsClicked);
        stage.addChild(instructionImage);

        stage.update();
    }
}

//when play button is clicked, go to levels menu
function playButtonClicked(event: MouseEvent) {
    stage.cursor = "default";
    createjs.Ticker.removeEventListener("tick", gameLoop);
    createjs.Ticker.addEventListener("tick", menuLoop);
    stage.clear();
    space = new Space();
    levels = new LevelMenu();
    stage.update();
}

//class to hold information about level choices
class LevelMenu {
    heading: createjs.Text;
    easyImage: createjs.Bitmap;
    mediumImage: createjs.Bitmap;
    hardImage: createjs.Bitmap;
    easy1: createjs.Text;
    easy2: createjs.Text;
    easy3: createjs.Text;
    medium1: createjs.Text;
    medium2: createjs.Text;
    medium3: createjs.Text;
    hard1: createjs.Text;
    hard2: createjs.Text;
    hard3: createjs.Text;

    //hard coding the message texts into variables to display each line later, cause that was the easiest way
    headingString: string = "Select Difficulty";
    easyText1: string = "5 Lives to Start";
    easyText2: string = "Fewer Enemies";
    easyText3: string = "Enemies have less Health";
    mediumText1: string = "3 Lives to Start";
    mediumText2: string = "Normal Enemies";
    mediumText3: string = "Enemies are average";
    hardText1: string = "1 Life Only";
    hardText2: string = "More enemies";
    hardText3: string = "Enemies have more Health";
    constructor() {
        //taking each text variable and displaying it in the level selection menu
        this.heading = new createjs.Text(this.headingString, GAME_FONT, FONT_COLOUR);
        stage.addChild(this.heading);
        this.heading.x = (stage.canvas.width / 2) - (this.heading.getMeasuredWidth() / 2);
        this.heading.y = 20;

        this.easy1 = new createjs.Text(this.easyText1, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.easy1);
        this.easy1.x = (stage.canvas.width / 6) - (this.easy1.getMeasuredWidth() / 2);
        this.easy1.y = 230;

        this.easy2 = new createjs.Text(this.easyText2, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.easy2);
        this.easy2.x = (stage.canvas.width / 6) - (this.easy2.getMeasuredWidth() / 2);
        this.easy2.y = 260;

        this.easy3 = new createjs.Text(this.easyText3, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.easy3);
        this.easy3.x = (stage.canvas.width / 6) - (this.easy3.getMeasuredWidth() / 2);
        this.easy3.y = 290;

        this.medium1 = new createjs.Text(this.mediumText1, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.medium1);
        this.medium1.x = (stage.canvas.width / 2) - (this.medium1.getMeasuredWidth() / 2);
        this.medium1.y = 230;

        this.medium2 = new createjs.Text(this.mediumText2, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.medium2);
        this.medium2.x = (stage.canvas.width / 2) - (this.medium2.getMeasuredWidth() / 2);
        this.medium2.y = 260;

        this.medium3 = new createjs.Text(this.mediumText3, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.medium3);
        this.medium3.x = (stage.canvas.width / 2) - (this.medium3.getMeasuredWidth() / 2);
        this.medium3.y = 290;

        this.hard1 = new createjs.Text(this.hardText1, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.hard1);
        this.hard1.x = ((stage.canvas.width / 6) * 5) - (this.hard1.getMeasuredWidth() / 2);
        this.hard1.y = 230;

        this.hard2 = new createjs.Text(this.hardText2, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.hard2);
        this.hard2.x = ((stage.canvas.width / 6) * 5) - (this.hard2.getMeasuredWidth() / 2);
        this.hard2.y = 260;

        this.hard3 = new createjs.Text(this.hardText3, DESC_FONT, FONT_COLOUR);
        stage.addChild(this.hard3);
        this.hard3.x = ((stage.canvas.width / 6) * 5) - (this.hard3.getMeasuredWidth() / 2);
        this.hard3.y = 290;

        //easy, medium, hard button to start game with different difficulties
        var easyImage = new createjs.Bitmap(queue.getResult("easy"));
        easyImage.x = (stage.canvas.width / 6) - (easyImage.image.width / 2);
        easyImage.y = 140;
        easyImage.addEventListener("click", easyButtonClicked);
        stage.addChild(easyImage);

        var mediumImage = new createjs.Bitmap(queue.getResult("medium"));
        mediumImage.x = (stage.canvas.width / 2) - (mediumImage.image.width / 2);
        mediumImage.y = 140;
        mediumImage.addEventListener("click", mediumButtonClicked);
        stage.addChild(mediumImage);

        var hardImage = new createjs.Bitmap(queue.getResult("hard"));
        hardImage.x = ((stage.canvas.width / 6) * 5) - (hardImage.image.width / 2);
        hardImage.y = 140;
        hardImage.addEventListener("click", hardButtonClicked);
        stage.addChild(hardImage);

        //back button to return to main menu
        var backImage = new createjs.Bitmap(queue.getResult("back"));
        backImage.x = (stage.canvas.width / 2) - (backImage.image.width / 2);
        backImage.y = 390;
        backImage.addEventListener("click", backClicked);
        stage.addChild(backImage);

        stage.update();
    }
}

//if user clicks easy button, start the game with 'easy' parameters
function easyButtonClicked(event: MouseEvent) {
    stage.removeAllChildren();
    stage.removeAllEventListeners();
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.removeEventListener("tick", menuLoop);
    createjs.Ticker.addEventListener("tick", gameLoop);
    playerLives = 5;
    enemyNum = 3;
    enemyHP = 150;
    gameStart();
}

//if user clicks medium button, start the game with 'medium' parameters
function mediumButtonClicked(event: MouseEvent) {
    stage.removeAllChildren();
    stage.removeAllEventListeners();
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.removeEventListener("tick", menuLoop);
    createjs.Ticker.addEventListener("tick", gameLoop);
    playerLives = 3;
    enemyNum = 4;
    enemyHP = 200;
    gameStart();
}

//if user clicks hard button, start the game with 'hard' parameters
function hardButtonClicked(event: MouseEvent) {
    stage.removeAllChildren();
    stage.removeAllEventListeners();
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.removeEventListener("tick", menuLoop);
    createjs.Ticker.addEventListener("tick", gameLoop);
    playerLives = 1;
    enemyNum = 5;
    enemyHP = 250;
    gameStart();
}

//called by the difficulty buttons, starts a new game
function gameStart(): void {
    stage.cursor = 'none';
    createjs.Ticker.removeEventListener("tick", menuLoop);
    createjs.Ticker.addEventListener("tick", gameLoop);
    createjs.Sound.stop();
    stage.clear();
    createjs.Sound.play("game", "none", 0, 0, 100, 1, 0);
    space = new Space();
    republicCoin = new Coin();
    player = new Player();
    for (var count = 0; count < enemyNum; count++) {
        enemies[count] = new Enemy();
    }
    scoreboard = new Scoreboard();
    blasters[0] = new Blaster();
    stage.addEventListener("click", blasterClicked);
}

//includes information about controlling the game
class InstructionsMenu {
    backImage: createjs.Bitmap;
    heading: createjs.Text;
    body1: createjs.Text;
    body2: createjs.Text;
    body3: createjs.Text;
    body4: createjs.Text;
    body5: createjs.Text;
    body6: createjs.Text;
    body7: createjs.Text;
    body8: createjs.Text;

    //adding strings to variables to display them individually later
    headingString: string = "INSTRUCTIONS";
    bodyText1: string = "You are an X-Wing Pilot,";
    bodyText2: string = "a part of Rogue Squadron.";
    bodyText3: string = "Your goal is to safely";
    bodyText4: string = "navigate through a mine";
    bodyText5: string = "field of Tie Interceptors";
    bodyText6: string = "heading in your direction.";
    bodyText7: string = "Use the mouse to guide your";
    bodyText8: string = "ship, click to shoot.";
    constructor() {
        //displaying back image to screen, to allow user to return to main menu
        var backImage = new createjs.Bitmap(queue.getResult("back"));
        backImage.x = (stage.canvas.width / 2) - (backImage.image.width / 2);
        backImage.y = (stage.canvas.height * 0.85) - (backImage.image.height / 2);
        backImage.addEventListener("click", backClicked);
        stage.addChild(backImage);

        this.heading = new createjs.Text(this.headingString, GAME_FONT, FONT_COLOUR);
        this.body1 = new createjs.Text(this.bodyText1, BODY_FONT, FONT_COLOUR);
        this.body2 = new createjs.Text(this.bodyText2, BODY_FONT, FONT_COLOUR);
        this.body3 = new createjs.Text(this.bodyText3, BODY_FONT, FONT_COLOUR);
        this.body4 = new createjs.Text(this.bodyText4, BODY_FONT, FONT_COLOUR);
        this.body5 = new createjs.Text(this.bodyText5, BODY_FONT, FONT_COLOUR);
        this.body6 = new createjs.Text(this.bodyText6, BODY_FONT, FONT_COLOUR);
        this.body7 = new createjs.Text(this.bodyText7, BODY_FONT, FONT_COLOUR);
        this.body8 = new createjs.Text(this.bodyText8, BODY_FONT, FONT_COLOUR);

        //adding each text variable to the stage
        stage.addChild(this.heading);
        this.heading.x = (stage.canvas.width / 2) - (this.heading.getMeasuredWidth() / 2);
        this.heading.y = 20;
        stage.addChild(this.body1);
        this.body1.x = (stage.canvas.width / 2) - (this.body1.getMeasuredWidth() / 2);
        this.body1.y = 80;
        stage.addChild(this.body2);
        this.body2.x = (stage.canvas.width / 2) - (this.body2.getMeasuredWidth() / 2);
        this.body2.y = 110;
        stage.addChild(this.body3);
        this.body3.x = (stage.canvas.width / 2) - (this.body3.getMeasuredWidth() / 2);
        this.body3.y = 140;
        stage.addChild(this.body4);
        this.body4.x = (stage.canvas.width / 2) - (this.body4.getMeasuredWidth() / 2);
        this.body4.y = 170;
        stage.addChild(this.body5);
        this.body5.x = (stage.canvas.width / 2) - (this.body5.getMeasuredWidth() / 2);
        this.body5.y = 200;
        stage.addChild(this.body6);
        this.body6.x = (stage.canvas.width / 2) - (this.body6.getMeasuredWidth() / 2);
        this.body6.y = 230;
        stage.addChild(this.body7);
        this.body7.x = (stage.canvas.width / 2) - (this.body7.getMeasuredWidth() / 2);
        this.body7.y = 300;
        stage.addChild(this.body8);
        this.body8.x = (stage.canvas.width / 2) - (this.body8.getMeasuredWidth() / 2);
        this.body8.y = 330;

        stage.update();
    }
}

//when instruction button is clicked, go to instructions menu
function instructionsClicked(event: MouseEvent) {
    backState = 1;
    stage.cursor = "default";
    createjs.Ticker.removeEventListener("tick", gameLoop);
    createjs.Ticker.addEventListener("tick", menuLoop);
    stage.clear();
    space = new Space();
    instructions = new InstructionsMenu();
    stage.update();
}

//when back button is clicked, return to previous menu
function backClicked(event: MouseEvent) {
    if (backState == 1) {
        stage.cursor = "default";
        createjs.Ticker.removeEventListener("tick", gameLoop);
        createjs.Ticker.addEventListener("tick", menuLoop);
        stage.clear();
        space = new Space();
        mainMenu = new Menu();
        stage.update();
    }
    else {
        stage.cursor = "default";
        createjs.Ticker.removeEventListener("tick", gameLoop);
        createjs.Ticker.addEventListener("tick", menuLoop);
        stage.clear();
        space = new Space();
        endMenu = new GameOver();
        stage.update();
    }
}

//when the menu button is clicked, take user back to main menu
function menuClicked(event: MouseEvent) {
    stage.cursor = "default";
    createjs.Ticker.removeEventListener("tick", gameLoop);
    createjs.Ticker.addEventListener("tick", menuLoop);
    createjs.Sound.stop();
    stage.clear();
    createjs.Sound.play("start", "none", 0, 0, 100, 1, 0);
    space = new Space();
    mainMenu = new Menu();
    stage.update();
}

//function to open the game ending menu
function endGame() {
    backState = 2;
    stage.cursor = "default";
    stage.removeEventListener("click", blasterClicked);
    createjs.Ticker.removeEventListener("tick", gameLoop);
    createjs.Ticker.addEventListener("tick", menuLoop);
    createjs.Sound.stop();
    stage.clear();
    createjs.Sound.play("end", "none", 0, 0, 100, 1, 0);
    space = new Space();
    endMenu = new GameOver();
    stage.update();
}

//shows player score, and allows restart
class GameOver {
    playImage: createjs.Bitmap;
    heading: createjs.Text;
    body: createjs.Text;
    again: createjs.Text;

    //storing strings in variables to be displayed
    headingString: string = "GAME OVER";
    bodyText: string = "SCORE: " + scoreboard.score.toString();
    tryAgain: string = "Try Again?";
    constructor() {
        //display strings to screen
        this.heading = new createjs.Text(this.headingString, GAME_FONT, FONT_COLOUR);
        this.body = new createjs.Text(this.bodyText, GAME_FONT, FONT_COLOUR);
        this.again = new createjs.Text(this.tryAgain, GAME_FONT, FONT_COLOUR);
        stage.addChild(this.heading);
        this.heading.x = (stage.canvas.width / 2) - (this.heading.getMeasuredWidth() / 2);
        this.heading.y = 80;
        stage.addChild(this.body);
        this.body.x = (stage.canvas.width / 2) - (this.body.getMeasuredWidth() / 2);
        this.body.y = 150;
        stage.addChild(this.again);
        this.again.x = (stage.canvas.width / 2) - (this.again.getMeasuredWidth() / 2);
        this.again.y = 300;
        //make a play button and menu button to restart the game, or return to main menu
        var playImage = new createjs.Bitmap(queue.getResult("play"));
        playImage.x = (stage.canvas.width / 2) - (playImage.image.width / 2);
        playImage.y = (stage.canvas.height * 0.85) - (playImage.image.height / 2);
        playImage.addEventListener("click", playButtonClicked);
        stage.addChild(playImage);
        var menuImage = new createjs.Bitmap(queue.getResult("menu"));
        menuImage.x = stage.canvas.width - (menuImage.image.width + 15);
        menuImage.y = (stage.canvas.height * 0.925) - (menuImage.image.height / 2);
        menuImage.addEventListener("click", menuClicked);
        stage.addChild(menuImage);
        stage.update();
    }
}