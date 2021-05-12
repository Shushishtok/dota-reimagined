import { registerModifier } from "../../../lib/dota_ts_adapter";
import { registerTalent, BaseTalent, BaseTalentModifier } from "../../../lib/talents";

// If we want a talent with standard modifier, the below is enough
// @registerTalent()
// export class reimagined_skywrath_mage_talent_1 extends BaseTalent {}

// If we want a custom modifier (e.g. make it call events or do something specific) do this:
// @registerModifier()
// export class modifier_reimagined_skywrath_mage_talent_1 extends BaseTalentModifier
// {
//      // Do your stuff here!
// }

// @registerTalent(undefined, modifier_reimagined_skywrath_mage_talent_1)
// export class reimagined_skywrath_mage_talent_1 extends BaseTalent {}

export const enum SkywrathMageTalents {
	SkywrathMageTalent_1 = "reimagined_skywrath_mage_talent_1",
	SkywrathMageTalent_2 = "reimagined_skywrath_mage_talent_2",
	SkywrathMageTalent_3 = "reimagined_skywrath_mage_talent_3",
	SkywrathMageTalent_4 = "reimagined_skywrath_mage_talent_4",
	SkywrathMageTalent_5 = "reimagined_skywrath_mage_talent_5",
	SkywrathMageTalent_6 = "reimagined_skywrath_mage_talent_6",
	SkywrathMageTalent_7 = "reimagined_skywrath_mage_talent_7",
	SkywrathMageTalent_8 = "reimagined_skywrath_mage_talent_8",
}

@registerTalent()
export class reimagined_skywrath_mage_talent_1 extends BaseTalent {}

@registerTalent()
export class reimagined_skywrath_mage_talent_2 extends BaseTalent {}

@registerTalent()
export class reimagined_skywrath_mage_talent_3 extends BaseTalent {}

@registerTalent()
export class reimagined_skywrath_mage_talent_4 extends BaseTalent {}

@registerTalent()
export class reimagined_skywrath_mage_talent_5 extends BaseTalent {}

@registerTalent()
export class reimagined_skywrath_mage_talent_6 extends BaseTalent {}

@registerTalent()
export class reimagined_skywrath_mage_talent_7 extends BaseTalent {}

@registerTalent()
export class reimagined_skywrath_mage_talent_8 extends BaseTalent {}
