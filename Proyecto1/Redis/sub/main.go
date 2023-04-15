package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/go-redis/redis/v8"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"log"
	"os"
	"time"
)

var (
	REDIS_HOST string
	REDIS_PORT string
)

var (
	MYSQL_HOST string
	MYSQL_PORT string
	MYSQL_USER string
	MYSQL_DB   string
	MYSQL_PASS string
)

var mainDB *sql.DB

type Voting struct {
	Sede         int `json:"sede"`
	Municipio    int `json:"municipio"`
	Departamento int `json:"departamento"`
	Papeleta     int `json:"papeleta"`
	Partido      int `json:"partido"`
}

var ctx = context.Background()

var redisClient *redis.Client

func main() {
	fmt.Println("Waiting 10 segs for MySQL to Start")
	time.Sleep(time.Second * 10)
	err := godotenv.Load(".env.local")
	if err != nil {
		log.Fatal(err)
		return
	}
	REDIS_HOST = mustGentENV("REDIS_HOST")
	REDIS_PORT = mustGentENV("REDIS_PORT")

	MYSQL_HOST = mustGentENV("MYSQL_HOST")
	MYSQL_PORT = mustGentENV("MYSQL_PORT")
	MYSQL_DB = mustGentENV("MYSQL_DB")
	MYSQL_USER = mustGentENV("MYSQL_USER")
	MYSQL_PASS = mustGentENV("MYSQL_PASS")

	//fmt.Println("Redis-->" + REDIS_HOST + ":" + REDIS_PORT)
	//fmt.Println("MYSQL-->"+MYSQL_HOST, MYSQL_PORT, MYSQL_DB, MYSQL_USER, MYSQL_PASS)
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	redisClient = redis.NewClient(&redis.Options{
		Addr: REDIS_HOST + ":" + REDIS_PORT,
	})

	fmt.Println("Redis connection made")

	mainDB, err = openDB()
	defer mainDB.Close()

	if err != nil {
		log.Fatal("Error connecting to db", err)
		return
	}

	fmt.Println("MySQL connection made")

	for {
		// use BLPOP to wait for a new element to be added to the "myList" key
		value, err := redisClient.BLPop(ctx, -1, "newVotes").Result()
		if err != nil {
			fmt.Println(err)
			continue
		}

		// the value slice returned by BLPop contains the name of the list and the new value added
		// to the beginning of the list, so we can ignore the first element and use the second
		//fmt.Printf("New value added to myList: %s\n", value[1])

		var newVote Voting
		if err := json.Unmarshal([]byte(value[1]), &newVote); err != nil {
			fmt.Println("ERROR PARSING JSON OF NEW VOTE")
			continue
		}

		theQuery := fmt.Sprintf("INSERT INTO `so1`.`votes` (`SEDE`, `MUNICIPIO`, `DEPARTAMENTO`, `PAPELETA`, `PARTIDO`) VALUES (%d,%d,%d,%d,%d)",
			newVote.Sede, newVote.Municipio, newVote.Departamento, newVote.Papeleta, newVote.Partido)
		db_r := makeDBQuery(theQuery)
		if db_r == nil {
			fmt.Println("Error inserting vote to db:", newVote)
			fmt.Println(err)
		} else {
			fmt.Println("Vote registered correctly")
		}
	}
}

func mustGentENV(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatalf("Fatal Error in redis_sub: %s environment variable not set.\n", k)
	}
	return v
}

func openDB() (*sql.DB, error) {
	var db *sql.DB
	var err error
	db, err = sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", MYSQL_USER, MYSQL_PASS, MYSQL_HOST, MYSQL_PORT, MYSQL_DB))
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %v", err)
	}
	return db, nil
}

func makeDBQuery(query string) *sql.Rows {
	result, err2 := mainDB.Query(query)
	if err2 != nil {
		log.Println("Error querying to db...")
		log.Println(err2)
		return nil
	}
	return result
}
