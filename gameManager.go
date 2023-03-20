package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"

	"github.com/google/uuid"
)

const (
	Spade   string = "spade"
	Heart   string = "heart"
	Diamond string = "diamond"
	Club    string = "club"
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
	Id     string `json:"id"`
	Type   string `json:"type,omitempty"`
	Number string `json:"number,omitempty"`
	Owner  *User  `json:"owner"`
}

func (card *Card) hideConfidentials() {
	card.Type = ""
	card.Number = ""
}

type DeskCard struct {
	User *User `json:"user"`
	Card *Card `json:"card"`
}

type GameManager struct {
	Id             string
	Stage          string
	allCards       []Card
	Users          []*User
	leftOverCards  []Card
	Desk           []DeskCard
	Started        bool
	Finished       bool
	gameStarted    bool
	Owner          *User
	biggestBidUser *User
	currentIndex   int
	Turn           *User
	Trump          string
	leftoverDone   bool
	Round          int
}

func (manager *GameManager) createCards() {
	for _, _card := range CardsNumbers {
		cardMaca := Card{
			Id:     uuid.Must(uuid.NewRandom()).String(),
			Type:   Spade,
			Number: _card,
		}
		cardKupa := Card{
			Id:     uuid.Must(uuid.NewRandom()).String(),
			Type:   Heart,
			Number: _card,
		}
		cardKaro := Card{
			Id:     uuid.Must(uuid.NewRandom()).String(),
			Type:   Diamond,
			Number: _card,
		}
		cardSinek := Card{
			Id:     uuid.Must(uuid.NewRandom()).String(),
			Type:   Club,
			Number: _card,
		}

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
		user := manager.Users[i/16]
		user.cards = append(user.cards, card)
		cards = append(cards[:randIndex], cards[randIndex+1:]...)
	}

	// bind cards to users
	for i := 0; i < len(manager.Users); i++ {
		for j := 0; j < len(manager.Users[i].cards); j++ {
			manager.Users[i].cards[j].Owner = manager.Users[i]
		}
	}

	manager.leftOverCards = cards
}

func (manager *GameManager) addDeskCard(card DeskCard) {
	manager.Desk = append(manager.Desk, card)
}

func (manager *GameManager) addUser(user User) {
	manager.Users = append(manager.Users, &user)
}

