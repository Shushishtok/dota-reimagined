import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "./dota_ts_adapter"

export const registerTalent = (name?: string, Modifier?: typeof BaseTalentModifier) => (ability: typeof BaseTalent) => 
{
    registerAbility(name)(ability);

    if (Modifier === undefined)
    {
        @registerModifier('modifier_' + ability.name)
        class TalentModifier extends BaseTalentModifier {}
        Modifier = TalentModifier;
    }

    ability.Modifier = Modifier;        
}

export class BaseTalent extends BaseAbility
{
    static Modifier: typeof BaseModifier;    

    GetIntrinsicModifierName(): string
    {
        return (this.constructor as typeof BaseTalent).Modifier.name;
    }
}

export class BaseTalentModifier extends BaseModifier
{    
    IsHidden() {return true}
    IsDebuff() {return false}
    IsPurgable() {return false}
    RemoveOnDeath() {return false}
    IsPermanent() {return true}    
}