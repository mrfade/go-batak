package main

import (
	"encoding/json"
	"log"

	"github.com/gofiber/websocket/v2"
)

type User struct {
	Id    string          `json:"id"`
	Name  string          `json:"name"`
	cards []Card          `json:"-"`
	Score int             `json:"score"`
	Bid   int             `json:"bid"`
	trump string          `json:"-"`
	con   *websocket.Conn `json:"-"`
}

func (user *User) sendCards() {
	cardsjson, err := json.Marshal(user.cards)
	if err != nil {
		log.Println("cards json error", err)
	}

	if user.con == nil {
		return
	}

	user.sendMessage(WSResponseMessage{
		Type:    "cards",
		Message: string(cardsjson),
	})
}

func (user *User) findCardIndex(card Card) int {
	for index, _card := range user.cards {
		if _card == card {
			return index
		}
	}

	return -1
}

func (user *User) removeCard(index int) {
	user.cards = append(user.cards[:index], user.cards[index+1:]...)
}

func (user *User) addCards(cards ...Card) {
	user.cards = append(user.cards, cards...)
}

func (user *User) sendMessage(message WSResponseMessage) {
	user.con.WriteJSON(message)
}
