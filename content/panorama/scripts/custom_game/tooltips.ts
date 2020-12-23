interface DOTAAbilityImage extends Panel
{
    abilityname: string;
}

class OverrideAbilityTooltips
{
    last_used_ability_name: string = "";

    constructor()
    {
        this.RegisterToEvents();
    }

    GetDescriptionPanel(): Panel | undefined
    {
        // Navigate to ability tooltip panel
        let hud = $.GetContextPanel().GetParent()!.GetParent()!.GetParent()!;
        let description = hud.FindChildTraverse("Tooltips");
        if (!description) return;
            description = description.FindChildTraverse("DOTAAbilityTooltip");
        if (!description) return;
            description = description.FindChildTraverse("AbilityDescriptionOuterContainer");
        if (!description) return;

        return description;
    }

    IsDifferentAbilityName(abilityName: string): boolean
    {
        // Check if ability name is empty
        if (this.last_used_ability_name = "")
        {
            // Register ability
            this.last_used_ability_name = abilityName;
            return true;
        }
        else
        {
            // Compare with last ability - do nothing if those are the same. Otherwise, register new ability name
            if (this.last_used_ability_name == abilityName) return false;
            else
            {
                this.last_used_ability_name = abilityName
                return true;
            }
        }
    }

    DeleteOldAbilityTooltips(description: Panel)
    {
        // Remove old custom tooltips
        let old = description.Children()
        if (old)
        {
            old.forEach((child) =>
            {
                if(child.id == "CustomTooltip")
                {
                    child.RemoveAndDeleteChildren()
                    child.DeleteAsync(0)
                }
            })
        }
    }

    CreateNewReimaginedAbilityTooltips(description: Panel, abilityName: string)
    {
        let ability_string = "DOTA_Tooltip_Ability_" + abilityName + "_";
        let header_string = "rmg_title_";
        let description_string = "rmg_description_"
        let effect_number = 1;
        let header_tooltip = $.Localize(ability_string + header_string + effect_number);

        // Create new custom tooltips as long as there are more effects to create
        while (header_tooltip != ability_string + header_string + effect_number)
        {
            // Make main body
            let container = $.CreatePanel("Panel", description, "CustomTooltip")

            // Load empty layout to include the CSS into the scope of vanilla tooltip panels
            container.BLoadLayout('file://{resources}/layout/custom_game/tooltips.xml',false,false);

            // Apply CSS for panel
            container.AddClass("CustomTooltipContainer");

            // Add header panel
            let header;
            header = $.CreatePanel("Label", container, "")
            header.AddClass("Header")
            header.text = header_tooltip.toUpperCase();

            // Add the description panel
            let panel = $.CreatePanel("Label", container, "")
            let description_tooltip = $.Localize("#" + ability_string + description_string + effect_number);
            description_tooltip = GameUI.ReplaceDOTAAbilitySpecialValues(abilityName, description_tooltip)!;

            // Check if the portrait is a teammate or self
            const currentlySelectedUnit = Players.GetLocalPlayerPortraitUnit();
            if (Entities.GetTeamNumber(currentlySelectedUnit) == Players.GetTeam((Players.GetLocalPlayer())))
            {
                const ability = Entities.GetAbilityByName(currentlySelectedUnit, abilityName);
                const level = Abilities.GetLevel(ability);
                if (level > 0)
                {
                    description_tooltip = this.FormatAbilitySpecialValues(description_tooltip, level);
                }
            }

            panel.html = true;
            panel.text = description_tooltip;

            // Generate the next header tooltip
            effect_number++
            header_tooltip = $.Localize(ability_string + header_string + effect_number)

            // Should never actually happen, but just to be sure
            if (effect_number > 10) break
        }
    }

