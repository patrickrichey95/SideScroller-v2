var stage: createjs.Stage;
var game: createjs.Container;
var queue;

// Game Objects
var player: Player;
var republicCoin: Coin;
var enemies = [];
var space: Space;
var scoreboard: Scoreboard;
var lose: GameOver;
var mainMenu: Menu;
var instructions: InstructionsMenu;
var endMenu: GameOver;
var score;

// Game Constants
var ENEMY_NUM: number = 5;
var GAME_FONT: string = "40px Consolas";
var BODY_FONT: string = "30px Consolas";
var FONT_COLOUR: string = "#FFFFFF";
var PLAYER_LIVES: number = 3;

//preloads assests for game
function preload(): void {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([
        { id: "xWing", src: "assets/images/xWing.png" },
        { id: "logo", src: "assets/images/republicLogo.png" },
        { id: "tieInterceptor", src: "assets/images/tieInterceptor.png" },
        { id: "space", src: "assets/images/space.png" },
        { id: "title", src: "assets/images/starWarsLogo.png" },
        { id: "play", src: "assets/images/playButton.png" },
        { id: "instruction", src: "assets/images/instructionsButton.png" },
        { id: "back", src: "assets/images/backButton.png" }
        //{ id: "yay", src: "sounds/yay.ogg" },
        //{ id: "thunder", src: "sounds/thunder.ogg" },
        //{ id: "engine", src: "sounds/engine.ogg" }
    ]);
}

function init(): void {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    startMenu();
}

// Game Loop
function gameLoop(event): void {
    space.update();
    republicCoin.update();
    player.update();
    for (var count = 0; count < ENEMY_NUM; count++) {
        enemies[count].update();
    }

    collisionCheck();
    scoreboard.update();
    stage.update();
}

// Player Class
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

// Coin Class
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

// Enemy Class
class Enemy {
    image: createjs.Bitmap;
    width: number;
    height: number;
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
        this.image.x = stage.canvas.width + this.width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
        this.dx = Math.floor(Math.random() * 5 + 5);
        this.dy = Math.floor(Math.random() * 4 - 2);
    }

    update() {
        this.image.y -= this.dy;
        this.image.x -= this.dx;
        if (this.image.x <= 0) {
            this.reset();
        }
    }
}

// Space Class
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

class Scoreboard {
    label: createjs.Text;
    labelString: string = "";
    lives: number = PLAYER_LIVES;
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
        //createjs.Sound.play("yay");
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
        //createjs.Sound.play("thunder");
        interceptor.reset();
        scoreboard.lives -= 1;
        if (scoreboard.lives == 0) {
            //go to game over state
            endGame();
        }
    }
}

// Collision Check Utility Function 
function collisionCheck() {
    playerAndCoin();

    for (var count = 0; count < ENEMY_NUM; count++) {
        playerAndEnemy(enemies[count]);
    }
}

////////////////////////////// Game State Information /////////////////////////////////

//function to create the start menu
function startMenu() {
    stage.cursor = 'default';
    //createjs.Sound.stop();
    stage.clear();
    //createjs.Sound.play("BG");
    space = new Space();
    mainMenu = new Menu();
    stage.update();
}

//class to hold information about menus
class Menu {
    titleImage: createjs.Bitmap;
    playImage: createjs.Bitmap;
    instructionsImage: createjs.Bitmap;
    constructor() {
        var titleImage = new createjs.Bitmap(queue.getResult("title"));
        titleImage.x = (stage.canvas.width/2) - (titleImage.image.width/2);
        titleImage.y = (stage.canvas.height * 0.3) - (titleImage.image.height/2);
        stage.addChild(titleImage);

        var playImage = new createjs.Bitmap(queue.getResult("play"));
        playImage.x = (stage.canvas.width / 2) - (playImage.image.width / 2);
        playImage.y = (stage.canvas.height * 0.7) - (playImage.image.height / 2);
        playImage.addEventListener("click", playButtonClicked);
        stage.addChild(playImage);

        var instructionImage = new createjs.Bitmap(queue.getResult("instruction"));
        instructionImage.x = (stage.canvas.width / 2) - (instructionImage.image.width / 2);
        instructionImage.y = (stage.canvas.height * 0.85) - (instructionImage.image.height / 2);
        instructionImage.addEventListener("click", instructionsClicked);
        stage.addChild(instructionImage);

        stage.update();
    }
}

