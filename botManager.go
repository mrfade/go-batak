package main

import (
	"log"
	"math/rand"
)

type BotManager struct {
	player      *User
	gameManager *GameManager
}

func (manager *BotManager) GetCard() Card {
	log.Println("BotManager :: GetCard :: player", manager.player)
	return manager.player.Cards[rand.Intn(len(manager.player.Cards))]
}

func (manager *BotManager) Run() {
	if manager.gameManager.Turn.Id == manager.player.Id {
		card := manager.player.Cards[0]
		manager.gameManager.onCardSent(manager.player, card)
	}
}
