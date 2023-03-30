package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Server struct {
	Rooms     map[string]*GameManager
	Socket    func(*fiber.Ctx) error
	WSHandler WSHandlerEngine
	Port      int
}

func (server *Server) FindManagerByUserId(userId string) *GameManager {
	for index, manager := range server.Rooms {
		for _, user := range manager.Users {
			if user.Id == userId {
				return server.Rooms[index]
			}
		}
	}

	return nil
}

func (server *Server) DisconnectConn(conn *websocket.Conn) {
	for _, game := range server.Rooms {
		for _, user := range game.Users {
			if user.con == conn {
				game.DisconnectUser(user)
			}
		}
	}
}

func (server *Server) WebSocket() func(*fiber.Ctx) error {
	server.Socket = websocket.New(func(c *websocket.Conn) {
		// fmt.Println(c.Locals("Host")) // "Localhost:3000"

		log.Println("Client connected", c)

		c.SetCloseHandler(func(code int, text string) error {
			log.Println("Client disconnected", c)
			server.DisconnectConn(c)
			return &fiber.Error{}
		})

		for {
			message := WSClientMessage{}
			err := c.ReadJSON(&message)
			if err != nil {
				log.Println("ClientMessage read error:", err)
				break
			}

			server.WSHandler.Run(c, message)
		}
	})

	return server.Socket
}

func (server *Server) MountWSHandlers() {
	server.WSHandler.Handle("join", wsJoin)
	server.WSHandler.Handle("bid", wsBid)
	server.WSHandler.Handle("selectTrump", wsTrump)
	server.WSHandler.Handle("selectLeftover", wsLeftover)
	server.WSHandler.Handle("start", wsStart)
	server.WSHandler.Handle("createGame", wsCreateGame)
	server.WSHandler.Handle("sendCard", wsSendcard)
}

func NewServer(port int) *Server {
	server := &Server{
		Rooms: map[string]*GameManager{},
		Port:  port,
	}

	server.WSHandler = newWSHandler(server)

	return server
}

func createUserFromWSMessage(c *websocket.Conn, wm WSClientMessage) User {
	user := User{
		Id:   wm.UserId,
		Name: wm.Username,
		Type: UserType.User,
		con:  c,
	}
	return user
}
