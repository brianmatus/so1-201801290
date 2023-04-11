package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
)

type Voting struct {
	Sede         string `json:"sede"`
	Municipio    string `json:"municipio"`
	Departamento string `json:"departamento"`
	Papeleta     string `json:"papeleta"`
	Partido      string `json:"partido"`
}

var ctx = context.Background()

var redisClient = redis.NewClient(&redis.Options{
	Addr: "localhost:6379",
})

func main() {

	app := fiber.New()

	app.Post("/", func(c *fiber.Ctx) error {
		vote := new(Voting)

		if err := c.BodyParser(vote); err != nil {
			panic(err)
		}

		payload, err := json.Marshal(vote)
		if err != nil {
			panic(err)
		}

		fmt.Println(string(payload))
		//if err := redisClient.Publish(ctx, "send-user-data", payload).Err(); err != nil {
		//	panic(err)
		//}

		//Save for listener
		if err := redisClient.LPush(context.Background(), "newVotes", payload).Err(); err != nil {
			return c.SendStatus(404)
		}

		//Save for statistics
		if err := redisClient.LPush(context.Background(), "lastFive", payload).Err(); err != nil {
			return c.SendStatus(404)
		}

		if err := redisClient.LTrim(context.Background(), "lastFive", 0, 4).Err(); err != nil {
			return c.SendStatus(404)
		}

		return c.SendStatus(200)
	})

	app.Listen(":3000")
}
