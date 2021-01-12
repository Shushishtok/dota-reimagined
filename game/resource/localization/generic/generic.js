"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateLocalizationData = void 0;
var localizationInterfaces_1 = require("../../localizationInterfaces");
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
    StandardTooltips.push({
        classname: "addon_game_name",
        name: "Dota Reimagined"
    });
    StandardTooltips.push({
        classname: "DOTA_Reimagined_Talent_Learned",
        name: "Talent learned",
    });
    StandardTooltips.push({
        classname: "DOTA_Reimagined_Talent_Can_Be_Learned",
        name: "Talent can be learned",
        language_overrides: [
            {
                language: localizationInterfaces_1.Language.Russian,
                name_override: "IT CAN BE DONE!!!!!"
            }
        ]
    });
    StandardTooltips.push({
        classname: "DOTA_Reimagined_Talent_Not_Learned",
        name: "Talent not yet learned"
    });
    StandardTooltips.push({
        classname: "DOTA_Reimagined_Talent_Cannot_Be_Learned",
        name: "Talent cannot be learned"
    });
    StandardTooltips.push({
        classname: "DOTA_Reimagined_Talent_Ping_Enemy",
        name: "Enemy"
    });
    StandardTooltips.push({
        classname: "DOTA_Reimagined_Talent_Ping_Ally",
        name: "Ally"
    });
    StandardTooltips.push({
        classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web",
        name: "Caster doesn't have the Spin Web ability"
    });
    StandardTooltips.push({
        classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_spin_web_unleveled",
        name: "Spin Web is not yet leveled"
    });
    StandardTooltips.push({
        classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charge_modifier",
        name: "No charges modifier exists for Spin Web"
    });
    StandardTooltips.push({
        classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charges",
        name: "Not enough Spin Web charges to consume"
    });
    StandardTooltips.push({
        classname: "DOTA_Tooltip_cast_error_cast_on_roshan",
        name: "Ability cannot be cast on Roshan"
    });
    StandardTooltips.push({
        classname: "DOTA_Tooltip_cast_error_cast_on_player_controlled_units",
        name: "Ability cannot be cast on player controlled units"
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_charges",
        name: "Charges",
        description: "Can cast this ability whenever there are charges available. A charge is refreshed every {" + "MODIFIER_PROPERTY_TOOLTIP" /* TOOLTIP */ + "} seconds.",
        language_overrides: [
            {
                language: localizationInterfaces_1.Language.Russian,
                description_override: "\u041C\u043E\u0436\u0435\u0442 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u044D\u0442\u0443 \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u0432\u0441\u044F\u043A\u0438\u0439 \u0440\u0430\u0437, \u043A\u043E\u0433\u0434\u0430 \u0435\u0441\u0442\u044C \u0437\u0430\u0440\u044F\u0434\u044B. \u0417\u0430\u0440\u044F\u0434 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043A\u0430\u0436\u0434\u044B\u0435 {" + "MODIFIER_PROPERTY_TOOLTIP" /* TOOLTIP */ + "} \u0441\u0435\u043A\u0443\u043D\u0434\u044B"
            }
        ]
    });
    return localization_info;
}
exports.GenerateLocalizationData = GenerateLocalizationData;
