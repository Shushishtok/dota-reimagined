import * as fs from 'fs';
const path = require('path');
import { LocalizationCompiler } from './game/resource/localizationCompiler';
import { LocalizationData} from './game/resource/localizationInterfaces';
const watch = require("node-watch");

let completeData: {[path: string]: LocalizationData} = {};

let watcher = watch(["./game/resource/localization", "./game/resource/localizationCompiler.js"], {recursive: true})
watcher.on("change", (eventType ?: 'update' | 'remove' | undefined, filePath ?: string) => {
	if (!filePath) return;
	if (filePath.includes("localizationCompiler.js")) {
		compiler = loadCompiler();
	}
	let match = /(.*[\/|\\](\w+)).js/g.exec(filePath);
	if (eventType == "update" && filePath && match) {
		const curpath = match[1];
		const data = getDataFromFile(".\\" + curpath + ".js");
		if (data) {
			completeData[curpath] = data;
			combineData();
		}
	} else if (eventType == "remove" && match) {
		if (completeData.hasOwnProperty(match[1])) {
			delete completeData[match[1]];
			combineData();
		}
	}
})

// not really neccessarry:
watcher.on("error", (error: Error) => {
	console.log("Something went wrong!");
	console.log(error);
})

watcher.on("ready", () => {
	console.log("Ready!");
})

let compiler = loadCompiler();

function getDataFromFile(filePath: string): LocalizationData | undefined {
	if (!fs.existsSync(filePath)){
		return;
	}
	delete require.cache[require.resolve(filePath)]
	let file = require(filePath);
	if (file["GenerateLocalizationData"]) {
		const localizationArr: LocalizationData = file["GenerateLocalizationData"]();
		return localizationArr;
	}
	return;
}

function combineData() {
	compiler.OnLocalizationDataChanged(completeData);
}

function loadCompiler(): LocalizationCompiler
{
    // Clear require cache
    delete require.cache[require.resolve("./game/resource/localizationCompiler")]
    // Require latest compiler version
    const compilerClass: new () => LocalizationCompiler = require("./game/resource/localizationCompiler").LocalizationCompiler;
    return new compilerClass();
}
