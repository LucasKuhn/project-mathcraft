var apt, sprite;
var isoGroup, cursorPos, cursor, selectedTile, changedGroup, ghostGroup;
var lastImage;
var i = 0;
var worldScale = 1;
var woodAmount = $("#wood-amount").html();
var stoneAmount = $("#stone-amount").html();
var goldAmount = $("#gold-amount").html();

var magicHouse1Price = 5;
var magicHouse2Price = 5;
var magicHouse3Price = 10;

var alchemyLab1Price = 3;
var alchemyLab2Price = 5;
var alchemyLab3Price = 10;

var teslaHouse1Price = 2;
var teslaHouse2Price = 5;
var teslaHouse3Price = 10;


var game = new Phaser.Game($("#townArea").width(),$("#townArea").height(), Phaser.AUTO, 'townArea', null, true, false);
var BasicGame = function (game) { };
BasicGame.Boot = function (game) { };
BasicGame.Boot.prototype =
{
    preload: function () {
        // Make the game Full Screen
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        // --- LOAD IMAGE ASSETS ---
        game.load.image('grass-tile', 'images/tiles/grass.png');

        game.load.image('main-building', 'images/buildings/main-building.png');
        game.load.image('center-fountain', "images/buildings/center-fountain.png")

        game.load.image('wall-SE', "images/buildings/border-se.png")
        game.load.image('wall-SW', "images/buildings/border-sw.png")

        game.load.image('wood', "images/resources/wood.png")
        game.load.image('stone', "images/resources/stone.png")
        game.load.image('gold', "images/resources/gold.png")


        game.load.image('magic-house-1', 'images/buildings/magic-house-1.png');
        game.load.image('magic-house-2', 'images/buildings/magic-house-2.png');
        game.load.image('magic-house-3', 'images/buildings/magic-house-3.png');

        game.load.image('alchemy-lab-1', 'images/buildings/alchemy-lab-1.png');
        game.load.image('alchemy-lab-2', 'images/buildings/alchemy-lab-2.png');
        game.load.image('alchemy-lab-3', 'images/buildings/alchemy-lab-3.png');

        game.load.image('tesla-house-1', 'images/buildings/tesla-house-1.png');
        game.load.image('tesla-house-2', 'images/buildings/tesla-house-2.png');
        game.load.image('tesla-house-3', 'images/buildings/tesla-house-3.png');

        game.load.image('left-button', "images/buttons/left-button.png");
        game.load.image('right-button', "images/buttons/right-button.png");
        game.load.image('build-button', "images/buttons/tools.png");
        game.load.image('accept-button', "images/buttons/accept-button.png");
        game.load.image('cancel-button', "images/buttons/cancel-button.png");
        game.load.image('build-here', "images/buttons/build-here.png");
        game.load.image('upgrade-button', "images/buttons/upgrade-button.png");


        game.load.image('background-image', "images/backgrounds/green.jpg");

        // Used to show the FPS
        game.time.advancedTiming = true;

        // Add and enable the isometric plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game));

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        game.iso.anchor.setTo(0.5, 0.2);
    },
    create: function () {
        // Green Background
        game.add.tileSprite(-500, -500, 2000,2000, 'background-image');

        // Main Building
        game.add.isoSprite(-10,-200,80,'main-building');

        // BORDER WALLS
        // game.add.isoSprite(40,630,100,'wall-SW');
        // game.add.isoSprite(330,630,100,'wall-SW');

        // game.add.isoSprite(450,130,100,'wall-SE');
        // game.add.isoSprite(450,430,100,'wall-SE');

        // game.add.isoSprite(-150,130,100,'wall-SE');
        // game.add.isoSprite(-150,430,100,'wall-SE');

        // LEFT BUTTON
        lButton = game.add.sprite(game.world.width/2 -290, game.world.height/2 + 200, 'left-button');
        lButton.scale.set(2.2);
        lButton.inputEnabled = true;
        lButton.events.onInputDown.add(previousBuilding, this);

        // RIGHT BUTTON
        rButton = game.add.sprite(game.world.width/2 + 190, game.world.height/2 + 200, 'right-button');
        rButton.scale.set(2.2);
        rButton.inputEnabled = true;
        rButton.events.onInputDown.add(nextBuilding, this);

        // ACCEPT BUTTON
        acceptButton = game.add.sprite(game.world.width/2,game.world.height - 200, 'accept-button');
        acceptButton.scale.set(2.5);
        // acceptButton.width = 600;
        acceptButton.anchor.set(0.5, 0);
        acceptButton.inputEnabled = true;
        acceptButton.events.onInputDown.add(addBuilding, this);

        // CANCEL BUTTON
        cancelButton = game.add.sprite(game.world.width/2,game.world.height - 350, 'cancel-button');
        cancelButton.scale.set(2.5);
        cancelButton.anchor.set(0.5, 0);
        cancelButton.inputEnabled = true;
        cancelButton.events.onInputDown.add(reloadPage, this);

        // BUILDING PREVIEW
        buildingPreview = game.add.sprite(game.world.width/2 + 20, game.world.height/2 + 100, 'magic-house-1');
        buildingPreviewX = -90;
        buildingPreviewY = -10;
        buildingPreview.anchor.set(0.5, 0);
        buildingPreview.scale.set(2);
        buildingPreview.alpha = 0.8;
        buildingPreviewName = game.add.text(game.world.width/2, game.world.height/2 + 330, 'MAGIC HOUSE', { fill: '#ffffff', font: "40px Arial" });
        buildingPreviewName.anchor.set(0.5, 0,5);
        buildingPreviewResource = game.add.sprite(game.world.width/2 - 80, game.world.height/2,'wood');
        buildingPreviewResource.scale.set(2);
        buildingPreviewPrice = game.add.text(buildingPreviewResource.x + 115, buildingPreviewResource.y + 30, "x " +magicHouse1Price, { fill: '#ffffff', font: "50px Arial" });

        //

        // INVISIBLE SPRITES (intial reference for .destroy )
        ghostBuilding = game.add.isoSprite(0,0, 0, 'magic-house-1', 0, ghostGroup);
        ghostBuilding.alpha = 0;
        confirmBuilding = game.add.isoSprite(0,0, 0, 'build-here', 0, ghostGroup);
        confirmBuilding.alpha = 0;
        upgradePopup = game.add.sprite(0,0, 'upgrade-button');
        upgradePopup.alpha = 0;

        // Create a group for our tiles.
        isoGroup = game.add.group();

        // Create a group for our buildings.
        buildingGroup = game.add.group();

        // Let's make a load of tiles on a grid.
        this.spawnTiles();

        // Provide a 3D position for the cursor
        cursorPos = new Phaser.Plugin.Isometric.Point3();

        // Add the Fountain to the center tile
        isoGroup.children[12].buildingName = 'center-fountain';
        isoGroup.children[12].buildingX = -10;
        isoGroup.children[12].buildingY = 65;
        isoGroup.children[12].buildingZ = 75;
        isoGroup.children[12].busy = true;
        isoGroup.children[12].alpha = 0;

        // TEST - ADDING A PRE-MADE BUILDING
        serverBuildingName = 'alchemy-lab-1';
        serverBuildingTile = 1;

        selectedTile = isoGroup.children[serverBuildingTile];
        addAlchemyLab1 ();
    },
    update: function () {

        // Create a cursor
        game.iso.unproject(game.input.activePointer.position, cursorPos);

        // Loop through all tiles
        isoGroup.forEach(function (tile) {
            //  WHEN THE TILE HAS A BUILDING
            if (tile.busy && !tile.buildingAdded){
                console.log("ADDING BUILDING");
                building = game.add.isoSprite(tile.isoX + tile.buildingX,tile.isoY + tile.buildingY, tile.buildingZ, tile.buildingName, 0, buildingGroup);
                building.baseTile = tile.parent.getChildIndex(tile);
                building.inputEnabled = true;
                building.events.onInputDown.add(upgradeOption, this);
                tile.buildingAdded = true;
            }

            // inBounds - Check if cursor is over a tile
            var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);

            // WHEN CLICKING: Select the tile and make it green, un-select others
            if (game.input.activePointer.isDown && inBounds && !tile.busy){
                selectedTile = tile;
                tile.tint = 0x00FF00;

                // Destroy previous preview, create a new one
                ghostBuilding.destroy();
                confirmBuilding.destroy();
                ghostBuilding = game.add.isoSprite(selectedTile.isoX + buildingPreviewX, selectedTile.isoY + buildingPreviewY, 0, buildingPreview.key, 0, ghostGroup);
                ghostBuilding.alpha = 0.7;
                // Create the 'BUILD' pop-up
                confirmBuilding = game.add.isoSprite(selectedTile.isoX - 85, selectedTile.isoY, 130, 'build-here');
                confirmBuilding.scale.set(0.1);
                game.add.tween(confirmBuilding.scale).to( { x: 1.2, y: 1.2 }, 1000, Phaser.Easing.Elastic.Out, true);
                confirmBuilding.alpha = 0.7;
                confirmBuilding.inputEnabled = true;
                confirmBuilding.events.onInputDown.add(addBuilding, this);

                // Do the ease out animation for other tiles
                isoGroup.forEach(function (tile) {tile.ready = false})
                tile.ready = true
                game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }

            // WHEN HOVERING: Do a little animation and tint change.
            else if (!tile.selected && inBounds) {
                tile.selected = true;
                tile.tint = 0x86bfda;
                game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }

            // WHEN NOT HOVERING: Do the ease-out the animation and remove the tint.
            else if (tile.selected && !inBounds && !tile.ready) {
                tile.selected = false;
                tile.tint = 0xffffff;
                game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }
        });
    },

    // ADD THE MAP TILES
    spawnTiles: function () {
        var tile;
        for (var xx = 0; xx < 450; xx += 105) {
            for (var yy = 0; yy < 450; yy += 105) {
                tile = game.add.isoSprite(xx, yy, 0, 'grass-tile', 0, isoGroup);
                tile.anchor.set(0.5, 0);
            }
        }
    },

};

