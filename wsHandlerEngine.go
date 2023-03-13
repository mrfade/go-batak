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
	Handlers map[string]func(*websocket.Conn, WSClientMessage)
}

func (wshandler *WSHandlerEngine) Handle(name string, handler func(*websocket.Conn, WSClientMessage)) {
	wshandler.Handlers[name] = handler
}

func (wshandler *WSHandlerEngine) Run(connection *websocket.Conn, message WSClientMessage) {
	handler, ok := wshandler.Handlers[message.Type]

	if !ok {
		log.Println("WSHandler :: handle not found", message.Type)
	}

	handler(connection, message)
}

func newWSHandler() WSHandlerEngine {
	wshandler := WSHandlerEngine{}
	wshandler.Handlers = make(map[string]func(*websocket.Conn, WSClientMessage))
	return wshandler
}
