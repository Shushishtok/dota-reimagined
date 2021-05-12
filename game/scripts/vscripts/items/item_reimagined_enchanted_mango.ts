import { BaseItem, registerAbility } from "../lib/dota_ts_adapter";
import { modifier_reimagined_enchanted_mango_passive } from "../modifiers/items/enchanted_mango/modifier_reimagined_enchanted_mango_passive";

@registerAbility()
export class item_reimagined_enchanted_mango extends BaseItem {
	// Ability properties
	caster?: CDOTA_BaseNPC;
	sound_cast: string = "DOTA_Item.Mango.Activate";
	particle_cast: string = "particles/items3_fx/mango_active.vpcf";
	particle_fx?: ParticleID;

	// Ability specials
	replenish_amount?: number;

	Precache(context: CScriptPrecacheContext) {
		PrecacheResource(PrecacheType.PARTICLE, "particles/items3_fx/mango_active.vpcf", context);
	}

	GetIntrinsicModifierName() {
		return modifier_reimagined_enchanted_mango_passive.name;
	}

	OnSpellStart(): void {
		// Ability properties
		this.caster = this.GetCaster();
		let target: CDOTA_BaseNPC = this.GetCursorTarget()!;

		// Ability specials
		this.replenish_amount = this.GetSpecialValueFor("replenish_amount");

		// Remove charge, or destroy the item if there are no more charges left
		const current_charges = this.GetCurrentCharges();
		if (current_charges > 1) {
			this.SpendCharge();
		} else {
			this.Destroy();
		}

		// Play cast sound
		EmitSoundOn(this.sound_cast, target);

		// Create particle effect
		this.particle_fx = ParticleManager.CreateParticle(this.particle_cast, ParticleAttachment.ABSORIGIN_FOLLOW, target);
		ParticleManager.SetParticleControl(this.particle_fx, 0, target.GetAbsOrigin());
		ParticleManager.ReleaseParticleIndex(this.particle_fx);

		// Restore mana to the target
		target.GiveMana(this.replenish_amount);
	}
}
