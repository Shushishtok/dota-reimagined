"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationCompiler = void 0;
var fs = __importStar(require("fs"));
var LocalizationCompiler = /** @class */ (function () {
    function LocalizationCompiler() {
        this.AbilityArray = new Array();
        this.ModifierArray = new Array();
        this.StandardArray = new Array();
        this.addon_english_filepath = "game/resource/addon_english.txt";
    }
    LocalizationCompiler.prototype.TransformForLocalization = function (text, modifier) {
        if (modifier) {
            return text.replace(/\{([^f]\w+)\}([^%])/g, "%d$1%$2").replace(/\{([^f]\w+)\}%/g, "%d$1%%%").replace(/\{f(\w+)\}([^%])/g, "%f$1%$2").replace(/\{f(\w+)\}%/g, "%f$1%%%");
        }
        else {
            return text.replace(/\${(\w*)}([^%])/g, "%$1%$2").replace(/\${(\w*)}%/g, "%$1%%%");
        }
    };
    LocalizationCompiler.prototype.OnLocalizationDataChanged = function () {
        var _this = this;
        console.log("Localization event fired");
        this.GenerateLocalizationData();
        console.log("Localization data generated");
        // Open addon_english.txt
        fs.truncate(this.addon_english_filepath, function () {
            // Add the opening tokens
            var localization_content = '"lang"\n{\n\t"Language" "English"\n\t"Tokens"\n\t{\n';
            // Go over standard tooltips
            for (var _i = 0, _a = _this.StandardArray; _i < _a.length; _i++) {
                var standardLocalization = _a[_i];
                localization_content += "\t\t\"" + standardLocalization.classname + "\" \"" + standardLocalization.name + "\"";
                localization_content += "\n";
            }
            // Go over abilities
            for (var _b = 0, _c = _this.AbilityArray; _b < _c.length; _b++) {
                var ability = _c[_b];
                // Ability name
                var ability_string = "\t\t\"DOTA_Tooltip_Ability_" + ability.ability_classname;
                localization_content += ability_string + "\" \"" + ability.name + "\"";
                localization_content += "\n";
                // Ability description
                var ability_description = _this.TransformForLocalization(ability.description, false);
                localization_content += ability_string + "_description\" \"" + ability_description + "\"";
                localization_content += "\n";
                // Reimagined effects, if any
                if (ability.reimagined_effects) {
                    var counter = 1;
                    for (var _d = 0, _e = ability.reimagined_effects; _d < _e.length; _d++) {
                        var reimagined_effect = _e[_d];
                        // Reimagined title
                        localization_content += ability_string + "_rmg_title_" + counter + "\" \"" + reimagined_effect.title + "\"";
                        localization_content += "\n";
                        // Reimagined description
                        var reimagined_effect_description = _this.TransformForLocalization(reimagined_effect.description, false);
                        localization_content += ability_string + "_rmg_description_" + counter + "\" \"" + reimagined_effect_description + "\"";
                        localization_content += "\n";
                        counter++;
                    }
                }
                // Lore
                if (ability.lore) {
                    var ability_lore = _this.TransformForLocalization(ability.lore, false);
                    localization_content += ability_string + "_Lore\" \"" + ability_lore + "\"";
                    localization_content += "\n";
                }
                // Notes
                if (ability.notes) {
                    var counter = 0;
                    for (var _f = 0, _g = ability.notes; _f < _g.length; _f++) {
                        var note = _g[_f];
                        var transformed_note = _this.TransformForLocalization(note, false);
                        localization_content += ability_string + "_Note" + counter + "\" \"" + transformed_note + "\"";
                        localization_content += "\n";
                        counter++;
                    }
                }
                // Scepter
                if (ability.scepter_description) {
                    var ability_scepter_description = _this.TransformForLocalization(ability.scepter_description, false);
                    localization_content += ability_string + "_scepter_description\" \"" + ability_scepter_description + "\"";
                    localization_content += "\n";
                }
                // Shard
                if (ability.shard_description) {
                    var ability_shard_description = _this.TransformForLocalization(ability.shard_description, false);
                    localization_content += ability_string + "_shard_description\" \"" + ability_shard_description + "\"";
                    localization_content += "\n";
                }
                // Ability specials
                if (ability.ability_specials) {
                    for (var _h = 0, _j = ability.ability_specials; _h < _j.length; _h++) {
                        var ability_special = _j[_h];
                        // Construct the ability special
                        var ability_special_text = "";
                        if (ability_special.percentage) {
                            ability_special_text = "%";
                        }
                        else if (ability_special.item_stat) {
                            ability_special_text = "+$";
                        }
                        ability_special_text += ability_special.text.toUpperCase();
                        localization_content += ability_string + "_" + ability_special.ability_special + "\" \"" + ability_special_text + ":\"";
                        localization_content += "\n";
                    }
                }
            }
            // Go over modifiers
            for (var _k = 0, _l = _this.ModifierArray; _k < _l.length; _k++) {
                var modifier = _l[_k];
                var modifier_string = "\t\t\"DOTA_Tooltip_" + modifier.modifier_classname;
                // Name
                localization_content += modifier_string + "\" \"" + modifier.name + "\"";
                localization_content += "\n";
                // Description
                if (modifier.description) {
                    // Add to localization string
                    var modifier_description = _this.TransformForLocalization(modifier.description, true);
                    localization_content += modifier_string + "_description\" \"" + modifier_description + "\"";
                    localization_content += "\n";
                }
            }
            // Add the closing token
            localization_content += '\t}\n}';
            // Write to the file
            fs.writeFile(_this.addon_english_filepath, localization_content, function () { console.log("Done!"); });
            console.log("Wrote to file");
        });
    };
    LocalizationCompiler.prototype.GenerateLocalizationData = function () {
        //#region Generic localization
        this.StandardArray.push({
            classname: "addon_game_name",
            name: "Dota Reimagined"
        });
        this.StandardArray.push({
            classname: "DOTA_Reimagined_Talent_Learned",
            name: "Talent learned"
        });
        this.StandardArray.push({
            classname: "DOTA_Reimagined_Talent_Can_Be_Learned",
            name: "Talent can be learned"
        });
        this.StandardArray.push({
            classname: "DOTA_Reimagined_Talent_Not_Learned",
            name: "Talent not yet learned"
        });
        this.StandardArray.push({
            classname: "DOTA_Reimagined_Talent_Cannot_Be_Learned",
            name: "Talent cannot be learned"
        });
        this.StandardArray.push({
            classname: "DOTA_Reimagined_Talent_Ping_Enemy",
            name: "Enemy"
        });
        this.StandardArray.push({
            classname: "DOTA_Reimagined_Talent_Ping_Ally",
            name: "Ally"
        });
        this.StandardArray.push({
            classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web",
            name: "Caster doesn't have the Spin Web ability"
        });
        this.StandardArray.push({
            classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_spin_web_unleveled",
            name: "Spin Web is not yet leveled"
        });
        this.StandardArray.push({
            classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charge_modifier",
            name: "No charges modifier exists for Spin Web"
        });
        this.StandardArray.push({
            classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charges",
            name: "Not enough Spin Web charges to consume"
        });
        this.StandardArray.push({
            classname: "DOTA_Tooltip_cast_error_cast_on_roshan",
            name: "Ability cannot be cast on Roshan"
        });
        this.StandardArray.push({
            classname: "DOTA_Tooltip_cast_error_cast_on_player_controlled_units",
            name: "Ability cannot be cast on player controlled units"
        });
        //#endregion
        //#region Generic modifiers
        this.ModifierArray.push({
            modifier_classname: "modifier_reimagined_charges",
            name: "Charges",
            description: "Can cast this ability whenever there are charges available. A charge is refreshed every {" + "MODIFIER_PROPERTY_TOOLTIP" /* TOOLTIP */ + "} seconds."
        });
        //#endregion
        //#region Anti Mage
        this.AbilityArray.push({
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
            ]
        }),
            this.ModifierArray.push({
                modifier_classname: "modifier_reimagined_antimage_mana_break_mana_convergence_counter",
                name: "Mana Convergence Counter",
                description: "Mana Convergence will be applied on you when the threshold is reached."
            });
        this.ModifierArray.push({
            modifier_classname: "modifier_reimagined_antimage_mana_convergence_debuff",
            name: "Mana Convergence",
            description: "Manaloss Reduction reduced by {" + "MODIFIER_PROPERTY_MANACOST_PERCENTAGE_STACKING" /* MANACOST_PERCENTAGE_STACKING */ + "}%."
        });
        this.ModifierArray.push({
            modifier_classname: "modifier_reimagined_antimage_mana_break_disable",
            name: "Mana Break Disabled",
            description: "Energy Blast was triggered, disabling Mana Break for the duration of this modifier."
        });
        this.AbilityArray.push({
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
        this.ModifierArray.push({
            modifier_classname: "modifier_reimagined_antimage_blink_magic_nullity",
            name: "Magic Nullity",
            description: "Magic resistance increased by {" + "MODIFIER_PROPERTY_MAGICAL_RESISTANCE_BONUS" /* MAGICAL_RESISTANCE_BONUS */ + "}%."
        });
        this.AbilityArray.push({
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
        this.ModifierArray.push({
            modifier_classname: "modifier_reimagined_antimage_counterspell_active",
            name: "Counterspell Shield",
            description: "Causes all spells that target you to be blocked and reflected onto the enemy."
        });
        this.AbilityArray.push({
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
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_mana_overload",
            name: "Blink Fragment",
            description: "Blinks an illusion at the target enemy or location and attack them for ${duration} seconds. Counterspell is replicated on the Blink Fragment illusion."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_1",
            name: "Feedback Pulse",
            description: "Energy Blast now triggers a total of ${total_waves} waves, each being applied ${wave_interval} seconds one after another. All waves after the initial wave only deal and burn ${mana_burn_pct_wave}% the regular amount.",
            lore: "Knowing that causing feedback on his enemies can turn the tides of battle, Magina mastered a technique that allows him to release even the smallest pockets of energies that reside within his body."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_2",
            name: "Flowing Void",
            description: "If the target has no mana after being struck with Mana Break, Mana Break now deals pure damage to the target equals to ${pure_dmg_pct}% of the total mana burn on the target.",
            lore: "With all of his enemy's magical energies depleted, Magina utilizes that advantages and punishes it for its use of magic."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_3",
            name: "Nullifier of Magic",
            description: "Blink's Magic Nullity now increases your magic resistance to ${magic_resist}% and status resistance by ${status_resist}% for its duration.",
            lore: "Learning to shrug off magic aimed at you is important in your step of winning battles against mages."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_4",
            name: "Overblink",
            description: "Blink can now be set to auto cast. Multiplies Blink's max blink range by ${cast_range_increase}, but causes Anti Mage to be stunned for up to ${max_stun} seconds after blinking a distance above its the regular range. The stun scales by ${stun_per_units} seconds for every ${units_interval} units above the regular range.",
            lore: "Sometimes the situation is so dire that Anti Mage must move himself away as far as possible, but doing so expands so much energy, leaving him exposed until he regains his senses."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_5",
            name: "Abolish Magic",
            description: "Counterspell's The Magic Ends Here now also silences the caster for ${silence_duration} seconds after reflecting a spell towards it. Can apply multiple times for all reflected spells.",
            lore: "Punishing those who dare cast magic on him, Anti Mage not only make them suffer from it, but also makes them vulnerable and helpless."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_6",
            name: "Magic Cannot Harm Me!",
            description: "Magic resistance increases by ${magic_resist_stack}% for each enemy unit target spell that was reflected by Counterspell. Lasts ${duration} seconds. Stacks and refreshes itself.",
            lore: "Not only Anti Mage is able to become essentially invulnerable to most kinds of magic while exuding that force, but it also keeps him from harm even after it dissipates."
        });
        this.ModifierArray.push({
            modifier_classname: "modifier_reimagined_antimage_talent_6_buff",
            name: "Magic Cannot Harm Me!",
            description: "Magic resistance increased by {" + "MODIFIER_PROPERTY_MAGICAL_RESISTANCE_BONUS" /* MAGICAL_RESISTANCE_BONUS */ + "}%."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_7",
            name: "Void of Emptyness",
            description: "Void Feedback now deals ${multiplier} times the damage when the target has less than ${mana_threshold}% of its max mana. Overrides Void Feedback's damage.",
            lore: "With the target almost completely drained of mana, Magina uses his ultimate technique to its utmost potential."
        });
        this.AbilityArray.push({
            ability_classname: "reimagined_antimage_talent_8",
            name: "Violent Circuits",
            description: "Mana Void adds ${max_mana_pct}% of the main target's max mana to the damage calculation.",
            lore: "Disrupting the natural flow of mana in his enemies, Anti Mage flips their own magic against them."
        });
        //#endregion
    };
    return LocalizationCompiler;
}());
exports.LocalizationCompiler = LocalizationCompiler;
