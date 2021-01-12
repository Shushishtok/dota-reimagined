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
        ability_classname: "item_reimagined_enchanted_mango",
        name: "Enchanted Mango",
        description: "<h1>Use: Eat Mango</h1> Instantly restores ${replenish_amount} mana.<br><br>Range: ${abilitycastrange}",
        lore: "The bittersweet flavors of Jidi Isle are irresistible to amphibians.",
        ability_specials:
        [
            {
                ability_special: "hp_regen",
                text: "hp_regen",
                item_stat: true
            }
        ]
    })

    return localization_info;

}