// -------- HELPER FUNCTIONS --------
function reloadPage(){ window.open("/town","_self"); }
function confirmAlterations(){}

function removeWood(amount) {
    woodAmount -= amount;
    $("#wood-amount").html(woodAmount);
}
function upgradeOption(building){
    selectedTile = isoGroup.children[building.baseTile];

    upgradePopup.destroy();
    upgradePopup = game.add.sprite( selectedTile.x -50, selectedTile.y -120, 'upgrade-button');
    upgradePopup.building = building;
    upgradePopup.scale.set(0.1);
    game.add.tween(upgradePopup.scale).to( { x: 1, y: 1 }, 1000, Phaser.Easing.Elastic.Out, true);
    upgradePopup.inputEnabled = true;
    upgradePopup.events.onInputDown.add(upgradeBuilding, {building: building});
}

function upgradeBuilding() {
    upgradePopup.destroy();
    building = this.building;
    selectedTile = isoGroup.children[building.baseTile];

    switch (building.key) {
      case 'magic-house-1':
        addMagicHouse2();
        removeWood(magicHouse2Price);
        break;
      case 'magic-house-2':
        addMagicHouse3();
        break;
      case 'tesla-house-1':
        addTeslaHouse2();
        break;
      case 'tesla-house-2':
        addTeslaHouse3();
        break;
      case 'alchemy-lab-1':
        addAlchemyLab2();
        break;
      case 'alchemy-lab-2':
        addAlchemyLab3();
        break;

      default:
        console.log("Can't upgrade:" + building.key);
        break;
    }

    // popup.anchor.set(0.5);
    // popup.alpha = 0.8
    // popup.scale.set(0.1);
    // game.add.tween(popup.scale).to( { x: 3, y: 1.8 }, 1500, Phaser.Easing.Elastic.Out, true);

    // // TEXT
    // var ipsum = "Building to be updated:" + building;
    // var style = { font: "30px Arial", fill: "#fff", wordWrap: true, wordWrapWidth: 650 };
    // text = game.add.text(0, 0, ipsum, style);
    // text.setTextBounds(popup.x, popup.y);
    // // Center align
    // text.anchor.set(0.5);
    // text.align = 'center';
    // //  Stroke color and thickness
    // text.stroke = '#000000';
    // text.strokeThickness = 4;
}