function playButtonClicked(event: MouseEvent) {
    stage.removeAllChildren();
    stage.removeAllEventListeners();
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();
}

function gameStart(): void {
    stage.cursor = 'none';
    space = new Space();
    republicCoin = new Coin();
    player = new Player();
    for (var count = 0; count < ENEMY_NUM; count++) {
        enemies[count] = new Enemy();
    }
    scoreboard = new Scoreboard();
}

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

    headingString: string = "INSTRUCTIONS";
    bodyText1: string = "You are an X-Wing Pilot,";
    bodyText2: string = "a part of Rogue Squadron.";
    bodyText3: string = "Your goal is to safely";
    bodyText4: string = "navigate through a mine";
    bodyText5: string = "field of Tie Interceptors";
    bodyText6: string = "heading in your direction.";
    bodyText7: string = "Use the mouse to guide your";
    bodyText8: string = "ship, it will follow you.";
    constructor() {
        var backImage = new createjs.Bitmap(queue.getResult("back"));
        backImage.x = (stage.canvas.width / 2) - (backImage.image.width / 2);
        backImage.y = (stage.canvas.height * 0.85) - (backImage.image.height / 2);
        stage.addChild(backImage);

        backImage.addEventListener("click", backClicked);

        this.heading = new createjs.Text(this.headingString, GAME_FONT, FONT_COLOUR);
        this.body1 = new createjs.Text(this.bodyText1, BODY_FONT, FONT_COLOUR);
        this.body2 = new createjs.Text(this.bodyText2, BODY_FONT, FONT_COLOUR);
        this.body3 = new createjs.Text(this.bodyText3, BODY_FONT, FONT_COLOUR);
        this.body4 = new createjs.Text(this.bodyText4, BODY_FONT, FONT_COLOUR);
        this.body5 = new createjs.Text(this.bodyText5, BODY_FONT, FONT_COLOUR);
        this.body6 = new createjs.Text(this.bodyText6, BODY_FONT, FONT_COLOUR);
        this.body7 = new createjs.Text(this.bodyText7, BODY_FONT, FONT_COLOUR);
        this.body8 = new createjs.Text(this.bodyText8, BODY_FONT, FONT_COLOUR);

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

function instructionsClicked(event: MouseEvent) {
    stage.cursor = "default";
    //createjs.Sound.stop();
    stage.clear();
    //createjs.Sound.play("BG");
    space = new Space();
    instructions = new InstructionsMenu();
    stage.update();
}

function backClicked(event: MouseEvent) {
    stage.cursor = "default";
    //createjs.Sound.stop();
    stage.clear();
    //createjs.Sound.play("BG");
    space = new Space();
    mainMenu = new startMenu();
    stage.update();
}

//function to open the game ending menu
function endGame() {
    stage.cursor = "default";
    //createjs.Sound.stop();
    stage.clear();
    //createjs.Sound.play("BG");
    space = new Space();
    endMenu = new GameOver();
    stage.update();
}

class GameOver {
    playImage: createjs.Bitmap;
    heading: createjs.Text;
    body: createjs.Text;
    again: createjs.Text;
    headingString: string = "GAME OVER";
    bodyText: string = "SCORE: " + scoreboard.score.toString();
    tryAgain: string = "Try Again?";
    constructor() {
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
        var playImage = new createjs.Bitmap(queue.getResult("play"));
        playImage.x = (stage.canvas.width / 2) - (playImage.image.width / 2);
        playImage.y = (stage.canvas.height * 0.85) - (playImage.image.height / 2);
        playImage.addEventListener("click", playButtonClicked);
        stage.addChild(playImage);
        stage.update();
    }
}