class PickScreen {
	constructor() {
		this.RemoveTalentIcon();
	}

	RemoveTalentIcon() {
		const heroContainerPanel = this.GetContextPanel()
			.FindChildTraverse("PreGame")!
			.FindChildTraverse("MainContents")!
			.FindChildTraverse("ScreenContainer")!
			.FindChildTraverse("HeroPickScreen")!
			.FindChildTraverse("HeroPickScreenContents")!
			.FindChildTraverse("MainHeroPickScreenContents")!
			.FindChildTraverse("HeroPickRightColumn")!
			.FindChildTraverse("HeroInspect")!
			.FindChildTraverse("HeroAbilities")!;
		if (heroContainerPanel) {
			$.Schedule(0.03, () => this.LocateTalentIconHeroSelection(heroContainerPanel));
		}

		const strategyPanel = this.GetContextPanel()
			.FindChildTraverse("PreGame")!
			.FindChildTraverse("MainContents")!
			.FindChildTraverse("ScreenContainer")!
			.FindChildTraverse("StrategyScreen")!
			.FindChildTraverse("SelectedHeroAbilities")!;
		const strategyPanelOverlay = strategyPanel.GetParent()!.GetParent()!.FindChildTraverse("SelectedHeroAbilitiesHitTargets")!;
		if (strategyPanel) {
			$.Schedule(0.03, () => this.LocateTalentIconStrategyPhase(strategyPanel, strategyPanelOverlay));
		}
	}

	LocateTalentIconHeroSelection(heroContainerPanel: Panel) {
		// If the game state changed, stop trying
		if (!Game.GameStateIs(DOTA_GameState.DOTA_GAMERULES_STATE_HERO_SELECTION)) {
			return;
		}

		// Try to find the StatBranch class element.
		const talentIcon = heroContainerPanel.FindChildrenWithClassTraverse("StatBranch")![0];
		if (talentIcon) {
			// Found it? Great! Make it invisible.
			talentIcon.style.visibility = "collapse";

			// But keep trying in case it appears again! (whenever another hero is chosen)
			$.Schedule(0.03, () => this.LocateTalentIconHeroSelection(heroContainerPanel));
		} else {
			// Nope.... try again.
			$.Schedule(0.03, () => this.LocateTalentIconHeroSelection(heroContainerPanel));
		}
	}

	LocateTalentIconStrategyPhase(strategyPanel: Panel, strategyPanelOverlay: Panel) {
		// If the game state changed, stop trying
		if (Game.GameStateIsAfter(DOTA_GameState.DOTA_GAMERULES_STATE_STRATEGY_TIME)) {
			return;
		}

		let talentIconHidden = false;
		let talentIconOverlayHidden = false;

		// Try to find the talent branch panel
		const talentIcon = strategyPanel.FindChildrenWithClassTraverse("StatBranch")![0];
		if (talentIcon) {
			// Hide it!
			talentIcon.style.visibility = "collapse";
			talentIconHidden = true;
		}

		// Try to find the overlay panel
		const talentIconOverlay = strategyPanelOverlay.GetChild(strategyPanelOverlay.GetChildCount() - 2);
		if (talentIconOverlay) {
			talentIconOverlay.style.visibility = "collapse";
			talentIconOverlay.SetPanelEvent("onmouseover", function () {});
			talentIconOverlay.SetPanelEvent("onmouseout", function () {});
			talentIconOverlayHidden = true;
		}

		if (!talentIconHidden || !talentIconOverlayHidden) {
			$.Schedule(1, () => this.LocateTalentIconStrategyPhase(strategyPanel, strategyPanelOverlay));
		}
	}

	GetContextPanel(): Panel {
		return $.GetContextPanel().GetParent()!.GetParent()!.GetParent()!;
	}
}

let pickscreen = new PickScreen();