function renderProperly (){
    isoGroup.forEach(function (tile) {tile.tint = 0xffffff;})

    // Removes all the sprites and things on the group
    buildingGroup.forEach(function (building) {buildingGroup.remove(building);});
    buildingGroup.forEach(function (building) {building.destroy();});

    // Set the building added as false so the building are re-rendered in the right order
    isoGroup.forEach(function (tile) {tile.buildingAdded = false});
};

function nextBuilding() {
    i += 1;
    loadBuildingPreview();
}

function previousBuilding() {
    i -= 1;
    loadBuildingPreview();
}

function loadBuildingPreview() {
    console.log(i);
    switch (i) {
      case 1:
        buildingPreview.loadTexture('magic-house-1', 0);
        buildingPreviewName.text = "MAGIC HOUSE";
        buildingPreviewResource.loadTexture('wood',0);
        buildingPreviewPrice.text = "x " + magicHouse1Price;
        break;
      case 2:
        buildingPreview.loadTexture('alchemy-lab-1', 0);
        buildingPreviewName.text = "ALCHEMY LAB";
        buildingPreviewResource.loadTexture('stone',0);
        buildingPreviewPrice.text = "x " + alchemyLab1Price;
        break;
      case 3:
        buildingPreview.loadTexture('tesla-house-1', 0);
        buildingPreviewName.text = "TESLA FACORY";
        buildingPreviewResource.loadTexture('gold',0);
        buildingPreviewPrice.text = "x " + teslaHouse1Price;
        break;
      default:
        i = 1;
        loadBuildingPreview();
        break;
    }
}


