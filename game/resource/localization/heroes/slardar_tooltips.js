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
        ability_classname: "reimagined_slardar_sprint",
        name: "Guardian Sprint",
        description: "Slardar slithers ahead, moving significantly faster and passing through units. Slardar has unlocked max speed and grants movement speed while in the river.",
        reimagined_effects: [
            {
                title: "Headstrong",
                description: "Grants ${headstrong_damage_reduction}% damage reduction from the front while active from all damage sources."
            },
            {
                title: "Finish Strong",
                description: "When Guardian Sprint ends, Slardar moves ${finish_strong_distance} units forward over the duration of ${finish_strong_duration} seconds, dragging enemies in front of him. Upon reaching the landing position, Slardar deals ${finish_strong_damage} physical damage to all enemy units in ${finish_strong_radius} radius and stunning them for ${finish_strong_stun_duration} seconds."
            },
            {
                title: "Watery Comfort",
                description: "Passively reduces the cooldown of Guardian Sprint by ${watery_comfort_cd_redcution} every ${watery_comfort_interval} seconds Slardar is considered in the river. Additionally, river bonuses linger for ${watery_comfort_river_bonus_linger} seconds after leaving a river or a puddle."
            }
        ],
        lore: "As Slardar has made the transition from the Deeps, it has been necessary to use his powerful tail for sprinting instead of swimming.",
        notes: [
            "Activating this ability doesn't interrupt channeling abilities."
        ],
        scepter_description: "Provides additional HP Regen, Armor and Status Resistance while in a puddle or in the river.",
        ability_specials: [
            {
                ability_special: "bonus_speed",
                text: "BONUS MOVE SPEED",
                percentage: true
            },
            {
                ability_special: "duration",
                text: "DURATION"
            },
            {
                ability_special: "river_speed",
                text: "RIVER BONUS MOVE SPEED",
                percentage: true
            },
            {
                ability_special: "puddle_regen",
                text: "SCEPTER RIVER HP REGEN"
            },
            {
                ability_special: "puddle_armor",
                text: "SCEPTER RIVER BONUS ARMOR"
            },
            {
                ability_special: "puddle_status_resistance",
                text: "SCEPTER RIVER STATUS RESISTANCE",
                percentage: true
            }
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_slardar_sprint_buff",
        name: "Guardian Sprint",
        description: "Movement speed increased by {" + "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE" /* MOVESPEED_BONUS_PERCENTAGE */ + "%."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_slardar_sprint_river",
        name: "Guardian Sprint River",
        description: "Movement speed increased by {" + "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE" /* MOVESPEED_BONUS_PERCENTAGE */ + "}% due to being in the river."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_slardar_talent_1_slow_debuff",
        name: "Tail Whack",
        description: "Slowed by {" + "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE" /* MOVESPEED_BONUS_PERCENTAGE */ + "}%."
    });
    Talents.push({
        talent_classname: "reimagined_slardar_talent",
        talents: [
            {
                name: "Tail Whack",
                description: "Finish Strong deals ${bonus_damage} physical damage to all enemies in ${radius} radius of the landing position. Enemies that weren't stunned by it are instead slowed by ${slow_pct}% for the same duration.",
                lore: "Utilizing the momentum gained from the gushing waters, Slardar slaps his tail to make enemies further away feel the impact of his slam."
            },
            {
                name: "Land Adaptation",
                description: "Allows Slardar to benefit from ${movespeed_pct}% of the river move speed bonuses and unlocks the move speed limit while Slardar is standing in dry land.",
                lore: "Very quickly Slardar has realized that cannot also rely on home advantage, and learned to adapt to navigating the land."
            }
        ]
    });
    return localization_info;
}
exports.GenerateLocalizationData = GenerateLocalizationData;
