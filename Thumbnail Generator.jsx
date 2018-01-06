// Thumbnail Generator - Adobe Photoshop Script
// Description: Generates YouTube thumbnail based on user inputs
// Requirements: Adobe Photoshop CS2, or higher
// Version: 1.1.0 06/01/2018.
// Author: KeithyDee (all@krd.me)
// Website: https://krd.me
// ============================================================================
// Installation:
// 1. Place script in 'C:\Program Files\Adobe\Adobe Photoshop CS#\Presets\Scripts\'
// 2. Restart Photoshop
// 3. Choose File > Scripts > Thumbnail Generator
// ============================================================================

// ==================== //
//   Document set-up    //
// ==================== //

#target photoshop
app.bringToFront();

// ==================== //
//    Start Program     //
// ==================== //

if (isCorrectVersion() && isOpenDocs() && hasLayers()) {
    try {
        var heroes = map = date = sr = customtitle = "";
        generateThumbnail(heroes, map, date, sr, customtitle, true, true);
    }
    catch(e) {
        // don't report error on user cancel
        if (e.number != 8007) {
            showError(e);
        }
    }
}

// ==================== //
//      Functions       //
// ==================== //

/*
Prompts for user input and validates it. Then
calls editLayers() to make the image manipulation 
and, if successful, calls saveImage to export PNG.
*/
function generateThumbnail(heroes, map, date, sr, customtitle, validHeroes, validMap) {
    // Prompt for hero input
    if (validHeroes === true) {
        while (!heroes) {
            var heroes = prompt('[REQUIRED] Enter the name of the hero(es) played (Format: Ana) (Format: Sombra/Ana)', heroes, 'Select Hero');
        }
    } else { // Previous hero check failed (i.e. layer doesn't exist for given hero)
        var heroes = prompt(heroes + ' not found. Either hero is not in template yet, or you made a typo. Note, multiple heroes might be Ana/Mei instead of Mei/Ana, for example.\n' +
            'Try again?', heroes, 'Select Hero');
    }

    // Prompt for map input
    if (validMap === true) {
        while (!map) {
            var map = prompt('[REQUIRED] Enter the name of the map played (Format: Dorado) (Format: Watchpoint: Gibraltar)', map, 'Select Map');
        }
    } else { // Previous map check failed (i.e. layer doesn't exist for given map)
        var map = prompt(map + ' not found. Either map is not in template yet, or you made a typo.\n' +
        'Try again?', map, 'Select Map');
    }

    // Prompt for date and validate it
    while (!date) {
        var date = prompt('[REQUIRED] Enter the date of the game played (Format: 2017-01-25)', dateToDisplay(date), 'Select Date');
    }
    while (!dateToDisplay(date)) {
        var date = prompt('Error: Incorrect date ' + date + '. Could not parse, try again.\n[REQUIRED] Enter the date of the game played (Format: 2017-01-25)', dateToDisplay(date), 'Select Date');
    }

    // Prompt for SR and validate it
    while (!sr) {
        var sr = prompt('[REQUIRED] Enter the SR at the time played (Format: 4500)', sr, 'Select SR');
    }
    while (sr.length > 4) {
        var sr = prompt('Error: SR given (' + sr + ') should not be more than four chars.\n[REQUIRED] Enter the SR at the time played (Format: 4500)', sr, 'Select SR');
    }

    // Prompt for customtitle and validate if present
    var customtitle = prompt('[OPTIONAL] Enter the custom title. If blank, it will be the hero(es) played. (Format: Best Sombra NA?!?!)', customtitle, 'Select Custom Title');
    if (customtitle) {
        while (customtitle.length > 25) {
            var customtitle = prompt('Error: Custom title should not be more than 25 chars.\n[OPTIONAL] Enter the custom title. If blank, it will be the hero(es) played. (Format: Best Sombra NA?!?!)', customtitle, 'Select Custom Title');
        }
    }

    // Confirmation box for detail check, pressing no aborts the script
    if (!confirm("Heroes: '" + heroes + "'\nMap: '" + map + "'\nDate: '" + dateToDisplay(date) + "'\nSR: '" + sr + "'\nCustom Title: '" + customtitle + "'\n\nYes to confirm, No to cancel. This can take 10-30 seconds.")) {
        return;
    }

    var validHeroesMapReturn = validateHeroesMap(activeDocument, heroes, map);
    var validHeroesReturn = validHeroesMapReturn.heroes;
    var validMapReturn = validHeroesMapReturn.map;

    // If invalid hero or map, retry
    if (!(validHeroesReturn && validMapReturn)) {
        generateThumbnail(heroes, map, date, sr, customtitle, validHeroesReturn, validMapReturn);
    } else {
        editLayers(activeDocument, heroes, map, date, sr, customtitle);
        var filepath = saveImage(activeDocument, date);
        alert("Image saved at " + filepath + ".");
    }
}

