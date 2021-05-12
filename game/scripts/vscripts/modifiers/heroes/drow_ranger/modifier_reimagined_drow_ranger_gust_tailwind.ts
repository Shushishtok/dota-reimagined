import { DrowRangerTalents } from "../../../abilities/heroes/drow_ranger/reimagined_drow_ranger_talents";
import { reimagined_drow_ranger_wave_of_silence } from "../../../abilities/heroes/drow_ranger/reimagined_drow_ranger_wave_of_silence";
import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor, HasTalent } from "../../../lib/util";

@registerModifier()
export class modifier_reimagined_drow_ranger_gust_tailwind extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();
	particle_tailwind = "particles/heroes/drow_ranger/gust_tailwind.vpcf";
	particle_tailwind_fx?: ParticleID;
	velocity?: Vector;

	// Modifier specials
	silence_duration?: number;
	tailwind_speed?: number;
	tailwind_silence_radius?: number;

	// Reimagined talent properties
	elapsed_time: number = 0;
	projectile_talent_3_gust = "particles/heroes/drow_ranger/talent_taildraft_breeze_projectile.vpcf";

	// Reimagined talent specials
	talent_3_interval?: number;
	talent_3_distance?: number;
	talent_3_width?: number;
	talent_3_projectile_speed?: number;

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
		if (!IsServer()) return;

		// Modifier specials
		this.silence_duration = this.ability.GetSpecialValueFor("silence_duration");
		this.tailwind_speed = this.ability.GetSpecialValueFor("tailwind_speed");
		this.tailwind_silence_radius = this.ability.GetSpecialValueFor("tailwind_silence_radius");

		// Play particle
		this.particle_tailwind_fx = ParticleManager.CreateParticle(this.particle_tailwind, ParticleAttachment.ABSORIGIN_FOLLOW, this.parent);
		ParticleManager.SetParticleControl(this.particle_tailwind_fx, 0, this.parent.GetAbsOrigin());
		this.AddParticle(this.particle_tailwind_fx, false, false, -1, false, false);

		this.StartIntervalThink(FrameTime());
	}

	OnIntervalThink() {
		// Check if the caster wasn't caught: being stunned, out of world etc. will remove the modifier
		if (this.parent.IsStunned() || this.parent.IsOutOfGame() || this.parent.IsHexed() || this.parent.IsCurrentlyHorizontalMotionControlled() || this.parent.IsCurrentlyVerticalMotionControlled()) {
			this.Destroy();
			return;
		}

		// Update particle location
		ParticleManager.SetParticleControl(this.particle_tailwind_fx!, 0, this.parent.GetAbsOrigin());

		// Move the parent in the direction it's currently facing
		let new_pos = (this.parent.GetAbsOrigin() + this.parent.GetForwardVector() * this.tailwind_speed! * FrameTime()) as Vector;
		new_pos = GetGroundPosition(new_pos, this.parent);
		this.parent.SetAbsOrigin(new_pos);

		// Destroy trees in AoE
		GridNav.DestroyTreesAroundPoint(this.parent.GetAbsOrigin(), this.parent.GetHullRadius(), true);

		// Apply silence on nearby enemies in AoE
		const enemies = FindUnitsInRadius(
			this.parent.GetTeamNumber(),
			this.parent.GetAbsOrigin(),
			undefined,
			this.tailwind_silence_radius!,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO + UnitTargetType.BASIC,
			UnitTargetFlags.NONE,
			FindOrder.ANY,
			false
		);

		// Silence enemies it comes in contact with
		for (const enemy of enemies) {
			enemy.AddNewModifier(this.parent, this.ability, BuiltInModifier.SILENCE, { duration: this.silence_duration });
		}

		// Talent: Taildraft Breeze: During Tailwind, Drow Ranger fires a small gust projectile backwards every x seconds, which has y width and goes up to z distance, knocking enemies slightly back and silencing them for t seconds.
		this.ReimaginedTalentTaildraftBreeze();
	}

	DeclareFunctions(): ModifierFunction[] {
		return [ModifierFunction.OVERRIDE_ANIMATION, ModifierFunction.ON_ORDER];
	}

	GetOverrideAnimation(): GameActivity {
		return GameActivity.DOTA_FLAIL;
	}

	OnOrder(event: ModifierUnitEvent): void {
		if (!IsServer()) return;

		// Only apply if the parent is the one who issued the order
		if (event.unit != this.parent) return;

		// Only apply on a stop command
		if (event.order_type == UnitOrder.HOLD_POSITION) {
			this.Destroy();
		}
	}

	CheckState(): Partial<Record<ModifierState, boolean>> {
		return { [ModifierState.DISARMED]: true, [ModifierState.ROOTED]: true, [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true };
	}

	OnDestroy() {
		if (!IsServer()) return;

		if (this.parent.IsCurrentlyHorizontalMotionControlled() || this.parent.IsCurrentlyVerticalMotionControlled()) return;

		// Set the caster at a valid position
		FindClearSpaceForUnit(this.parent, this.parent.GetAbsOrigin(), true);
		ResolveNPCPositions(this.parent.GetAbsOrigin(), this.parent.GetHullRadius());
	}

	ReimaginedTalentTaildraftBreeze() {
		if (HasTalent(this.caster, DrowRangerTalents.DrowRangerTalent_3)) {
			// Initialize vairables
			if (!this.talent_3_interval) this.talent_3_interval = GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_3, "talent_3_interval");
			if (!this.talent_3_distance) this.talent_3_distance = GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_3, "talent_3_distance");
			if (!this.talent_3_width) this.talent_3_width = GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_3, "talent_3_width");
			if (!this.talent_3_projectile_speed) this.talent_3_projectile_speed = GetTalentSpecialValueFor(this.caster, DrowRangerTalents.DrowRangerTalent_3, "talent_3_projectile_speed");

			// Check if enough time has elapsed
			this.elapsed_time += FrameTime();
			if (this.elapsed_time < this.talent_3_interval) return;

			this.elapsed_time = 0;

			// Get the opposite direction the caster is facing
			const direction = this.parent.GetForwardVector() * -1;

			const projectileID = ProjectileManager.CreateLinearProjectile({
				Ability: this.ability,
				EffectName: this.projectile_talent_3_gust,
				Source: this.caster,
				bVisibleToEnemies: true,
				fDistance: this.talent_3_distance,
				fEndRadius: this.talent_3_width,
				fExpireTime: GameRules.GetGameTime() + 5,
				fMaxSpeed: undefined,
				fStartRadius: this.talent_3_width,
				iUnitTargetFlags: UnitTargetFlags.NONE,
				iUnitTargetTeam: UnitTargetTeam.ENEMY,
				iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
				iVisionRadius: undefined,
				iVisionTeamNumber: undefined,
				vAcceleration: undefined,
				vSpawnOrigin: this.caster.GetAttachmentOrigin(this.caster.ScriptLookupAttachment("attach_hitloc")),
				vVelocity: (direction * this.talent_3_projectile_speed) as Vector,
			});

			(this.ability as reimagined_drow_ranger_wave_of_silence).projectile_map.set(projectileID, false);
		}
	}
}