function addBuilding() {
    // Remove previews
    ghostBuilding.destroy();
    confirmBuilding.destroy();

    // Build based on the preview
    switch (buildingPreview.key) {
      case 'magic-house-1':
        addMagicHouse1();
        removeWood(magicHouse1Price);
        break;
      case 'magic-house-2':
        addMagicHouse2();
        break;
      case 'magic-house-3':
        addMagicHouse3();
        removeWood(magicHouse3Price);
        break;
      case 'alchemy-lab-1':
        addAlchemyLab1();
        break;
      case 'alchemy-lab-2':
        addAlchemyLab2();
        break;
      case 'alchemy-lab-3':
        addAlchemyLab3();
        break;
      case 'tesla-house-1':
        addTeslaHouse1();
        break;
      default:
        console.log("Couldn't add Building: " + buildingPreview.key);
        break;
    }
}

// -------- ADD BUILDING FUNCTIONS --------
function previewBuilding () {

};
function addMagicHouse1 () {
    selectedTile.buildingName = 'magic-house-1'
    selectedTile.buildingX = -90
    selectedTile.buildingY = -10
    selectedTile.busy = true;
    renderProperly();
}
function addMagicHouse2 () {
    selectedTile.buildingName = 'magic-house-2'
    selectedTile.buildingX = -90
    selectedTile.buildingY = -20
    selectedTile.busy = true;
    renderProperly();
}
function addMagicHouse3 () {
    selectedTile.buildingName = 'magic-house-3'
    selectedTile.buildingX = -90
    selectedTile.buildingY = -20
    selectedTile.busy = true;
    renderProperly();
}
function addTeslaHouse1 () {
    selectedTile.buildingName = 'tesla-house-1'
    selectedTile.buildingX = -90
    selectedTile.buildingY = 0
    selectedTile.busy = true;
    renderProperly();
}
function addTeslaHouse2 () {
    selectedTile.buildingName = 'tesla-house-2'
    selectedTile.buildingX = -140
    selectedTile.buildingY = -60
    selectedTile.busy = true;
    renderProperly();
}
function addTeslaHouse3 () {
    selectedTile.buildingName = 'tesla-house-3'
    selectedTile.buildingX = -160
    selectedTile.buildingY = -70
    selectedTile.busy = true;
    renderProperly();
}
function addAlchemyLab1 () {
    selectedTile.buildingName = 'alchemy-lab-1';
    selectedTile.buildingX = -80;
    selectedTile.buildingY = -10;
    selectedTile.busy = true;
    renderProperly();
}
function addAlchemyLab2 () {
    selectedTile.buildingName = "alchemy-lab-2"
    selectedTile.buildingX = -120
    selectedTile.buildingY = -30
    selectedTile.busy = true;
    renderProperly();
}
function addAlchemyLab3 () {
    selectedTile.buildingName = 'alchemy-lab-3';
    selectedTile.buildingX = -150;
    selectedTile.buildingY = -60;
    selectedTile.busy = true;
    renderProperly();
}
function addCenterFountain () {
    selectedTile.buildingName = 'center-fountain'
    selectedTile.buildingX = -10
    selectedTile.buildingY = 65
    selectedTile.buildingZ = 65
    selectedTile.busy = true;
    renderProperly();
}
// ---------------------------------------------------


