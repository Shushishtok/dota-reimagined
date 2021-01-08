import * as fs from 'fs';
import path from 'path';
import { LocalizationCompiler } from './localizationCompiler';
import { GenerateLocalizationData } from "./localizationData";

const filepath: string = path.join(__dirname, "/localizationData.js");

let compiler = loadCompiler();
doCompile();

let fsWait: NodeJS.Timeout | false = false;
fs.watch(filepath, (event: any , filename: string | undefined) =>
{
    if (filename && event ==='change')
    {
        if (fsWait) return;
        fsWait = setTimeout(() =>
        {
            fsWait = false;
        }, 100);

        // Create a new compiler class
        compiler = loadCompiler();
        compiler.OnLocalizationDataChanged();
    }
});

function doCompile()
{
    console.log("Data changed, compiling");
    compiler.OnLocalizationDataChanged();
    console.log("Data finished compilation.");
}

function loadCompiler(): LocalizationCompiler
{
    // Clear require cache
    delete require.cache[require.resolve("./localizationCompiler")]
    delete require.cache[require.resolve("./localizationData")]
    // Require latest compiler version
    const compilerClass: new () => LocalizationCompiler = require("./localizationCompiler").LocalizationCompiler;
    return new compilerClass();
}
