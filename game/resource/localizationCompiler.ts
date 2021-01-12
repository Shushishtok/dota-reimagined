import * as fs from 'fs';
// import { GenerateLocalizationData } from "./localizationData";
import { LocalizationData, Language, AbilityLocalization, ModifierLocalization, StandardLocalization, HeroTalents, Weapons } from "./localizationInterfaces";

export class LocalizationCompiler
{
    addon_filepath: string = "game/resource/addon_";
    filepath_format: string = ".txt";

    // Helper functions
    TransformForLocalization(text: string, modifier: boolean): string
    {
        if (modifier)
        {
            return text.replace(/\{([^f]\w+)\}($|[^%])/g, "%d$1%$2").replace(/\{([^f]\w+)\}%/g, "%d$1%%%").replace(/\{f(\w+)\}($|[^%])/g, "%f$1%$2").replace(/\{f(\w+)\}%/g, "%f$1%%%");
        }
        else
        {
            return text.replace(/\${(\w*)}($|[^%])/g, "%$1%$2").replace(/\${(\w*)}%/g, "%$1%%%");
        }
    }

    OnLocalizationDataChanged(allData: {[path: string]: LocalizationData})
    {
        console.log("Localization event fired");
        let Abilities: Array<AbilityLocalization> = new Array<AbilityLocalization>();
        let Modifiers: Array<ModifierLocalization> = new Array<ModifierLocalization>();
        let StandardTooltips: Array<StandardLocalization> = new Array<StandardLocalization>();
        let Talents: Array<HeroTalents> = new Array<HeroTalents>();

        const localization_info: LocalizationData =
        {
            AbilityArray: Abilities,
            ModifierArray: Modifiers,
            StandardArray: StandardTooltips,
            TalentArray: Talents,
        };

        for (const [key, data] of Object.entries(allData)) {
            if (data.AbilityArray) {
                Array.prototype.push.apply(Abilities, data.AbilityArray);
            }
            if (data.ModifierArray) {
                Array.prototype.push.apply(Modifiers, data.ModifierArray);
            }
            if (data.StandardArray) {
                Array.prototype.push.apply(StandardTooltips, data.StandardArray);
            }
            if (data.TalentArray) {
                Array.prototype.push.apply(Talents, data.TalentArray);
            }
        }

        console.log("Localization data generated");

        // Generate information for every language
        const languages = Object.values(Language).filter(v => typeof v !== "number");
        for (const language of languages)
        {
            const localization_content: string = this.GenerateContentStringForLanguage(language, localization_info);
            this.WriteContentToAddonFile(language, localization_content);
        }
    }