// ---------------------------------
// START THE GAME
game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');

// -------------- OLD CODE -----------------
// cE.events.onInputOver.add(onDown, this);
// cE.events.onInputUp.add(onUp, this);
// cE.events.onInputOut.add(onUp, this);
// cE.fixedToCamera = true;

// game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");

// --------------- TESTING AJAX CALL---------
// $.ajax({
//     type: "POST",
//     url: "http://localhost:3000/games-data",
//     data: {
//         info: {
//         name: "Burger",
//         renderOrderID: selectedTile.renderOrderID,
//         z: selectedTile.z,
//         isoX: selectedTile.isoX,
//         isoY: selectedTile.isoY
//         }
//     },
//   }).always(function(e) {
//   console.log( "complete:", e );
//   });


// function rndNum(num) {
//     return Math.round(Math.random() * num);
// }

// text = game.add.text(selectedTile.x, selectedTile.y, "10");
// text.anchor.setTo(0.5, 0.5);

// // RESOURCES
// // WOOD
// woodAmount = 20;
// woodSprite = game.add.sprite(250, 120,'wood');
// woodText = game.add.text(woodSprite.x + woodSprite.width/2 -10, woodSprite.y + woodSprite.height, 20);

// // STONE
// stoneAmount = 10;
// stoneSprite = game.add.sprite(350, 120,'stone');
// stoneText = game.add.text(stoneSprite.x + stoneSprite.width/2 -10, stoneSprite.y + stoneSprite.height, 10);

// // GOLD
// goldAmount = 0;
// goldSprite = game.add.sprite(450, 120,'gold');
// goldText = game.add.text(goldSprite.x + goldSprite.width/2 -10, goldSprite.y + goldSprite.height, 2);

// popup = game.add.sprite(game.world.centerX+50, game.world.centerY-200, 'popup');
// popup.anchor.set(0.5);
// popup.alpha = 0.8
// popup.scale.set(0.1);
// game.add.tween(popup.scale).to( { x: 3, y: 1.8 }, 1500, Phaser.Easing.Elastic.Out, true);
// // debugger

// // ZOOM and MOVEMENT
// if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
//   game.world.pivot.y -= 5;
// }
// else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
//   game.world.pivot.y += 5;
// }
// if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
//   game.world.pivot.x -= 5;
// }
// else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
//   game.world.pivot.x += 5;
// }

// if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
//     worldScale += 0.05;
//     game.world.pivot.x += 5;
// }
// else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
//     worldScale -= 0.05;
//     game.world.pivot.x -= 5;
// }
// else if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
//     worldScale = 1;
//     game.world.pivot.x = 0;
// }
// // set a minimum and maximum scale value
// worldScale = Phaser.Math.clamp(worldScale, 1, 1.5);

// // set our world scale as needed
// game.world.scale.set(worldScale);
