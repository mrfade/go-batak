package main

type BotManager struct {
	user        *User
	gameManager *GameManager
}

func (manager *BotManager) Run() {
	if manager.gameManager.Turn.Id == manager.user.Id {
		card := manager.user.cards[0]
		manager.gameManager.onCardSent(manager.user, card)
	}
}
