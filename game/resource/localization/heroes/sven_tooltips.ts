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

    return localization_info;
}
