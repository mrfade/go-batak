package main

import (
	"encoding/json"
	"log"
	"strconv"

	"github.com/gofiber/websocket/v2"
)

func wsJoin(server *Server, c *websocket.Conn, wm WSClientMessage) {
	gameId := wm.Message
	manager, ok := server.Rooms[gameId]
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
		checkUser.Type = UserType.User

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
	if len(manager.Users) >= manager.MaxPlayers() || manager.Started {
		c.WriteJSON(WSResponseMessage{
			Type: "gameFull",
		})
		return
	}

	// if user in other games remove him
	if checkMananger := server.FindManagerByUserId(wm.UserId); checkMananger != nil && checkMananger.Id != manager.Id {
		log.Println("WSHandle :: join :: user found on another room", wm.UserId)
		checkMananger.removeUserById(wm.UserId)
	}

	// user
	user := User{
		Id:   wm.UserId,
		Name: wm.Username,
		Type: UserType.User,
		con:  c,
	}
	userJson, _ := json.Marshal(user)

	manager.sendMessage(WSResponseMessage{
		Type:    "userJoined",
		Message: string(userJson),
	})

	manager.addUser(&user)
	actualUser := manager.getUser(user.Id)

	c.WriteJSON(WSResponseMessage{
		Type:    "joined",
		Message: gameId,
	})

	manager.announceUserListTo(actualUser)
}

func wsBid(server *Server, c *websocket.Conn, wm WSClientMessage) {
	manager := server.FindManagerByUserId(wm.UserId)
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

	isEveryoneBidded := true
	for _, user := range manager.Users {
		if user.Type != UserType.Bot && user.Bid == 0 {
			isEveryoneBidded = false
		}
	}

	if isEveryoneBidded {
		manager.calculateBiggestBidder()
		manager.trumpStage()
	}
}

func wsTrump(server *Server, c *websocket.Conn, wm WSClientMessage) {
	manager := server.FindManagerByUserId(wm.UserId)
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

	if manager.Mode == Mode._1v2 {
		manager.leftoverStage()
	}
	if manager.Mode == Mode._1v3 {
		manager.realGameStart()
	}
}

func wsLeftover(server *Server, c *websocket.Conn, wm WSClientMessage) {
	manager := server.FindManagerByUserId(wm.UserId)
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

	log.Println("users leftovers", leftovers)

	manager.userPickLeftovers(leftovers)
	manager.realGameStart()
}

func wsStart(server *Server, c *websocket.Conn, wm WSClientMessage) {
	manager := server.FindManagerByUserId(wm.UserId)
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

	// if len(manager.Users) < 3 {
	// 	c.WriteJSON(WSResponseMessage{
	// 		Type: "gameNotFull",
	// 	})
	// 	return
	// }

	manager.sendGameSettings()
	manager.startGame()

	for _, user := range manager.Users {
		user.sendCards()
	}

	manager.bidStage()
}

func wsCreateGame(server *Server, c *websocket.Conn, wm WSClientMessage) {
	// if user in other games remove him
	if checkMananger := server.FindManagerByUserId(wm.UserId); checkMananger != nil {
		log.Println("WSHandle :: join :: user found on another room", wm.UserId)
		checkMananger.removeUserById(wm.UserId)
	}

	gameSettings := GameSettings{
		Mode: "1v2",
	}
	json.Unmarshal([]byte(wm.Message), &gameSettings)

	log.Println("WSHandle :: gameSettings", gameSettings)

	owner := createUserFromWSMessage(c, wm)
	manager := newGameManager(owner)

	gameId := RandStringBytes(8)
	mode := gameSettings.Mode

	server.Rooms[gameId] = &manager
	manager.Id = gameId
	manager.Mode = mode

	c.WriteJSON(WSResponseMessage{
		Type:    "gameId",
		Message: gameId,
	})
}

func wsSendcard(server *Server, c *websocket.Conn, wm WSClientMessage) {
	manager := server.FindManagerByUserId(wm.UserId)
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

	manager.onCardSent(user, card)
}
