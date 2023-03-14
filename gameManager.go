package main

import (
	"encoding/json"
	"log"
	"math"
	"math/rand"
	"time"
)

const (
	Maca  string = "maca"
	Kupa  string = "kupa"
	Karo  string = "karo"
	Sinek string = "sinek"
)

var Stage = newStageRegistry()

func newStageRegistry() *stageRegistry {
	return &stageRegistry{
		Created:  "created",
		Bid:      "bid",
		Trump:    "trump",
		Leftover: "leftover",
		Started:  "started",
		Finished: "finished",
	}
}

type stageRegistry struct {
	Created  string
	Bid      string
	Trump    string
	Leftover string
	Started  string
	Finished string
}

var CardsNumbers = []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}
var CardNumberValues = map[string]int{
	"A":  30,
	"K":  29,
	"Q":  28,
	"J":  27,
	"10": 10,
	"9":  9,
	"8":  8,
	"7":  7,
	"6":  6,
	"5":  5,
	"4":  4,
	"3":  3,
	"2":  2,
}

type Card struct {
	Type   string `json:"type"`
	Number string `json:"number"`
}

type DeskCard struct {
	User *User `json:"user"`
	Card *Card `json:"card"`
}

type GameManager struct {
	Id             string
	Stage          string
	allCards       []Card
	Users          []User
	leftOverCards  []Card
	Desk           []DeskCard
	Started        bool
	Finished       bool
	gameStarted    bool
	Owner          *User
	biggestBidUser *User
	currentIndex   int
	Trump          string
	leftoverDone   bool
	Round          int
}

func (manager *GameManager) createCards() {
	for _, _card := range CardsNumbers {
		cardMaca := Card{Maca, _card}
		cardKupa := Card{Kupa, _card}
		cardKaro := Card{Karo, _card}
		cardSinek := Card{Sinek, _card}

		manager.allCards = append(manager.allCards, cardKaro)
		manager.allCards = append(manager.allCards, cardMaca)
		manager.allCards = append(manager.allCards, cardKupa)
		manager.allCards = append(manager.allCards, cardSinek)
	}
}

func (manager *GameManager) generateRandomCards() {
	cards := []Card{}

	cards = append(cards, manager.allCards...)

	for i := 0; i < 16*3; i++ {
		randIndex := rand.Intn(len(cards))
		card := cards[randIndex]
		user := &manager.Users[i/16]
		user.cards = append(user.cards, card)
		cards = append(cards[:randIndex], cards[randIndex+1:]...)
	}

	manager.leftOverCards = cards
}

func (manager *GameManager) addDeskCard(card DeskCard) {
	manager.Desk = append(manager.Desk, card)
}

func (manager *GameManager) addUser(user User) {
	manager.Users = append(manager.Users, user)
}

func (manager *GameManager) getUser(userId string) *User {
	for index, user := range manager.Users {
		if user.Id == userId {
			return &manager.Users[index]
		}
	}

	return nil
}

func (manager *GameManager) findUserIndex(userId string) int {
	for index, user := range manager.Users {
		if user.Id == userId {
			return index
		}
	}

	return -1
}

func (manager *GameManager) removeUserById(userId string) {
	user := manager.getUser(userId)
	user.con.Close()

	userIndex := manager.findUserIndex(userId)

	manager.Users = append(manager.Users[:userIndex], manager.Users[userIndex+1:]...)

	if len(manager.Users) == 0 {
		manager.destroy()
	}
}

func (manager *GameManager) isOwner(user User) bool {
	return manager.Owner.Id == user.Id
}

func (manager *GameManager) runDesk() {
	var userJson []byte

	if len(manager.Desk) == 3 {
		user := manager.calculateRound()
		userIndex := manager.findUserIndex(user.Id)

		user.Score++

		manager.currentIndex = userIndex
		manager.Round++
		userJson, _ = json.Marshal(user)

		manager.sendMessage(WSResponseMessage{
			Type:    "roundWinner",
			Message: string(userJson),
		})

		// user.sendMessage(WSResponseMessage{
		// 	Type:    "score",
		// 	Message: strconv.Itoa(user.Score),
		// })
	} else {
		manager.currentIndex = (manager.currentIndex + 1) % 3
		nextUser := manager.Users[manager.currentIndex]
		userJson, _ = json.Marshal(nextUser)
	}

	manager.sendMessage(WSResponseMessage{
		Type:    "turn",
		Message: string(userJson),
	})

	deskJson, _ := json.Marshal(manager.Desk)
	manager.sendMessage(WSResponseMessage{
		Type:    "desk",
		Message: string(deskJson),
	})

	userListJson, _ := json.Marshal(manager.Users)
	manager.sendMessage(WSResponseMessage{
		Type:    "userList",
		Message: string(userListJson),
	})

	if manager.Round == 16 {
		manager.Finished = true

		winner := manager.calculateWinner()
		userJson, _ := json.Marshal(winner)

		manager.setStage(Stage.Finished)
		manager.announceStage()

		manager.sendMessage(WSResponseMessage{
			Type:    "winner",
			Message: string(userJson),
		})
	}
}

