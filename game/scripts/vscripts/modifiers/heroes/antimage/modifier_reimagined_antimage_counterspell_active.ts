import { AntiMageTalents } from "../../../abilities/heroes/antimage/reimagined_antimage_talents";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import "./modifier_reimagined_antimage_talent_6_buff";
import * as util from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_antimage_counterspell_active extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_reflect: string = "Hero_Antimage.Counterspell.Target";
	particle_shield: string = "particles/units/heroes/hero_antimage/antimage_counter.vpcf";
	particle_shield_fx?: ParticleID;
	particle_absorb: string = "particles/units/heroes/hero_antimage/antimage_spellshield.vpcf";
	particle_absorb_fx?: ParticleID;

	// Modifier specials
	shard_illusion_duration: number = 0;
	shard_illusion_incoming_damage: number = 0;
	shard_illusion_outgoing_damage: number = 0;

	// Reimagined specials
	magic_ends_mana_burn: number = 0;
	anti_magic_duration_inc: number = 0;
	instinctive_counter_trigger_multiplier: number = 0;

	// Reimagined talent specials
	silence_duration: number = 0;
	magic_cannot_harm_me_duration: number = 0;

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	OnCreated(): void {
		this.FetchAbilitySpecials();

		// Play particle
		this.particle_shield_fx = ParticleManager.CreateParticle(this.particle_shield, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
		ParticleManager.SetParticleControl(this.particle_shield_fx, 0, this.parent.GetAbsOrigin());
		ParticleManager.SetParticleControl(this.particle_shield_fx, 1, Vector(150, 150, 150));
		this.AddParticle(this.particle_shield_fx, false, false, -1, false, false);
	}

	FetchAbilitySpecials() {
		// Modifier specials
		this.shard_illusion_duration = this.ability.GetSpecialValueFor("shard_illusion_duration");
		this.shard_illusion_incoming_damage = this.ability.GetSpecialValueFor("shard_illusion_incoming_damage");
		this.shard_illusion_outgoing_damage = this.ability.GetSpecialValueFor("shard_illusion_outgoing_damage");

		// Reimagined specials
		this.magic_ends_mana_burn = this.ability.GetSpecialValueFor("magic_ends_mana_burn");
		this.anti_magic_duration_inc = this.ability.GetSpecialValueFor("anti_magic_duration_inc");
		this.instinctive_counter_trigger_multiplier = this.ability.GetSpecialValueFor("instinctive_counter_trigger_multiplier");
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.ABSORB_SPELL, ModifierFunction.REFLECT_SPELL];
	}

	GetAbsorbSpell(event: ModifierAbilityEvent): 0 | 1 {
		if (!IsServer()) return 0;

		// Do not absorb allies' spells
		if (event.ability.GetCaster().GetTeamNumber() == this.parent.GetTeamNumber()) return 0;

		// Play absorb effect
		this.particle_absorb_fx = ParticleManager.CreateParticle(this.particle_absorb, ParticleAttachment.CUSTOMORIGIN_FOLLOW, this.parent);
		ParticleManager.SetParticleControlEnt(this.particle_absorb_fx, 0, this.parent, ParticleAttachment.POINT_FOLLOW, AttachLocation.HITLOC, this.parent.GetAbsOrigin(), true);
		ParticleManager.ReleaseParticleIndex(this.particle_absorb_fx);

		return 1;
	}

	GetReflectSpell(event: ModifierAbilityEvent): 0 | 1 {
		if (!IsServer()) return 0;

		// If spell reflection returned false we'll stop here
		if (!util.SpellReflect(event, this.parent, "modifier_reimagined_antimage_counterspell_passive")) {
			return 0;
		}

		// Play reflect sound
		EmitSoundOn(this.sound_reflect, event.ability.GetCaster());

		// Scepter Shard: Successful Counterspell creates an illusion attacking the caster for 5 seconds. Removes Counterspell manacost.
		if (util.HasScepterShard(this.caster)) {
			const original_caster_pos = event.ability.GetCaster().GetAbsOrigin();

			// Create illusion
			const illusion = CreateIllusions(
				this.caster,
				this.caster as CDOTA_BaseNPC_Hero,
				{ duration: this.shard_illusion_duration!, incoming_damage: this.shard_illusion_incoming_damage!, outgoing_damage: this.shard_illusion_outgoing_damage! },
				1,
				this.caster.GetHullRadius(),
				false,
				true
			)[0];

			// Set illusion at target point
			illusion.SetAbsOrigin(original_caster_pos);
			FindClearSpaceForUnit(illusion, original_caster_pos, true);
			ResolveNPCPositions(original_caster_pos, illusion.GetHullRadius());
		}

		// Talent: Magic Cannot Harm Me!: Magic resistance increases by x% for each enemy unit target spell that was cast at Anti Mage. Lasts y seconds. Stacks and refreshes itself.
		this.ReimaginedTalentMagicCannotHarmMe();

		// Reimagined: The Magic Ends Here: Burns a flat amount of mana of the original casters of reflected spells.
		this.ReimaginedTheMagicEndsHere(event.ability.GetCaster());

		// Reimagined: Anti Magic Shell: Increases Counterspell's current duration by x seconds for every spell reflected.
		this.ReimaginedAntiMagicShell();

		return 1;
	}

	ReimaginedTheMagicEndsHere(original_caster: CDOTA_BaseNPC): void {
		original_caster.ReduceMana(this.magic_ends_mana_burn);

		// Talent: Abolish Magic: Counterspell's The Magic Ends Here now also silences the caster for x seconds after reflecting a spell towards it.
		this.ReimaginedTalentAbolishMagic(original_caster);
	}

	ReimaginedAntiMagicShell(): void {
		this.SetDuration(this.GetRemainingTime() + this.anti_magic_duration_inc, true);
	}

	ReimaginedTalentAbolishMagic(original_caster: CDOTA_BaseNPC) {
		if (util.HasTalent(this.caster, AntiMageTalents.AntiMageTalents_5)) {
			if (!this.silence_duration) this.silence_duration = util.GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_5, "silence_duration");
			original_caster.AddNewModifier(this.caster, this.ability, BuiltInModifier.SILENCE, { duration: this.silence_duration });
		}
	}

	ReimaginedTalentMagicCannotHarmMe() {
		if (util.HasTalent(this.caster, AntiMageTalents.AntiMageTalents_6)) {
			if (!this.magic_cannot_harm_me_duration) this.magic_cannot_harm_me_duration = util.GetTalentSpecialValueFor(this.caster, AntiMageTalents.AntiMageTalents_6, "duration");
			let talent_modifier;
			if (!this.caster.HasModifier("modifier_reimagined_antimage_talent_6_buff")) {
				talent_modifier = this.caster.AddNewModifier(this.caster, this.ability, "modifier_reimagined_antimage_talent_6_buff", {
					duration: this.magic_cannot_harm_me_duration,
				});
			} else {
				talent_modifier = this.caster.FindModifierByName("modifier_reimagined_antimage_talent_6_buff");
			}

			if (talent_modifier) {
				talent_modifier.IncrementStackCount();
				talent_modifier.ForceRefresh();
			}
		}
	}
}
