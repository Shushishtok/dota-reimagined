import { AntiMageTalents } from "../../../abilities/heroes/antimage/reimagined_antimage_talents";
import { BaseModifier, registerModifier, BaseAbility } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_antimage_blink_magic_nullity extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_shield: string = "particles/heroes/anti_mage/antimage_magic_nullity_shield.vpcf";
	particle_shield_fx?: ParticleID;

	// Modifier specials
	magic_nullity_magic_res?: number;

	// Reimagined talent specials
	talent_3_magic_resist?: number;
	talent_3_status_resist?: number;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return true;
	}

	OnCreated(): void {
		// Modifier properties

		this.ability = this.GetAbility()!;

		// Modifier specials
		this.magic_nullity_magic_res = this.ability?.GetSpecialValueFor("magic_nullity_magic_res");

		// Attach particle
		this.particle_shield_fx = ParticleManager.CreateParticle(this.particle_shield, ParticleAttachment.POINT_FOLLOW, this.parent);
		ParticleManager.SetParticleControlEnt(this.particle_shield_fx, 0, this.parent, ParticleAttachment.POINT_FOLLOW, "attach_hitloc", this.parent.GetAbsOrigin(), true);
		this.AddParticle(this.particle_shield_fx, false, false, -1, false, false);
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.MAGICAL_RESISTANCE_BONUS, ModifierFunction.STATUS_RESISTANCE_STACKING]; // Talent 3
	}

	GetModifierMagicalResistanceBonus(): number {
		// Talent: Nullifier of Magic: Magic Nullity now increases your magic resistance to x% and status resistance by z% for the duration.
		let magic_nullity_magic_res = this.magic_nullity_magic_res!;
		magic_nullity_magic_res = this.ReimaginedTalentNullifierofMagicMResistance();

		return magic_nullity_magic_res;
	}

	GetModifierStatusResistanceStacking(): number {
		// Talent: Nullifier of Magic: Magic Nullity now increases your magic resistance to x% and status resistance by z% for the duration.
		return this.ReimaginedTalentNullifierofMagicSResistance();
	}

	ReimaginedTalentNullifierofMagicMResistance(): number {
		if (HasTalent(this.caster, AntiMageTalents.AntiMageTalents_3)) {
			if (!this.talent_3_magic_resist) this.talent_3_magic_resist = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_3, "magic_resist");
			return this.talent_3_magic_resist;
		}

		return this.magic_nullity_magic_res!;
	}

	ReimaginedTalentNullifierofMagicSResistance(): number {
		if (HasTalent(this.caster, AntiMageTalents.AntiMageTalents_3)) {
			if (!this.talent_3_status_resist) this.talent_3_status_resist = GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_3, "status_resist");
			return this.talent_3_status_resist;
		}

		return 0;
	}
}