    RegisterToEvents()
    {
        // Ability tooltips
        $.RegisterForUnhandledEvent("DOTAShowAbilityTooltipForEntityIndex", (abilityPanel, abilityName) => this.OnAbilityTooltipShown(abilityPanel, abilityName));

        // Updated ability tooltips when
        GameEvents.Subscribe("dota_player_learned_ability", (event) => this.OnAbilityPointsChanged(event))

        // Item tooltips
        $.RegisterForUnhandledEvent("DOTAShowAbilityShopItemTooltip", (abilityPanel, abilityName) => this.OnItemTooltipShown(abilityPanel, abilityName));

        // Hero pick screen
        $.RegisterForUnhandledEvent("DOTAShowAbilityTooltip", (abilityPanel, abilityName) => this.OnTooltipShown(abilityPanel, abilityName))
    }

    OnTooltipShown(abilityPanel: Panel, abilityname: string)
    {
        if (abilityname.substring(0, 5) == "item_")
        {
            this.OnItemTooltipShown(abilityPanel, abilityname);
            return;
        }

        this.OnAbilityTooltipShown($.GetContextPanel(), abilityname);
    }

    OnAbilityTooltipShown(abilityPanel: Panel, abilityName: string)
    {
        let description = this.GetDescriptionPanel();
        if (!description)
        {
            if (this.last_used_ability_name === "")
            {
                $.Schedule(0, () =>
                {
                    this.OnAbilityTooltipShown(abilityPanel, abilityName);
                })
            }
            return;
        }

        if (!this.IsDifferentAbilityName(abilityName)) return;
        this.DeleteOldAbilityTooltips(description);
        this.CreateNewReimaginedAbilityTooltips(description, abilityName);
    }

    OnItemTooltipShown(abilityPanel: Panel, abilityName: string)
    {
        let description = this.GetDescriptionPanel();
        if (!description) return;

        if (!this.IsDifferentAbilityName(abilityName)) return;
        this.DeleteOldAbilityTooltips(description);
    }

    FormatAbilitySpecialValues(text: string, abilityLevel: number): string
    {
        const beforeNumber = "<span class='CustomTooltipValue'>";
        const afterNumber = "</span>";

        let number_regex = /\d+\.?\d*\%?/g;
        let numbers = text.match((number_regex));
        let currentMultiLevelValueCount = 0;
        if (numbers)
        {
            let lastNumberPosition = 0;
            for (let index = 0; index < numbers.length; index++)
            {
                const number = numbers[index];

                // Find the number's index in the string
                const numberPosition = text.indexOf(number, lastNumberPosition);

                // Get number's digit length
                const numberLength = number.length;

                // Check if the number is a multi level value
                if (text[numberPosition + numberLength] === "<") // not a multi leveled value, or the last multi leveled value
                {
                    text = text.slice(0, numberPosition + numberLength) + afterNumber + text.slice(numberPosition + numberLength);
                    text = text.slice(0, numberPosition) + beforeNumber + text.slice(numberPosition);

                    lastNumberPosition = numberPosition + numberLength + beforeNumber.length;

                    currentMultiLevelValueCount = 0;
                }
                else
                {
                    // Multi-level
                    currentMultiLevelValueCount++;
                    if (abilityLevel === currentMultiLevelValueCount)
                    {
                        text = text.slice(0, numberPosition + numberLength) + afterNumber + text.slice(numberPosition + numberLength);
                        text = text.slice(0, numberPosition) + beforeNumber + text.slice(numberPosition);

                        lastNumberPosition = numberPosition + numberLength + beforeNumber.length;

                        // Skip checking numbers for the unnecessary levels
                        index += (4 - abilityLevel);
                    }
                    else
                    {
                        lastNumberPosition = numberPosition + numberLength;
                    }
                }
            }
        }

        return text;
    }

    OnAbilityPointsChanged(event: DotaPlayerLearnedAbilityEvent)
    {
        if (event.abilityname != this.last_used_ability_name) return;

        // Update the tooltips
        this.OnAbilityTooltipShown($.GetContextPanel(), event.abilityname);
    }
}

$.Schedule(0, () =>
{
    $.Msg("Tooltips loaded");
    new OverrideAbilityTooltips();
});
