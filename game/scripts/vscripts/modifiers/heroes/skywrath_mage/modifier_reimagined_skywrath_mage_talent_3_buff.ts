import { BaseModifier, registerModifier } from "../../../lib/dota_ts_adapter";
import { GetTalentSpecialValueFor } from "../../../lib/util";
import { reimagined_skywrath_mage_concussive_shot } from "../../../abilities/heroes/skywrath_mage/reimagined_skywrath_mage_concussive_shot";
import { SkywrathMageTalents } from "../../../abilities/heroes/skywrath_mage/reimagined_skywrath_mage_talents";

@registerModifier()
export class modifier_reimagined_skywrath_mage_talent_3_buff extends BaseModifier {
	// Modifier properties
	caster: CDOTA_BaseNPC = this.GetCaster()!;
	ability: CDOTABaseAbility = this.GetAbility()!;
	parent: CDOTA_BaseNPC = this.GetParent();

	// Modifier specials
	search_interval?: number;
	launch_radius?: number;

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
		// Modifier specials
		this.search_interval = GetTalentSpecialValueFor(this.caster, SkywrathMageTalents.SkywrathMageTalent_3, "search_interval");
		this.launch_radius = this.ability.GetSpecialValueFor("launch_radius");
		if (IsServer()) this.StartIntervalThink(this.search_interval);
	}

	OnIntervalThink(): void {
		// Search for nearby enemy heroes, including spell immune
		let enemies = FindUnitsInRadius(
			this.caster.GetTeamNumber(),
			this.caster.GetAbsOrigin(),
			undefined,
			this.launch_radius!,
			UnitTargetTeam.ENEMY,
			UnitTargetType.HERO,
			UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.FOW_VISIBLE,
			FindOrder.CLOSEST,
			false
		);

		// If no enemy heroes were found, check for nearby enemy creeps
		if (enemies.length == 0) {
			enemies = FindUnitsInRadius(
				this.caster.GetTeamNumber(),
				this.caster.GetAbsOrigin(),
				undefined,
				this.launch_radius!,
				UnitTargetTeam.ENEMY,
				UnitTargetType.BASIC,
				UnitTargetFlags.MAGIC_IMMUNE_ENEMIES + UnitTargetFlags.FOW_VISIBLE,
				FindOrder.CLOSEST,
				false
			);
		}

		// If we found at least one enemy, fire and remove self
		if (enemies.length > 0) {
			const enemy = enemies[0];
			const ability_type = this.ability as reimagined_skywrath_mage_concussive_shot;

			ability_type.LaunchConcussiveShot(this.caster, enemy, ability_type.ReimaginedConjuredRelayMarker(enemy), true);
			this.Destroy();
		}
	}
}
