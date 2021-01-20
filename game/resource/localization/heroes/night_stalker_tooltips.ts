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
    });

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

    return localization_info;
}
