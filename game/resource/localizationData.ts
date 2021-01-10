import { AbilityLocalization, HeroTalents, Language, LocalizationData, ModifierLocalization, StandardLocalization } from "./localizationInterfaces";

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

    //#region Generic localization
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
        language_overrides:
        [
            {
                language: Language.Russian,
                name_override: "IT CAN BE DONE!!!"
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
    //#endregion

    //#region Generic modifiers
    Modifiers.push({
        modifier_classname: "modifier_reimagined_charges",
        name: "Charges",
        description: `Can cast this ability whenever there are charges available. A charge is refreshed every {${LocalizationModifierProperty.TOOLTIP}} seconds.`,
        language_overrides:
        [
            {
                language: Language.Russian,
                description_override: `Может использовать эту способность всякий раз, когда есть заряды. Заряд обновляется каждые {${LocalizationModifierProperty.TOOLTIP}} секунды`
            }
        ]
    });
    //#endregion

    //#region Anti Mage
    Abilities.push({
        ability_classname: "reimagined_antimage_mana_break",
        name: "Mana Break",
        description: "Burns an opponent's mana on each attack based on a flat amount and the target's max mana. Mana Break deals ${percent_damage_per_burn}% of the mana burned as damage to the target.",
        reimagined_effects:
        [
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
        notes:
        [
            "Illusions can trigger Mana Break and its additional effects, but burn ${illusion_percentage}% less mana on each attack.",
            "Mana Cleave has a starting width of ${mana_cleave_starting_width} and an ending width of ${mana_cleave_end_width}. It also excludes the main target.",
            "Mana Convergence's stacking debuff lasts ${mana_convergence_hit_duration} seconds. While the target already has the triggered debuff, the stacking debuff will not increase stacks."
        ],
        ability_specials:
        [
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
        language_overrides:
        [
            {
                language: Language.Russian,
                description_override: "This Is The Ability Description In Russian",
                reimagined_effects_override:
                [
                    {
                        title: "This Is The reimagined effect title In Russian",
                        description: "This Is The reimagined effect description In Russian"
                    }
                ],
                lore_override: "This Is The Ability lore In Russian",
                notes_override: ["This Is The Ability notes In Russian"],
                scepter_description_override: "This Is The scepter Description In Russian",
                shard_description_override: "This Is The shard Description In Russian",
                ability_specials_override:
                [
                    {
                        ability_special: "mana_per_hit",
                        text: "ManaPerHitInRussian"
                    }
                ]
            },

            {
                language: Language.SChinese,
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
        description: `Manaloss Reduction reduced by {${LocalizationModifierProperty.MANACOST_PERCENTAGE_STACKING}}%.`
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
        reimagined_effects:
        [
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
        notes:
        [
            "Using Blink disjoints incoming projectiles."
        ],
        ability_specials:
        [
            {
                ability_special: "blink_range",
                text: "BLINK RANGE"
            }
        ],
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_blink_magic_nullity",
        name: "Magic Nullity",
        description: `Magic resistance increased by {${LocalizationModifierProperty.MAGICAL_RESISTANCE_BONUS}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_antimage_counterspell",
        name: "Counterspell",
        description: "Passively grants you magic resistance. Can be activated to create an anti-magic shell around you that sends any targeted spells back towards enemies instead of affecting you.",
        reimagined_effects:
        [
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
        notes:
        [
            "Instinctive Counter will not trigger if the expected amount of mana to be consumed is higher than your current mana.",
            "Even when the auto cast is on, manually activating Counterspell will consume the original mana cost and cooldown."
        ],
        shard_description: "Successful Counterspell creates an illusion attacking the caster for ${shard_illusion_duration} seconds. Removes Counterspell manacost.",
        ability_specials:
        [
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
        reimagined_effects:
        [
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
        notes:
        [
            "The stun passes through spell immunity.",
            "Purity of Will's stun duration slightly increases by each point of missing mana, even if it doesn't reach an instance of ${purity_of_will_missing_mana_for_instance} mana."
        ],
        ability_specials:
        [
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
        talents:
        [
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
    })

    Modifiers.push({
        modifier_classname: "modifier_reimagined_antimage_talent_6_buff",
        name: "Magic Cannot Harm Me!",
        description: `Magic resistance increased by {${LocalizationModifierProperty.MAGICAL_RESISTANCE_BONUS}}%.`
    });
    //#endregion

    //#region Night Stalker
    Abilities.push({
        ability_classname: "reimagined_night_stalker_void",
        name: "Void",
        description: "Creates a damaging void that slows an enemy unit and deals damage. Void also mini-stuns, interrupting channeling abilities. The slowing effect lasts longer at night.",
        reimagined_effects:
        [
            {
                title: "Darkness Hungers",
                description: "Void sets targets' vision to ${vision_day} if cast during the day or to ${vision_night} if cast during the night."
            },

            {
                title: "Stalking",
                description: "Night Stalker gains a bonus of ${stalking_ms_bonus}% move speed while facing towards enemies affected by Void. Stalked enemies are visible through the fog of war."
            }
        ],
        lore: "Balanar creates a vortex of infinite night, tearing opponents violently into the eternal darkness that once was.",
        notes:
        [
            "Void does not ministun enemies during the day.",
            "Stalking requires the caster to face towards an enemy unit afflicted by Void in up to ${stalking_distance} distance and ${stalking_width} width. Stalking lasts ${stalk_interval} seconds and refreshes continually while facing towards the target; during this time, the enemy is revealed through the fog.",
            "While stalking, the caster will have a visible modifier."
        ],
        scepter_description: "Causes Void to be an AoE ability. Increases ministun duration.",
        ability_specials:
        [
            {
                ability_special: "damage",
                text: "DAMAGE"
            },

            {
                ability_special: "duration_day",
                text: "DAY DURATION"
            },

            {
                ability_special: "duration_night",
                text: "NIGHT DURATION"
            },

            {
                ability_special: "movespeed_slow",
                text: "MOVE SLOW",
                percentage: true
            },

            {
                ability_special: "attackspeed_slow",
                text: "ATTACK SLOW"
            },

            {
                ability_special: "radius_scepter",
                text: "SCEPTER AOE"
            },

            {
                ability_special: "scepter_ministun",
                text: "SCPETER STUN"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_void_stalking",
        name: "Stalking",
        description: `Stalking an enemy. Grants {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% bonus move speed.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_void_debuff",
        name: "Void",
        description: `Slows move speed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% and attack speed by %dMODIFIER_PROPERTY_ATTACKSPEED_BONUS_CONSTANT%. Vision is drastically reduced.`
    });

    Abilities.push({
        ability_classname: "reimagined_night_stalker_crippling_fear",
        name: "Crippling Fear",
        description: "Night Stalker horrifies all nearby enemies, causing them to become silenced while near him. The effect lasts longer at night.",
        reimagined_effects:
        [
            {
                title: "Roll Back The Light",
                description: "The aura's radius increases over time at a rate of ${roll_back_light_radius_inc_sec} additional units per second."
            },

            {
                title: "Crippling Crippling Fear",
                description: "Causes enemies afflicted by the silence debuff to miss ${crippling_crippling_fear_miss_rate}% of their attacks."
            },

            {
                title: "Night Terror",
                description: "May be set to autocast to fear enemies inside the aura, causing them to run away from you."
            }
        ],
        lore: "A vision of the twisted maw of Balanar etches itself into the minds of the poor souls unlucky enough to cross his path.",
        notes:
        [
            "Night Terror's fear effect does not affect AI controlled creeps as they have command overriding logic. It will work on player controlled creeps, however.",
            "Night Terror replaces the silence and the miss chance from Crippling Crippling Fear with the fear.",
            "Roll Back The Light's radius increase scales every ${roll_back_light_interval} seconds."
        ],
        ability_specials:
        [
            {
                ability_special: "duration_day",
                text: "DAY DURATION"
            },

            {
                ability_special: "duration_night",
                text: "NIGHT DURATION"
            },

            {
                ability_special: "radius",
                text: "AURA RADIUS"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_crippling_fear_aura",
        name: "Crippling Fear",
        description: "Silencing or fearing nearby enemies. The aura's radius constantly increases."
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_crippling_fear_silence_debuff",
        name: "Crippling Fear Silence",
        description: `Silenced by Crippling Fear and missing {${LocalizationModifierProperty.MISS_PERCENTAGE}}% of attacks.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_crippling_fear_fear_debuff",
        name: "Night Terror",
        description: "Running away from the caster in terror due to Crippling Fear."
    });

    Abilities.push({
        ability_classname: "reimagined_night_stalker_hunter_in_the_night",
        name: "Hunter in the Night",
        description: "Night Stalker is in his element at night, attacking and moving with great swiftness.",
        reimagined_effects:
        [
            {
                title: "Dead of Night",
                description: "Grants a bonus to Night Stalker's stats and abilities for every ${dead_of_night_interval} second interval that the current night has lasted. The bonus reaches its peak in the middle of the night and then begins to decay at the same rate. For every ${dead_of_night_interval} seconds, increases strength, agility and intelligence by ${dead_of_night_stats_per_stack}, movement speed, attack speed and damage by ${dead_of_night_bonuses_per_stack}, and Void's and Crippling Fear's durations by ${dead_of_night_durations_per_stack} seconds."
            },

            {
                title: "As Quick As a Shadow",
                description: "Unlocks movespeed limit during the night."
            },

            {
                title: "Everlasting Night",
                description: "Each natural night lasts ${everlasting_night_duration} seconds longer than the one before it."
            }
        ],
        shard_description: "During night time, Night Stalker can cast Hunter in the Night to consumes a creature, instantly killing it and restoring ${shard_max_hp_restore_pct}% of Night Stalker's maximum health and ${shard_max_mana_restore_pct}% of Night Stalker's maximum mana. Can only be cast on non-player units. Has a ${shard_cooldown} seconds cooldown.",
        notes:
        [
            "Dead of Night only triggers during natural nights. Nights caused by abilities such as Dark Ascension do not trigger Dead of Night.",
            "Dead of Night's modifier stacks show how close it is to the peak of the night, with 100 stacks signaling the peak of it.",
            "Dead of Night's duration scales with Everlasting Nights longer nights, matching the peak accordingly."
        ],
        lore: "The hunting prowess of Balanar improves as the night beckons.",
        ability_specials:
        [
            {
                ability_special: "bonus_movement_speed_pct_night",
                text: "MOVE SPEED",
                percentage: true
            },

            {
                ability_special: "bonus_attack_speed_night",
                text: "ATTACK SPEED"
            },
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_hunter_in_the_night_dead_of_night",
        name: "Dead of Night",
        description: `Increases strength, agility and intelligence by {${LocalizationModifierProperty.STATS_STRENGTH_BONUS}}, move speed, damage and attack speed by {${LocalizationModifierProperty.MOVESPEED_BONUS_CONSTANT}}, and Void's and Crippling Fear's durations by {f${LocalizationModifierProperty.TOOLTIP}} seconds.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_hunter_in_the_night_everlasting_nights",
        name: "Everlasting Nights",
        description: `Increases the duration of the next natural night by {${LocalizationModifierProperty.TOOLTIP}} seconds.`
    });

    Abilities.push({
        ability_classname: "reimagined_night_stalker_dark_ascension",
        name: "Dark Ascension",
        description: "Night Stalker smothers the sun and summons instant darkness, so that he might use his powers at their fullest. Nightstalker gains flight and bonus damage during this time. Has unobstructed vision.",
        reimagined_effects:
        [
            {
                title: "Wings Out",
                description: "Passively applies Dark Ascension's bonuses when Dead of Night's power scale is at least ${wings_out_stack_threshold} stacks. The bonus damage granted by Wings Out is ${wings_out_damage_pct}% of Dark Ascension's damage."
            }
        ],
        notes:
        [
            "Wings Out is disabled when Dark Ascension is active."
        ],
        lore: "It is a humbling sight to see when the mightiest of warriors become afraid of the dark.",
        ability_specials:
        [
            {
                ability_special: "duration",
                text: "DURATION"
            },

            {
                ability_special: "bonus_damage",
                text: "BONUS DAMAGE"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_dark_ascension_wings_out",
        name: "Wings Out",
        description: `Grants unobstructed vision, flying movement and {${LocalizationModifierProperty.PREATTACK_BONUS_DAMAGE}} bonus damage.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_dark_ascension_active",
        name: "Dark Ascension",
        description: `Grants unobstructed vision, flying movement and {${LocalizationModifierProperty.PREATTACK_BONUS_DAMAGE}} bonus damage.`
    });

    Talents.push({
        talent_classname: "reimagined_night_stalker_talent",
        talents:
        [
            {
                name: "Rip and Tear",
                description: "Each attack Night Stalker lands on an enemy affected by Void reduces its armor by ${armor_reduction}. Lasts until the Void's debuff ends.",
                lore: "Feeling hopelessness and helplessness against such horrors is not an uncommon occurrence."
            },

            {
                name: "Path to the Prey",
                description: "While stalking a target afflicted by Void, Night Stalker gains free pathing and phased movement.",
                lore: "Once the night terror has marked a target, it cannot run or hide."
            },

            {
                name: "Feed The Night",
                description: "Each enemy hero that dies while inside Crippling Fear's aura extends its duration by ${hero_duration_extend} seconds. Units extends it by ${unit_duration_extend} seconds instead.",
                lore: "Night Stalker's control over the night increases for every victim he slaughters."
            },

            {
                name: "Dreadful Creature",
                description: "Enemies that are affected by Crippling Fear for over ${application_threshold} seconds have Break applied on them and take ${incoming_damage_increase}% more damage from all sources until they lose the aura debuff.",
                lore: "Staying in close proximity to the Night Stalker for too long can spark insanity in anyone."
            },

            {
                name: "Daywalker",
                description: "During daytime, Night Stalker gains ${bonuses_pct}% of Hunter in the Dark's movement and attack speed bonuses, and gains bonus ${day_vision_bonus} day vision range.",
                lore: "By keeping a small shroud of darkness around it, Night Stalker slowly adapts to the light."
            },

            {
                name: "Sneak Through The Night",
                description: "During the night, Night Stalker is passively invisible while not in vision range of enemy heroes. Units closer than ${proximity_distance} units to Night Stalker will also reveal him. This detection occurs regardless of obstacles between Night Stalker and his enemies.",
                lore: "Night Stalker moves swiftly at night, almost undetectable. His victims can only feel his presence when he's nearby."
            },

            {
                name: "Flight Muscles",
                description: "Wings Out is applied when Night Stalker has at least ${talent_stacks_threshold} Dead of Night stacks. In addition, while Dark Ascension is active, his move speed also increases by an additional ${dark_ascension_bonus_ms_pct}%.",
                lore: "Embracing the darkness in its full glory allowed Night Stalker to spread his wings more often and use them more effectively."
            },

            {
                name: "Midnight Peak",
                description: "While Night Stalker has at least ${talent_stacks_threshold} Dead of Night stacks, grants Night Stalker ${damage_reduction_pct}% damage reduction, ${status_resist_pct}% status resistance and ${damage_amp_pct}% outgoing damage from all sources.",
                lore: "At the peak of the night, there is very little that can actually hope to face against Night Stalker."
            }
        ]
    })


    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_talent_4_debuff",
        name: "Dreadful Creature",
        description: `Broken and taking {${LocalizationModifierProperty.INCOMING_DAMAGE_PERCENTAGE}}% more damage from all sources until leaving Crippling Fear's aura.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_talent_6",
        name: "Sneak Through The Night",
        description: "Invisible until coming in vision range of nearby enemies heroes or getting too close to enemy units."
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_night_stalker_talent_8",
        name: "Midnight Peak",
        description: `Damage reduction increased by {${LocalizationModifierProperty.INCOMING_DAMAGE_PERCENTAGE}}%, status resistance increased by {${LocalizationModifierProperty.STATUS_RESISTANCE_STACKING}}% and outgoing damage from all sources increased by {${LocalizationModifierProperty.DAMAGEOUTGOING_PERCENTAGE}}%. Active as long as Dead of Night has at least {${LocalizationModifierProperty.TOOLTIP}} stacks.`
    });
    //#endregion

    //#region Sven
    Abilities.push({
        ability_classname: "reimagined_sven_storm_bolt",
        name: "Storm Hammer",
        description: "Sven unleashes his magical gauntlet that deals damage and stuns enemy units in a small area around the target.",
        reimagined_effects:
        [
            {
                title: "Strong Right",
                description: "The main projectile goes through all units in the projectile's path, dealing ${strong_right_damage} damage."
            },

            {
                title: "Momentum Punch",
                description: "For every ${momentum_punch_units_travel} units the main projectile traveled until it hit the target or was disjointed, increases the impact's AoE by ${momentum_punch_aoe_increase}."
            },

            {
               title: "Gomu Gomu No Gatling Gun",
               description: "Fires additional ${gatling_gun_count} mini-Storm Hammer projectiles in random positions next to Sven which travel forward in the direction of his target, mini-stunning and dealing ${gatling_gun_damage} damage to enemies it comes in contact with."
            }
        ],
        scepter_description: "Increases cast range and transports you along with the Storm Hammer. Gomu Gomu No Gatling Gun triggers after reaching the destination.",
        shard_description: "Storm Hammer now applies a dispel on enemies hit. This also includes enemies hit by Strong Right.",
        lore: "The Rogue Knight's iron gauntlet, taken from the school of his father, strikes his foes to their core.",
        notes:
        [
            "Strong Right has a search radius of %strong_right_radius% units. It can only hit each enemy once, and it ignores the main target.",
            "Gatling Gun projectiles spawn randomly to the right and to the left of the caster evenly on random positions between ${gatling_gun_spawn_min_distance} and ${gatling_gun_spawn_max_distance} units to the caster's side. Each projectile spawns after a ${gatling_gun_spawn_delay} seconds delay.",
            "Gatling Gun dissipates after traveling ${gatling_gun_max_distance} units without hitting anything."
        ],
        ability_specials:
        [
            {
                ability_special: "stun_duration",
                text: "DURATION"
            },

            {
                ability_special: "bolt_aoe",
                text: "RADIUS"
            },

            {
                ability_special: "cast_range_bonus_scepter",
                text: "SCEPTER BONUS CAST RANGE"
            }
        ]
    });

    Abilities.push({
        ability_classname: "reimagined_sven_great_cleave",
        name: "Great Cleave",
        description: "Sven strikes with great force, cleaving all nearby enemy units with his attack.",
        reimagined_effects:
        [
            {
                title: "Epic Cleave",
                description: "Every ${epic_cleave_attacks} attacks, Sven's attack becomes an Epic Cleave which multiplies the cleave's radius and distance by ${epic_cleave_distance_multiplier}, deals ${epic_cleave_damage_pct}% cleave damage, and ignores ${epic_cleave_armor_ignore_pct}% of the main target's armor. The counter resets after ${epic_cleave_counter_duration} seconds."
            },

            {
                title: "Overhead Slam",
                description: "Can be cast on a target position to strike the Outcast Blade, firing a fast moving shockwave that travels up to ${overhead_slam_max_distance} units. Instant attacks all targets hit by the shockwave."
            }
        ],
        lore: "The Vigil Knights still seek to reclaim the stolen Outcast Blade from Sven, a weapon capable of cutting wide swaths through lesser warriors.",
        notes:
        [
            "Great Cleave will not cleave from Storm Hammer's and Overhead Slam's instant attacks.",
            "Epic Cleave generates stacks from hitting enemies with instant attacks. However, only a real attack can trigger Epic Cleave's attack.",
            "Overhead Slam's projectile moves at ${overhead_slam_speed} speed, hitting enemies in ${overhead_slam_speed} radius around it."
        ],
        ability_specials:
        [
            {
                ability_special: "great_cleave_damage",
                text: "CLEAVE DAMAGE",
                percentage: true
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_sven_great_cleave_epic_cleave",
        name: "Epic Cleave",
        description: `After attacking {${LocalizationModifierProperty.TOOLTIP}} times, next attack will be a devastating Epic Cleave.`
    });

    Abilities.push({
        ability_classname: "reimagined_sven_warcry",
        name: "Warcry",
        description: "Sven's Warcry heartens his allied heroes for battle, increasing their armor and movement speed. Lasts ${duration} seconds.",
        reimagined_effects:
        [
            {
                title: "Heart of Valor",
                description: "Grants Sven and his allies a shield that absorbs up to ${heart_valor_current_hp_shield_pct}% of Sven's current health. Lasts until the shield is depleted or until Warcry's duration ends."
            },

            {
                title: "Chaaaaarge",
                description: "Warcry's duration is increased by ${chaaarge_duration_increase} seconds for every allied hero in the radius on cast."
            },

            {
                title: "Power Overwhelming",
                description: "When God's Strength is active, Sven and all allies affected by Warcry gain ${power_overwhelming_damage_pct}% attack damage bonus."
            }
        ],
        lore: "Calling a few lines from the Vigil Codex fortifies Sven's obedience to his rogue code. So poetic!",
        notes:
        [
            "Chaaaaarge doesn't count illusions, clones, tempest doubles or creep heroes. Only real heroes are eligible for the duration increase.",
            "Power Overwhelming's attack bonus adapts dynamically based on whether the caster's God's Strength is currently active.",
            "Only the base attack damage is increased by Power Overwhelming."
        ],
        ability_specials:
        [
            {
                ability_special: "radius",
                text: "RADIUS"
            },

            {
                ability_special: "movespeed",
                text: "BONUS SPEED",
                percentage: true
            },

            {
                ability_special: "bonus_armor",
                text: "BONUS ARMOR"
            },

            {
                ability_special: "duration",
                text: "DURATION"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_sven_warcry_buff",
        name: "Warcry",
        description: `Armor increased by {${LocalizationModifierProperty.PHYSICAL_ARMOR_BONUS}} and movement speed increased by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%. Blocks {${LocalizationModifierProperty.TOOLTIP}} damage, and if the caster has God's Strength active, also increases your damage output by {${LocalizationModifierProperty.TOOLTIP2}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_sven_gods_strength",
        name: "God's Strength",
        description: "Sven channels his rogue strength, granting bonus damage for ${duration} seconds.",
        reimagined_effects:
        [
            {
                title: "Shattering Strength",
                description: "Increases Sven's strength by ${shattering_strength_str_bonus_pct}%."
            },

            {
                title: "Buff Fish",
                description: "Passively increases Sven's next attack's damage by ${buff_fish_bonus_damage_pct}%. Has an internal cooldown of ${buff_fish_cooldown} seconds."
            },

            {
                title: "Rogue Knight",
                description: "Killing an enemy unit while in God's Strength improves the current God's Strength bonus damage percentage by ${rough_knight_unit_kill_damage_bonus}%. Hero kills grant ${rough_knight_hero_kill_damage_bonus}% instead."
            }
        ],
        lore: "With the strength that shattered the Sacred Helm, the Rogue Knight stands unopposed in melee combat.",
        notes:
        [
            "Shattering Strength adapts automatically to any change in Sven's Strength.",
            "Rough Knight represent the bonus in stacks. Does not count kills of buildings, wards, allies, illusions or clones."
        ],
        ability_specials:
        [
            {
                ability_special: "gods_strength_damage",
                text: "BONUS DAMAGE",
                percentage: true
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_sven_gods_strength",
        name: "God's Strength",
        description: `Base damage increased by {${LocalizationModifierProperty.BASEDAMAGEOUTGOING_PERCENTAGE}}%, strength increased by {${LocalizationModifierProperty.STATS_STRENGTH_BONUS}}, and adds {${LocalizationModifierProperty.TOOLTIP}}% bonus damage when attacking every {${LocalizationModifierProperty.TOOLTIP2}} seconds. Gains additional bonus damage when killing enemy units.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_sven_gods_strength_buff_fish_counter",
        name: "Buff Fish Cooldown",
        description: "Buff Fish cannot be used while in cooldown."
    });

    Talents.push({
        talent_classname: "reimagined_sven_talent",
        talents:
        [
            {
                name: "Momentum Breaker",
                description: "Momentum Punch now also increases the stun duration of the projectile by ${stun_duration} for every ${units_travel} units it traveled until reaching its destination.",
                lore: "As the Gauntlet breaks the momentum on impact, the unfortunate victims feel its acute pressure."
            },

            {
                name: "Fist Catcher",
                description: "Enemies hit by Storm Bolt's Strong Right get dragged along with it to its destination.",
                lore: "Modifying the Gauntlet to be able to catch enemies on the path and drag them was proven to be effective at decimating entire armies."
            },

            {
                name: "Quakewave",
                description: "Overhead Slam now knockbacks enemies hit up and back ${knockback_distance} units over a duration of ${knockback_duration} seconds. Units hit are stunned for a total of ${stun_duration} seconds.",
                lore: "The extreme force of the shockwave done by the Outcast Blade can throw anyone off their feet."
            },

            {
                name: "Double Swinger",
                description: "Epic Cleave can now be triggered ${total_cleave_attacks} times in succession before resetting the Epic Cleave counter.",
                lore: "Sven's flutters his sword in perfect motions, every motion shivering the cores of his opponents."
            },

            {
                name: "True Bravery",
                description: "Warcry now also basic dispels all allies on cast.",
                lore: "Inspiring himself and his allies for the cause, the team shrugs off most harmful effects and press on."
            },

            {
                name: "Rallying Cry of Strength",
                description: "Power Overwhelming now also grants allies ${strength_pct}% of Sven's current Strength while God's Strength is active. Does not include Sven himself.",
                lore: "Simply witnessing the Rogue Knight's warcry is enough to make one stronger."
            },

            {
                name: "Bodybuilder Fish",
                description: "God's Strength's Buff Fish effect becomes permanently active, regardless of God's Strength.",
                lore: "As Sven becomes stronger, he no longer has to rely on borrowed powers to deal massive damage to his adversaries."
            },

            {
                name: "God's Epic Stance",
                description: "While God's Strength is active, grants ${chance_pct}% chance on attack to immediately set Epic Cleave's counter at max stacks. Uses Psuedo Random distribution.",
                lore: "Utilizing the ultimate strength given by the gods, every swing can suddenly become the last its enemy would witness."
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_sven_talent_2_buff",
        name: "Fist Catcher",
        description: "Being dragged with Sven's Gauntlet."
    });

    //#endregion

    //#region Crystal Maiden
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
                description: "Lasts infinitely on creeps, dealing ${eternal_cold_fixed_damage%} damage per tick. Can still be dispellable."
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
    //#endregion

    //#region Phantom Assassin
    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_stifling_dagger",
        name: "Stifling Dagger",
        description: "Throws a dagger slowing the enemy unit's movement speed, dealing ${base_damage} + ${attack_factor_tooltip}% of Phantom Assassin's attack damage as physical damage and applying attack effects from items and abilities.",
        reimagined_effects:
        [
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
        notes:
        [
            "If an attack effect is chance-based, the chance of its application will be the same as its chance to occur.",
            "Spell-immune enemies are not affected by Stifling Dagger's slow.",
            "Fan of Knives additional daggers are fired in a delay of ${fan_of_knives_delay} seconds after each dagger."
        ],
        ability_specials:
        [
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
        description: `Movement speed reduced by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% and total outgoing damage reduced by {${LocalizationModifierProperty.DAMAGEOUTGOING_PERCENTAGE}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_phantom_strike",
        name: "Phantom Strike",
        description: "Teleports to a unit, friendly or enemy, and grants bonus attack speed while attacking if it's an enemy unit.",
        reimagined_effects:
        [
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
        notes:
        [
            "Nothin Personalle's search width is based on the caster's hull radius plus its current attack range.",
            "Nothin Personalle does not apply an instant attack on the main target.",
            "Escape Plan only procs the Blur's active modifier if Blur is learned and is not currently active. The move speed modifier is independent and will always proc when blinking to an ally."
        ],
        ability_specials:
        [
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
        description: `Attack speed increased by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}}. Refreshes itself when attacking the main target.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_phantom_assassin_phantom_strike_escape_plan",
        name: "Escape Plan",
        description: `Move speed increased by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_blur",
        name: "Blur",
        description: "Phantom Assassin focuses inward, increasing her ability to evade enemy attacks. Can be activated to blur her body, causing her to be impossible to see until near enemy heroes.",
        scepter_description: "Causes Blur to have instant cast time and applies a dispel. Anytime you get a hero kill, your abilities are refreshed. Reduces Blur cooldown.",
        reimagined_effects:
        [
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
        notes:
        [
            "Quick and Quiet's stacks no longer increase during the linger time of the modifier.",
            "Quick and Quiet's stacks are reset when Blur is refreshed while already being active.",
            "From the Veils constantly procs the added pure damage until Blur is completely dispelled."
        ],
        ability_specials:
        [
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
        description: `Increases move speed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%. Lingers for {${LocalizationModifierProperty.TOOLTIP}} seconds after Blur is dispelled.`
    });

    Abilities.push({
        ability_classname: "reimagined_phantom_assassin_coup_de_grace",
        name: "Coup de Grace",
        description: "Phantom Assassin refines her combat abilities, gaining a chance of delivering a devastating critical strike to enemy units. Stifling Dagger shares the same critical strike chance.",
        reimagined_effects:
        [
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
        notes:
        [
            "Kiss of Death procs a critical strike with the highest possible crit damage. As such, it simply deals extremely high damage, but does not guarantees killing the target."
        ],
        ability_specials:
        [
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
        description: `Slows attack speed by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}}, but increases the critical hit chance by {${LocalizationModifierProperty.TOOLTIP}}%.`
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
        talents:
        [
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
        description: `Phantom Assassin has {${LocalizationModifierProperty.TOOLTIP}}% evasion against your attacks for the duration of the debuff.`
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
    //#endregion

    //#region Drow Ranger
    Abilities.push({
        ability_classname: "reimagined_drow_ranger_frost_arrows",
        name: "Frost Arrows",
        description: "Adds a freezing effect to Drow's attacks, slowing enemy movement and dealing bonus damage. Slow lasts ${duration} seconds.",
        reimagined_effects:
        [
            {
                title: "Brittle as the Cold",
                description: "Frost Arrows causes the target to lose ${brittle_cold_armor_loss_pct}% of its total armor and ${brittle_cold_aspd_loss%} attack speed for ${brittle_cold_duration} seconds. Stacks indefinitely. Stacks have independent duration."
            },

            {
                title: "Freezing Offensive",
                description: "Each Frost Arrow extends the current slow debuff timer by ${duration} seconds, instead of refreshing it. The timer can only be extended up to a maximum of ${freezing_offensive_max_duration} seconds."
            },

            {
                title: "Cryo Arrowhead",
                description: "While Marksmanship is active, grants a ${cryo_arrowhead_chance}% chance to have Frost Arrows explode on impact, dealing bonus ${cryo_arrowhead_damage} magical damage to all enemies in ${cryo_arrowhead_radius} radius of the target. All enemies hit are afflicted with Frost Arrow's slow debuff for ${cryo_arrowhead_duration} seconds."
            }
        ],
        shard_description: "Frost Arrows now apply a Hypothermia stack to enemy heroes, reducing their regeneration by ${shard_health_regen_reduction_stack}% per stack. Lasts ${shard_hypothermia_duration} seconds. If an enemy hero dies with Hypothermia stacks, they burst and deal ${shard_burst_damage} magic damage per stack and ${shard_burst_slow_pct}% slow for ${shard_burst_slow_duration} seconds to enemies within ${shard_burst_damage_radius} radius. Max Stacks: ${shard_max_stacks}.",
        lore: "Ice-encased arrows pierce the silence, chilling their victims to the core.",
        notes:
        [
            "Cryo Arrowhead effect fully stacks with Freezing Offensive, extending the Frost Arrow slow debuff if the target is already affected by it.",
            "Cryo Arrowhead cannot proc when Marksmanship was not yet learned, or when it's disabled due to nearby enemies."
        ],
        ability_specials:
        [
            {
                ability_special: "frost_arrows_movement_speed",
                text: "MOVEMENT SLOW",
                percentage: true
            },

            {
                ability_special: "damage",
                text: "BONUS DAMAGE"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_frost_arrows_slow",
        name: "Frost Arrow Slow",
        description: `Movement speed reduced by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_frost_arrows_brittle",
        name: "Brittle as the Cold",
        description: `Attack speed reduced by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}} and armor reduced by {${LocalizationModifierProperty.PHYSICAL_ARMOR_BONUS}}.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_hypothermia",
        name: "Hypothermia",
        description: `Health regeneration reduced by {${LocalizationModifierProperty.TOOLTIP}}%. On death, burst and deals damage to nearby allies.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_hypothermia_slow",
        name: "Hypothermia Slow",
        description: `Slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_drow_ranger_wave_of_silence",
        name: "Gust",
        description: "Releases a wave that silences and knocks back enemy units. Knockback distance is relative to how close they are to you.",
        reimagined_effects:
        [
            {
                title: "X Gust",
                description: "Launches ${xgust_projectiles} Gust projectiles in every ${xgust_angle} degrees of Drow Ranger, pushing all enemies away from her."
            },

            {
                title: "Wave Chill",
                description: "Enemies that are in ${wave_chill_range} range of Drow Ranger are also frozen, becoming stunned during the Gust's knockback plus ${wave_chill_freeze_duration} additional seconds."
            },

            {
                title: "Tailwind",
                description: "Drow can cast Gust on herself to constantly push her on the direction she's currently facing, silencing enemies in ${tailwind_silence_radius} radius around her. Drow Ranger can rotate herself to change the direction the gust pushes her. Lasts ${tailwind_duration} seconds."
            }
        ],
        lore: "Traxex is rather fond of the tranquility of physical combat, calling on her Drow heritage to end the incantations of opposing magi.",
        notes:
        [
            "Tailwind's effect does not knockbacks enemies.",
            "Tailwind's effect will stop prematurely if Drow Ranger is interrupted by being afflicted with status effects or is being affected by forced movement.",
            "While Tailwind is active, Drow Ranger is disarmed and have free pathing through units and obstacles.",
            "Issuing a Stop command or a Hold Position command will immediately stop Tailwind."
        ],
        ability_specials:
        [
            {
                ability_special: "wave_width",
                text: "WIDTH"
            },

            {
                ability_special: "silence_duration",
                text: "SILENCE DURATION"
            },

            {
                ability_special: "knockback_distance_max",
                text: "KNOCKBACK MAX"
            },

            {
                ability_special: "knockback_duration",
                text: "KNOCKBACK DURATION"
            },

            {
                ability_special: "abilitycastrange",
                text: "CAST RANGE"
            }
        ],
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_gust_freeze",
        name: "Wave Chill",
        description: "Frozen and cannot act."
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_gust_tailwind",
        name: "Tailwind",
        description: "Being pushed forward. Enemies around you become silenced."
    });

    Abilities.push({
        ability_classname: "reimagined_drow_ranger_multishot",
        name: "Multishot",
        description: "Drow releases a flurry of arrows in continuous salvos, hitting enemies for extra damage and applying longer duration Frost Arrows. Lasts up to ${abilitychanneltime} seconds.",
        reimagined_effects:
        [
            {
                title: "Quick Quiver",
                description: "For every ${quick_quiver_aspd} attack speed that Drow Ranger has, increases the amount of arrows fired in each wave by ${quick_quiver_bonus_arrows}."
            },

            {
                title: "Endless Barrage",
                description: "Can be set to auto cast to increase the max channel time to ${endless_barrage_channel_time} seconds, firing a wave of arrows every ${endless_barrage_delay_between_waves} seconds, but causes each wave to drain ${endless_barrage_mana_per_wave} mana. Lasts until no mana is left to fire an additional wave, the channeling is interrupted, or the duration elapses."
            },

            {
                title: "Thrilling Hunt",
                description: "While Marksmanship is enabled, the first wave's arrows trigger Marksmanship's bonuses. In addition, each enemy hit with a Multishot projectile increases the projectile speed of all further projectiles of this cast by ${thrilling_hunt_projectile_speed}."
            }
        ],
        lore: "In the ranger's youth, learning to fire multiple arrows at once was considered a distracting frivolity. In the war of the Ancients, such technique has become strange necessity.",
        notes:
        [
            "Quick Quiver also reduces the delay by a frame per wave to allow Drow Ranger to fire all arrows within the channel time.",
            "Quick Quiver rounds down, so it ignores partial amounts below the threshold.",
            "Thrilling Hunt's projectile speed bonus does not apply to arrows that are already on the move."
        ],
        ability_specials:
        [
            {
                ability_special: "arrow_count",
                text: "ARROW COUNT"
            },

            {
                ability_special: "arrow_damage_pct",
                text: "ARROW BASE DAMAGE BONUS",
                percentage: true
            },

            {
                ability_special: "arrow_slow_duration",
                text: "ARROW SLOW DURATION"
            },

            {
                ability_special: "arrow_range_multiplier",
                text: "ARROW RANGE MULTIPLIER"
            }
        ]
    });

    Abilities.push({
        ability_classname: "reimagined_drow_ranger_marksmanship",
        name: "Marksmanship",
        description: "Drow's experience in battle grant her a chance to launch arrows with incredible accuracy and effectiveness. Pierces through the enemy's defenses, ignoring their base armor. Grants Drow and nearby ranged heroes with bonus agility based on Drow's current agility. This ability is disabled if there is an enemy hero within ${disable_range} range.",
        reimagined_effects:
        [
            {
                title: "Pride of the Drow",
                description: "Can be activated to prevent Marksmanship from being disabled by nearby enemies for ${pride_drow_duration} seconds."
            },

            {
                title: "Ambush from the Forests",
                description: "While Marksmanship is active and Drow Ranger did not attack for ${ambush_forest_no_attack_period} seconds, Drow Ranger's next arrow is guaranteed to proc Marksmanship."
            },

            {
                title: "Ranger of Frost",
                description: "While Marksmanship is active, attacking targets that are afflicted with Frost Arrows' slow debuff grants Drow Ranger's a stack to the Ranger of Frost buff. Each stack increases Drow Ranger's attack speed by ${ranger_frost_attack_speed}, her projectile speed by ${ranger_frost_projectile_speed}, and decreases the distance where Marksmanship is disabled by ${ranger_frost_disable_distance_decrease}. Stacks infinitely. Each stack has its own independent duration, and lasts ${ranger_frost_duration} seconds."
            }
        ],
        lore: "The Drow Ranger's is the epitome of archery prowess.",
        notes:
        [
            "Ranger of Frost will also give a stack if the attack is a Frost Arrow, which applies the slow."
        ],
        scepter_description: "Causes Drow Ranger's attacks to splinter on the target, hitting nearby units with normal attacks that deal reduced damage.",
        ability_specials:
        [
            {
                ability_special: "chance",
                text: "CHANCE",
                percentage: true
            },

            {
                ability_special: "bonus_damage",
                text: "BONUS PROC DAMAGE"
            },

            {
                ability_special: "agility_multiplier",
                text: "AGILITY BONUS",
                percentage: true
            },

            {
                ability_special: "agility_range",
                text: "AGILITY RADIUS"
            },

            {
                ability_special: "split_count_scepter",
                text: "SCEPTER SPLIT COUNT"
            },

            {
                ability_special: "damage_reduction_scepter",
                text: "SCEPTER DAMAGE REDUCTION",
                percentage: true
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_marksmanship_pride_drow",
        name: "Pride of the Drow",
        description: "Prevents Marksmanship for being disabled for the duration of this modifier."
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_marksmanship_ranger_of_frost",
        name: "Ranger of Frost",
        description: `Increases attack speed by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}} and projectile speed by {${LocalizationModifierProperty.PROJECTILE_SPEED_BONUS}}. Also decreases the range Marksmanship is disabled by {${LocalizationModifierProperty.TOOLTIP}}.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_marksmanship_agility_buff",
        name: "Marksmanship",
        description: `Increases agility by {${LocalizationModifierProperty.STATS_AGILITY_BONUS}}.`
    });

    Talents.push({
        talent_classname: "reimagined_drow_ranger_talent",
        talents:
        [
            {
                name: "Brittle Winds",
                description: "Frost Arrows attacks now apply a stack of Brittle as the Cold to all enemies in ${talent_1_search_radius} radius around the target.",
                lore: "Every enchanted arrow fills the air with frosty mist, which might prove difficult and disadvantageous to some."
            },

            {
                name: "Cryo Surge",
                description: "Cryo Arrowhead now applies even when Marksmanship is disabled. Additionally, the chance to proc Cryo Arrowhead increases by ${talent_2_cryo_chance_bonus}% when Marksmanship is active.",
                lore: "Steadily breathing frost into her arrows in perfect rhythm enables the application of cryo coating, even when Traxex is thrown off her balance."
            },

            {
                name: "Taildraft Breeze",
                description: "During Tailwind, Drow Ranger fires a miniature Gust projectile backwards every ${talent_3_interval} seconds. The projectile has ${talent_3_width} width and goes up to ${talent_3_distance} distance, knocking enemies back and silencing them for ${talent_3_silence_duration} seconds.",
                lore: "Utilizing the same breeze that pushes Traxes forward, she thrusts it back with a Drowish incantation to get possible enemies off her trail."
            },

            {
                name: "Frozen Bind",
                description: "Gust roots affected enemies for ${talent_4_root_duration} seconds after the knockback. If Wave Chill procced, then the root is also extended by the stun duration.",
                lore: "Traxex has found binding the feet of her foes is a good way to keep her distance from them."
            },

            {
                name: "Reflex Shot",
                description: "Drow Ranger performs an instant attack on every enemy unit that was hit by ${talent_5_arrows_for_attack} Multishot arrows. This effect can occur multiple times in a single Multishot cast, and counts for enemies that were already hit by an arrow in a wave. The counter resets between casts.",
                lore: "Traxes uses has sharp senses to be able to reflexively fire a quick arrow on anyone that her arrow showers mark."
            },

            {
                name: "Precision Volley",
                description: "Thrilling Hunt now also applies Marksmanship on ${talent_6_percentage}% of each wave's arrows. The arrows for each wave are chosen randomly.",
                lore: "Out of all the arrows in the quiver, a number of them will surely hit their target with deadly precision."
            },

            {
                name: "Prideful Ranger",
                description: "While Pride of the Drow is not active, taking damage applies Pride of the Drow automatically for ${talent_7_pride_duration} seconds. Has a ${talent_7_internal_cd} seconds internal cooldown. Does not trigger Marksmanship's cooldown and can trigger while Marksmanship is on cooldown.",
                lore: "When Traxex gets hurts, her resolve gets stronger."
            },

            {
                name: "Markswoman's Tempo",
                description: "Marksmanship's Ranger of Frost now also increases Drow Ranger's attack range by ${talent_8_attack_range_per_stack} per stack.",
                lore: "Traxex is most terrifying when she fires a flurry of arrows that leaves no chance to escape."
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_gust_root",
        name: "Frozen Bind",
        description: "Rooted.",
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_drow_ranger_talent_7_counter",
        name: "Prideful Ranger Cooldown",
        description: "Prideful Ranger is on cooldown until this modifier's duration ends."
    });

    //#endregion

    //#region Skywrath Mage
    Abilities.push({
        ability_classname: "reimagined_skywrath_mage_arcane_bolt",
        name: "Arcane Bolt",
        description: "Skywrath Mage launches a slow-moving bolt of arcane magic, dealing damage to an enemy unit based on Skywrath Mage's intelligence.",
        reimagined_effects:
        [
            {
                title: "Arcane Infusion",
                description: "Grants bonus ${arcane_infusion_speed_per_int} projectile speed for each point of intelligence Skywrath has when casting Arcane Bolt."
            },

            {
                title: "Wrath of Dragonus",
                description: "After Skywrath Mage casts ${wrath_arcane_bolt_casts} Arcane Bolts, the next Arcane Bolt cast will become a Wrath Bolt, which travels ${wrath_bolt_speed_multiplier} times as fast, the damage includes the intelligence of nearby allied heroes in ${wrath_int_calculate_range} range, and Skywrath's intelligence is calculated ${wrath_caster_calculations} times. The counter modifier lasts ${wrath_duration} seconds."
            },

            {
                title: "Blank Bolt",
                description: "Arcane Bolt can be cast on spell immune enemies. When the projectile hits a spell immune enemy, it deals no damage, and instead sets a debuff that has a stack count equal to ${blank_bolt_damage_pct}% of the damage the unit would've taken. When the unit takes magic damage with an ability and it is not spell immune, the debuff is consumed and the damage it had stored is dealt in a separate instance. The debuff lasts ${blank_bolt_duration} seconds."
            }
        ],
        lore: "Within the Ghastly Eyrie's endless intrigue, only the clever and calm can hope to survive.",
        notes:
        [
            "While the projectile is moving, it provides ${bolt_vision} vision around it. Upon impact, it will reveal the target area for ${vision_duration} seconds.",
            "Wrath Bolts do not multiply the intelligence of nearby allies by the multiplier.",
            "Blank Bolt can refresh itself with additional Arcane Bolt hits on a spell immune enemy. The damage will be adjusted if the new cast deals more damage."
        ],
        scepter_description: "When Skywrath Mage casts Arcane Bolt, a different random target within ${scepter_radius} range will be hit with the same ability. Heroes will take priority.",
        ability_specials:
        [
            {
                ability_special: "bolt_damage",
                text: "BASE DAMAGE"
            },

            {
                ability_special: "int_multiplier",
                text: "INT DAMAGE MULTIPLIER"
            },

            {
                ability_special: "scepter_radius",
                text: "SCEPTER RADIUS"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_arcane_bolt_wrath",
        name: "Wrath Bolt Counter",
        description: `After {${LocalizationModifierProperty.TOOLTIP}} Arcane Bolts were fired, the next Arcane Bolt will be a Wrath Bolt.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt",
        name: "Blank Bolt",
        description: `When not spell immune and taking magical damage from an ability, the modifier is consumed and deals magical damage equal to the stack count.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_talent_1_buff",
        name: "Unending Proficiency",
        description: `Increases intelligence by {${LocalizationModifierProperty.STATS_INTELLECT_BONUS}}.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_talent_3_buff",
        name: "Trapped Energy",
        description: "Automatically fires Concussive Shot at the closest enemy unit in range."
    });

    Abilities.push({
        ability_classname: "reimagined_skywrath_mage_concussive_shot",
        name: "Concussive Shot",
        description: "Skywrath Mage sets off a long range shot that hits the closest hero within a long range. Upon impact, it deals damage and slows in an area of effect.",
        reimagined_effects:
        [
            {
                title: "Conjured Relay",
                description: "Concussive Shot bounces ${conjured_relay_bounce_count} times towards the closest enemy that was not hit by Concussive Shot this cast. Looks in ${conjured_relay_search_radius} units around the last bounce target."
            },

            {
                title: "Brain Concussion",
                description: "The main target hit by Concussive Shot is also affected by a ${brain_concussion_spell_amp_rdct}% spell amp reduction for the duration of the slow."
            },

            {
                title: "Ghastly Eerie",
                description: "If the main target of Concussive Shot is afflicted by Ancient Seal's debuff when the projectile hits, the radius of Concussive Shot increases by ${ghastly_eerie_radius_pct}% and the slow duration increases by ${ghastly_eerie_duration_pct}% for all enemies in the blast range."
            }
        ],
        lore: "Those who serve the court of the Ghastly Eyrie are ever locked in covert war. One must always know where danger lurks nearest.",
        notes:
        [
            "If no enemy heroes are in range or they are in fog, Concussive Shot targets the nearest enemy creep.",
            "Damages creeps around the impact area.",
            "Provides ${shot_vision} vision around the projectile, and reveals the target area for ${vision_duration} seconds upon impact."
        ],
        scepter_description: "When Skywrath Mage casts Concussive Shot, a different random target within cast range will be hit with the same ability. Heroes will take priority.",
        ability_specials:
        [
            {
                ability_special: "launch_radius",
                text: "SHOT RANGE"
            },

            {
                ability_special: "slow_radius",
                text: "RADIUS"
            },

            {
                ability_special: "damage",
                text: "DAMAGE"
            },

            {
                ability_special: "slow_duration",
                text: "SLOW DURATION"
            },

            {
                ability_special: "movement_speed_pct",
                text: "SLOW",
                percentage: true
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_concussive_shot_slow",
        name: "Concussive Shot",
        description: `Slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_skywrath_mage_ancient_seal",
        name: "Ancient Seal",
        description: "Skywrath Mage seals the targeted unit with an ancient rune, silencing it and causing it to take additional damage from spells.",
        reimagined_effects:
        [
            {
                title: "Seal of Scree'auk",
                description: "Can be cast on an ally to set the seal within it, granting it a ${seal_screeauk_spell_amp}% spell amp, and causes it to emit an aura that applies Ancient Seal's debuff on any enemy in ${seal_screeauk_radius} radius near it."
            },

            {
                title: "Rebounding Seal",
                description: "When the seal expires prematurely, it is applied to the closest enemy in ${rebound_seal_search_radius} radius around it with its remaining duration. This effects also applies on allies affected by Seal of the Scree'auk seals. This process can repeat infinitely."
            },

            {
                title: "Sealed Enmity",
                description: "Every ${sealed_enmity_magic_damage_threshold} magical damage accumulated by the target during the debuff increases the magic reduction by ${sealed_enmity_magic_reduction_increase}% for the remainder of the duration."
            }
        ],
        shard_description: "Ancient Seal debuff now causes other debuffs applied to last ${shard_status_resistance}% longer. Grants vision over the target.",
        scepter_description: "Anytime Skywrath Mage casts Ancient Seal, a different random target within ${scepter_radius} range will be affected by the same ability. Heroes will take priority.",
        lore: "A holy incantation, whosoever finds themselves touched by Avilliva's sigil must suffer in penitent silence.",
        notes:
        [
            "The magic damage resistance reduction doesn't affect creeps.",
            "Scepter effect will also also be applied when casting Seal of Scree'auk on an ally, casting it on a random ally in its range."
        ],
        ability_specials:
        [
            {
                ability_special: "resist_debuff",
                text: "INCREASED MAGIC DAMAGE",
                percentage: true
            },

            {
                ability_special: "seal_duration",
                text: "DURATION"
            },

            {
                ability_special: "scepter_radius",
                text: "SCEPTER RADIUS"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_ancient_seal_debuff",
        name: "Ancient Seal",
        description: `Silenced. Magic damage is increased by {${LocalizationModifierProperty.MAGICAL_RESISTANCE_BONUS}}%.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_ancient_seal_screeauk",
        name: "Seal of Scree'auk",
        description: `Spell amp increased by {${LocalizationModifierProperty.SPELL_AMPLIFY_PERCENTAGE}}%, and all enemies in {${LocalizationModifierProperty.TOOLTIP}} radius of you will be affected by Ancient Seal.`
    });

    Abilities.push({
        ability_classname: "reimagined_skywrath_mage_mystic_flare",
        name: "Mystic Flare",
        description: "Skywrath Mage uses his ultimate magical ability to conjure a precise and violent mystical field that lays waste to his adversaries. Deals massive damage distributed evenly among any Heroes in the area over ${duration%} seconds.",
        reimagined_effects:
        [
            {
                title: "Mystical Bombardment",
                description: "Every interval also fires ${mystical_bombardment_hits_per_interval} small instances of Mystic Flare in random locations around the target point up between ${mystical_bombardment_min_range} and ${mystical_bombardment_max_range} units away from it, dealing an instance damage to all enemies in a ${mystical_bombardment_radius} radius where it landed. Damage is distributed evenly between enemies in the hit radius."
            },

            {
                title: "Flare of Divinity",
                description: "Mystic Flare automatically moves towards the closest enemy in ${flare_divinity_search_radius%} range of its center, moving at ${flare_divinity_move_speed} speed."
            },

            {
                title: "Skywrath's High Mage",
                description: "Each point of intelligence the caster has reduces the duration of Mystic Flare by ${high_mage_duration_per_int_pct}%, up to ${high_mage_max_duration_reduction_pct}% duration reduction. The damage scales accordingly."
            }
        ],
        lore: "Only the most practiced of Skywrath sorcerers could hope to shape the skies into such a storm.",
        notes:
        [
            "Mystic Flare only affects Heroes; it does not damage illusions or creep heroes.",
            "Spell immune enemies do not count toward the damage distribution.",
            "Mystic Flare will damage enemy creeps if no enemy heroes are present."
        ],
        scepter_description: "When Skywrath Mage casts Mystic Flare, another Mystic Flare will be created on the position of a different random target enemy within ${scepter_radius} range. Heroes will take priority.",
        ability_specials:
        [
            {
                ability_special: "radius",
                text: "RADIUS"
            },

            {
                ability_special: "duration",
                text: "DURATION"
            },

            {
                ability_special: "damage",
                text: "DAMAGE"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_talent_7_debuff",
        name: "Null Field",
        description: `Cannot use movement abilities until moving away from the center of the field.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_skywrath_mage_talent_8_buff",
        name: "Divine Flight",
        description: `Grants flying movement.`
    });

    Talents.push({
        talent_classname: "reimagined_skywrath_mage_talent",
        talents:
        [
            {
                name: "Unending Proficiency",
                description: "Casting Arcane Bolt increases your intelligence by ${int_bonus} for ${duration} seconds. Has independent stacks.",
                lore: "Skywrath Mage's proficiency with magic allows him to constantly gain knowledge through battle."
            },

            {
                name: "Wrathful Incantation",
                description: "Wrath Bolts now also calculate the target's main attribute as bonus magical damage. This bonus damage is not multiplied by Arcane Bolt's intelligence multiplier.",
                lore: "Concentrating enormous Skywrath magic in his Wrath Bolts, Dragonus is capable of combusting his target's magical energies on impact."
            },

            {
                name: "Trapped Energy",
                description: "Fizzling a Concussive Shot grants a buff that automatically fires Concussive Shot at a nearby enemy hero that comes into range. Lasts ${duration} seconds.",
                lore: "Instead of letting arcane energies go to waste, Dragonus traps them until a worthy opponent comes in its range."
            },

            {
                name: "Motor Dysfunction",
                description: "Brain Concussion now also decreases turn rate by ${turn_rate_reduction}%.",
                lore: "The immense impact of the Concussive Shot shatters the motoric capabilities of its unfortunate target."
            },

            {
                name: "Seal of Amplification",
                description: "Sealed Enmity now increases damage taken from all types of damage instead of only magical.",
                lore: "Dragonus employs a legendary seal, capable of making any target extremely vulnerable."
            },

            {
                name: "Scree'auk's Screech",
                description: "Seal of Scree'auk now pulses every ${pulse_interval} seconds, applying its effect to all enemies in ${radius} range.",
                lore: "Utilizing Scree'auk's special technique, Skywrath Mage causes the seal to pulse in sheer force, reaching enemies far beyond its usual range."
            },

            {
                name: "Null Field",
                description: "Mystic Flare now adds the Leashed state to all enemy units in the initial area of effect, preventing usage of movement abilities until leaving they leave the flare's radius. The radius is centered on the flare's current location.",
                lore: "Binding enemies into a nullity field reduces their escape options severly."
            },

            {
                name: "Divine Flight",
                description: "When casting Mystic Flare, Skywrath Mage gains flying movement for ${duration} seconds. Doesn't grant flying vision.",
                lore: "When Dragonus unleashes his ultimate power, the left over energies propel his wings upwards, allowing him to fly over terrain for a short while."
            }
        ]
    });

    //#endregion

    //#region Broodmother
    StandardTooltips.push({
        classname: "npc_dota_reimagined_broodmother_spiderking",
        name: "Spiderking"
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_spawn_spiderlings",
        name: "Spawn Spiderlings",
        description: "Broodmother injects her young into an enemy unit, dealing damage. The spiderlings will hatch if the target is killed while under this influence, which lasts ${buff_duration} seconds.",
        reimagined_effects:
        [
            {
                title: "Avenger",
                description: "Whenever any Spider unit dies in ${avenger_radius} radius of Broodmother, Broodmother gains a stack of Avenger. Each stack increases her base damage by ${avenger_damage_pct}% for ${avenger_duration} seconds. Has independent stacks."
            },

            {
                title: "Spiderlings Academy",
                description: "For each level of Broodmother, Spiderlings gain ${spiderlings_academy_damage_per_level} damage, ${spiderlings_academy_health_per_level} health, ${spiderlings_academy_armor_per_level} armor and ${spiderlings_academy_magic_res_per_level}% magic resistance. Spiderites gain ${spiderlings_academy_spiderites_pct}% of the values."
            },

            {
                title: "Reimagined Spiderling",
                description: "Spiderlings have the Ticking Poison, Volatile Spiderlings and the Spider Genes abilities. Spiderites have a lesser version of the Volatile Spiderling ability as well."
            }
        ],
        lore: "Black Arachnia continues to raise her young, even amidst the field of combat. The brood quickly learns how to support their mother.",
        notes:
        [
            "If the target is killed within ${buff_duration} seconds of being hit with this skill, the Spiderlings will spawn.",
            "Units killed by Spiderlings will then give birth to Spiderites, smaller and less powerful versions of the Spiderlings.",
            "Spiderlings Academy is only applied upon Spiderlings and Spiderites spawn.",
            "Detailed information on Ticking Poison, Volatile Spiderlings, Volatile Spiderites, and Spider Genes can be found on the units' abilities."
        ],
        ability_specials:
        [
            {
                ability_special: "spiderling_duration",
                text: "LIFETIME"
            },

            {
                ability_special: "damage",
                text: "DAMAGE"
            },

            {
                ability_special: "count",
                text: "COUNT"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spawn_spiderling_debuff",
        name: "Spawn Spiderlings",
        description: `If killed, will spawn {${LocalizationModifierProperty.TOOLTIP}} Spiderlings.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_avenger_buff",
        name: "Avenger",
        description: `Increases base damage by {${LocalizationModifierProperty.BASEDAMAGEOUTGOING_PERCENTAGE}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_spiderling_poison_sting",
        name: "Poison Sting",
        description: "Poisons and slows enemies with each attack.",
        reimagined_effects:
        [
            {
                title: "Ticking Poison",
                description: "Poison Sting accumulates stacks on the target each time it is attacked by a Spiderling. When the target reaches ${ticking_poison_stacks} stacks, all stacks are consumed, causing the target to burst and take ${ticking_poison_damage} magical damage."
            },

            {
                title: "Volatile Spiderlings",
                description: "Spiderlings explode on death, dealing ${volatile_spiderling_damage} magical damage in ${volatile_spiderling_radius} radius around them and applying Poison Sting to enemies in the area of effect."
            }
        ],
        notes:
        [
            "Volatile Spiderlings does not trigger from expiring."
        ],
        ability_specials:
        [
            {
                ability_special: "damage_per_second",
                text: "DAMAGE PER SECOND"
            },

            {
                ability_special: "movement_speed",
                text: "MOVE SLOW",
                percentage: true
            },

            {
                ability_special: "duration",
                text: "DURATION (CREEP)"
            },

            {
                ability_special: "duration_hero",
                text: "DURATION (HERO)"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spiderling_poison_sting_debuff",
        name: "Poison Sting",
        description: `Ticking for {${LocalizationModifierProperty.TOOLTIP}} damage per second, slowing by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}. Poison will burst when accumulating {${LocalizationModifierProperty.TOOLTIP2}} stacks.`
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_spiderling_spawn_spiderite",
        name: "Spawn Spiderite",
        description: "Applies debuff on attack. If debuffed unit dies, a spiderite will spawn.",
        reimagined_effects:
        [
            {
                title: "Spider Genes",
                description: "Each unique Spiderling that attacks the target adds a stack. If the target dies with at least ${spider_genes_stacks} stacks, it will birth a Spiderling instead of a Spiderite."
            }
        ],
        ability_specials:
        [
            {
                ability_special: "spiderite_duration",
                text: "LIFETIME"
            },

            {
                ability_special: "buff_duration",
                text: "DEBUFF DURATION"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spiderling_spawn_spiderite_debuff",
        name: "Spawn Spiderite",
        description: `If killed, will spawn a Spiderite. If {${LocalizationModifierProperty.TOOLTIP}} stacks are accumulated, a Spiderling will spawn instead.`
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_spiderite_volatile_spiderite",
        name: "Volatile Spiderite",
        description: "When killed, explodes violently, dealing damage to nearby enemies.",
        notes:
        [
            "Does not trigger when the Spiderite expires."
        ],
        ability_specials:
        [
            {
                ability_special: "volatile_spiderite_damage",
                text: "DAMAGE"
            },

            {
               ability_special: "volatile_spiderite_radius",
               text: "RADIUS"
            }
        ]
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_spin_web",
        name: "Spin Web",
        description: "Spins a large web that grants Broodmother a passive movement speed increase, gives free movement, and boosts regeneration while in its vicinity. Spin Web charges restore every ${charge_restore_time} seconds. Spin Web can be cast from anywhere as long as the new web touches an existing web. Webs never expire, and can be manually destroyed. When the maximum limit of webs is exceeded, the oldest web disappears.",
        reimagined_effects:
        [
            {
                title: "Web Manuever",
                description: "Increases Spiderlings' and Spiderites' damage reduction by ${web_menuever_dmg_pct}% while they are on a web. In addition, Broodmother and all her spider units gain ${web_menuever_attack_speed} attack speed bonus while on a web."
            },

            {
                title: "Web Sense",
                description: "Enemies entering a web have their models shown through Fog of War for ${web_sense_duration} seconds. This can only occur once per entrance to each web."
            }
        ],
        lore: "Weaving a bed of silken fibers, Arachnia's web both protects her and her offspring, as well as giving advancing opponents a sense of forboding.",
        scepter_description: "Increases movement speed, removes movement speed limit, and increases Spin Web max count.",
        notes:
        [
            "Also affects Spiderlings, Spiderites and the Spiderking.",
            "Web Manuever's damage reduction only applies to Spiderlings and Spiderites.",
            "Web Sense only resets the vision duration when the enemy leaves a web completely and goes into range of another. Stacked webs do not count for leaving a web."
        ],
        ability_specials:
        [
            {
                ability_special: "max_charges",
                text: "MAX CHARGES:"
            },

            {
                ability_special: "charge_restore_time",
                text: "CHARGE RESTORE TIME"
            },

            {
                ability_special: "count",
                text: "MAX WEBS"
            },

            {
                ability_special: "health_regen",
                text: "HEALTH REGEN"
            },

            {
                ability_special: "bonus_movespeed",
                text: "MOVE INCREASE",
                percentage: true
            },

            {
                ability_special: "max_charges_scepter",
                text: "SCEPTER WEB CHARGES"
            },

            {
                ability_special: "bonus_movespeed_scepter",
                text: "SCEPTER MOVE SPEED",
                percentage: true
            },

            {
                ability_special: "count_scepter",
                text: "SCEPTER MAX WEBS"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spin_web_aura_buff",
        name: "Spin Web",
        description: `Increasing health regen by {${LocalizationModifierProperty.HEALTH_REGEN_CONSTANT}} and movement speed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%. Attack speed increased by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}}. Spiderlings and Spiderites also gain {${LocalizationModifierProperty.TOOLTIP}}% damage reduction.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spin_web_debuff",
        name: "Spin Web",
        description: `Inside an enemy's web. Visible to the enemy team for {${LocalizationModifierProperty.TOOLTIP}} seconds when stepping in a new web.`
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_spin_web_destroy",
        name: "Destroy Spin Web",
        description: "Destroys the selected Spin Web.",
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_incapacitating_bite",
        name: "Incapacitating Bite",
        description: "Broodmother's venom cripples enemy units, causing her attacks to slow and give the affected unit a chance to miss its attacks.",
        reimagined_effects:
        [
            {
                title: "Webbed Up",
                description: "When Broodmother or a spider unit under her control attack an enemy standing in a web, that enemy gets a stack of Webbed Up. When it reaches ${web_up_stacks_threshold} stacks, stacks are consumed, causing the enemy to become rooted and to have %web_up_miss_chance_pct%%% miss chance for %web_up_duration% second. Broodmother's attacks increase the stacks by %web_up_stacks_hero%. Spiderlings', Spiderites and Spiderking's attacks increase it by ${web_up_stacks_spider} stack instead."
            },

            {
                title: "Paralytic Toxics",
                description: "Also reduces attack speed by ${paralytic_attack_speed_slow} and cast speed by ${paralytic_cast_speed_slow_pct}% for affected units.",
            }
        ],
        lore: "Paralytic toxins come from Black Arachnia's fangs, causing a slow and painful death to those who intrude on her webs.",
        notes: ["The miss chance stacks with evasion and terrain dodge chance."],
        ability_specials:
        [
            {
                ability_special: "miss_chance",
                text: "MISS CHANCE",
                percentage: true
            },

            {
                ability_special: "bonus_movespeed",
                text: "MOVE SLOW",
                percentage: true
            },

            {
                ability_special: "duration",
                text: "DURATION"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_incapacitating_bite_debuff",
        name: "Incapacitating Bite",
        description: `Miss chance increased by {${LocalizationModifierProperty.MISS_PERCENTAGE}} and movement speed reduced by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%. Also reduces attack speed by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}} and increases cast time by {${LocalizationModifierProperty.CASTTIME_PERCENTAGE}}%.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_incapacitating_bite_webbed_up_counter",
        name: "Webbed Up Counter",
        description: `Accumulates stacks when you are attacked while standing on a web. Reaching {${LocalizationModifierProperty.TOOLTIP}} stacks will cause you to become rooted.`,
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_incapacitating_bite_webbed_up_debuff",
        name: "Webbed Up",
        description: `Rooted and missing {${LocalizationModifierProperty.MISS_PERCENTAGE}}% of attacks.`
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_insatiable_hunger",
        name: "Insatiable Hunger",
        description: "A violent lust for vital fluids increases Broodmother's attack damage and gives her a vampiric attack.",
        reimagined_effects:
        [
            {
               title: "Queen of the Brood",
               description: "While Insatiable Hunger is active, Broodmother emits an aura that increases the damage of nearby spider units under her control in ${queen_brood_radius} range by ${queen_brood_damage_bonus}, and grants them ${queen_brood_lifesteal_pct}% lifesteal."
            },

            {
                title: "Feed The Brood",
                description: "While Insatiable Hunger is active, Broodmother's attacks apply a debuff on her target for ${feed_brood_debuff_duration} seconds. If the target dies while the debuff is still active, Broodmother's health increases by ${feed_brood_brood_hero_health} for each hero killed and by ${feed_brood_brood_unit_health} for each unit killed. Additionally, when killing an enemy unit with the debuff, all spider units under her control ${queen_brood_radius} range gain a buff that heals them by ${feed_brood_heal_per_second} health every second for ${feed_brood_heal_duration} seconds."
            }
        ],
        lore: "While most of her prey is wrapped in silken cocoons and saved for her young, the Broodmother herself has a taste for wandering heroes.",
        notes:
        [
            "Fully stacks with other sources of lifesteal.",
            "Broodmother's health bonus modifier duration equals to Insatiable Hunger's buff duration.",
            "Feed the Brood's unit heal modifier fully stacks with itself. Each stack has independent timers.",
            "Feed the Brood's unit heal modifier heals the unit every ${feed_brood_heal_interval} seconds."
        ],
        ability_specials:
        [
            {
                ability_special: "bonus_damage",
                text: "BONUS DAMAGE"
            },

            {
                ability_special: "lifesteal_pct",
                text: "LIFESTEAL",
                percentage: true
            },

            {
                ability_special: "duration",
                text: "DURATION"
            }
        ],
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_insatiable_hunger_buff",
        name: "Insatiable Hunger",
        description: `Damage increased by {${LocalizationModifierProperty.PREATTACK_BONUS_DAMAGE}} and lifestealing {${LocalizationModifierProperty.TOOLTIP}}%. Nearby spiderlings also gain bonus damage and lifesteal.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_insatiable_hunger_feed_brood_debuff",
        name: "Feed The Brood",
        description: "Dying with this debuff will turn you into food for Broodmother and her family."
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_insatiable_hunger_feed_brood_health_buff",
        name: "Feed The Brood",
        description: `Health is increased by {${LocalizationModifierProperty.HEALTH_BONUS}} from killing enemies while Insatiable Hunger is active.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_insatiable_hunger_feed_brood_unit_heal",
        name: "Feed The Brood",
        description: `Healed by {${LocalizationModifierProperty.TOOLTIP}} every second.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_insatiable_hunger_queen_of_brood_buff",
        name: "Queen of the Brood",
        description: `Damage increased by {${LocalizationModifierProperty.PREATTACK_BONUS_DAMAGE}} and lifestealing {${LocalizationModifierProperty.TOOLTIP}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_spawn_spiderking",
        name: "Spawn Spiderking",
        description: "Broodmother plants a cocoon in her position, causing a mutation that rapidly creates a Spiderking to serve her. While it is being mutated into existence, it cannot act and slowly gains health. Spiderkings are permanent, but only ${max_spiderkings} can exist at a time. Spiderkings have significantly increased stats, an extremely potent poison, and emit an aura that protect nearby Spiderlings and Spiderites.",
        lore: "Every queen needs a king, and that's no different for the Black Arachnia.",
        notes:
        [
            "This ability levels up automatically when leveling Insatiable Hunger.",
            "Spiderking has the Venom Stinger and Hardened Brood Aura abilities, which are set to the level of the Spawn Spiderking ability, and immediately align when leveling it up.",
            "While hatching, the Spiderking is stunned and cannot be healed."
        ],
        ability_specials:
        [
            {
                ability_special: "hatch_duration",
                text: "GROW DURATION"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spiderking_hatch",
        name: "Spawn Spiderking",
        description: "This Spiderking is growing into full power, and is stunned during this process."
    });

    Abilities.push({
        ability_classname: "reimagined_spiderking_venom_stinger",
        name: "Venom Stinger",
        description: "Spiderking's attacks inflict its deadly venom unto the target, which slows it and causes its veins to periodically burst, causing it to take damage on each burst.",
        notes: ["Additional attacks refresh the duration, but does not affect the burst timer."],
        ability_specials:
        [
            {
                ability_special: "explosion_interval",
                text: "BURST INTERVAL"
            },

            {
                ability_special: "movement_speed_slow",
                text: "MOVE SPEED SLOW",
                percentage: true
            },

            {
                ability_special: "duration",
                text: "DEBUFF DURATION"
            },

            {
                ability_special: "explosion_damage",
                text: "BURST DAMAGE"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spiderking_venom_stinger_debuff",
        name: "Venom Stinger",
        description: `Slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}% and bursting every {${LocalizationModifierProperty.TOOLTIP}} seconds.`
    });

    Abilities.push({
        ability_classname: "reimagined_spiderking_hardened_brood_aura",
        name: "Hardened Brood Aura",
        description: "Increases the damage resistance of nearby Spiderlings and Spiderites.",
        notes: ["Does not apply on Broodmother and on the Spiderking."],
        ability_specials:
        [
            {
                ability_special: "radius",
                text: "RADIUS"
            },

            {
                ability_special: "damage_reduction",
                text: "DAMAGE REDUCTION",
                percentage: true
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_spiderking_hardened_brood_buff",
        name: "Hardened Brood Aura",
        description: `Damage resistance increased by {${LocalizationModifierProperty.INCOMING_DAMAGE_PERCENTAGE}}%.`
    });

    Abilities.push({
        ability_classname: "reimagined_broodmother_silken_bola",
        name: "Silken Bola",
        description: "Consumes ${spin_web_charges_spend} Spin Web charges and roots the target enemy for ${duration} seconds, dealing damage over time.",
        notes: ["Spin Web is stolen alongside Silken Bola."],
        ability_specials:
        [
            {
                ability_special: "duration",
                text: "DURATION"
            },

            {
                ability_special: "damage_per_second",
                text: "DAMAGE PER SECOND"
            },

            {
                ability_special: "damage_interval",
                text: "DAMAGE INTERVAL"
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_silken_bola_debuff",
        name: "Silken Bola",
        description: `Rooted. Taking {${LocalizationModifierProperty.TOOLTIP}} damage per second.`
    });

    Talents.push({
        talent_classname: "reimagined_broodmother_talent",
        talents:
        [
            {
                name: "Poison Popper",
                description: "Spiderlings and Spiderites have a ${pop_chance}% chance to pop when taking damage, triggering their Volatile Poison effect around them. The damage instance must be greater than ${min_damage} after reductions in order to roll the chance to pop.",
                lore: "Black Arachnia's young has a habit to spread lethal poison on whoever attempts to harm them."
            },

            {
                name: "Broodfather",
                description: "Spiderking's Hardened Brood Aura now also prevents the death of affected Spiderlings and Spiderites.",
                lore: "As they keep close to the father figure of the brood, the young are protected from deadly hazards."
            },

            {
                name: "Tangled",
                description: "Enemy units that move while inside of a web gain a stack for every ${time_threshold} seconds they accumulate. Each stack reduces move speed by ${move_speed_slow_per_stack}, up to a maximum of ${max_stacks} stacks.",
                lore: "The silken strings woven by the Broodmother slowly become tangled around her prey's body, slowly stopping it from moving as effectively."
            },

            {
                name: "Silken Bind",
                description: "Casting Spin Web causes all enemies in Spin Web's radius to become rooted and disarmed for ${bound_duration} seconds. Each enemy can only be afflicted by this effect once every ${trigger_immunity_duration} seconds.",
                lore: "It is foolish for one to be standing right where Black Arachnia is marking her new territory."
            },

            {
                name: "Weblings",
                description: "Spiderlings and Spiderites now apply ${additional_stacks} additional Webbed Up stacks, and gain ${attack_speed_bonus} attack speed when attacking a target with the Webbed Up counter or debuff. The attack speed buff lasts ${attack_speed_duration} seconds.",
                lore: "Black Arachnia's spiderlings have good control on their spinnerets, improving their ability to wrap their prey in webs."
            },

            {
                name: "Necrotic Venom",
                description: "Incapacitating Bite's debuff now also stops all health regeneration of the target.",
                lore: "Black Arachnia's venom has a component that blocks blood from reaching the infected area, preventing the regeneration of dead body cells."
            },

            {
                name: "Hunger Pangs",
                description: "When killing an enemy unit and Insatiable Hunger is not currently active, grants the Insatiable Hunger buff for ${duration} seconds.",
                lore: "After having a taste of her prey, Black Arachnia often goes into a rage induced by hunger pangs."
            },

            {
                name: "Feast Frenzy",
                description: "While Insatiable Hunger is active, attacking an enemy unit while Broodmother's health is under ${health_minimum_pct}% of her max health grants her ${attack_speed_bonus} attack speed and ${lifesteal_amp}% lifesteal amplification. The buff lasts for ${duration} seconds, or until Broodmother fully heals. This effect can only occur once per trigger of the Insatiable Hunger buff.",
                lore: "Being on her last legs, Black Arachnia instinctively goes into a frenzy, ripping her enemies apart from limb to limb, feeding herself to recover her wounds."
            }
        ]
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_talent_4_debuff",
        name: "Silken Bind",
        description: "Rooted and disarmed."
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_talent_4_immunity",
        name: "Silken Bind Immunity",
        description: "Cannot be affected by successive casts of Silken Bind."
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_talent_5_buff",
        name: "Weblings",
        description: `Attack speed increased by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}}.`
    });

    Modifiers.push({
        modifier_classname: "modifier_reimagined_broodmother_talent_8_buff",
        name: "Feast Frenzy",
        description: `Attack speed increased by {${LocalizationModifierProperty.ATTACKSPEED_BONUS_CONSTANT}} and lifesteal amplification increased by {${LocalizationModifierProperty.LIFESTEAL_AMPLIFY_PERCENTAGE}}%.`
    });

    //#endregion

    // Return data to compiler
    return localization_info;
}