/*
Check whether the supplied heroes and map
have a corresponding layer in the PSD
*/
function validateHeroesMap(ref, heroes, map) {
    var heroLayers = ref.layers.getByName('Stream Replay').layers.getByName('Body').layers.getByName('Heroes').layers;
    var mapLayers = ref.layers.getByName('Stream Replay').layers.getByName('Background').layers.getByName('Maps').layers;

    var validHeroes = false;
    var validMap = false;
    
    // Validate Hero Layer
    for (var i = 0; i < heroLayers.length; i++) {
        var layer = heroLayers[i];

        if (layer.name.toLowerCase() == heroes.toLowerCase()) {
            validHeroes = true;
            break;
        }
    }

    // Validate Map Layer
    for (var i = 0; i < mapLayers.length; i++) {
        var layer = mapLayers[i];

        if (layer.name.toLowerCase() == map.toLowerCase()) {
            validMap = true;
            break;
        }
    }

    return { "heroes": validHeroes, "map": validMap };
}

/*
Generate the image based on the inputs. Basically shows
the layers which are necessary, hides the ones that aren't
and changes the text layers based on the input.
*/
function editLayers(ref, heroes, map, date, sr, customtitle) {
    var layers = prepareLayers(ref);

    var validHeroes = false;
    var validMap = false;
    
    // Set Hero Layer
    for (var i = 0; i < layers.heroes.length; i++) {
        var layer = layers.heroes[i];

        if (layer.name.toLowerCase() == heroes.toLowerCase()) {
            layer.visible = true;
        } else {
            layer.visible = false;
        }
    }

    // Set Map Layer
    for (var i = 0; i < layers.maps.length; i++) {
        var layer = layers.maps[i];

        if (layer.name.toLowerCase() == map.toLowerCase()) {
            layer.visible = true;
        } else {
            layer.visible = false;
        }
    }

    // Set Map Text
    var layer_titleMap = layers.title.getByName('Map').textItem;
    if (customtitle) {
        layer_titleMap.contents = customtitle;
    } else {
        layer_titleMap.contents = map;
    }

    // Set Date
    var layer_titleDate = layers.title.getByName('Date').textItem;
    layer_titleDate.contents = "Stream Highlight - " + dateToDisplay(date);

    // Set SR
    var layer_bottomSR = layers.bottomBar.getByName('Text').layers.getByName('SR Number').textItem;
    layer_bottomSR.contents = sr;

    // Set Title
    var layer_titleHeroes = layers.title.getByName('Heroes').textItem;
    layer_titleHeroes.contents = heroes;
}


/*
Recursively make all layers within a layerset visible.
includeRoot = true will also make the layerset itself visible.
*/
function showLayers(layerSet, includeRoot) {
    if (includeRoot) {
        layerSet.visible = true;
    }
    for (var i = 0; i < layerSet.layers.length; i++) {
        layer = layerSet.layers[i];

        if (layer.typename == 'LayerSet') {
            showLayers(layer, true);
        } else {
            layer.visible = true;
        }
    }
}

/*
Recursively make all layers within a layerset invisible.
includeRoot = true will also make the layerset itself invisible.
*/
function hideLayers(layerSet, includeRoot) {
    if (includeRoot) {
        layerSet.visible = false;
    }
    for (var i = 0; i < layerSet.layers.length; i++) {
        layer = layerSet.layers[i];

        if (layer.typename == 'LayerSet') {
            hideLayers(layer, true);
        } else {
            layer.visible = false;
        }
    }
}