func (manager *GameManager) calculateRound() *User {
	biggest := manager.Desk[0]
	trump := manager.Trump

	for _, card := range manager.Desk {
		cardValue := CardNumberValues[card.Card.Number]
		biggestValue := CardNumberValues[biggest.Card.Number]

		cardType := card.Card.Type
		biggestType := biggest.Card.Type

		if cardType == biggestType {
			if cardValue > biggestValue {
				biggest = card
			}
		} else {
			if cardType == trump {
				biggest = card
			}
		}
	}

	manager.Desk = []DeskCard{}

	return biggest.User
}

func (manager *GameManager) calculateWinner() User {
	winner := manager.Users[0]
	for _, user := range manager.Users {
		if user.Score > winner.Score {
			winner = user
		}
	}
	return winner
}

func (manager *GameManager) sendMessage(message WSResponseMessage) {
	for _, user := range manager.Users {
		user.sendMessage(message)
	}
}

func (manager *GameManager) setStage(stage string) {
	manager.Stage = stage
}

func (manager *GameManager) announceStage() {
	manager.sendMessage(WSResponseMessage{
		Type:    "stage",
		Message: manager.Stage,
	})
}

func (manager *GameManager) announceUserListTo(user *User) {
	userListJson, _ := json.Marshal(manager.Users)

	user.sendMessage(WSResponseMessage{
		Type:    "userList",
		Message: string(userListJson),
	})
}

func (manager *GameManager) announceBids() {
	bids := map[string]int{}

	for _, user := range manager.Users {
		bids[user.Id] = user.Bid
	}

	bidsJson, _ := json.Marshal(bids)

	manager.sendMessage(WSResponseMessage{
		Type:    "userBids",
		Message: string(bidsJson),
	})
}

func (manager *GameManager) startGame() {
	manager.Started = true

	// usersCount := len(manager.users)
	// for i := 0; i < 3-usersCount; i++ {
	// 	user := User{"31234523452345", "", []Card{}, 0, "", nil}
	// 	manager.addUser(user)
	// }

	manager.generateRandomCards()

	// fmt.Printf("%+v\n", manager.users)
	// fmt.Printf("%+v", manager.leftOverCards)
}

func (manager *GameManager) bidStage() {
	manager.setStage(Stage.Bid)
	manager.announceStage()

	go func() {
		time.Sleep(10 * time.Second)

		manager.trumpStage()
	}()
}

func (manager *GameManager) trumpStage() {
	manager.setStage(Stage.Trump)
	manager.announceStage()

	var biggestBidUser *User
	biggestBid := math.MinInt
	biggestBidUserIndex := 0

	for index, user := range manager.Users {
		if biggestBid < user.Bid {
			biggestBid = user.Bid
			biggestBidUser = &manager.Users[index]
			biggestBidUserIndex = index
		}
	}

	manager.currentIndex = biggestBidUserIndex
	manager.biggestBidUser = biggestBidUser

	biggestBidUser.sendMessage(WSResponseMessage{
		Type: "selectTrump",
	})

	go func() {
		time.Sleep(10 * time.Second)

		if manager.Stage == Stage.Trump {
			if manager.Trump == "" {
				biggestBidUser.trump = Maca
				manager.Trump = Maca
			}

			manager.sendMessage(WSResponseMessage{
				Type:    "trump",
				Message: manager.Trump,
			})

			manager.leftoverStage()
		}
	}()
}

func (manager *GameManager) leftoverStage() {
	manager.setStage(Stage.Leftover)
	manager.announceStage()

	manager.biggestBidUser.sendMessage(WSResponseMessage{
		Type: "selectLeftover",
	})

	go func() {
		time.Sleep(20 * time.Second)

		if !manager.leftoverDone {
			cards := []Card{}

			for i := 0; i < 4; i++ {
				randIndex := rand.Intn(len(manager.biggestBidUser.cards))
				card := manager.biggestBidUser.cards[randIndex]
				cards = append(cards, card)
				manager.biggestBidUser.removeCard(randIndex)
			}

			manager.biggestBidUser.addCards(manager.leftOverCards...)
			manager.leftOverCards = cards
			manager.biggestBidUser.sendCards()
		}

		if manager.Stage == Stage.Leftover {
			manager.realGameStart()
		}
	}()
}

func (manager *GameManager) realGameStart() {
	manager.setStage(Stage.Started)
	manager.announceStage()

	manager.gameStarted = true
	userJson, _ := json.Marshal(manager.biggestBidUser)

	manager.sendMessage(WSResponseMessage{
		Type:    "gameStarted",
		Message: manager.Trump,
	})

	manager.sendMessage(WSResponseMessage{
		Type:    "turn",
		Message: string(userJson),
	})
}

func (manager *GameManager) destroy() {
	// disconnect users
	for _, user := range manager.Users {
		user.con.Close()
	}

	log.Println("Game destroyed ::", manager.Id)

	delete(Games, manager.Id)
}

func newGameManager(owner User) GameManager {
	manager := GameManager{}
	manager.createCards()

	manager.Stage = Stage.Created
	manager.addUser(owner)

	user := manager.getUser(owner.Id)
	manager.Owner = user

	return manager
}
