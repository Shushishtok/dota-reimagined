import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";
import { modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike";
import { modifier_reimagined_phantom_assassin_coup_de_grace_passive } from "../../../modifiers/heroes/phantom_assassin/modifier_reimagined_phantom_assassin_coup_de_grace_passive";

@registerAbility()
export class reimagined_phantom_assassin_coup_de_grace extends BaseAbility {
	// Ability properties
	caster: CDOTA_BaseNPC = this.GetCaster();
	sound_cast: string = "PhantomAssassin.DecisiveStrike.Cast";

	// Reimagined specials
	decisive_strike_duration?: number;

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/units/heroes/hero_phantom_assassin/phantom_assassin_crit_impact.vpcf", context);
	}

	GetCastAnimation(): GameActivity {
		return GameActivity.DOTA_SPAWN;
	}

	GetIntrinsicModifierName(): string {
		return modifier_reimagined_phantom_assassin_coup_de_grace_passive.name;
	}

	OnAbilityPhaseStart(): boolean {
		// Play sound
		EmitSoundOn(this.sound_cast, this.caster);

		return true;
	}

	OnAbilityPhaseInterrupted() {
		StopSoundOn(this.sound_cast, this.caster);
	}

	OnSpellStart(): void {
		// Reimagined specials
		this.decisive_strike_duration = this.GetSpecialValueFor("decisive_strike_duration");

		// Reimagined: Decisive Strike: Coup de Grace can be no-target cast. Doing so reduces Phantom Assassin's attack speed significantly, but increases the chance to proc Coup de Grace dramatically. Lasts for a few seconds, or until Phantom Assassin crits.
		this.ReimaginedDecisiveStrike();
	}

	ReimaginedDecisiveStrike() {
		// Add Decisive Strike modifier to self
		this.caster.AddNewModifier(this.caster, this, modifier_reimagined_phantom_assassin_coup_de_grace_decisive_strike.name, { duration: this.decisive_strike_duration });
	}
}