    GenerateContentStringForLanguage(language: string, localized_data: LocalizationData): string
    {
        let localization_content = "";

        // Go over standard tooltips
        if (localized_data.StandardArray) {
            for (const standardLocalization of localized_data.StandardArray)
            {
                // Check for name override for the language we're checking
                let standard_tooltip_string = standardLocalization.name;

                if (standardLocalization.language_overrides && standardLocalization.language_overrides.length > 0)
                {
                    for (const language_override of standardLocalization.language_overrides)
                    {
                        if (language_override.language === language)
                        {
                            standard_tooltip_string = language_override.name_override;
                        }
                    }
                }

                localization_content += `\t\t"${standardLocalization.classname}" "${standard_tooltip_string}"`;
                localization_content += "\n";
            }
        }

        // Go over abilities for this language
        if (localized_data.AbilityArray) {
            for (const ability of localized_data.AbilityArray)
            {
                // Class name is identical for all languages, so we would always use it
                const ability_string = `\t\t"DOTA_Tooltip_Ability_${ability.ability_classname}`;

                // Name
                let ability_name = ability.name;
                let ability_description = ability.description;
                let reimagined_effects = ability.reimagined_effects;
                let ability_lore = ability.lore;
                let ability_notes = ability.notes;
                let scepter_description = ability.scepter_description;
                let shard_description = ability.shard_description;
                let ability_specials = ability.ability_specials;

                if (ability.language_overrides)
                {
                    for (const language_override of ability.language_overrides)
                    {
                        if (language_override.language === language)
                        {
                            // Check for name override
                            if (language_override.name_override)
                            {
                                ability_name = language_override.name_override;
                            }

                            // Check for description overrides
                            if (language_override.description_override)
                            {
                                ability_description = language_override.description_override;
                            }

                            // Check for reimagined effect overrides
                            if (language_override.reimagined_effects_override)
                            {
                                reimagined_effects = language_override.reimagined_effects_override;
                            }

                            // Check for lore override
                            if (language_override.lore_override)
                            {
                                ability_lore = language_override.lore_override;
                            }

                            // Check for note override
                            if (language_override.notes_override)
                            {
                                ability_notes = language_override.notes_override;
                            }

                            // Check for scepter override
                            if (language_override.scepter_description_override)
                            {
                                scepter_description = language_override.scepter_description_override;
                            }

                            // Check for shard override
                            if (language_override.shard_description_override)
                            {
                                shard_description = language_override.shard_description_override;
                            }

                            // Check for ability specials override, if any
                            if (language_override.ability_specials_override)
                            {
                                ability_specials = language_override.ability_specials_override;
                            }
                        }
                    }
                }

                // Add name localization
                localization_content += `${ability_string}" "${ability_name}"`;
                localization_content += "\n";

                // Add description localization
                ability_description = this.TransformForLocalization(ability_description, false);
                localization_content += `${ability_string}_description" "${ability_description}"`;
                localization_content += "\n";

                // Reimagined effects, if any
                if (reimagined_effects)
                {
                    let counter = 1;
                    for (const reimagined_effect of reimagined_effects)
                    {
                        // Reimagined title
                        localization_content += `${ability_string}_rmg_title_${counter}" "${reimagined_effect.title}"`;
                        localization_content += "\n";

                        // Reimagined description
                        const reimagined_effect_description = this.TransformForLocalization(reimagined_effect.description, false);
                        localization_content += `${ability_string}_rmg_description_${counter}" "${reimagined_effect_description}"`;
                        localization_content += "\n";

                        counter++;
                    }
                }

                // Lore, if any
                if (ability_lore)
                {
                    const transformed_lore = this.TransformForLocalization(ability_lore, false);
                    localization_content += `${ability_string}_Lore" "${transformed_lore}"`;
                    localization_content += "\n";
                }

                // Notes, if any
                if (ability_notes)
                {
                    let counter = 0;
                    for (const note of ability_notes)
                    {
                        const transformed_note = this.TransformForLocalization(note, false);
                        localization_content += `${ability_string}_Note${counter}" "${transformed_note}"`;
                        localization_content += "\n";

                        counter++;
                    }
                }

                // Scepter, if any
                if (scepter_description)
                {
                    const ability_scepter_description = this.TransformForLocalization(scepter_description, false);
                    localization_content += `${ability_string}_scepter_description" "${ability_scepter_description}"`;
                    localization_content += "\n";
                }

                // Shard, if any
                if (shard_description)
                {
                    const ability_shard_description = this.TransformForLocalization(shard_description, false);
                    localization_content += `${ability_string}_shard_description" "${ability_shard_description}"`;
                    localization_content += "\n";
                }

                // Ability specials, if any
                if (ability_specials)
                {
                    for (const ability_special of ability_specials)
                    {
                        // Construct the ability special
                        let ability_special_text = "";

                        if (ability_special.percentage)
                        {
                            ability_special_text = "%";
                        }
                        else if (ability_special.item_stat)
                        {
                            ability_special_text = "+$"
                        }

                        ability_special_text += ability_special.text;
                        localization_content += `${ability_string}_${ability_special.ability_special}" "${ability_special_text}:"`;
                        localization_content += "\n";
                    }
                }
            }
        }

        // Go over talents for that language
        if (localized_data.TalentArray) {
            for (const hero_talent_list of localized_data.TalentArray)
            {
                const talent_classname = `\t\t"DOTA_Tooltip_Ability_${hero_talent_list.talent_classname}`;
                let talent_counter = 1;

                for (const talent of hero_talent_list.talents)
                {
                    let talent_name = talent.name;
                    let talent_description = talent.description;
                    let talent_lore = talent.lore;

                    if (talent.language_overrides)
                    {
                        for (const language_override of talent.language_overrides)
                        {
                            // Only do overrides for the language that we're checking right now
                            if (language_override.language === language)
                            {
                                // Check name override
                                if (language_override.name_override)
                                {
                                    talent_name = language_override.name_override;
                                }

                                // Check description override
                                if (language_override.description_override)
                                {
                                    talent_description = language_override.description_override;
                                }

                                // Check lore override
                                if (language_override.lore_override)
                                {
                                    talent_lore = language_override.lore_override;
                                }
                            }
                        }
                    }

                    // Talent name
                    const talent_string = `${talent_classname}_${talent_counter}`;
                    localization_content += `${talent_string}" "${talent_name}"`
                    localization_content += "\n";

                    // Talent description
                    talent_description = this.TransformForLocalization(talent_description, false);
                    localization_content += `${talent_string}_Description" "${talent_description}"`
                    localization_content += "\n";

                    // Talent lore
                    localization_content += `${talent_string}_Lore" "${talent_lore}"`
                    localization_content += "\n";

                    // Increment talent counter
                    talent_counter++;
                }
            }
        }

        // Go over modifiers
        if (localized_data.ModifierArray) {
            for (const modifier of localized_data.ModifierArray)
            {
                const modifier_string = `\t\t"DOTA_Tooltip_${modifier.modifier_classname}`;

                // Name
                let modifier_name = modifier.name;
                let modifier_description = modifier.description;

                if (modifier.language_overrides)
                {
                    for (const language_override of modifier.language_overrides)
                    {
                        if (language_override.language === language)
                        {
                            // Name overrides for a specific language, if necessary
                            if (language_override.name_override)
                            {
                                modifier_name = language_override.name_override;
                            }

                            // Description overrides for a specific language, if necessary
                            if (language_override.description_override)
                            {
                                modifier_description = language_override.description_override;
                            }
                        }
                    }
                }

                // Add name to localization string
                localization_content += `${modifier_string}" "${modifier_name}"`;
                localization_content += "\n";

                // Add description to localization string
                modifier_description = this.TransformForLocalization(modifier_description, true);
                localization_content += `${modifier_string}_description" "${modifier_description}"`;
                localization_content += "\n";
            }
        }

        return localization_content;
    }

    WriteContentToAddonFile(language: string, localization_content: string)
    {
        // Set based on language
        const filepath = this.addon_filepath + language.toString() + this.filepath_format;

        // Remove file contents, or create a fresh one if it doesn't exists yet.
        const fd = fs.openSync(filepath, 'w');
        fs.closeSync(fd);

        // Add the opening tokens
        let localization_intro = `"lang"\n{\n\t"Language" "${language}"\n\t"Tokens"\n\t{\n`;

        // Add the closing token
        let localization_ending = '\t}\n}';
        let write_string = localization_intro + localization_content + localization_ending;

        // Write to the file
        fs.writeFile(filepath, write_string, ()=>{console.log(`Finished writing tooltips for language ${language} in file ${filepath}`)});
    }
}
