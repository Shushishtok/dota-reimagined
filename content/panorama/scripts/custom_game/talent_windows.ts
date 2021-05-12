interface DOTAAbilityImage extends Panel {
    abilityname: string;
}

interface CustomGameEventDeclarations {
    learn_talent_event: { ability: EntityIndex };
    confirm_talent_learned: { talent_num: number; learned_by_force: 0 | 1 };
    request_currently_selected_unit: {};
    send_currently_selected_unit: { unit: EntityIndex };
    ping_talent: { ability: EntityIndex; status: TalentStatus };
}

class RmgTalentWindow {
    // Properties
    isTalentWindowCurrentlyOpen: boolean = false;
    isHudCurrentlyVisible: boolean = true;
    currentlySelectedUnitID: EntityIndex;
    talentsCount = 8;
    talentsRows = 4;
    talentsLevelPerRow = 10;
    talentMap: Map<DOTAAbilityImage, AbilityEntityIndex> = new Map();
    currentlyPickedRowsSet: Set<number> = new Set();
    talentSetMap: Map<EntityIndex, AbilityEntityIndex[]> = new Map();

    // Panels
    contextPanel: Panel;
    talentWindow: Panel;
    hudButtonContainer?: Panel;
    hudButton?: Button;
    hudOverlay?: Panel;
    hudScene?: ScenePanel;

    // IDs
    abilityTalentButtonID: string = "Rmg_talent";

    // CSS classes
    cssTalendWindowOpen: string = "Talent_Window_open";
    cssOverlaySelected: string = "visible_overlay";
    cssTalentLearned: string = "talentImageLearned";
    cssTalentButtonUpgradeReady: string = "upgradeAvailable";
    cssTalentUnlearnable: string = "talentImageUnlearnable";
    cssTalentLearnable: string = "talentLearnableGlow";

    constructor(contextPanel: Panel, currentlySelectedUnitID: EntityIndex) {
        this.currentlySelectedUnitID = currentlySelectedUnitID;
        this.contextPanel = contextPanel;
        this.talentWindow = this.GetHudRoot().FindChildTraverse("CustomUIRoot")!.FindChildTraverse("CustomUIContainer_Hud")!.FindChildTraverse("TalentsHeader")!.GetParent()!;
        this.RemoveDotaTalentTree();
        this.AddRmgHudTalentButton();
        this.ConfigureTalentHud();
        this.SubscribeToEvents();
        this.InitializeHeroTalents();
        this.ConfigureTalentAbilityButtons();
        this.ConfigureTalentHotkey();
    }

    intToARGB(i: number): string {
        return (
            ("00" + (i & 0xff).toString(16)).substr(-2) +
            ("00" + ((i >> 8) & 0xff).toString(16)).substr(-2) +
            ("00" + ((i >> 16) & 0xff).toString(16)).substr(-2) +
            ("00" + ((i >> 24) & 0xff).toString(16)).substr(-2)
        );
    }

    AddRmgHudTalentButton() {
        // Find the ability bar
        const abilityBar = this.GetHudRoot()
            .FindChildTraverse("HUDElements")!
            .FindChildTraverse("lower_hud")!
            .FindChildTraverse("center_with_stats")!
            .FindChildTraverse("center_block")!
            .FindChildTraverse("AbilitiesAndStatBranch")!
            .FindChildTraverse("StatBranch")!
            .GetParent()!;

        // Find old button and delete if relevant
        const oldHudButtonContainer = abilityBar.FindChildTraverse("talent_btn_container")!;
        if (oldHudButtonContainer) {
            oldHudButtonContainer.DeleteAsync(0);
        }

        this.hudButtonContainer = $.CreatePanel("Panel", abilityBar, "talent_btn_container");
        const abilityList = abilityBar.FindChildTraverse("StatBranch")!;
        this.hudButtonContainer.BLoadLayout("file://{resources}/layout/custom_game/talent_hud.xml", true, false);
        this.hudButtonContainer.SetParent(abilityBar);
        abilityBar.MoveChildAfter(this.hudButtonContainer, abilityList);

        // Find the button inside the container
        this.hudButton = this.hudButtonContainer!.FindChildTraverse("talent_hud_btn")!;
    }

