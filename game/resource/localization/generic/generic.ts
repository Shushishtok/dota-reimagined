import { AbilityLocalization, HeroTalents, Language, LocalizationData, ModifierLocalization, StandardLocalization } from "../../localizationInterfaces";

export function GenerateLocalizationData(): LocalizationData {
	// This section can be safely ignored, as it is only logic.
	//#region Localization logic
	// Arrays
	const Abilities: Array<AbilityLocalization> = new Array<AbilityLocalization>();
	const Modifiers: Array<ModifierLocalization> = new Array<ModifierLocalization>();
	const StandardTooltips: Array<StandardLocalization> = new Array<StandardLocalization>();
	const Talents: Array<HeroTalents> = new Array<HeroTalents>();

	// Create object of arrays
	const localization_info: LocalizationData = {
		AbilityArray: Abilities,
		ModifierArray: Modifiers,
		StandardArray: StandardTooltips,
		TalentArray: Talents,
	};
	//#endregion

	StandardTooltips.push({
		classname: "addon_game_name",
		name: "Dota Reimagined",
	});

	StandardTooltips.push({
		classname: "DOTA_Reimagined_Talent_Learned",
		name: "Talent learned",
	});

	StandardTooltips.push({
		classname: "DOTA_Reimagined_Talent_Can_Be_Learned",
		name: "Talent can be learned",
		language_overrides: [
			{
				language: Language.Russian,
				name_override: "IT CAN BE DONE!!!!!",
			},
		],
	});

	StandardTooltips.push({
		classname: "DOTA_Reimagined_Talent_Not_Learned",
		name: "Talent not yet learned",
	});

	StandardTooltips.push({
		classname: "DOTA_Reimagined_Talent_Cannot_Be_Learned",
		name: "Talent cannot be learned",
	});

	StandardTooltips.push({
		classname: "DOTA_Reimagined_Talent_Ping_Enemy",
		name: "Enemy",
	});

	StandardTooltips.push({
		classname: "DOTA_Reimagined_Talent_Ping_Ally",
		name: "Ally",
	});

	StandardTooltips.push({
		classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web",
		name: "Caster doesn't have the Spin Web ability",
	});

	StandardTooltips.push({
		classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_spin_web_unleveled",
		name: "Spin Web is not yet leveled",
	});

	StandardTooltips.push({
		classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charge_modifier",
		name: "No charges modifier exists for Spin Web",
	});

	StandardTooltips.push({
		classname: "DOTA_Tooltip_cast_error_broodmother_silken_bola_no_spin_web_charges",
		name: "Not enough Spin Web charges to consume",
	});

	StandardTooltips.push({
		classname: "DOTA_Tooltip_cast_error_cast_on_roshan",
		name: "Ability cannot be cast on Roshan",
	});

	StandardTooltips.push({
		classname: "DOTA_Tooltip_cast_error_cast_on_player_controlled_units",
		name: "Ability cannot be cast on player controlled units",
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_charges",
		name: "Charges",
		description: `Can cast this ability whenever there are charges available. A charge is refreshed every {${LocalizationModifierProperty.TOOLTIP}} seconds.`,
		language_overrides: [
			{
				language: Language.Russian,
				description_override: `Может использовать эту способность всякий раз, когда есть заряды. Заряд обновляется каждые {${LocalizationModifierProperty.TOOLTIP}} секунды`,
			},
		],
	});

	return localization_info;
}
