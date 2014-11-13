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
var score;

// Game Constants
var ENEMY_NUM: number = 3;
var GAME_FONT: string = "40px Consolas";
var FONT_COLOUR: string = "#FFFFFF";
var PLAYER_LIVES: number = 3;

//preloads assests for game
function preload(): void {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([
        { id: "xWing", src: "images/xWing.png" },
        { id: "logo", src: "images/republicLogo.png" },
        { id: "tieInterceptor", src: "images/tieInterceptor.png" },
        { id: "space", src: "images/space.png" },
        { id: "title", src: "images/starWarsLogo.png" },
        { id: "play", src: "images/playButton.png" },
        { id: "instruction", src: "images/instructionsButton.png" },
        { id: "back", src: "images/backButton.png" }
        //{ id: "yay", src: "sounds/yay.ogg" },
        //{ id: "thunder", src: "sounds/thunder.ogg" },
        //{ id: "engine", src: "sounds/engine.ogg" }
    ]);
}

function init(): void {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);
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
        //this.reset();
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
        createjs.Sound.play("thunder");
        interceptor.reset();
        scoreboard.lives -= 1;
        if (scoreboard.lives == 0) {
            //go to game over state
            //GameOver();
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

///////////////////////////////// Game State Information /////////////////////////////////

//function to create the start menu
function startMenu() {
    stage.cursor = "default";
    createjs.Sound.stop();
    stage.clear();
    createjs.Sound.play("BG");
    space = new Space();
    mainMenu = new Menu();
    stage.update();
}

//class to hold information about menus
class Menu {
    titleImage: createjs.Bitmap;
    playImage: createjs.Bitmap;
    instructionsImage: createjs.Bitmap;
    width: number;
    height: number;
    width2: number;
    height2: number;
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
        instructionImage.addEventListener("click", playButtonClicked);
        stage.addChild(instructionImage);

        stage.update();
    }
}

function gameStart(): void {
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);

    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();

    space = new Space();
    republicCoin = new Coin();
    player = new Player();
   
    for (var count = 0; count < ENEMY_NUM; count++) {
        enemies[count] = new Enemy();
    }

    scoreboard = new Scoreboard();
}

class GameOver {
    label: createjs.Text;
    label2: createjs.Text;
    labelString: string = "GAME OVER";
    labelString2: string = "SCORE: " + score.toString();
    width: number;
    height: number;
    width2: number;
    height2: number;
    constructor() {
        this.label = new createjs.Text(this.labelString, GAME_FONT, FONT_COLOUR);

        this.width = this.label.getBounds().width;
        this.height = this.label.getBounds().height;
        this.label2 = new createjs.Text(this.labelString2, GAME_FONT, FONT_COLOUR);
        this.width2 = this.label.getBounds().width;
        this.height2 = this.label.getBounds().height;
        var playButton = new createjs.Bitmap("images/playagain.png");
        stage.addChild(playButton);
        playButton.x = 150;
        playButton.y = 300;
        playButton.addEventListener("click", playButtonClicked);
        stage.addChild(this.label);
        this.label.x = 225;
        this.label.y = 20;
        stage.addChild(this.label2);
        this.label2.x = 240;
        this.label2.y = 70;
        stage.update();
    }

}

class InstructionsMenu {
    label: createjs.Text;
    label2: createjs.Text;
    labelString: string = "INSTRUCTIONS";
    labelString2: string = "THE GAME WORKS LIKE DIS";
    width: number;
    height: number;
    width2: number;
    height2: number;
    constructor() {
        this.label = new createjs.Text(this.labelString, GAME_FONT, FONT_COLOUR);

        this.width = this.label.getBounds().width;
        this.height = this.label.getBounds().height;
        this.label2 = new createjs.Text(this.labelString2, GAME_FONT, FONT_COLOUR);
        this.width2 = this.label.getBounds().width;
        this.height2 = this.label.getBounds().height;
        var backButton = new createjs.Bitmap("images/back.png");
        stage.addChild(backButton);
        backButton.x = 250;
        backButton.y = 400;
        backButton.addEventListener("click", startMenu);
        stage.addChild(this.label);
        this.label.x = 195;
        this.label.y = 20;
        stage.addChild(this.label2);
        this.label2.x = 120;
        this.label2.y = 70;
        stage.update();
    }

}
function instructionsClicked(event: MouseEvent) {
    // Instantiate Game Objects
    stage.cursor = "default";
    createjs.Sound.stop();
    stage.clear();
    createjs.Sound.play("BG");
    instructions = new InstructionsMenu();
    space = new Space();
    instructions = new InstructionsMenu();
    stage.update();
}

function playButtonClicked(event: MouseEvent) {
    stage.removeAllChildren();
    stage.removeAllEventListeners();
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();
}