import { AbilityLocalization, HeroTalents, Language, LocalizationData, ModifierLocalization, StandardLocalization } from "../../localizationInterfaces";

export function GenerateLocalizationData(): LocalizationData
{
    // This section can be safely ignored, as it is only logic.
    //#region Localization logic
    // Arrays
    const Abilities: Array<AbilityLocalization> = new Array<AbilityLocalization>();
    const Modifiers: Array<ModifierLocalization> = new Array<ModifierLocalization>();
    const StandardTooltips: Array<StandardLocalization> = new Array<StandardLocalization>();
    const Talents: Array<HeroTalents> = new Array<HeroTalents>();

    // Create object of arrays
    const localization_info: LocalizationData =
    {
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
        reimagined_effects:
        [
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
        notes:
        [
            "Activating this ability doesn't interrupt channeling abilities."
        ],
        scepter_description: "Provides additional HP Regen, Armor and Status Resistance while in a puddle or in the river.",
        ability_specials:
        [
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
        description: `Movement speed increased by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}%.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_slardar_sprint_river",
        name: "Guardian Sprint River",
        description: `Movement speed increased by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% due to being in the river.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_slardar_talent_1_slow_debuff",
        name: "Tail Whack",
        description: `Slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`
    });

    Talents.push({
        talent_classname: "reimagined_slardar_talent",
        talents:
        [
            {
                name: "Tail Whack",
                description: "Finish Strong deals ${bonus_damage} physical damage to all enemies in ${radius} radius of the landing position. Enemies that weren't stunned by it are instead slowed by ${slow_pct}% for the same duration.",
                lore: "Utilizing the momentum gained from the gushing waters, Slardar slaps his tail to make enemies further away feel the impact of his slam."
            },

            {
                name: "Land Adaptation",
                description: "Allows Slardar to benefit from ${movespeed_pct}% of the river move speed bonuses and unlocks the move speed limit while Slardar is standing in dry land.",
                lore: "Very quickly Slardar has realized that cannot also rely on home advantage, and learned to adapt to navigating the land."
            },

            {
                name: "Hydro Pump",
                description: "When Splash Attack projectiles land at their target positions, a Slithereen Crush is cast on their location, utilizing river values. Those projectiles cannot create additional puddles.",
                lore: "The immense force that Slardar fires those blobs of water cause them to crush at their landing position violently."
            },

            {
                name: "Naga Instincts",
                description: "Allows Slithereen Crush to be immediately cast while stunned. If Slardar casts Slithereen Crush while stunned, he is also Strong Dispelled.",
                lore: "The Naga race is known for their tenacity and stubborness, breaking free from most dire situations."
            }
        ]
    });

    Abilities.push({
        ability_classname: "reimagined_slardar_slithereen_crush",
        name: "Slithereen Crush",
        description: "Slams the ground, stunning and damaging nearby enemy land units. After the stun, the affected units are slowed.",
        lore: "A swift crush of might and water breaks even the toughest of defenses.",
        scepter_description: "Whenever Slardar casts Slithereen Crush, he creates a puddle of water that is considered a river for movement and bonuses.",
        reimagined_effects:
        [
            {
                title: "Splash Attack",
                description: "When Slithereen Crush is cast while the caster is considered in the river, the radius of this ability increases to ${splash_attack_radius}. Additionally, throws ${splash_attack_puddle_count} projectiles of water to random locations in ${splash_attack_puddle_search_radius} range around the caster, each forming a ${splash_attack_puddle_radius} radius puddle for ${splash_attack_puddle_duration} seconds."
            },

            {
                title: "Brine Breeze",
                description: "Applies the slow debuff to enemies that are outside the AoE, but are in ${brine_breeze_range} units range of the outer ring."
            },

            {
                title: "Royal Breaker",
                description: "Enemies affected by Slithereen Crush's slow debuff cannot utilize damage blocks."
            }
        ],

        notes:
        [
            "A Splash Attack puddle projectile will land in a random position with a minimum of 300 distance from the cast position.",
            "Splash Attack puddle projectiles provide ${splash_attack_projectile_vision} vision around them until the puddles expire."
        ],

        ability_specials:
        [
            {
                ability_special: "crush_radius",
                text: "RADIUS"
            },

            {
                ability_special: "crush_extra_slow",
                text: "MOVEMENT SLOW",
                percentage: true
            },

            {
                ability_special: "crush_attack_slow_tooltip",
                text: "ATTACK SLOW"
            },

            {
                ability_special: "crush_extra_slow_duration",
                text: "SLOW DURATION"
            },

            {
                ability_special: "stun_duration",
                text: "STUN DURATION"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_slardar_slithereen_crush_slow",
        name: "Slithereen Crush",
        description: `Affected by Slardar's Slithereen Crush. Move speed slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% and attack speed slowed by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}}."`
    });

    return localization_info;
}