func (manager *GameManager) getUser(userId string) *User {
	for index, user := range manager.Users {
		if user.Id == userId {
			return manager.Users[index]
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
	var nextUser *User

	if len(manager.Desk) == 3 {
		nextUser = manager.calculateRound()
		userIndex := manager.findUserIndex(nextUser.Id)

		nextUser.Score++

		manager.Turn = nextUser
		manager.currentIndex = userIndex
		manager.Round++
		userJson, _ = json.Marshal(nextUser)

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
		nextUser = manager.Users[manager.currentIndex]
		userJson, _ = json.Marshal(nextUser)

		manager.Turn = nextUser
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

	manager.announceUserList()

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

		return
	}

	go func() {
		sleep := 2 * time.Second
		if len(manager.Desk) == 0 {
			sleep = 5 * time.Second
		}

		time.Sleep(sleep)

		if nextUser.Type == UserType.Bot {
			// nextUser.botManager.Run()
			card := nextUser.cards[rand.Intn(len(nextUser.cards))]
			manager.onCardSent(nextUser, card)
		}
	}()
}

func (manager *GameManager) calculateRound() *User {
	biggest := &manager.Desk[0]
	trump := manager.Trump

	for index := range manager.Desk {
		card := &manager.Desk[index]

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

func (manager *GameManager) calculateWinner() *User {
	winner := manager.Users[0]
	for _, user := range manager.Users {
		if user.Score > winner.Score {
			winner = user
		}
	}
	return winner
}

func (manager *GameManager) calculateBiggestBidder() {
	var biggestBidUser *User
	biggestBid := math.MinInt
	biggestBidUserIndex := 0

	for index, user := range manager.Users {
		if biggestBid < user.Bid {
			biggestBid = user.Bid
			biggestBidUser = user
			biggestBidUserIndex = index
		}
	}

	manager.currentIndex = biggestBidUserIndex
	manager.biggestBidUser = biggestBidUser
}

func (manager *GameManager) onCardSent(user *User, card Card) {
	cardIndex := user.findCardIndex(card)
	if cardIndex == -1 {
		log.Println("sendCard card not found")
		return
	}

	deskCard := DeskCard{user, &card}
	manager.addDeskCard(deskCard)
	user.removeCard(cardIndex)

	deskCardJson, _ := json.Marshal(deskCard)
	manager.sendMessage(WSResponseMessage{
		Type:    "cardToDesk",
		Message: string(deskCardJson),
	})

	manager.runDesk()
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

func (manager *GameManager) announceUserList() {
	userListJson, _ := json.Marshal(manager.Users)

	manager.sendMessage(WSResponseMessage{
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

	usersCount := len(manager.Users)
	for i := 0; i < 3-usersCount; i++ {
		user := User{
			Id:   uuid.Must(uuid.NewRandom()).String(),
			Name: fmt.Sprintf("Bot %d", i),
			Type: UserType.Bot,
			con:  nil,
		}

		botManager := &BotManager{
			user:        &user,
			gameManager: manager,
		}
		user.botManager = botManager

		manager.addUser(user)
	}

	manager.generateRandomCards()
	manager.announceUserList()
	manager.sendOthersCards()
	manager.sendMessage(WSResponseMessage{
		Type: "roomStarted",
	})
}

func (manager *GameManager) bidStage() {
	manager.setStage(Stage.Bid)
	manager.announceStage()

	go func() {
		time.Sleep(10 * time.Second)

		if manager.Stage == Stage.Bid {
			manager.calculateBiggestBidder()
			manager.trumpStage()
		}
	}()
}

func (manager *GameManager) trumpStage() {
	manager.setStage(Stage.Trump)
	manager.announceStage()

	manager.biggestBidUser.sendMessage(WSResponseMessage{
		Type: "selectTrump",
	})

	go func() {
		if manager.biggestBidUser.Type != UserType.Bot {
			time.Sleep(10 * time.Second)
		}

		if manager.Stage == Stage.Trump {
			if manager.Trump == "" {
				manager.biggestBidUser.trump = Spade
				manager.Trump = Spade
			}

			manager.sendMessage(WSResponseMessage{
				Type:    "trump",
				Message: manager.Trump,
			})

			if manager.Stage == Stage.Trump {
				manager.leftoverStage()
			}
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
		if manager.biggestBidUser.Type != UserType.Bot {
			time.Sleep(20 * time.Second)
		}

		if !manager.leftoverDone {
			cards := manager.selectRandomLeftovers()
			manager.afterLeftOverStage(cards)
		}

		if manager.Stage == Stage.Leftover {
			manager.realGameStart()
		}
	}()
}

func (manager *GameManager) userPickLeftovers(leftovers []Card) {
	manager.leftoverDone = true
	user := manager.biggestBidUser

	for _, leftover := range leftovers {
		index := user.findCardIndex(leftover)
		user.removeCard(index)
	}

	manager.afterLeftOverStage(leftovers)
}

func (manager *GameManager) selectRandomLeftovers() []Card {
	cards := []Card{}

	for i := 0; i < 4; i++ {
		randIndex := rand.Intn(len(manager.biggestBidUser.cards))
		card := manager.biggestBidUser.cards[randIndex]
		cards = append(cards, card)
		manager.biggestBidUser.removeCard(randIndex)
	}

	return cards
}

func (manager *GameManager) afterLeftOverStage(cards []Card) {
	manager.biggestBidUser.addCards(manager.leftOverCards...)
	manager.leftOverCards = cards
	manager.biggestBidUser.sendCards()
}

func (manager *GameManager) sendOthersCards() {
	var othersCards []Card
	for i := 0; i < len(manager.Users); i++ {
		user := manager.Users[i]
		if manager.biggestBidUser != nil && user.Id == manager.biggestBidUser.Id {
			continue
		}

		othersCards = append(othersCards, user.cards...)
	}

	for i := 0; i < len(othersCards); i++ {
		othersCards[i].hideConfidentials()
	}

	othersCardsJson, _ := json.Marshal(othersCards)

	manager.sendMessage(WSResponseMessage{
		Type:    "othersCards",
		Message: string(othersCardsJson),
	})
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