    RemoveDotaTalentTree() {
        // Find the talent tree and disable it
        const talentTree = this.GetHudRoot()
            .FindChildTraverse("HUDElements")!
            .FindChildTraverse("lower_hud")!
            .FindChildTraverse("center_with_stats")!
            .FindChildTraverse("center_block")!
            .FindChildTraverse("AbilitiesAndStatBranch")!
            .FindChildTraverse("StatBranch")!;
        talentTree.style.visibility = "collapse";
        talentTree.SetPanelEvent("onmouseover", function () {});
        talentTree.SetPanelEvent("onactivate", function () {});

        // Disable the level up frame for the talent tree
        const levelUpButton = this.GetHudRoot()
            .FindChildTraverse("HUDElements")!
            .FindChildTraverse("lower_hud")!
            .FindChildTraverse("center_with_stats")!
            .FindChildTraverse("center_block")!
            .FindChildTraverse("level_stats_frame")!;
        levelUpButton.style.visibility = "collapse";
    }

    ConfigureTalentAbilityButtons() {
        for (let index = 1; index <= this.talentsCount; index++) {
            const button = $("#" + this.abilityTalentButtonID + index) as DOTAAbilityImage;

            button.SetPanelEvent("onactivate", () => this.LearnTalent(button));
            button.SetPanelEvent("onmouseover", () => this.ShowTooltip(button));
            button.SetPanelEvent("onmouseout", () => this.HideTooltip());
        }
    }

    GetHudRoot() {
        return this.contextPanel.GetParent()!.GetParent()!.GetParent()!;
    }

    ConfigureTalentHud() {
        this.hudButton!.SetPanelEvent("onactivate", () => this.OnHudButtonClick());
        this.hudOverlay = this.hudButtonContainer!.FindChildTraverse("talent_hud_btn_overlay")!;
        this.hudScene = this.hudButtonContainer!.FindChildTraverse("talent_hud_scene") as ScenePanel;
    }

    OnHudButtonClick() {
        this.ToggleTalentWindow();
    }

    ToggleTalentWindow() {
        // Currently close: open!
        if (!this.isTalentWindowCurrentlyOpen) {
            this.GetHeroTalents();
            this.isTalentWindowCurrentlyOpen = true;
            this.talentWindow.AddClass(this.cssTalendWindowOpen);
            this.hudOverlay!.AddClass(this.cssOverlaySelected);
        } // Currently open: close!
        else {
            this.isTalentWindowCurrentlyOpen = false;
            this.talentWindow.RemoveClass(this.cssTalendWindowOpen);
            Game.EmitSound("ui_chat_slide_out");
            this.hudOverlay!.RemoveClass(this.cssOverlaySelected);
        }
    }

    CloseTalentWindow_UnitDeselected() {
        const unitIDPortrait = Players.GetLocalPlayerPortraitUnit();

        if (this.isTalentWindowCurrentlyOpen) {
            // If this is another hero, then refill the talent window without closing it
            if (Entities.IsHero(unitIDPortrait)) {
                this.GetHeroTalents();
            } // Close the window
            else {
                this.ToggleTalentWindow();
            }
        }
    }

    GetHeroTalents() {
        const currently_selected_hero = Players.GetLocalPlayerPortraitUnit();

        // Do nothing if the current player is not a hero
        if (!Entities.IsHero(currently_selected_hero)) return;

        if (currently_selected_hero != this.currentlySelectedUnitID) {
            // Update currently selected hero unit
            this.currentlySelectedUnitID = currently_selected_hero;

            // Update talents
            this.InitializeHeroTalents();
        }
    }

