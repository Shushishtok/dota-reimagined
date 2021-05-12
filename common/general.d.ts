/// <reference types="typescript-to-lua/language-extensions" />

declare const enum TalentStatus {
	LEARNED = 0,
	NOT_LEARNED = 1,
	UNLEARNABLE = 2,
	CAN_BE_LEARNED = 3,
}

interface CustomNetTableDeclarations {
	// Just an example of a nettable, not actually used
	spider_manager: { spiders: number };
}

interface CustomGameEventDeclarations {
	learn_talent_event: { ability: EntityIndex };
	confirm_talent_learned: { talent_num: number; learned_by_force: 0 | 1 };
	request_currently_selected_unit: {};
	send_currently_selected_unit: { unit: EntityIndex };
	ping_talent: { ability: EntityIndex; status: TalentStatus };
	custom_chat_message: {
		isTeam: boolean;
		textData: string;
		playerID: PlayerID;
		ability_name: string | undefined;
	};
}
