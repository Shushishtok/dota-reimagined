"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLocalizationData = void 0;
function GenerateLocalizationData() {
    // This section can be safely ignored, as it is only logic.
    //#region Localization logic
    // Arrays
    var Abilities = new Array();
    var Modifiers = new Array();
    var StandardTooltips = new Array();
    var Talents = new Array();
    // Create object of arrays
    var localization_info = {
        AbilityArray: Abilities,
        ModifierArray: Modifiers,
        StandardArray: StandardTooltips,
        TalentArray: Talents
    };
    //#endregion
    // Enter localization data below!
    Abilities.push({
        ability_classname: "item_reimagined_enchanted_mango",
        name: "Enchanted Mango",
        description: "<h1>Use: Eat Mango</h1> Instantly restores ${replenish_amount} mana.<br><br>Range: ${abilitycastrange}",
        lore: "The bittersweet flavors of Jidi Isle are irresistible to amphibians.",
        ability_specials: [
            {
                ability_special: "hp_regen",
                text: "hp_regen",
                item_stat: true
            }
        ]
    });
    return localization_info;
}
exports.GenerateLocalizationData = GenerateLocalizationData;
