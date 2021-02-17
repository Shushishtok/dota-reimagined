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
        ability_classname: "reimagined_crystal_maiden_crystal_nova",
        name: "Crystal Nova",
        description: "A burst of damaging frost slows enemy movement and attack rate in the targeted area.",
        reimagined_effects:
        [
            {
                title: "Snowstorm Field",
                description: "Leaves a field on the ground where Crystal Nova was cast for ${snowstorm_duration} seconds. Allies standing on the field are granted ${snowstorm_damage_reduction}% damage reduction and ${snowstorm_status_reduction}% status resistance."
            },

            {
                title: "Snowbite",
                description: "When an enemy is under both Frostbite's debuff and standing on the Snowstorm Field, Crystal Nova's slow modifier's timer refreshes itself."
            },

            {
                title: "Hail Winds",
                description: "While Snowstorm Field is up, frozen shards are released with extreme force from the center of the field, dealing ${hailwind_damage} to all enemies in ${hailwind_radius} range and slowing them by ${hailwind_slow_pct}% for ${hailwind_duration} seconds. Repeats every ${hailwind_interval} seconds until Snowstorm Field dissipates."
            }
        ],
        lore: "The air temperature around Rylai drops rapidly, chilling all around her to the core.",
        notes:
        [
            "Grants a %vision_radius% AoE vision for %vision_duration% seconds centered on the position of Crystal Nova.",
            "Snowbite's effect persists as long as the target is afflicted with both Frostbite's and the Snowstorm Field's modifier; when one of them wears off, the effect no longer occurs.",
            "Despite Hail Winds' particle effect, Hail Winds hits all enemies in Hail Wind AoE immediately, and it cannot be dodged."
        ],
        ability_specials:
        [
            {
                ability_special: "radius",
                text: "RADIUS"
            },

            {
                ability_special: "movespeed_slow",
                text: "MOVEMENT SLOW",
                percentage: true
            },

            {
                ability_special: "attackspeed_slow",
                text: "ATTACK SLOW"
            },

            {
                ability_special: "duration",
                text: "DURATION"
            },

            {
                ability_special: "nova_damage",
                text: "DAMAGE"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_crystal_nova_slow",
        name: "Crystal Nova",
        description: `Move speed reduced by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% and attack speed reduced by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}}. Refreshes itself when you are afflicted by both Snowstorm Field and Frostbite.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_crystal_nova_hailwind_slow",
        name: "Hail Winds",
        description: `Move speed reduced by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_crystal_nova_snowstorm_buff",
        name: "Snowstorm",
        description: `Damage reduction increased by {${LocalizationModifierProperty.INCOMING_DAMAGE_PERCENTAGE}}% and status resistance increased by {${LocalizationModifierProperty.STATUS_RESISTANCE_STACKING}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_crystal_maiden_frostbite",
        name: "Frostbite",
        description: "Encases an enemy unit in ice, prohibiting movement and attack, while dealing damage over time.",
        reimagined_effects:
        [
            {
                title: "Eternal Cold",
                description: "Lasts infinitely on creeps, dealing ${eternal_cold_fixed_damage} damage per tick. Can still be dispellable."
            },

            {
                title: "Frost Emanation",
                description: "While a unit is afflicted with Frostbite, on every tick, the closest enemy in ${frost_emanation_search_radius} radius will also be afflicted with a ${frost_emanation_duration} seconds Frostbite."
            },

            {
                title: "Igloo Frosting",
                description: "Can be cast on an ally, rooting and disarming it and increasing Arcane Aura's effect on that ally by ${igloo_frosting_arcane_aura_multiplier} times. Does not deals damage to the target ally."
            }
        ],
        shard_description: "Casting Frosbite on yourself also reduces incoming damage by ${shard_damage_reduction_pct}% for the duration. Allows casting Frostbite while channeling as long as the target is in range.<br><br>Reduces cooldown by ${shard_cooldown_reudction} seconds.",
        lore: "Rylai channels winds from the Blueheart Glacier, imprisoning attackers in thick blocks of ice.",
        notes:
        [
            "Creep heroes, Roshan and ancient creeps are considered heroes and do not count for Eternal Cold.",
            "Frost Emanation does not trigger on Frostbites that were created from it.",
            "Igloo Frosting multiplies all bonuses of the Arcane Aura, including Focused Arcane's bonuses.",
            "Igloo Frosting can be help disabled."
        ],
        ability_specials:
        [
            {
                ability_special: "total_damage",
                text: "HERO TOTAL DAMAGE"
            },

            {
                ability_special: "duration",
                text: "HERO DURATION"
            },

            {
                ability_special: "tick_interval",
                text: "DAMAGE INTERVAL"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_frostbite_debuff",
        name: "Frostbite",
        description: `Cannot move or attack. Taking {${LocalizationModifierProperty.TOOLTIP}} damage every {f${LocalizationModifierProperty.TOOLTIP2}} seconds. Spreading Frostbite to nearby allies.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_frostbite_buff",
        name: "Igloo Frosting",
        description: `Cannot move or attack. Arcane Aura's effects on you are multiplied by {${LocalizationModifierProperty.TOOLTIP}}. Spreading Frosbite to nearby enemies.`
    });

    Abilities.push({
        ability_classname: "reimagined_crystal_maiden_brilliance_aura",
        name: "Arcane Aura",
        description: "Gives additional mana regeneration to all friendly units on the map. This bonus is increased for Crystal Maiden.",
        reimagined_effects:
        [
            {
                title: "Focused Arcane",
                description: "Can be cast as a no target spell to reduce the aura range from global to ${focused_arcane_radius}, but increase allies' magical resistance by ${focused_arcane_magic_res}% and spell amp by ${focused_arcane_spell_amp}%. Those bonuses are not multiplied by Crystal Maiden's self bonus. Lasts ${focused_arcane_duration} seconds."
            },

            {
                title: "Ice Never Dies",
                description: "Aura persists even when Crystal Maiden is dead or hidden."
            },

            {
                title: "Blueheart Mastery",
                description: "Dealing damage to enemy units improves Arcane Aura's mana regeneration by ${blueheart_mastery_mana_regen} for all allies for each damage instance she inflicts. Stacks infinitely and has independent stack durations. Each stack lasts ${blueheart_mastery_duration} seconds."
            }
        ],
        lore: "Cold temperatures promote the essence of magic, causing Rylai's presence to allow spell usage in abundance.",
        notes:
        [
            "Blueheart Mastery's mana regen bonus applies after the self factor is taken into account. However, this bonus is multiplied by Frostbite's Igloo Frosting multiplier."
        ],
        ability_specials:
        [
            {
                ability_special: "mana_regen",
                text: "MANA REGEN"
            },

            {
                ability_special: "self_factor",
                text: "SELF BONUS FACTOR"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_arcane_aura_blueheart_mastery",
        name: "Blueheart Mastery",
        description: `Increases Arcane's Aura mana regeneration bonus by {f${LocalizationModifierProperty.TOOLTIP}}.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_arcane_aura_buff",
        name: "Arcane Aura",
        description: `Adds {f${LocalizationModifierProperty.MANA_REGEN_CONSTANT}} mana regeneration. When Focused Arcane is active, magic resistance and spell amp are also increased by {${LocalizationModifierProperty.TOOLTIP}}%.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_arcane_aura_focused_arcane",
        name: "Focused Arcane",
        description: `Limits Arcane Aura's radius to {${LocalizationModifierProperty.TOOLTIP}} and increases magic resistance and spell amp for affected allies.`
    });

    Abilities.push({
        ability_classname: "reimagined_crystal_maiden_freezing_field",
        name: "Freezing Field",
        description: "CHANNELED - Surrounds Crystal Maiden with random icy explosions that slow enemies and deal massive damage. Grants bonus armor while channeling. Lasts ${abilitychanneltime} seconds.",
        reimagined_effects:
        [
            {
                title: "Arcane Glacier",
                description: "For every ${arcane_glacier_interval} seconds that Freezing Field is still channeling, Crystal Maiden's damage resistance increases by ${arcane_glacier_damage_res_per_tick}%. Lasts ${arcane_glacier_linger_duration} seconds after the channeling of Freezing Field ends."
            },

            {
                title: "Subzero Crystal",
                description: "Freezing Field's explosions have a ${subzero_crystal_chance}% chance to leave a Snowstorm Field on the impact location for ${subzero_crystal_duration} seconds, applying the reimaginations of Crystal Nova."
            },

            {
                title: "Numbing Cold",
                description: "Frostbitten enemies take ${numbing_cold_bonus_dmg_pct}% increased damage from Freezing Field explosions and become ministunned."
            }
        ],
        scepter_description: "Applies Frostbite to any unit that has been standing in the Freezing Field for over ${scepter_delay} seconds.",
        lore: "Once the place of her exile, Icewrack has become an anchor for Rylai's frigid onslaught.",
        notes:
        [
            "The slow is applied on all enemies in the radius, even if they aren't hit by an explosion. The slow lingers for ${slow_duration} seconds.",
            "Explosions occur every ${explosion_interval} seconds.",
            "Subzero Crystal uses psuedo random calaulation."
        ],
        ability_specials:
        [
            {
                ability_special: "radius",
                text: "RADIUS"
            },

            {
                ability_special: "explosion_radius",
                text: "EXPLOSION RADIUS"
            },

            {
                ability_special: "bonus_armor",
                text: "BONUS ARMOR"
            },

            {
                ability_special: "movespeed_slow",
                text: "MOVEMENT SLOW",
                percentage: true
            },

            {
                ability_special: "attack_slow",
                text: "ATTACK SLOW"
            },

            {
                ability_special: "damage",
                text: "DAMAGE"
            },

            {
                ability_special: "scepter_delay",
                text: "SCEPTER FROSTBITE DELAY"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_freezing_field_arcane_glacier",
        name: "Arcane Glacier",
        description: `Damage resistance is increased by {${LocalizationModifierProperty.INCOMING_DAMAGE_PERCENTAGE}}%.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_freezing_field_aura",
        name: "Freezing Field",
        description: `Armor increased by {${LocalizationModifierProperty.PHYSICAL_ARMOR_BONUS}}.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_freezing_field_slow",
        name: "Freezing Field Slow",
        description: `Movement speed slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%, attack speed reduced by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}}.`
    });

    Talents.push({
        talent_classname: "reimagined_crystal_maiden_talent",
        talents:
        [
            {
                name: "Charmed Snow",
                description: "Snowstorm Field now provides bonus ${bonus_spell_amp}% spell amp to allies and ${spell_amp_reduction}% spell amp reduction to enemies that stand in its radius.",
                lore: "Rylai can enchant the flowing gusts of ice to allow magic to form easily, or to repel tainted magical energies."
            },

            {
                name: "Dense Ice",
                description: "Crystal Nova's move and attack speed slow scales with the the enemy's distance to the center of the Snowstorm Field, up to ${max_additional_slow}% additional slow when standing in its center. Every ${units_per_slow} units of distance from the center reduces the slow further.",
                lore: "Rylai piles small particles of dense ice on her enemies, weighing them down and making it truly hard to move in the storm."
            },

            {
                name: "Subzero Grasp",
                description: "Frostbitten enemies can no longer turn while under this effect, and their health and mana regeneration rates are reduced by ${hp_mp_regen_reduction}%.",
                lore: "Tormented in a prison made of ice, freezing to their core, unable to even look behind them on the path they've walked on, they suffer."
            },

            {
                name: "Bunker of Ice",
                description: "Igloo Frosting now also increases the cast range of the affected ally by ${cast_range_bonus}. Also increases allies' Frost Emanation's search radius by ${frost_emanation_radius_bonus}.",
                lore: "By encasing an ally with ice full of spiritual and arcane energies, Rylai can extend its magical capabilities greatly."
            },

            {
                name: "Frost Drift",
                description: "Blueheart Mastery now also increases Crystal Maiden's move speed by ${talent_movespeed_bonus_pct}% per stack.",
                lore: "As her mastery grows, creating small footing of ice to allow her to slide with turns manuevering around an easy feat for Rylai."
            },

            {
                name: "Intense Cold",
                description: "Focused Arcane now multiplies the mana regeneration of Arcane Aura by ${mana_regen_multiplier} and decreases the cooldowns of all affected allies by ${cooldown_reduction}%.",
                lore: "Erecting an exceptionally unique climate of cold and frost where magical energies can thrive, Rylai provides the mystical energies needed to sustain a continuous conflict."
            },

            {
                name: "Icy Drill Barrage",
                description: "Freezing Field now can be set to auto cast. While auto cast is on, all explosions hit ${explosion_distance} units around Crystal Maiden, moving clockwise, then send a shard in that direction as a linear projectile. Shards deals explosion damage to a single unit.",
                lore: "Rather of spreading her magic in a big area, Rylai forces it to keep close, forming a relentless offensive barrage of drills formed by ice magic."
            },

            {
                name: "Whirlwind of Frost",
                description: "Freezing Field is no longer channeled, and is always centered around Crystal Maiden. If Crystal Maiden is disabled or issues a stop command, the effect stops.",
                lore: "To survive in the harsh world, one has to be versatile and keep on the move."
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_crystal_maiden_talent_1_debuff",
        name: "Charmed Ice",
        description: `Spell amp reduced by {${LocalizationModifierProperty.TOOLTIP}}%.`
    });

    return localization_info;
}