/*
Hide and show the necessary layers. We can't guarantee
what layers will be visible when user loads script, so
we have to deal in absolutes.
*/
function prepareLayers(ref) {
    // Base Layer
    var baseLayerSet = ref.layers.getByName('Stream Replay');
    showLayers(baseLayerSet, true);

    // Top Bar Layers
    var topBarLayerSet = ref.layers.getByName('Stream Replay').layers.getByName('Top Bar');

    // Body Layers
    var titleLayerSet = ref.layers.getByName('Stream Replay').layers.getByName('Body').layers.getByName('Title Text');

    var titleBackgroundLayerSet = ref.layers.getByName('Stream Replay').layers.getByName('Body').layers.getByName('Background');
    hideLayers(titleBackgroundLayerSet, false);
    showLayers(titleBackgroundLayerSet.layers.getByName("Background Gradient"), true);

    var heroLayerSet = ref.layers.getByName('Stream Replay').layers.getByName('Body').layers.getByName('Heroes');
    hideLayers(heroLayerSet, false);

    // Bottom Bar Layers
    var bottomBarLayerSet = ref.layers.getByName('Stream Replay').layers.getByName('Bottom Bar');

    // Background Layers
    var backgroundLayerSet = ref.layers.getByName('Stream Replay').layers.getByName('Background');
    hideLayers(backgroundLayerSet, false);

    var mapLayerSet = ref.layers.getByName('Stream Replay').layers.getByName('Background').layers.getByName('Maps');
    mapLayerSet.visible = true;

    // Return the layers within the layerset
    var layers = {
        "topBar": topBarLayerSet.layers,
        "title": titleLayerSet.layers,
        "titleBackground": titleBackgroundLayerSet.layers,
        "heroes": heroLayerSet.layers,
        "bottomBar": bottomBarLayerSet.layers,
        "background": backgroundLayerSet.layers,
        "maps": mapLayerSet.layers
    }

    return layers;
}

/*
Exports the image as a PNG once the layers are
generated and saves it to the current directory.
*/
function saveImage(ref, date) {
    var filename = "fitz_thumbnail_sr_" + date + ".png"; // Edit this to change output file format
    var filepath = ref.path + "/" + filename;
    var saveFile = File(filepath);  

    var pngOpts = new ExportOptionsSaveForWeb; 
    pngOpts.format = SaveDocumentType.PNG
    pngOpts.PNG8 = false; 
    pngOpts.transparency = true; 
    pngOpts.interlaced = true; 
    pngOpts.quality = 100;

    ref.exportDocument(saveFile,ExportType.SAVEFORWEB,pngOpts);

    return filepath;
}

/* 
JavaScript dates didn't want to play nice, so this
monstrosity is the result. If I entered Date("2017-01-01")
it would make the date 1910 or something. So here we are.
*/
function dateToDisplay(date) {
    try {
        if (date) {
            month = parseInt(date.split("-")[1]);
            day = parseInt(date.split("-")[2]);

            var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
            var month = monthNames[month - 1];
        
            return day + " " + month.slice(0, 3);
        } else {
            return "";
        }
    } catch(err) {
        return false;
    }
}

// ==================== //
//   Photoshop Checks   //
// ==================== //

/*
Check for Adobe Photoshop CS2 (v9) or higher.
*/
function isCorrectVersion() {
    if (parseInt(version, 10) >= 9) {
        return true;
    }
    else {
        alert('This script requires Adobe Photoshop CS2 or higher.', 'Wrong Version', false);
        return false;
    }
}

/*
Ensure at least one document is open.
*/
function isOpenDocs() {
    if (documents.length) {
        return true;
    }
    else {
        alert('There are no documents open.', 'No Documents Open', false);
        return false;
    }
}

/*
Ensure that the active document contains at least one layer.
*/
function hasLayers() {
    var doc = activeDocument;
    if (doc.layers.length == 1 && doc.activeLayer.isBackgroundLayer) {
        alert('The active document has no layers.', 'No Layers', false);
        return false;
    }
    else {
        return true;
    }
}

/*
Display the JavaScript error message if we encouter one.
*/
function showError(err) {
    if (confirm('An unknown error has occurred.\n' +
        'Would you like to see more information?', true, 'Unknown Error')) {
            alert(err + ': on line ' + err.line, 'Script Error', true);
    }
}