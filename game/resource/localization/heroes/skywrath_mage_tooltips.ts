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

	// Enter localization data below!
	Abilities.push({
		ability_classname: "reimagined_skywrath_mage_arcane_bolt",
		name: "Arcane Bolt",
		description: "Skywrath Mage launches a slow-moving bolt of arcane magic, dealing damage to an enemy unit based on Skywrath Mage's intelligence.",
		reimagined_effects: [
			{
				title: "Arcane Infusion",
				description: "Grants bonus ${arcane_infusion_speed_per_int} projectile speed for each point of intelligence Skywrath has when casting Arcane Bolt.",
			},

			{
				title: "Wrath of Dragonus",
				description:
					"After Skywrath Mage casts ${wrath_arcane_bolt_casts} Arcane Bolts, the next Arcane Bolt cast will become a Wrath Bolt, which travels ${wrath_bolt_speed_multiplier} times as fast, the damage includes the intelligence of nearby allied heroes in ${wrath_int_calculate_range} range, and Skywrath's intelligence is calculated ${wrath_caster_calculations} times. The counter modifier lasts ${wrath_duration} seconds.",
			},

			{
				title: "Blank Bolt",
				description:
					"Arcane Bolt can be cast on spell immune enemies. When the projectile hits a spell immune enemy, it deals no damage, and instead sets a debuff that has a stack count equal to ${blank_bolt_damage_pct}% of the damage the unit would've taken. When the unit takes magic damage with an ability and it is not spell immune, the debuff is consumed and the damage it had stored is dealt in a separate instance. The debuff lasts ${blank_bolt_duration} seconds.",
			},
		],
		lore: "Within the Ghastly Eyrie's endless intrigue, only the clever and calm can hope to survive.",
		notes: [
			"While the projectile is moving, it provides ${bolt_vision} vision around it. Upon impact, it will reveal the target area for ${vision_duration} seconds.",
			"Wrath Bolts do not multiply the intelligence of nearby allies by the multiplier.",
			"Blank Bolt can refresh itself with additional Arcane Bolt hits on a spell immune enemy. The damage will be adjusted if the new cast deals more damage.",
		],
		scepter_description: "When Skywrath Mage casts Arcane Bolt, a different random target within ${scepter_radius} range will be hit with the same ability. Heroes will take priority.",
		ability_specials: [
			{
				ability_special: "bolt_damage",
				text: "BASE DAMAGE",
			},

			{
				ability_special: "int_multiplier",
				text: "INT DAMAGE MULTIPLIER",
			},

			{
				ability_special: "scepter_radius",
				text: "SCEPTER RADIUS",
			},
		],
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_arcane_bolt_wrath",
		name: "Wrath Bolt Counter",
		description: `After {${LocalizationModifierProperty.TOOLTIP}} Arcane Bolts were fired, the next Arcane Bolt will be a Wrath Bolt.`,
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_arcane_bolt_blank_bolt",
		name: "Blank Bolt",
		description: `When not spell immune and taking magical damage from an ability, the modifier is consumed and deals magical damage equal to the stack count.`,
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_talent_1_buff",
		name: "Unending Proficiency",
		description: `Increases intelligence by {${LocalizationModifierProperty.STATS_INTELLECT_BONUS}}.`,
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_talent_3_buff",
		name: "Trapped Energy",
		description: "Automatically fires Concussive Shot at the closest enemy unit in range.",
	});

	Abilities.push({
		ability_classname: "reimagined_skywrath_mage_concussive_shot",
		name: "Concussive Shot",
		description: "Skywrath Mage sets off a long range shot that hits the closest hero within a long range. Upon impact, it deals damage and slows in an area of effect.",
		reimagined_effects: [
			{
				title: "Conjured Relay",
				description:
					"Concussive Shot bounces ${conjured_relay_bounce_count} times towards the closest enemy that was not hit by Concussive Shot this cast. Looks in ${conjured_relay_search_radius} units around the last bounce target.",
			},

			{
				title: "Brain Concussion",
				description: "The main target hit by Concussive Shot is also affected by a ${brain_concussion_spell_amp_rdct}% spell amp reduction for the duration of the slow.",
			},

			{
				title: "Ghastly Eerie",
				description:
					"If the main target of Concussive Shot is afflicted by Ancient Seal's debuff when the projectile hits, the radius of Concussive Shot increases by ${ghastly_eerie_radius_pct}% and the slow duration increases by ${ghastly_eerie_duration_pct}% for all enemies in the blast range.",
			},
		],
		lore: "Those who serve the court of the Ghastly Eyrie are ever locked in covert war. One must always know where danger lurks nearest.",
		notes: [
			"If no enemy heroes are in range or they are in fog, Concussive Shot targets the nearest enemy creep.",
			"Damages creeps around the impact area.",
			"Provides ${shot_vision} vision around the projectile, and reveals the target area for ${vision_duration} seconds upon impact.",
		],
		scepter_description: "When Skywrath Mage casts Concussive Shot, a different random target within cast range will be hit with the same ability. Heroes will take priority.",
		ability_specials: [
			{
				ability_special: "launch_radius",
				text: "SHOT RANGE",
			},

			{
				ability_special: "slow_radius",
				text: "RADIUS",
			},

			{
				ability_special: "damage",
				text: "DAMAGE",
			},

			{
				ability_special: "slow_duration",
				text: "SLOW DURATION",
			},

			{
				ability_special: "movement_speed_pct",
				text: "SLOW",
				percentage: true,
			},
		],
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_concussive_shot_slow",
		name: "Concussive Shot",
		description: `Slowed by {${LocalizationModifierProperty.MOVESPEED_BONUS_PERCENTAGE}}%.`,
	});

	Abilities.push({
		ability_classname: "reimagined_skywrath_mage_ancient_seal",
		name: "Ancient Seal",
		description: "Skywrath Mage seals the targeted unit with an ancient rune, silencing it and causing it to take additional damage from spells.",
		reimagined_effects: [
			{
				title: "Seal of Scree'auk",
				description:
					"Can be cast on an ally to set the seal within it, granting it a ${seal_screeauk_spell_amp}% spell amp, and causes it to emit an aura that applies Ancient Seal's debuff on any enemy in ${seal_screeauk_radius} radius near it.",
			},

			{
				title: "Rebounding Seal",
				description:
					"When the seal expires prematurely, it is applied to the closest enemy in ${rebound_seal_search_radius} radius around it with its remaining duration. This effects also applies on allies affected by Seal of the Scree'auk seals. This process can repeat infinitely.",
			},

			{
				title: "Sealed Enmity",
				description:
					"Every ${sealed_enmity_magic_damage_threshold} magical damage accumulated by the target during the debuff increases the magic reduction by ${sealed_enmity_magic_reduction_increase}% for the remainder of the duration.",
			},
		],
		shard_description: "Ancient Seal debuff now causes other debuffs applied to last ${shard_status_resistance}% longer. Grants vision over the target.",
		scepter_description: "Anytime Skywrath Mage casts Ancient Seal, a different random target within ${scepter_radius} range will be affected by the same ability. Heroes will take priority.",
		lore: "A holy incantation, whosoever finds themselves touched by Avilliva's sigil must suffer in penitent silence.",
		notes: [
			"The magic damage resistance reduction doesn't affect creeps.",
			"Scepter effect will also also be applied when casting Seal of Scree'auk on an ally, casting it on a random ally in its range.",
		],
		ability_specials: [
			{
				ability_special: "resist_debuff",
				text: "INCREASED MAGIC DAMAGE",
				percentage: true,
			},

			{
				ability_special: "seal_duration",
				text: "DURATION",
			},

			{
				ability_special: "scepter_radius",
				text: "SCEPTER RADIUS",
			},
		],
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_ancient_seal_debuff",
		name: "Ancient Seal",
		description: `Silenced. Magic damage is increased by {${LocalizationModifierProperty.MAGICAL_RESISTANCE_BONUS}}%.`,
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_ancient_seal_screeauk",
		name: "Seal of Scree'auk",
		description: `Spell amp increased by {${LocalizationModifierProperty.SPELL_AMPLIFY_PERCENTAGE}}%, and all enemies in {${LocalizationModifierProperty.TOOLTIP}} radius of you will be affected by Ancient Seal.`,
	});

	Abilities.push({
		ability_classname: "reimagined_skywrath_mage_mystic_flare",
		name: "Mystic Flare",
		description:
			"Skywrath Mage uses his ultimate magical ability to conjure a precise and violent mystical field that lays waste to his adversaries. Deals massive damage distributed evenly among any Heroes in the area over ${duration%} seconds.",
		reimagined_effects: [
			{
				title: "Mystical Bombardment",
				description:
					"Every interval also fires ${mystical_bombardment_hits_per_interval} small instances of Mystic Flare in random locations around the target point up between ${mystical_bombardment_min_range} and ${mystical_bombardment_max_range} units away from it, dealing an instance damage to all enemies in a ${mystical_bombardment_radius} radius where it landed. Damage is distributed evenly between enemies in the hit radius.",
			},

			{
				title: "Flare of Divinity",
				description: "Mystic Flare automatically moves towards the closest enemy in ${flare_divinity_search_radius%} range of its center, moving at ${flare_divinity_move_speed} speed.",
			},

			{
				title: "Skywrath's High Mage",
				description:
					"Each point of intelligence the caster has reduces the duration of Mystic Flare by ${high_mage_duration_per_int_pct}%, up to ${high_mage_max_duration_reduction_pct}% duration reduction. The damage scales accordingly.",
			},
		],
		lore: "Only the most practiced of Skywrath sorcerers could hope to shape the skies into such a storm.",
		notes: [
			"Mystic Flare only affects Heroes; it does not damage illusions or creep heroes.",
			"Spell immune enemies do not count toward the damage distribution.",
			"Mystic Flare will damage enemy creeps if no enemy heroes are present.",
		],
		scepter_description:
			"When Skywrath Mage casts Mystic Flare, another Mystic Flare will be created on the position of a different random target enemy within ${scepter_radius} range. Heroes will take priority.",
		ability_specials: [
			{
				ability_special: "radius",
				text: "RADIUS",
			},

			{
				ability_special: "duration",
				text: "DURATION",
			},

			{
				ability_special: "damage",
				text: "DAMAGE",
			},
		],
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_talent_7_debuff",
		name: "Null Field",
		description: `Cannot use movement abilities until moving away from the center of the field.`,
	});

	Modifiers.push({
		modifier_classname: "modifier_reimagined_skywrath_mage_talent_8_buff",
		name: "Divine Flight",
		description: `Grants flying movement.`,
	});

	Talents.push({
		talent_classname: "reimagined_skywrath_mage_talent",
		talents: [
			{
				name: "Unending Proficiency",
				description: "Casting Arcane Bolt increases your intelligence by ${int_bonus} for ${duration} seconds. Has independent stacks.",
				lore: "Skywrath Mage's proficiency with magic allows him to constantly gain knowledge through battle.",
			},

			{
				name: "Wrathful Incantation",
				description: "Wrath Bolts now also calculate the target's main attribute as bonus magical damage. This bonus damage is not multiplied by Arcane Bolt's intelligence multiplier.",
				lore: "Concentrating enormous Skywrath magic in his Wrath Bolts, Dragonus is capable of combusting his target's magical energies on impact.",
			},

			{
				name: "Trapped Energy",
				description: "Fizzling a Concussive Shot grants a buff that automatically fires Concussive Shot at a nearby enemy hero that comes into range. Lasts ${duration} seconds.",
				lore: "Instead of letting arcane energies go to waste, Dragonus traps them until a worthy opponent comes in its range.",
			},

			{
				name: "Motor Dysfunction",
				description: "Brain Concussion now also decreases turn rate by ${turn_rate_reduction}%.",
				lore: "The immense impact of the Concussive Shot shatters the motoric capabilities of its unfortunate target.",
			},

			{
				name: "Seal of Amplification",
				description: "Sealed Enmity now increases damage taken from all types of damage instead of only magical.",
				lore: "Dragonus employs a legendary seal, capable of making any target extremely vulnerable.",
			},

			{
				name: "Scree'auk's Screech",
				description: "Seal of Scree'auk now pulses every ${pulse_interval} seconds, applying its effect to all enemies in ${radius} range.",
				lore: "Utilizing Scree'auk's special technique, Skywrath Mage causes the seal to pulse in sheer force, reaching enemies far beyond its usual range.",
			},

			{
				name: "Null Field",
				description:
					"Mystic Flare now adds the Leashed state to all enemy units in the initial area of effect, preventing usage of movement abilities until leaving they leave the flare's radius. The radius is centered on the flare's current location.",
				lore: "Binding enemies into a nullity field reduces their escape options severly.",
			},

			{
				name: "Divine Flight",
				description: "When casting Mystic Flare, Skywrath Mage gains flying movement for ${duration} seconds. Doesn't grant flying vision.",
				lore: "When Dragonus unleashes his ultimate power, the left over energies propel his wings upwards, allowing him to fly over terrain for a short while.",
			},
		],
	});

	return localization_info;
}
