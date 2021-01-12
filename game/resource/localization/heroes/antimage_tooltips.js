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
    Abilities.push({
        ability_classname: "reimagined_antimage_mana_break",
        name: "Mana Break",
        description: "Burns an opponent's mana on each attack based on a flat amount and the target's max mana. Mana Break deals ${percent_damage_per_burn}% of the mana burned as damage to the target.",
        reimagined_effects: [
            {
                title: "Mana Cleave",
                description: "Also burns ${mana_cleave_mana_burn} mana for all enemy units in ${mana_cleave_distance} radius in a cone in front of Anti Mage, but does not deal damage."
            },
            {
                title: "Mana Convergence",
                description: "When an enemy unit is hit ${mana_convergence_hit_threshold} times with Mana Break, Mana Convergence triggers for ${mana_convergence_debuff_duration} seconds, reducing the target's manaloss reduction by ${mana_convergence_manaloss_reduction_pct}%."
            },
            {
                title: "Energy Blast",
                description: "Mana Break can be activated to trigger an Energy Blast, burning up to ${energy_blast_max_mana_burn} mana to all enemies in {energy_blast_radius} range and dealing ${percent_damage_per_burn}% of it as magical damage. Disables Mana Break's passive effects for ${energy_blast_passive_disable_duration} seconds after use."
            }
        ],
        lore: "A modified technique of the Turstarkuri monks' peaceful ways is to turn magical energies on their owner.",
        notes: [
            "Illusions can trigger Mana Break and its additional effects, but burn ${illusion_percentage}% less mana on each attack.",
            "Mana Cleave has a starting width of ${mana_cleave_starting_width} and an ending width of ${mana_cleave_end_width}. It also excludes the main target.",
            "Mana Convergence's stacking debuff lasts ${mana_convergence_hit_duration} seconds. While the target already has the triggered debuff, the stacking debuff will not increase stacks."
        ],
        ability_specials: [
            {
                ability_special: "mana_per_hit",
                text: "MANA BURNED PER HIT"
            },
            {
                ability_special: "mana_per_hit_pct",
                text: "MAX MANA BURNED PER HIT",
                percentage: true
            },
        ],
        language_overrides: [
            {
                language: localizationInterfaces_1.Language.Russian,
                description_override: "This Is The Ability Description In Russian",
                reimagined_effects_override: [
                    {
                        title: "This Is The reimagined effect title In Russian",
                        description: "This Is The reimagined effect description In Russian"
                    }
                ],
                lore_override: "This Is The Ability lore In Russian",
                notes_override: ["This Is The Ability notes In Russian"],
                scepter_description_override: "This Is The scepter Description In Russian",
                shard_description_override: "This Is The shard Description In Russian",
                ability_specials_override: [
                    {
                        ability_special: "mana_per_hit",
                        text: "ManaPerHitInRussian"
                    }
                ]
            },
            {
                language: localizationInterfaces_1.Language.SChinese,
                name_override: "This is a name in Chinese",
                description_override: "Blah blah blah",
            }
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_mana_break_mana_convergence_counter",
        name: "Mana Convergence Counter",
        description: "Mana Convergence will be applied on you when the threshold is reached."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_mana_convergence_debuff",
        name: "Mana Convergence",
        description: "Manaloss Reduction reduced by {" + "MODIFIER_PROPERTY_MANACOST_PERCENTAGE_STACKING" /* MANACOST_PERCENTAGE_STACKING */ + "}%."
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_mana_break_disable",
        name: "Mana Break Disabled",
        description: "Energy Blast was triggered, disabling Mana Break for the duration of this modifier."
    });
    Abilities.push({
        ability_classname: "reimagined_antimage_blink",
        name: "Blink",
        description: "Short distance teleportation that allows Anti-Mage to move in and out of combat.",
        reimagined_effects: [
            {
                title: "Reaction",
                description: "Causes nearby enemies to trigger a stop command upon blinking ${reaction_radius} radius near them."
            },
            {
                title: "Interference",
                description: "Removes ${interference_curr_mana_rdct_pct}% of the target's current mana in ${interference_radius} radius around the start and end positions. Deals the amount of mana burned as physical damage to affected enemies."
            },
            {
                title: "Magic Nullity",
                description: "Increases the caster's magic resistance by ${magic_nullity_magic_res}% for ${magic_nullity_duration} seconds after blinking."
            }
        ],
        lore: "In his encounter with the Dead Gods, Anti-Mage learned the value of being elusive.",
        notes: [
            "Using Blink disjoints incoming projectiles."
        ],
        ability_specials: [
            {
                ability_special: "blink_range",
                text: "BLINK RANGE"
            }
        ],
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_blink_magic_nullity",
        name: "Magic Nullity",
        description: "Magic resistance increased by {" + "MODIFIER_PROPERTY_MAGICAL_RESISTANCE_BONUS" /* MAGICAL_RESISTANCE_BONUS */ + "}%."
    });
    Abilities.push({
        ability_classname: "reimagined_antimage_counterspell",
        name: "Counterspell",
        description: "Passively grants you magic resistance. Can be activated to create an anti-magic shell around you that sends any targeted spells back towards enemies instead of affecting you.",
        reimagined_effects: [
            {
                title: "The Magic Ends Here",
                description: "Burns ${magic_ends_mana_burn} mana of the original casters of reflected spells."
            },
            {
                title: "Anti Magic Shell",
                description: "Increases Counterspell's current duration by ${anti_magic_duration_inc} second for every reflected spell."
            },
            {
                title: "Instinctive Counter",
                description: "Counterspell can be set to auto cast, allowing it to trigger automatically whenever an ability is fired towards the caster. However, automatic triggers consume ${instinctive_counter_trigger_multiplier} times the cooldown and the mana cost of Counterspell."
            }
        ],
        lore: "With the proper focus, Anti-Mage turns innate resistance into calculated retaliation.",
        notes: [
            "Instinctive Counter will not trigger if the expected amount of mana to be consumed is higher than your current mana.",
            "Even when the auto cast is on, manually activating Counterspell will consume the original mana cost and cooldown."
        ],
        shard_description: "Successful Counterspell creates an illusion attacking the caster for ${shard_illusion_duration} seconds. Removes Counterspell manacost.",
        ability_specials: [
            {
                ability_special: "magic_resistance",
                text: "MAGIC RESISTANCE",
                percentage: true
            },
            {
                ability_special: "duration",
                text: "DURATION"
            }
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_counterspell_active",
        name: "Counterspell Shield",
        description: "Causes all spells that target you to be blocked and reflected onto the enemy."
    });
    Abilities.push({
        ability_classname: "reimagined_antimage_mana_void",
        name: "Mana Void",
        description: "For each point of mana missing by the target unit, damage is dealt to it and surrounding enemies. The main target is also mini-stunned.",
        reimagined_effects: [
            {
                title: "Void Feedback",
                description: "If the main target has less than ${void_feedback_mana_threshold_pct}% of its max mana, the damage per mana point is multiplied by ${void_feedback_damage_multiplier}."
            },
            {
                title: "Calculated Combustion",
                description: "Calculates the damage based on the enemy unit missing the most mana in the radius."
            },
            {
                title: "Purity of Will",
                description: "Can be set to auto cast. Doing so causes the spell to only deal damage on the main target, but also to increase the stun it receives by ${purity_of_will_stun_per_instance} for every ${purity_of_will_missing_mana_for_instance} points of missing mana, up to a limit of ${purity_of_will_max_stun_increased} additional seconds."
            }
        ],
        lore: "After bringing enemies to their knees, Anti-Mage punishes them for their use of the arcane arts.",
        notes: [
            "The stun passes through spell immunity.",
            "Purity of Will's stun duration slightly increases by each point of missing mana, even if it doesn't reach an instance of ${purity_of_will_missing_mana_for_instance} mana."
        ],
        ability_specials: [
            {
                ability_special: "mana_void_damage_per_mana",
                text: "DAMAGE"
            },
            {
                ability_special: "mana_void_ministun",
                text: "STUN DURATION"
            },
            {
                ability_special: "mana_void_aoe_radius",
                text: "RADIUS"
            }
        ]
    });
    Abilities.push({
        ability_classname: "reimagined_antimage_mana_overload",
        name: "Blink Fragment",
        description: "Blinks an illusion at the target enemy or location and attack them for ${duration} seconds. Counterspell is replicated on the Blink Fragment illusion."
    });
    Talents.push({
        talent_classname: "reimagined_antimage_talent",
        talents: [
            {
                name: "Feedback Pulse",
                description: "Energy Blast now triggers a total of ${total_waves} waves, each being applied ${wave_interval} seconds one after another. All waves after the initial wave only deal and burn ${mana_burn_pct_wave}% the regular amount.",
                lore: "Knowing that causing feedback on his enemies can turn the tides of battle, Magina mastered a technique that allows him to release even the smallest pockets of energies that reside within his body."
            },
            {
                name: "Flowing Void",
                description: "If the target has no mana after being struck with Mana Break, Mana Break now deals pure damage to the target equals to ${pure_dmg_pct}% of the total mana burn on the target.",
                lore: "With all of his enemy's magical energies depleted, Magina utilizes that advantages and punishes it for its use of magic."
            },
            {
                name: "Nullifier of Magic",
                description: "Blink's Magic Nullity now increases your magic resistance to ${magic_resist}% and status resistance by ${status_resist}% for its duration.",
                lore: "Learning to shrug off magic aimed at you is important in your step of winning battles against mages."
            },
            {
                name: "Overblink",
                description: "Blink can now be set to auto cast. Multiplies Blink's max blink range by ${cast_range_increase}, but causes Anti Mage to be stunned for up to ${max_stun} seconds after blinking a distance above its the regular range. The stun scales by ${stun_per_units} seconds for every ${units_interval} units above the regular range.",
                lore: "Sometimes the situation is so dire that Anti Mage must move himself away as far as possible, but doing so expands so much energy, leaving him exposed until he regains his senses."
            },
            {
                name: "Abolish Magic",
                description: "Counterspell's The Magic Ends Here now also silences the caster for ${silence_duration} seconds after reflecting a spell towards it. Can apply multiple times for all reflected spells.",
                lore: "Punishing those who dare cast magic on him, Anti Mage not only make them suffer from it, but also makes them vulnerable and helpless."
            },
            {
                name: "Magic Cannot Harm Me!",
                description: "Magic resistance increases by ${magic_resist_stack}% for each enemy unit target spell that was reflected by Counterspell. Lasts ${duration} seconds. Stacks and refreshes itself.",
                lore: "Not only Anti Mage is able to become essentially invulnerable to most kinds of magic while exuding that force, but it also keeps him from harm even after it dissipates."
            },
            {
                name: "Void of Emptyness",
                description: "Void Feedback now deals ${multiplier} times the damage when the target has less than ${mana_threshold}% of its max mana. Overrides Void Feedback's damage.",
                lore: "With the target almost completely drained of mana, Magina uses his ultimate technique to its utmost potential."
            },
            {
                name: "Violent Circuits",
                description: "Mana Void adds ${max_mana_pct}% of the main target's max mana to the damage calculation.",
                lore: "Disrupting the natural flow of mana in his enemies, Anti Mage flips their own magic against them."
            }
        ]
    });
    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_talent_6_buff",
        name: "Magic Cannot Harm Me!",
        description: "Magic resistance increased by {" + "MODIFIER_PROPERTY_MAGICAL_RESISTANCE_BONUS" /* MAGICAL_RESISTANCE_BONUS */ + "}%."
    });
    return localization_info;
}
exports.GenerateLocalizationData = GenerateLocalizationData;
