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
    return localization_info;
}