    InitializeHeroTalents() {
        // Clear the rows set
        this.currentlyPickedRowsSet.clear();

        // Delete the current talents, if any
        this.talentMap.clear();

        if (!this.talentSetMap.has(this.currentlySelectedUnitID)) {
            // Count how many abilities this unit actually has
            let abilityCount = 0;
            for (let index = 0; index < Entities.GetAbilityCount(this.currentlySelectedUnitID!); index++) {
                const ability = Entities.GetAbility(this.currentlySelectedUnitID!, index);
                if (Entities.IsValidEntity(ability)) abilityCount++;
                else break;
            }

            // Assign the last abilities to the array
            let abilitySet: AbilityEntityIndex[] = [];
            let ability;
            for (let index = 0; index < this.talentsCount; index++) {
                const abilityIndex = abilityCount - this.talentsCount + index;
                ability = Entities.GetAbility(this.currentlySelectedUnitID!, abilityIndex);
                abilitySet[index] = ability;
            }

            this.talentSetMap.set(this.currentlySelectedUnitID, abilitySet);
        }

        // Find all talents abilities
        const abilitySet = this.talentSetMap.get(this.currentlySelectedUnitID)!;

        let rowNum = 1;
        let ability;
        for (let index = 1; index <= this.talentsCount; index++) {
            // Get talent button
            const talentIDString: string = "#" + this.abilityTalentButtonID + index;
            const talentButton: DOTAAbilityImage = $(talentIDString) as DOTAAbilityImage;

            // Get amount of abilities that this hero has - talents would always be his last abilities
            ability = abilitySet[index - 1];

            // Map the button to the ability
            this.talentMap.set(talentButton, ability);

            // Clear the unlearnable style if it has one
            if (talentButton.BHasClass(this.cssTalentUnlearnable)) {
                talentButton.RemoveClass(this.cssTalentUnlearnable);
            }

            // Change the image to the ability's texture
            talentButton.abilityname = Abilities.GetAbilityName(ability);

            // If talent is already learned, add the learned class to it
            if (Abilities.GetLevel(ability) > 0) {
                talentButton.AddClass(this.cssTalentLearned);

                // Mark this row as a row with a learned talent
                this.currentlyPickedRowsSet.add(rowNum);
            } else {
                // Remove it from talents that weren't learned when switching to another unit
                if (talentButton.BHasClass(this.cssTalentLearned)) {
                    talentButton.RemoveClass(this.cssTalentLearned);
                }
            }

            // Increment row every two talents
            if (index % 2 == 0) {
                rowNum++;
            }
        }

        // Run again: find all talents that should be disabled. This is needed due to some talents not being attached yet in the first loop
        for (const button of this.talentMap.keys()) {
            const ability = this.talentMap.get(button)!;
            if (Abilities.GetLevel(ability) == 0 && this.currentlyPickedRowsSet.has(this.GetTalentRow(ability)!)) {
                button.AddClass(this.cssTalentUnlearnable);
            }
        }

        // Reinitialize button events
        this.ConfigureTalentAbilityButtons();
    }

    ToggleHud() {
        const currentEntity = Players.GetLocalPlayerPortraitUnit();
        if (this.isHudCurrentlyVisible) {
            if (!Entities.IsValidEntity(currentEntity) || !Entities.IsHero(currentEntity)) {
                this.hudButtonContainer!.style.visibility = "collapse";
                this.isHudCurrentlyVisible = false;
            }
        } else {
            if (Entities.IsValidEntity(currentEntity) && Entities.IsHero(currentEntity)) {
                this.hudButtonContainer!.style.visibility = "visible";
                this.isHudCurrentlyVisible = true;
            }
        }
    }

    CanHeroUpgradeAnyTalent(): boolean {
        if (this.currentlySelectedUnitID) {
            // If this is not the hero under the local player's control, return false
            // Allows to see for other heroes in tools
            if (!Game.IsInToolsMode()) {
                if (this.currentlySelectedUnitID != Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer())) {
                    return false;
                }
            }

            // Ignore illusions
            if (Entities.IsIllusion(this.currentlySelectedUnitID)) {
                return false;
            }

            // Check if the selected hero has any upgrade points
            if (Entities.GetAbilityPoints(this.currentlySelectedUnitID) > 0) {
                // Check if any row is unlocked by level
                const hero_level = Entities.GetLevel(this.currentlySelectedUnitID);
                for (let index = 1; index <= this.talentsRows; index++) {
                    // Check if hero's level is over the threshold to unlock this row
                    if (hero_level >= this.talentsLevelPerRow * index) {
                        if (!this.currentlyPickedRowsSet.has(index)) {
                            // We found a row that didn't have a talent picked yet!
                            return true;
                        }
                    }
                }

                return false;
            }
        }

