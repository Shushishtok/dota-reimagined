"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require('path');
var watch = require("node-watch");
var completeData = {};
var watcher = watch(["./game/resource/localization", "./game/resource/localizationCompiler.js"], { recursive: true });
watcher.on("change", function (eventType, filePath) {
    if (!filePath)
        return;
    if (filePath.includes("localizationCompiler.js")) {
        compiler = loadCompiler();
    }
    var match = /(.*[\/|\\](\w+)).js/g.exec(filePath);
    if (eventType == "update" && filePath && match) {
        var curpath = match[1];
        var data = getDataFromFile(".\\" + curpath + ".js");
        if (data) {
            completeData[curpath] = data;
            combineData();
        }
    }
    else if (eventType == "remove" && match) {
        if (completeData.hasOwnProperty(match[1])) {
            delete completeData[match[1]];
            combineData();
        }
    }
});
// not really neccessarry:
watcher.on("error", function (error) {
    console.log("Something went wrong!");
    console.log(error);
});
watcher.on("ready", function () {
    console.log("Ready!");
});
var compiler = loadCompiler();
function getDataFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }
    delete require.cache[require.resolve(filePath)];
    var file = require(filePath);
    if (file["GenerateLocalizationData"]) {
        var localizationArr = file["GenerateLocalizationData"]();
        return localizationArr;
    }
    return;
}
function combineData() {
    compiler.OnLocalizationDataChanged(completeData);
}
function loadCompiler() {
    // Clear require cache
    delete require.cache[require.resolve("./game/resource/localizationCompiler")];
    // Require latest compiler version
    var compilerClass = require("./game/resource/localizationCompiler").LocalizationCompiler;
    return new compilerClass();
}
