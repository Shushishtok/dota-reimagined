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
        ability_classname: "reimagined_bristleback_viscous_nasal_goo",
        name: "Viscous Nasal Goo",
        description: "Covers a target in snot, causing it to have reduced armor and movement speed. Multiple casts stack and refresh the duration.",
        reimagined_effects:
        [
            {
                title: "Sneezer Pound",
                description: "When attacking an enemy unit, grants a ${sneezer_pound_chance}% chance to automatically cast Nasal Goo on it for free, regardless of current cooldown and mana."
            },

            {
                title: "Running Nose",
                description: "Units afflicted with at least ${running_nose_stacks_threshold} stacks of Nasal Goo sneeze every ${running_nose_sneeze_interval} seconds, sending Nasal Goo projectiles towards their allies in ${running_nose_radius} radius of them."
            },

            {
                title: "Raging Snot",
                description: "If Bristleback has at least ${raging_snot_warpath_stacks} Warpath stacks, Nasal Goo refreshes its cooldown immediately when cast. Has an internal cooldown of ${raging_snot_internal_cooldown} seconds."
            }
        ],
        lore: "Having caught a cold while stuck in the snow, Bristleback turns it to his advantage.",
        scepter_description: "Viscous Nasal Goo becomes a no target area of effect ability, applying to all enemies within range. Increases Stack Limit to ${stack_limit_scepter}.",
        ability_specials:
        [
            {
                ability_special: "goo_duration",
                text: "DURATION"
            },

            {
                ability_special: "base_armor",
                text: "BASE ARMOR LOSS"
            },

            {
                ability_special: "armor_per_stack",
                text: "ARMOR LOSS PER STACK"
            },

            {
                ability_special: "base_move_slow",
                text: "BASE MOVEMENT SLOW",
                percentage: true
            },

            {
                ability_special: "move_slow_per_stack",
                text: "MOVE SLOW PER STACK",
                percentage: true
            },

            {
                ability_special: "stack_limit",
                text: "STACK LIMIT"
            },

            {
                ability_special: "radius_scepter",
                text: "SCEPTER RADIUS"
            },

            {
                ability_special: "stack_limit_scepter",
                text: "SCEPTER STACK LIMIT"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_bristleback_nasal_goo_debuff",
        name: "Viscous Nasal Goo",
        description: `Losing {${LocalizationModifierProperty.PHYSICAL_ARMOR_BONUS}} armor and slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_bristleback_quill_spray",
        name: "Quill Spray",
        description: "Sprays enemy units with quills dealing damage in an area of effect around Bristleback. Deals bonus damage for every time a unit was hit by Quill Spray in the last ${quill_stack_duration} seconds.",
        reimagined_effects:
        [
            {
                title: "Needle Spreader",
                description: "Quill Spray can be set to auto cast. When cast with auto cast, Bristleback continually sprays quills around him, firing a wave of quills every ${needle_spreader_interval} seconds for a total of ${needle_spreader_total_instances} waves. Increases Quill Spray's mana cost to ${needle_spreader_manacost} and cooldown to ${needle_spreader_cooldown}. Bristleback is rooted and disarmed during the effect."
            },

            {
                title: "Spiked Edge",
                description: "If an enemy is closer than ${spiked_edge_distance} units to Bristleback, the damage dealt to it increases by ${spiked_edge_damage_bonus_pct}%."
            },

            {
                title: "Raging Quills",
                description: "Casting Quill Spray while Bristleback has at least 5 stacks of Warpath multiplies Quill Spray's radius by ${raging_quills_radius_multiplier}, and the projectile speed increases by ${raging_quills_projectile_speed_bonus_pct}%."
            }
        ],
        lore: "An enforcer's honor can be a prickly thing. So can his quills.",
        notes:
        [
            "Quill Spray damage is not reduced by damage block abilities.",
            "Spiked Edge's damage increase is still capped under the maximum damage cap."
        ],
        ability_specials:
        [
            {
                ability_special: "radius",
                text: "RADIUS"
            },

            {
                ability_special: "quill_base_damage",
                text: "QUILL BASE DAMAGE"
            },

            {
                ability_special: "quill_stack_damage",
                text: "QUILL STACK DAMAGE"
            },

            {
                ability_special: "quill_stack_duration",
                text: "STACK DURATION"
            },

            {
                ability_special: "max_damage",
                text: "MAX DAMAGE"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_bristleback_quill_spray_stacks",
        name: "Quill Spray",
        description: `Each stack increases damage taken from Quill Spray by {${LocalizationModifierProperty.TOOLTIP}}.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_bristleback_quill_spray_needle_spreader",
        name: "Needle Spreader",
        description: `Rooted and disarmed. Firing a wave of quills at nearby enemies every {f${LocalizationModifierProperty.TOOLTIP}} seconds.`
    });

    Abilities.push({
        ability_classname: "reimagined_bristleback_bristleback",
        name: "Bristleback",
        description: "Bristleback takes less damage if hit on the sides or rear. If Bristleback takes ${quill_release_threshold} damage from the rear, he releases a Quill Spray of the current level.",
        reimagined_effects:
        [
            {
                title: "Turtleback",
                description: "When Bristleback takes damage from the rear, the damage reduction granted by the ability increases by ${turtleback_back_dmg_reduction}% per damage instance, or by ${turtleback_side_dmg_reduction}% if the damage was taken from the side. This bonus resets when being attacked from the front, or after Bristleback doesn't take damage for ${turtleback_reset_time} seconds."
            },

            {
                title: "Moving Fortress",
                description: "Can be toggled on to apply the damage reduction from the rear to the sides and grant an additional ${moving_fortress_damage_reduction_bonus}% damage reduction. However, Bristleback is slowed by ${moving_fortress_move_slow_pct}% move speed and ${moving_fortress_attack_speed_slow} attack speed while this effect is active."
            },

            {
                title: "Prickly Sensations",
                description: "Damage done to enemies by Quill Spray also adds ${prickly_sensations_trigger_pct}% of it to the threshold counter."
            }
        ],
        lore: "Turning his back to a fight might be just the thing.",
        notes:
        [
            "Bristleback's rear is considered to be within ${back_angle} degrees from the back.",
            "Bristleback's side is considered to be within ${side_angle} degrees from the back.",
            "Prickly Sensations can immediately trigger an additional Quill Spray burst if the damage counter goes through the threshold."
        ],

        ability_specials:
        [
            {
                ability_special: "side_damage_reduction",
                text: "SIDE DAMAGE REDUCTION",
                percentage: true
            },

            {
                ability_special: "back_damage_reduction",
                text: "BACK DAMAGE REDUCTION",
                percentage: true
            },

            {
                ability_special: "quill_release_threshold",
                text: "DAMAGE THRESHOLD"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_bristleback_bristleback_moving_fortress",
        name: "Moving Fortress",
        description: `Uses back's damage reduction values for attacks on the side. Slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% movespeed and {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}} attack speed, but gains {${LocalizationModifierProperty.TOOLTIP}}% additional bonus damage reduction.`
    });

    Abilities.push({
        ability_classname: "reimagined_bristleback_warpath",
        name: "Warpath",
        description: "Bristleback works himself up into a fury every time he casts a spell, increasing his movement speed and damage.",
        reimagined_effects:
        [
            {
                title: "Simmer Down",
                description: "Warpath can be activated to consume all current Warpath stacks. Each stack consumed grants Bristleback ${simmer_down_damage_resistance_bonus_per_stack}% damage resistance from all directions for ${simmer_down_duration} seconds. While Simmer Down is active, Warpath stacks cannot be generated."
            },

            {
                title: "Anger Burst",
                description: "When Bristleback accumulates over ${anger_burst_damage_threshold} damage after reductions, he generates a Warpath stack. The damage counter resets after not taking any damage over ${anger_burst_reset_time} seconds."
            },

            {
                title: "Tantrum",
                description: "Warpath's stack count can keep increasing above the maximum limit. However, those additional stacks only last for ${tantrum_stack_duration} seconds and provide ${tantrum_stack_bonuses_pct}% of the bonuses."
            }
        ],
        lore: "'Temper, temper,' his mum always chided.  But in a fight, a temper can come in handy.",
        notes:
        [
            "Bristleback's illusions will receive the bonuses.",
            "Items will not trigger Warpath.",
            "Anger Burst will not accumulate stacks when Bristleback's passives are broken, or while Simmer Down is active."
        ],
        ability_specials:
        [
            {
                ability_special: "damage_per_stack",
                text: "DAMAGE PER STACK"
            },

            {
                ability_special: "move_speed_per_stack",
                text: "MOVEMENT PER STACK",
                percentage: true
            },

            {
                ability_special: "stack_duration",
                text: "STACK DURATION",
            },

            {
                ability_special: "max_stacks",
                text: "MAX STACKS"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_bristleback_warpath",
        name: "Warpath",
        description: `Moving {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% faster and dealing {${LocalizationModifierProperty.PREATTACK_BONUS_DAMAGE}} bonus damage.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_bristleback_warpath_passive",
        name: "Anger Burst Counter",
        description: `Taking {${LocalizationModifierProperty.TOOLTIP}} accumulated damage generates a Warpath stack.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_bristleback_warpath_simmer_down",
        name: "Simmer Down",
        description: `Increases damage resistance from all directions by {${LocalizationModifierProperty.INCOMING_DAMAGE_PERCENTAGE}}%, but cannot generate Warpath stacks while this buff is active.`
    });

    Abilities.push({
        ability_classname: "reimagined_bristleback_hairball",
        name: "Hairball",
        description: "Coughs a quill-packed hairball towards the target location. Erupts at the location, hitting enemies in ${radius} radius with ${nasal_goo_count} Nasal Goos and ${quill_spray_count} Quill Sprays."
    });

    Talents.push({
        talent_classname: "reimagined_bristleback_talent",
        talents:
        [
            {
                name: "Mucus Goo",
                description: "Each Viscous Nasal Goo projectile that hits its target increases the stack count of its Quill Spray's debuff by ${stacks}. Adds the debuff if it does not exist yet on the target.",
                lore: "Rigwarl spits a goo made of mucus that has weakening properties on his adversaries which mesh well with his quills."
            },

            {
                name: "Snot Artillery",
                description: "Increases Viscous Nasal Goo's cast range, or search range, by ${cast_range_bonus_per_stack} per Warpath stack.",
                lore: "The more deteremined Bristleback is, the further he can spit."
            },

            {
                name: "Quillgun",
                description: "When there is only one enemy in the cast range, fires additional ${additional_quills} quills at that enemy. Those quills do not increase the debuff's stack count, but do bonus damage based on it.",
                lore: "When focusing on a single enemy, Rigwarl learned to focus all his quills towards it to maximize the damage it can cause."
            },

            {
                name: "Drill Quills",
                description: "Quill Spray's stacks no longer have an independent duration, and each stack added refreshes the entire modifier.",
                lore: "Reinforcing Rigwal's quills, he makes sure they pierce and hold on even when his targets are riddled with them."
            },

            {
                name: "Bristlefront",
                description: "While Moving Fortress is active, ${damage_taken_to_threshold_pct}% of damage taken from the front and the sides also counts toward the passive Quill Spray damage trigger.",
                lore: "Rigwarl turns himself into a truly impenetrable fortress that fires at anyone who tries to barge in."
            },

            {
                name: "Barbed Exterior",
                description: "Attackers that hit Bristleback on the back have ${damage_reflection_pct}% of their own damage before reductions reflected back at them. This damage is flagged as reflection damage.",
                lore: "Rigwarl grows tiny quills on his rear that hurt anyone who tries to hit him from the back."
            },

            {
                name: "Hot Temper",
                description: "When Warpath's Anger Burst procs, Bristleback also gains ${attack_speed_bonus} attack speed for ${duration} seconds.",
                lore: "When Rigwarl gets angry, he mauls and maims everyone around him."
            },

            {
                name: "Persistent Brawler",
                description: "Simmer Down also grants ${cooldown_reduction_per_stack}% cooldown reduction per Warpath stack consumed, up to a maximum of ${max_cooldown_reduction}% cooldown reduction.",
                lore: "Sometimes, it is when one is calm that it is the most fearsome."
            }
        ]
    });

    return localization_info;
}
