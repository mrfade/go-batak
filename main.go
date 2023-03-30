package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
)

func main() {

	app := fiber.New()
	app.Static("/assets", "./assets")
	app.Static("/", "./views/index.html")

	server := NewServer(3000)
	server.MountWSHandlers()

	// Optional middleware
	app.Use("/ws", func(c *fiber.Ctx) error {
		// if c.Get("host") == "localhost:3000" {
		// c.Locals("Host", "Localhost:3000")
		return c.Next()
		// }
		// return c.Status(403).SendString("Request origin not allowed")
	})

	// Upgraded websocket request
	app.Get("/ws", server.WebSocket())

	app.Get("/rooms", func(c *fiber.Ctx) error {
		return c.JSON(struct {
			Rooms map[string]*GameManager
		}{
			Rooms: server.Rooms,
		})
	})

	// ws://localhost:3000/ws
	log.Fatal(app.Listen(fmt.Sprintf(":%d", server.Port)))
}
