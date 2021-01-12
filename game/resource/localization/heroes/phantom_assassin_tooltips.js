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
        ability_classname: "reimagined_phantom_assassin_stifling_dagger",
        name: "Stifling Dagger",
        description: "Throws a dagger slowing the enemy unit's movement speed, dealing ${base_damage} + ${attack_factor_tooltip}% of Phantom Assassin's attack damage as physical damage and applying attack effects from items and abilities.",
        reimagined_effects: [
            {
                title: "Fan of Knives",
                description: "Throws ${fan_of_knives_add_daggers} additional daggers on random targets in Stifling Dagger's cast range that are not the main target that deal ${fan_of_knives_fixed_damage} physical damage and do not proc on-hit effects. If there is at least one dagger that was not used, one additional dagger is thrown at the main target. Additional daggers still apply the slow debuff.",
            },
            {
                title: "Sharp and Quiet",
                description: "Stifling Dagger's chance to proc Coup de Grace increases by ${sharp_and_quite_crit_per_stack}% chance for every ${sharp_and_quite_hp_threshold_per_stack}% health that the enemy unit has."
            },
            {
                title: "Stifling Blade",
                description: "The slow debuff also reduces the outgoing damage of the target by ${stifling_blade_outgoing_damage}% for the duration of the debuff."
            }
        ],
        lore: "The first skill learned by the Sisters of the Veil often signals an incoming hit.",
        notes: [
            "If an attack effect is chance-based, the chance of its application will be the same as its chance to occur.",
            "Spell-immune enemies are not affected by Stifling Dagger's slow.",
            "Fan of Knives additional daggers are fired in a delay of ${fan_of_knives_delay} seconds after each dagger."
        ],
        ability_specials: [
            {
                ability_special: "move_slow",
                text: "MOVE SLOW",
                percentage: true
            },
            {
                ability_special: "duration",
                text: "SLOW DURATION"
            },
            {
                ability_special: "base_damage",
                text: "BASE DAMAGE"
            },
            {
                ability_special: "attack_factor_tooltip",
                text: "ATTACK DAMAGE",
                percentage: true
            },
            {
                ability_special: "abilitycastrange",
                text: "CAST RANGE"
            }
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_stifling_dagger_slow",
        name: "Stifling Dagger",
        description: "Movement speed reduced by {" + "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE" /* MOVESPEED_BONUS_PERCENTAGE */ + "}% and total outgoing damage reduced by {" + "MODIFIER_PROPERTY_DAMAGEOUTGOING_PERCENTAGE" /* DAMAGEOUTGOING_PERCENTAGE */ + "}%."
    });
    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_phantom_strike",
        name: "Phantom Strike",
        description: "Teleports to a unit, friendly or enemy, and grants bonus attack speed while attacking if it's an enemy unit.",
        reimagined_effects: [
            {
                title: "Nothin Personalle",
                description: "Applies instant attacks on all enemies between the caster and her target."
            },
            {
                title: "Relentless Assassin",
                description: "The attack speed buff refreshes itself when Phantom Assassin lands an attack on Phantom Strike's target."
            },
            {
                title: "Escape Plan",
                description: "After blinking to an ally, Phantom Assassin gains Blur's invisibility for ${escape_plan_blur_duration} seconds, and gets a ${escape_plan_ms_bonus_pct}% move speed bonus as well for the same duration."
            }
        ],
        lore: "Mortred's silken veil is the last thing her unfortunate target sees.",
        notes: [
            "Nothin Personalle's search width is based on the caster's hull radius plus its current attack range.",
            "Nothin Personalle does not apply an instant attack on the main target.",
            "Escape Plan only procs the Blur's active modifier if Blur is learned and is not currently active. The move speed modifier is independent and will always proc when blinking to an ally."
        ],
        ability_specials: [
            {
                ability_special: "bonus_attack_speed",
                text: "BONUS ATTACK SPEED"
            },
            {
                ability_special: "duration",
                text: "DURATION"
            },
            {
                ability_special: "cast_range",
                text: "CAST RANGE"
            },
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_phantom_strike_buff",
        name: "Phantom Strike",
        description: "Attack speed increased by {" + "MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT" /* ATTACKSPEED_BONUS_CONSTANT */ + "}. Refreshes itself when attacking the main target."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_phantom_strike_escape_plan",
        name: "Escape Plan",
        description: "Move speed increased by {" + "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE" /* MOVESPEED_BONUS_PERCENTAGE */ + "}%."
    });
    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_blur",
        name: "Blur",
        description: "Phantom Assassin focuses inward, increasing her ability to evade enemy attacks. Can be activated to blur her body, causing her to be impossible to see until near enemy heroes.",
        scepter_description: "Causes Blur to have instant cast time and applies a dispel. Anytime you get a hero kill, your abilities are refreshed. Reduces Blur cooldown.",
        reimagined_effects: [
            {
                title: "Turned Your Blade",
                description: "Phantom Assassin instantly attacks any enemy within her attack range that misses her with an auto attack. Each enemy that procs this effect has its own independent cooldown of ${turned_blade_internal_cooldown} seconds."
            },
            {
                title: "Quick and Quiet",
                description: "While Blur is active, grants ${quick_quiet_ms_per_interval}% move speed for every ${quick_quiet_interval} second it is on. Lingers for ${quick_quiet_linger_duration} additional seconds after Blur is dispelled or expires."
            },
            {
                title: "From The Veils",
                description: "Attacking while Blur is active grants Phantom Assassin an additional ${from_veils_pure_damage_pct}% of her total damage as bonus pure damage."
            }
        ],
        lore: "Meditation allows a Veiled Sister to carefully anticipate her opponents in combat.",
        notes: [
            "Quick and Quiet's stacks no longer increase during the linger time of the modifier.",
            "Quick and Quiet's stacks are reset when Blur is refreshed while already being active.",
            "From the Veils constantly procs the added pure damage until Blur is completely dispelled."
        ],
        ability_specials: [
            {
                ability_special: "bonus_evasion",
                text: "EVASION",
                percentage: true
            },
            {
                ability_special: "duration",
                text: "DURATION",
            },
            {
                ability_special: "radius",
                text: "VANISH RADIUS"
            },
            {
                ability_special: "fade_duration",
                text: "VANISH BUFFER"
            },
            {
                ability_special: "scepter_cooldown",
                text: "SCEPTER COOLDOWN"
            }
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_blur_active",
        name: "Blur",
        description: "Blurring out to disappear from the enemy's sight. Procs bonus pure damage while active."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_blur_quick_and_quiet",
        name: "Quiet and Quiet",
        description: "Increases move speed by {" + "MODIFIER_PROPERTY_MOVESPEED_BONUS_PERCENTAGE" /* MOVESPEED_BONUS_PERCENTAGE */ + "}%. Lingers for {" + "MODIFIER_PROPERTY_TOOLTIP" /* TOOLTIP */ + "} seconds after Blur is dispelled."
    });
    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_coup_de_grace",
        name: "Coup de Grace",
        description: "Phantom Assassin refines her combat abilities, gaining a chance of delivering a devastating critical strike to enemy units. Stifling Dagger shares the same critical strike chance.",
        reimagined_effects: [
            {
                title: "Kiss of Death",
                description: "When Phantom Assassin delivers a critical strike from Coup de Grace to a target with less than ${kiss_of_death_health_threshold}% health, there is a ${kiss_of_death_kill_chance}% chance that the critical damage will deal extremely massive damage.",
            },
            {
                title: "Marked For Death",
                description: "Each attack that doesn't proc Coup De Grace increases its crit damage by ${marked_for_death_damage_increase}%. Resets when Coup de Grace is triggered."
            },
            {
                title: "Decisive Strike",
                description: "Coup de Grace can be cast as a no target ability. Doing so reduces Phantom Assassin's attack speed by ${decisive_strike_as_reduction}, but increases the chance to proc Coup de Grace by ${decisive_strike_crit_chance_increase}%. Lasts for ${decisive_strike_duration} seconds, or until Phantom Assassin crits ${decisive_strike_crits_to_remove} times."
            }
        ],
        lore: "A divine strike, Mortred honors her opponent by choosing them for death.",
        notes: [
            "Kiss of Death procs a critical strike with the highest possible crit damage. As such, it simply deals extremely high damage, but does not guarantees killing the target."
        ],
        ability_specials: [
            {
                ability_special: "crit_chance",
                text: "CRITICAL CHANCE",
                percentage: true
            },
            {
                ability_special: "crit_bonus",
                text: "CRITICAL DAMAGE",
                percentage: true
            },
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike",
        name: "Decisive Strike",
        description: "Slows attack speed by {" + "MODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT" /* ATTACKSPEED_BONUS_CONSTANT */ + "}, but increases the critical hit chance by {" + "MODIFIER_PROPERTY_TOOLTIP" /* TOOLTIP */ + "}%."
    });
    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_fan_of_knives",
        name: "Fan of Knives",
        description: "Phantom Assassin releases sharp blades around her in a ${radius} AoE, dealing ${pct_health_damage}% of a victim's max health on impact and applying break for ${duration} seconds.",
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_fan_of_knives_debuff",
        name: "Fan of Knives",
        description: "Broken."
    });
    Talents.push({
        talent_classname: "reimagined_phantom_assassin_talent",
        talents: [
            {
                name: "Duo Daggers",
                description: "Each dagger hit causes Phantom Assassin to perform a total of ${total_performed_attacks} instant attacks on the target. Does not proc on Fan of Knives daggers.",
                lore: "Victims have reported that they felt being cut in two different spots at the same time, though only one dagger would be found on their bodies."
            },
            {
                name: "From The Shadows",
                description: "Casting Stifling Dagger while under Blur's active effect causes the projectiles to become completely invisible to the enemy. Additionally, the main projectile deals ${talent_2_dagger_bonus_damage} bonus damage, while Fan of Knives projectiles deal ${talent_2_fake_dagger_bonus_damage} bonus damage.",
                lore: "Hiding in the shadows, Mortred launches a dagger at unsuspecting victims, who could never see it coming."
            },
            {
                name: "Strikin' Out",
                description: "Each attack done while Phantom Assassin has the attack speed buff from Phantom Strike increases her base damage by ${talent_3_bonus_damage_per_stack_pct}% until the buff ends.",
                lore: "Mortred studies her target while she strikes, finding weak points on every attack until her target gives in."
            },
            {
                name: "Secret Blade",
                description: "All enemies hit by Nothing Personalle are affected with Stifling Dagger's slow debuff and are ministunned. If they are already afflicted with Stifling Dagger's debuff, then the duration is refreshed and extended by ${talent_4_extend_duration} seconds.",
                lore: "Utilizing her lightning fast reflexes, Mortred sticks a secret blade on obstacles that stand on her way to her target."
            },
            {
                name: "Immaterial Girl",
                description: "Upon proccing Turned Your Blade on an enemy unit, grants ${talent_5_evasion_pct}% evasion against that enemy for ${talent_5_evasion_duration} seconds.",
                lore: "Losing sight of Mortred once might mean losing sight of her forever."
            },
            {
                name: "Soft on the Eye Cooldown",
                description: "When disjointing a tracking projectile or evading a ranged attack and there are no enemies in ${talent_6_search_radius} range, grants active Blur's effects for free for ${talent_6_blur_duration} seconds. This effect can only occur once every ${talent_6_blur_cooldown} seconds. Does not trigger if Blur is already active.",
                lore: "One of the best techniques used by the Veiled Sisters is the ability to blend out of sight in an instant by using misdirection."
            },
            {
                name: "Mercy Killing",
                description: "When Phantom Assassin's attack target has less than ${talent_7_health_threshold}% health, her next attack on it will guarantee a Coup de Grace proc. This effect can trigger only once every ${talent_7_proc_cooldown} seconds.",
                lore: "Mortred waits for the moment of weakness on her enemies and decapitates them with a single swing."
            },
            {
                name: "Clean Streak",
                description: "While Decisive Strike is active, if Phantom Assassin's target is stunned when she begins the attack, the attack speed penalty is reduced by ${talent_8_attack_penalty_reduction_pct}% and Coup De Grace's critical damage increases by ${talent_8_crit_damage_bonus}%.",
                lore: "With her enemy bound and its defenses down, Mortred can deliver a perfectly clean streak to it."
            }
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_talent_5_debuff",
        name: "Immaterial Girl",
        description: "Phantom Assassin has {" + "MODIFIER_PROPERTY_TOOLTIP" /* TOOLTIP */ + "}% evasion against your attacks for the duration of the debuff."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_talent_6_cooldown",
        name: "Soft on the Eye Cooldown",
        description: "Soft on the Eye would not trigger while this modifier is in effect."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_talent_7_cooldown",
        name: "Mercy Killing Cooldown",
        description: "Cannot proc Mercy Killing's guaranteed critical strike on weakened enemies for the duration."
    });
    return localization_info;
}
exports.GenerateLocalizationData = GenerateLocalizationData;
