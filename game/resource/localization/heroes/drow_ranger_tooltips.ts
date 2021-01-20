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
        shard_description: "Frost Arrows now apply a Hypothermia stack to enemy heroes, reducing their regeneration by ${shard_health_regen_reduction_stack}% per stack. Increases damage by ${shard_bonus_damage_per_stack} per stack. Lasts ${shard_hypothermia_duration} seconds. If an enemy hero dies with Hypothermia stacks, they burst and deal ${shard_burst_damage} magic damage per stack and ${shard_burst_slow_pct}% slow for ${shard_burst_slow_duration} seconds to enemies within ${shard_burst_damage_radius} radius. Max Stacks: ${shard_max_stacks}.",
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
    return localization_info;
}