        // We're not supposed to ever get here, but just in case
        return false;
    }

    CanTalentBeLearned(ability: AbilityEntityIndex): boolean {
        // If ability is already leveled, return false
        if (Abilities.GetLevel(ability) > 0) {
            return false;
        }

        // If the ability doesn't belong to to the unit being clicked on, return false
        // Only in tools mode: allows to choose talents for other players
        if (!Game.IsInToolsMode()) {
            if (Abilities.GetCaster(ability) != Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer())) {
                return false;
            }
        }

        // If this is an illusion, return false
        if (Entities.IsIllusion(this.currentlySelectedUnitID)) {
            return false;
        }

        // If the hero cannot upgrade any talents, return false
        if (!this.CanHeroUpgradeAnyTalent) {
            return false;
        }

        // Find which button has the talent and fetch its ID to determine its level requirements
        let level_requirement;
        for (const button of this.talentMap.keys()) {
            if (this.talentMap.get(button) === ability) {
                level_requirement = this.GetTalentRow(ability)! * this.talentsLevelPerRow;
                break;
            }
        }

        // If ability's level requirement is higher than the hero's level, return false
        const hero_level = Entities.GetLevel(this.currentlySelectedUnitID);
        if (!level_requirement || hero_level < level_requirement) {
            return false;
        }

        // Check if a talent in the same row was picked
        if (this.currentlyPickedRowsSet.has(this.GetTalentRow(ability)!)) {
            return false;
        }

        return true;
    }

    LearnTalent(button: DOTAAbilityImage) {
        // Get the ability mapped to the button
        if (this.talentMap.has(button)) {
            const ability = this.talentMap.get(button)!;
            if (this.CanTalentBeLearned(ability)) {
                if (GameUI.IsAltDown()) {
                    // Ping talent
                    GameEvents.SendCustomGameEventToServer("ping_talent", {
                        ability: ability,
                        status: TalentStatus.CAN_BE_LEARNED,
                    });
                } else {
                    // Send event to server to apply the talent
                    GameEvents.SendCustomGameEventToServer("learn_talent_event", { ability: ability });
                }
            } else {
                // Pinging the talent
                if (GameUI.IsAltDown()) {
                    if (Abilities.GetLevel(ability) > 0) {
                        GameEvents.SendCustomGameEventToServer("ping_talent", {
                            ability: ability,
                            status: TalentStatus.LEARNED,
                        });
                    } else if (Abilities.GetLevel(this.talentMap.get(this.GetSecondaryAbilityInRow(ability)!)!) > 0) {
                        GameEvents.SendCustomGameEventToServer("ping_talent", {
                            ability: ability,
                            status: TalentStatus.UNLEARNABLE,
                        });
                    } else {
                        GameEvents.SendCustomGameEventToServer("ping_talent", {
                            ability: ability,
                            status: TalentStatus.NOT_LEARNED,
                        });
                    }
                }
            }
        }
    }

    OnTalentLearnedConfirmed(event: { talent_num: number; learned_by_force: 0 | 1 }) {
        const talent_num = event.talent_num;
        let learn_talent_by_force: boolean;
        if (event.learned_by_force == 1) learn_talent_by_force = true;
        else learn_talent_by_force = false;

        // Find talent button by ID
        const talentIDString: string = "#" + this.abilityTalentButtonID + talent_num;
        const talentButton: DOTAAbilityImage = $(talentIDString) as DOTAAbilityImage;

        if (talentButton && this.talentMap.has(talentButton)) {
            const ability = this.talentMap.get(talentButton)!;

            // Add the learned class to the button
            talentButton.AddClass(this.cssTalentLearned);

            // Add row of the talent to the map
            this.currentlyPickedRowsSet.add(this.GetTalentRow(ability)!);

            // Set the second ability of the same row as unselectedable
            const secondary_button = this.GetSecondaryAbilityInRow(ability)!;
            if (secondary_button) {
                secondary_button.AddClass(this.cssTalentUnlearnable);
            }

            // Check if the HUD should still be animated. Check after a frame since it's checking too fast otherwise
            $.Schedule(0, () => {
                this.AnimateHudTalentButton();
                this.AnimateLearnableAbilities();

                // Check if any other talent can still be learned. If not, toggle the window
                if (!this.CanHeroUpgradeAnyTalent()) {
                    if (!learn_talent_by_force) {
                        this.ToggleTalentWindow();
                    }
                }
            });
        }
    }

    OnRequestSelectedUnit() {
        const unit = Players.GetLocalPlayerPortraitUnit();
        GameEvents.SendCustomGameEventToServer("send_currently_selected_unit", { unit: unit });
    }

    GetTalentRow(ability: AbilityEntityIndex): number | undefined {
        for (const button of this.talentMap.keys()) {
            if (this.talentMap.get(button) === ability) {
                const id_number: number = parseInt(button.id.substr(-1));
                return Math.ceil(id_number / 2);
            }
        }
    }

    GetSecondaryAbilityInRow(ability: AbilityEntityIndex): DOTAAbilityImage | undefined {
        const talent_row = this.GetTalentRow(ability);
        for (const button of this.talentMap.keys()) {
            const second_ability = this.talentMap.get(button);
            if (second_ability && second_ability != ability && this.GetTalentRow(second_ability) == talent_row) {
                return button;
            }
        }
    }

    AnimateHudTalentButton() {
        if (this.currentlySelectedUnitID) {
            if (
                Entities.IsValidEntity(this.currentlySelectedUnitID) &&
                Entities.IsRealHero(this.currentlySelectedUnitID) &&
                Entities.IsControllableByPlayer(this.currentlySelectedUnitID, Players.GetLocalPlayer())
            ) {
                $.Schedule(0, () => {
                    if (this.CanHeroUpgradeAnyTalent()) {
                        if (!this.hudButton!.BHasClass(this.cssTalentButtonUpgradeReady)) {
                            this.hudButton!.AddClass(this.cssTalentButtonUpgradeReady);
                            this.hudScene!.AddClass(this.cssTalentButtonUpgradeReady);
                        }
                    } else {
                        if (this.hudButton!.BHasClass(this.cssTalentButtonUpgradeReady)) {
                            this.hudButton!.RemoveClass(this.cssTalentButtonUpgradeReady);
                            this.hudScene!.RemoveClass(this.cssTalentButtonUpgradeReady);
                        }
                    }
                });
            }
        }
    }

    AnimateLearnableAbilities() {
        if (this.currentlySelectedUnitID) {
            if (
                Entities.IsValidEntity(this.currentlySelectedUnitID) &&
                Entities.IsRealHero(this.currentlySelectedUnitID) &&
                Entities.IsControllableByPlayer(this.currentlySelectedUnitID, Players.GetLocalPlayer())
            ) {
                $.Schedule(0, () => {
                    // Cycle between all buttons
                    for (const button of this.talentMap.keys()) {
                        const ability = this.talentMap.get(button);
                        if (ability) {
                            if (this.CanTalentBeLearned(ability)) {
                                button.AddClass(this.cssTalentLearnable);
                            } else {
                                if (button.BHasClass(this.cssTalentLearnable)) {
                                    button.RemoveClass(this.cssTalentLearnable);
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    ShowTooltip(button: DOTAAbilityImage) {
        const title = this.GetTooltipTitle(button);
        const description = this.GetTooltipDescription(button);
        const lore = this.GetTooltipLore(button);
        const formattedTooltip = this.FormatTooltip(description, lore);

        $.DispatchEvent("DOTAShowTitleTextTooltip", button, title, formattedTooltip);
    }

    GetTooltipTitle(button: DOTAAbilityImage): string {
        const ability_name = button.abilityname;

        let title = $.Localize("DOTA_Tooltip_ability_" + ability_name, button);
        if (title === "DOTA_Tooltip_ability_" + ability_name) {
            title = "";
        } else {
            title = title.replace("[!s:value]%", "%value%%%");
            title = title.replace("[!s:value]", "%value%");
            title = GameUI.ReplaceDOTAAbilitySpecialValues(ability_name, title)!;
        }
        return title;
    }

    GetTooltipDescription(button: DOTAAbilityImage): string {
        const ability_name = button.abilityname;

        let description = $.Localize("DOTA_Tooltip_ability_" + ability_name + "_Description", button);
        if (description === "DOTA_Tooltip_ability_" + ability_name + "_Description") {
            description = "";
        } else {
            description = description.replace("[!s:value]%", "%value%%%");
            description = description.replace("[!s:value]", "%value%");
            description = GameUI.ReplaceDOTAAbilitySpecialValues(ability_name, description)!;
        }

        return description;
    }

    GetTooltipLore(button: DOTAAbilityImage): string {
        const ability_name = button.abilityname;

        let lore = $.Localize("DOTA_Tooltip_ability_" + ability_name + "_Lore", button);
        if (lore === "DOTA_Tooltip_ability_" + ability_name + "_Lore") {
            lore = "";
        }

        return lore;
    }

    HideTooltip() {
        $.DispatchEvent("DOTAHideTitleTextTooltip");
    }

    FormatTooltip(description: string, lore: string): string {
        const beforeNumber = "<font color='#5B93D1'><b>";
        const afterNumber = "</b></font>";

        let regex = /\d+\.?\d*\%?/g;
        let numbers = description.match(regex);

        if (numbers) {
            let lastNumberPosition = 0;
            for (let index = 0; index < numbers.length; index++) {
                const number = numbers[index];

                // Find the number's index in the string
                const numberPosition = description.indexOf(number, lastNumberPosition);

                // Get number's digit length
                const numberLength = number.length;

                // Add the span before and after the number
                description = description.slice(0, numberPosition + numberLength) + afterNumber + description.slice(numberPosition + numberLength);
                description = description.slice(0, numberPosition) + beforeNumber + description.slice(numberPosition);

                // Update the last number position for next iterations of indexOf
                lastNumberPosition = numberPosition + numberLength + beforeNumber.length;
            }
        }

        if (lore != "") {
            // Italicize the lore
            lore = "<br><br><i>" + lore + "</i>";
        }

        const formattedText = description + lore;
        return formattedText;
    }

    SubscribeToEvents() {
        GameEvents.Subscribe("dota_player_gained_level", () => this.OnPlayerGainedLevel());
        GameEvents.Subscribe("dota_player_learned_ability", () => this.OnPlayerLearnedAbility());
        GameEvents.Subscribe("dota_player_update_query_unit", () => this.OnPlayerUpdateQueryUnit());
        GameEvents.Subscribe("dota_player_update_selected_unit", () => this.OnPlayerUpdateSelectedUnit());
        GameEvents.Subscribe("confirm_talent_learned", (event) => this.OnTalentLearnedConfirmed(event));
        GameEvents.Subscribe("request_currently_selected_unit", () => this.OnRequestSelectedUnit());
    }

    OnPlayerGainedLevel() {
        this.AnimateHudTalentButton();
        this.AnimateLearnableAbilities();
    }

    OnPlayerLearnedAbility() {
        this.AnimateHudTalentButton();
        this.AnimateLearnableAbilities();
    }

    OnPlayerUpdateQueryUnit() {
        this.CloseTalentWindow_UnitDeselected();
        this.ToggleHud();
        this.AnimateHudTalentButton();
        this.GetHeroTalents();
        this.AnimateLearnableAbilities();
    }

    OnPlayerUpdateSelectedUnit() {
        this.CloseTalentWindow_UnitDeselected();
        this.ToggleHud();
        this.AnimateHudTalentButton();
        this.GetHeroTalents();
        this.AnimateLearnableAbilities();
    }

    ConfigureTalentHotkey() {
        const talentHotkey = Game.GetKeybindForCommand(DOTAKeybindCommand_t.DOTA_KEYBIND_LEARN_STATS);
        Game.CreateCustomKeyBind(talentHotkey, "AttributeHotkey");
        Game.AddCommand("AttributeHotkey", () => this.OnHudButtonClick(), "", 0);

        //Enable focus for talent window children (this is to allow catching of Escape button)
        this.RecurseEnableFocus(this.contextPanel);

        $.RegisterKeyBind(this.contextPanel, "key_escape", () => {
            if (this.isTalentWindowCurrentlyOpen) {
                this.ToggleTalentWindow();
            }
        });

        // Allow mouse clicks outside the talent window to close it.
        GameUI.SetMouseCallback((event: MouseEvent, value: MouseButton | MouseScrollDirection) => this.SetMouseCallback(event, value));
    }

    SetMouseCallback(event: MouseEvent, value: MouseButton | MouseScrollDirection): boolean {
        if (this.isTalentWindowCurrentlyOpen && value == CLICK_BEHAVIORS.DOTA_CLICK_BEHAVIOR_NONE) {
            if (event == "pressed") {
                const cursorPos = GameUI.GetCursorPosition();
                if (
                    cursorPos[0] < this.talentWindow.actualxoffset ||
                    this.talentWindow.actualxoffset + this.talentWindow.contentwidth < cursorPos[0] ||
                    cursorPos[1] < this.talentWindow.actualyoffset ||
                    this.talentWindow.actualyoffset + this.talentWindow.contentheight < cursorPos[1]
                ) {
                    const currentUnit = this.currentlySelectedUnitID;
                    $.Schedule(0, () => {
                        // Only close the window if we didn't change the selection of units
                        if (Players.GetLocalPlayerPortraitUnit() == currentUnit) {
                            this.ToggleTalentWindow();
                        }
                    });
                }
            }
        }

        return false;
    }

    RecurseEnableFocus(panel: Panel) {
        panel.SetAcceptsFocus(true);
        const children = panel.Children();

        children.forEach((child) => {
            this.RecurseEnableFocus(child);
        });
    }

    FindDotaHudElement(): Panel {
        const contextPanel = this.contextPanel;
        let currentPanel = contextPanel;
        while (currentPanel.id !== "DotaHud") {
            currentPanel = currentPanel.GetParent()!;
        }

        return currentPanel;
    }
}

$.Schedule(2, () => {
    const hero = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    new RmgTalentWindow($.GetContextPanel(), hero);
});
