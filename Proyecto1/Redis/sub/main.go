package main

import (
	"context"
	"fmt"
	"github.com/go-redis/redis/v8"
	"time"
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

	for {
		// use BLPOP to wait for a new element to be added to the "myList" key
		value, err := redisClient.BLPop(ctx, -1, "newVotes").Result()
		if err != nil {
			fmt.Println(err)
			continue
		}

		// the value slice returned by BLPop contains the name of the list and the new value added
		// to the beginning of the list, so we can ignore the first element and use the second
		fmt.Printf("New value added to myList: %s\n", value[1])

		time.Sleep(time.Second * 5)
	}

	//subscriber := redisClient.Subscribe(ctx, "newVotes")
	//fmt.Println("Subscribed to newVotes channel")
	//user := User{}
	//for {
	//	msg, err := subscriber.ReceiveMessage(ctx)
	//	if err != nil {
	//		panic(err)
	//	}
	//
	//	//if err := json.Unmarshal([]byte(msg.Payload), &user); err != nil {
	//	//	panic(err)
	//	//}
	//
	//	fmt.Println("Received message from " + msg.Channel + " channel.")
	//	//fmt.Printf("%+v\n", user)
	//	fmt.Printf(msg.Payload)
	//}
}
