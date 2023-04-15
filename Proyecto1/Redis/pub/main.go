package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/go-redis/redis/v8"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
	"time"
)

var (
	REDIS_HOST         string
	REDIS_PORT         string
	REDIS_PUB_API_PORT string
)

var (
	MYSQL_HOST string
	MYSQL_PORT string
	MYSQL_USER string
	MYSQL_DB   string
	MYSQL_PASS string
)

var (
	departments    = map[int]Department{}
	municipalities = map[int]Municipality{}
	papers         = map[int]Paper{}
	parties        = map[int]Party{}
)

type Department struct {
	Id   int
	Name string
}
type Municipality struct {
	Id     int
	Dpt_id int
	Name   string
}

type Paper struct {
	Id   int
	Name string
}

type Party struct {
	Id   int
	Name string
}

type Voting struct {
	Sede         int    `json:"sede"`
	Municipio    string `json:"municipio"`
	Departamento string `json:"departamento"`
	Papeleta     string `json:"papeleta"`
	Partido      string `json:"partido"`
}
type VotingResponse struct {
	Sede         int `json:"sede"`
	Municipio    int `json:"municipio"`
	Departamento int `json:"departamento"`
	Papeleta     int `json:"papeleta"`
	Partido      int `json:"partido"`
}

var mainDB *sql.DB
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
	REDIS_PUB_API_PORT = mustGentENV("REDIS_PUB_API_PORT")

	fmt.Println(REDIS_HOST, REDIS_PORT)
	var redisClient = redis.NewClient(&redis.Options{
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

	getVoteInfo()
	fmt.Println("Resulting deparments:")
	fmt.Println(departments)
	fmt.Println("Resulting municipalities:")
	fmt.Println(municipalities)
	fmt.Println("Resulting papers:")
	fmt.Println(papers)
	fmt.Println("Resulting parties:")
	fmt.Println(parties)

	app := fiber.New()
	app.Post("/new_vote", func(c *fiber.Ctx) error {
		vote := new(Voting)

		voteResponse := VotingResponse{}

		if err := c.BodyParser(vote); err != nil {
			panic(err)
		}

		voteResponse.Sede = vote.Sede

		///// Deparment
		theKey, err := getKeyByDepartmentName(vote.Departamento)
		if err != nil {
			return c.SendStatus(404)
		}
		fmt.Println("Found Department key for", vote.Departamento, ":", theKey)
		voteResponse.Departamento = theKey
		///// Municipality
		theKey, err = getKeyByMunicipalityName(vote.Municipio, theKey)
		if err != nil {
			return c.SendStatus(404)
		}
		fmt.Println("Found Municipality key for", vote.Municipio, ":", theKey)
		voteResponse.Municipio = theKey
		//Paper
		theKey, err = getKeyByPaperName(vote.Papeleta)
		if err != nil {
			return c.SendStatus(404)
		}
		fmt.Println("Found Paper key for", vote.Papeleta, ":", theKey)
		voteResponse.Papeleta = theKey
		//Party
		theKey, err = getKeyByPartyName(vote.Partido)
		if err != nil {
			return c.SendStatus(404)
		}
		fmt.Println("Found Party key for", vote.Partido, ":", theKey)
		voteResponse.Partido = theKey

		payload, err := json.Marshal(voteResponse)
		if err != nil {
			panic(err)
		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//if err := redisClient.Publish(ctx, "send-user-data", payload).Err(); err != nil {
		//	panic(err)
		//}

		//Save for listener
		if err := redisClient.LPush(context.Background(), "newVotes", payload).Err(); err != nil {
			fmt.Println("Error pushing newVote")
			fmt.Println(err)
			return c.SendStatus(404)
		}

		//Save for statistics
		if err := redisClient.LPush(context.Background(), "lastFive", payload).Err(); err != nil {
			fmt.Println("Error pushing lastFive")
			fmt.Println(err)
			return c.SendStatus(404)
		}

		if err := redisClient.LTrim(context.Background(), "lastFive", 0, 4).Err(); err != nil {
			fmt.Println("Error Trimming lastFive")
			fmt.Println(err)
			return c.SendStatus(404)
		}

		//Most vote per place statistics
		if err := redisClient.HIncrBy(ctx, "placeCounts", strconv.Itoa(voteResponse.Sede), 1).Err(); err != nil {
			fmt.Println("Error updating place count")
			fmt.Println(err)
			return c.SendStatus(404)
		}

		fmt.Println("All ok")
		return c.SendStatus(200)
	})

	app.Listen(":" + REDIS_PUB_API_PORT)
}

func getKeyByDepartmentName(name string) (int, error) {
	for key, department := range departments {
		if department.Name == name {
			return key, nil
		}
	}
	return 0, fmt.Errorf("Department with name %s not found", name)
}
func getKeyByMunicipalityName(name string, deparamentKey int) (int, error) {
	for key, municipality := range municipalities {
		if municipality.Name == name && municipality.Dpt_id == deparamentKey {
			return key, nil
		}
	}
	return 0, fmt.Errorf("Municipality with name %s not found", name)
}
func getKeyByPaperName(name string) (int, error) {
	for key, paper := range papers {
		if paper.Name == name {
			return key, nil
		}
	}
	return 0, fmt.Errorf("Paper with name %s not found", name)
}
func getKeyByPartyName(name string) (int, error) {
	for key, party := range parties {
		if party.Name == name {
			return key, nil
		}
	}
	return 0, fmt.Errorf("Party with name %s not found", name)
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

func getVoteInfo() {
	//Query for departments
	theQuery := "SELECT * FROM departments"
	db_r := makeDBQuery(theQuery)
	if db_r == nil {
		panic("Error querying deparments")
	}
	for db_r.Next() {
		var department Department
		err := db_r.Scan(&department.Id, &department.Name)
		if err != nil {
			log.Println("Error iterating query results")
			log.Println(err)
		}
		departments[department.Id] = department
	}
	//Query for municipalities
	theQuery = "SELECT * FROM municipalities"
	db_r = makeDBQuery(theQuery)
	if db_r == nil {
		panic("Error querying municipalities")
	}
	for db_r.Next() {
		var municipality Municipality
		err := db_r.Scan(&municipality.Id, &municipality.Dpt_id, &municipality.Name)
		if err != nil {
			log.Println("Error iterating query results")
			log.Println(err)
		}
		municipalities[municipality.Id] = municipality
	}

	//Query for papers
	theQuery = "SELECT * FROM papers"
	db_r = makeDBQuery(theQuery)
	if db_r == nil {
		panic("Error querying papers")
	}
	for db_r.Next() {
		var paper Paper
		err := db_r.Scan(&paper.Id, &paper.Name)
		if err != nil {
			log.Println("Error iterating query results")
			log.Println(err)
		}
		papers[paper.Id] = paper
	}

	//Query for parties
	theQuery = "SELECT * FROM parties"
	db_r = makeDBQuery(theQuery)
	if db_r == nil {
		panic("Error querying parties")
	}
	for db_r.Next() {
		var party Party
		err := db_r.Scan(&party.Id, &party.Name)
		if err != nil {
			log.Println("Error iterating query results")
			log.Println(err)
		}
		parties[party.Id] = party
	}

}
