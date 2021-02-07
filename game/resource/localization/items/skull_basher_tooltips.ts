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
        ability_classname: "item_reimagined_skull_basher",
        name: "Skull Basher",
        description: "<h1>Passive: Bash</h1> Grants melee heroes a ${bash_chance_melee}% chance on hit to stun the target for ${bash_duration} seconds and deal ${bonus_chance_damage} bonus physical damage.  Bash chance for ranged heroes is ${bash_chance_ranged}%.",
        lore: "A feared weapon in the right hands, this maul's ability to shatter the defenses of its opponents should not be underestimated.",
        notes:
        [
            "Does not stack with other sources of Bash, however it will stack with Mini-Bash.",
            "The following heroes cannot trigger Bash on this item: Spirit Breaker, Faceless Void, and Slardar."
        ],
        ability_specials:
        [
            {
                ability_special: "bonus_damage",
                text: "damage",
                item_stat: true
            },

            {
                ability_special: "bonus_strength",
                text: "str",
                item_stat: true
            }
        ]
    });

    return localization_info;

}
