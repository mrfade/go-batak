package main

import (
	"encoding/json"
	"log"

	"github.com/gofiber/websocket/v2"
)

var UserType = newUserTypeRegistry()

func newUserTypeRegistry() *userTypeRegistry {
	return &userTypeRegistry{
		User: "user",
		Bot:  "bot",
	}
}

type userTypeRegistry struct {
	User string
	Bot  string
}

type User struct {
	Id         string          `json:"id"`
	Name       string          `json:"name"`
	Score      int             `json:"score"`
	Bid        int             `json:"bid"`
	Type       string          `json:"type"`
	Cards      []Card          `json:"-"`
	trump      string          `json:"-"`
	con        *websocket.Conn `json:"-"`
	botManager *BotManager
}

func (user *User) sendCards() {
	cardsjson, err := json.Marshal(user.Cards)
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
	for index, _card := range user.Cards {
		if _card.Id == card.Id {
			return index
		}
	}

	return -1
}

func (user *User) removeCard(index int) {
	user.Cards = append(user.Cards[:index], user.Cards[index+1:]...)
}

func (user *User) addCards(cards ...Card) {
	user.Cards = append(user.Cards, cards...)
}

func (user *User) sendMessage(message WSResponseMessage) {
	if user.Type == UserType.Bot {
		return
	}

	user.con.WriteJSON(message)
}
