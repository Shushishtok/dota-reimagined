import { BaseModifier, registerModifier } from "../../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_reimagined_broodmother_spiderking_hatch extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	sound_hatch: string = "DOTA_Item.Necronomicon.Activate";
	model_hatching: string = "models/spider_sack.vmdl";
	particle_burst: string = "particles/heroes/broodmother/broodmother_spiderking_hatch.vpcf";
	particle_burst_fx?: ParticleID;
	paritcle_hatch_death: string = "particles/heroes/broodmother/broodmother_spiderking_hatch_death.vpcf";
	paritcle_hatch_death_fx?: ParticleID;

	// Modifier specials
	original_scale?: number;
	starting_health_pct?: number;
	starting_model_size?: number;

	OnCreated(): void {
		// Modifier specials
		this.original_scale = this.ability.GetSpecialValueFor("model_size");
		this.starting_health_pct = this.ability.GetSpecialValueFor("starting_health_pct");
		this.starting_model_size = this.ability.GetSpecialValueFor("starting_model_size");

		if (!IsServer()) return;

		// Set starting health
		const starting_health = this.parent.GetMaxHealth() * this.starting_health_pct * 0.01;
		this.parent.ModifyHealth(starting_health, this.ability, false, DamageFlag.NONE);
		this.parent.SetModelScale(this.starting_model_size);

		this.StartIntervalThink(FrameTime());
	}

	OnIntervalThink(): void {
		// Modify health every frame during the hatch
		const starting_health = this.parent.GetMaxHealth() * this.starting_health_pct! * 0.01;
		const health_gain_per_interval = ((this.parent.GetMaxHealth() - starting_health) / this.GetDuration()) * FrameTime();
		this.parent.ModifyHealth(this.parent.GetHealth() + health_gain_per_interval, this.ability, false, DamageFlag.NONE);

		// Increase model size until reaching max size
		this.parent.SetModelScale(this.starting_model_size! + (this.GetElapsedTime() / this.GetDuration()) * (this.original_scale! - this.starting_model_size!));
	}

	OnDestroy(): void {
		if (!IsServer()) return;
		if (this.parent.IsAlive()) {
			// Set the model scale to the exact model scale it should be
			this.parent.SetModelScale(this.original_scale!);

			// Play hatch sound
			EmitSoundOn(this.sound_hatch, this.parent);

			// Play the hatch particle
			this.particle_burst_fx = ParticleManager.CreateParticle(this.particle_burst, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
			ParticleManager.SetParticleControl(this.particle_burst_fx, 0, this.parent.GetAbsOrigin());
			ParticleManager.ReleaseParticleIndex(this.particle_burst_fx);
		} else {
			// Play death particle
			this.paritcle_hatch_death_fx = ParticleManager.CreateParticle(this.paritcle_hatch_death, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
			ParticleManager.SetParticleControl(this.paritcle_hatch_death_fx, 0, this.parent.GetAbsOrigin());
			ParticleManager.ReleaseParticleIndex(this.paritcle_hatch_death_fx);
		}
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.MODEL_CHANGE, ModifierFunction.DISABLE_HEALING];
	}

	GetModifierModelChange(): string {
		return this.model_hatching;
	}

	GetDisableHealing(): 0 | 1 {
		return 1;
	}

	IsHidden() {
		return false;
	}
	IsDebuff() {
		return false;
	}
	IsPurgable() {
		return false;
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.STUNNED]: true };
	}
}
