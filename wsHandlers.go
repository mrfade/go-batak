package main

import (
	"encoding/json"
	"log"
	"strconv"

	"github.com/gofiber/websocket/v2"
)

var wsHandler WSHandlerEngine

func mountWSHandlers() {
	wsHandler = newWSHandler()

	wsHandler.Handle("join", func(c *websocket.Conn, wm WSClientMessage) {
		gameId := wm.Message
		manager, ok := Games[gameId]
		if !ok {
			c.WriteJSON(WSResponseMessage{
				Type: "gameNotFound",
			})
			return
		}

		// if user is already in room, allow to rejoin
		checkUser := manager.getUser(wm.UserId)
		if checkUser != nil {
			// update connection
			checkUser.con = c

			checkUser.sendCards()

			gameDetailsJson, _ := json.Marshal(manager)
			c.WriteJSON(WSResponseMessage{
				Type:    "gameDetails",
				Message: string(gameDetailsJson),
			})

			manager.announceUserListTo(checkUser)
			return
		}

		// if room is full or started
		if len(manager.Users) >= 3 || manager.Started {
			c.WriteJSON(WSResponseMessage{
				Type: "gameFull",
			})
			return
		}

		// if user in other games remove him
		if checkMananger := findManagerByUserId(wm.UserId); checkMananger != nil && checkMananger.Id != manager.Id {
			log.Println("WSHandle :: join :: user found on another room", wm.UserId)
			checkMananger.removeUserById(wm.UserId)
		}

		// user
		user := User{wm.UserId, wm.Username, []Card{}, 0, 0, "", c}
		userJson, _ := json.Marshal(user)

		manager.sendMessage(WSResponseMessage{
			Type:    "userJoined",
			Message: string(userJson),
		})

		manager.addUser(user)
		actualUser := manager.getUser(user.Id)

		c.WriteJSON(WSResponseMessage{
			Type:    "joined",
			Message: gameId,
		})

		manager.announceUserListTo(actualUser)
	})

	wsHandler.Handle("bid", func(c *websocket.Conn, wm WSClientMessage) {
		manager := findManagerByUserId(wm.UserId)
		if manager == nil {
			c.WriteJSON(WSResponseMessage{
				Type: "gameNotFound",
			})
			return
		}

		bid, err := strconv.Atoi(wm.Message)

		if err != nil {
			log.Println("WSHandle :: bid :: bid message error", err)
			return
		}

		user := manager.getUser(wm.UserId)
		if user == nil {
			log.Println("WSHandle :: bid :: user not found", err)
			return
		}

		user.Bid = bid

		manager.announceBids()
	})

	wsHandler.Handle("selectTrump", func(c *websocket.Conn, wm WSClientMessage) {
		manager := findManagerByUserId(wm.UserId)
		if manager == nil {
			c.WriteJSON(WSResponseMessage{
				Type: "gameNotFound",
			})
			return
		}

		trump := wm.Message

		user := manager.getUser(wm.UserId)
		user.trump = trump
		manager.Trump = trump

		manager.sendMessage(WSResponseMessage{
			Type:    "trump",
			Message: manager.Trump,
		})

		manager.leftoverStage()
	})

	wsHandler.Handle("selectLeftover", func(c *websocket.Conn, wm WSClientMessage) {
		manager := findManagerByUserId(wm.UserId)
		if manager == nil {
			c.WriteJSON(WSResponseMessage{
				Type: "gameNotFound",
			})
			return
		}

		leftovers := []Card{}
		err := json.Unmarshal([]byte(wm.Message), &leftovers)

		if err != nil {
			log.Println("selectLeftover unmarshall error", err)
			return
		}

		if len(leftovers) != 4 {
			log.Println("selectLeftover length not 4")
			return
		}

		user := manager.getUser(wm.UserId)

		for _, leftover := range leftovers {
			index := user.findCardIndex(leftover)
			user.removeCard(index)
		}

		user.addCards(manager.leftOverCards...)
		manager.leftOverCards = leftovers
		manager.biggestBidUser.sendCards()

		manager.leftoverDone = true
		manager.realGameStart()
	})

	wsHandler.Handle("start", func(c *websocket.Conn, wm WSClientMessage) {
		manager := findManagerByUserId(wm.UserId)
		if manager == nil {
			c.WriteJSON(WSResponseMessage{
				Type: "gameNotFound",
			})
			return
		}

		user := manager.getUser(wm.UserId)

		if !manager.isOwner(*user) {
			c.WriteJSON(WSResponseMessage{
				Type: "forbidden",
			})
			return
		}

		if len(manager.Users) < 3 {
			c.WriteJSON(WSResponseMessage{
				Type: "gameNotFull",
			})
			return
		}

		manager.startGame()

		for _, user := range manager.Users {
			user.sendCards()
		}

		manager.bidStage()
	})

	wsHandler.Handle("createGame", func(c *websocket.Conn, wm WSClientMessage) {
		// if user in other games remove him
		if checkMananger := findManagerByUserId(wm.UserId); checkMananger != nil {
			log.Println("WSHandle :: join :: user found on another room", wm.UserId)
			checkMananger.removeUserById(wm.UserId)
		}

		owner := createUserFromWSMessage(c, wm)
		manager := newGameManager(owner)

		gameId := RandStringBytes(8)

		Games[gameId] = &manager
		manager.Id = gameId

		c.WriteJSON(WSResponseMessage{
			Type:    "gameId",
			Message: gameId,
		})
	})

	wsHandler.Handle("sendCard", func(c *websocket.Conn, wm WSClientMessage) {
		manager := findManagerByUserId(wm.UserId)
		if manager == nil {
			c.WriteJSON(WSResponseMessage{
				Type: "gameNotFound",
			})
			return
		}

		if manager.Finished {
			c.WriteJSON(WSResponseMessage{
				Type: "gameFinished",
			})
			return
		}

		var card Card
		err := json.Unmarshal([]byte(wm.Message), &card)

		if err != nil {
			log.Println("sendCard unmarshall error", err)
			return
		}

		user := manager.getUser(wm.UserId)

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
	})
}
