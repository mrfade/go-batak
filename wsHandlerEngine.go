package main

import (
	"log"

	"github.com/gofiber/websocket/v2"
)

type WSClientMessage struct {
	Type     string `json:"type"`
	Username string `json:"username"`
	UserId   string `json:"userid"`
	Message  string `json:"message"`
}

type WSResponseMessage struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type WSHandlerEngine struct {
	Handlers map[string]func(*Server, *websocket.Conn, WSClientMessage)
	Server   *Server
}

func (engine *WSHandlerEngine) Handle(name string, handler func(*Server, *websocket.Conn, WSClientMessage)) {
	engine.Handlers[name] = handler
}

func (engine *WSHandlerEngine) Run(connection *websocket.Conn, message WSClientMessage) {
	handler, ok := engine.Handlers[message.Type]

	if !ok {
		log.Println("WSHandlerEngine :: handle not found", message.Type)
	}

	// log.Println("WSHandlerEngine :: Run :: server", engine.Server)
	log.Println("WSHandlerEngine :: Run :: message", message)

	handler(engine.Server, connection, message)
}

func newWSHandler(server *Server) WSHandlerEngine {
	engine := WSHandlerEngine{
		Handlers: map[string]func(*Server, *websocket.Conn, WSClientMessage){},
		Server:   server,
	}
	return engine
}
