package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

var Games map[string]*GameManager

func findManagerByUserId(userId string) *GameManager {
	for index, manager := range Games {
		for _, user := range manager.Users {
			if user.Id == userId {
				return Games[index]
			}
		}
	}

	return nil
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

func main() {

	Games = make(map[string]*GameManager)
	mountWSHandlers()

	// Create a new engine
	// engine := html.New("./views", ".html")

	// app := fiber.New(fiber.Config{
	// 	Views: engine,
	// })
	app := fiber.New()

	app.Static("/assets", "./assets")

	// Optional middleware
	app.Use("/ws", func(c *fiber.Ctx) error {
		// if c.Get("host") == "localhost:3000" {
		// c.Locals("Host", "Localhost:3000")
		return c.Next()
		// }
		// return c.Status(403).SendString("Request origin not allowed")
	})

	// Upgraded websocket request
	app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		// fmt.Println(c.Locals("Host")) // "Localhost:3000"

		log.Println("Client connected", c)

		c.SetCloseHandler(func(code int, text string) error {
			log.Println("Client disconnected", c)

			for _, game := range Games {
				for _, user := range game.Users {
					if user.con == c {
						game.DisconnectUser(user)
					}
				}
			}

			return &fiber.Error{}
		})

		for {
			message := WSClientMessage{}
			err := c.ReadJSON(&message)
			if err != nil {
				log.Println("ClientMessage read error:", err)
				break
			}

			wsHandler.Run(c, message)
		}
	}))

	app.Get("/games", func(c *fiber.Ctx) error {
		return c.JSON(struct {
			Games map[string]*GameManager
		}{
			Games: Games,
		})
	})

	app.Static("/", "./views/index.html")

	// ws://localhost:3000/ws
	log.Fatal(app.Listen(":3000"))
}
