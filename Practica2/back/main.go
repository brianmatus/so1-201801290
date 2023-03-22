package main

import (
	"bufio"
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"os"
	"os/exec"
	"strconv"
	"strings"

	_ "github.com/GoogleCloudPlatform/cloudsql-proxy/proxy/proxy"
)

var is_sql_local = false
var is_docker = true

var mainDB *sql.DB
var db_user = "so1"
var db_password = "featupz97"

// Create a map to store UID and username
var usernameByUID = make(map[int]string)

type Process struct {
	Pid      int     `json:"pid"`
	Name     string  `json:"name"`
	Status   string  `json:"status"`
	User     int     `json:"user"`
	Children []Child `json:"children"`
}

type Child struct {
	Pid  int    `json:"pid"`
	Name string `json:"name"`
}

type Data struct {
	Processes []Process `json:"processes"`
	CpuUsage  int       `json:"cpu_usage"`
}

type RAM struct {
	Total    int `json:"total_ram"`
	Free     int `json:"free_ram"`
	Buffered int `json:"buffered_ram"`
	Cached   int `json:"cached_ram"`
}

func main() {
	fmt.Println("#################################################################################################")
	var err error = nil
	mainDB, err = openDB()
	if err != nil {
		fmt.Println("Error getting db:")
		fmt.Println(err)
		return
	}
	getUserNames()
	updateData()
	defer mainDB.Close()

}

func updateData() {
	var cpuString = getCPUJSONString()

	var data Data
	err := json.Unmarshal([]byte(cpuString), &data)
	if err != nil {
		log.Fatal(err)
	}
	var insertQuery = "INSERT INTO `prac2_procs`(`PID`, `Name`, `Username`, `State`, `RAM`, `FatherPID`) VALUES \n"

	for _, parentProcess := range data.Processes {
		if parentProcess.Pid == -1 {
			continue
		}

		insertQuery += fmt.Sprintf("(%v, \"%v\", \"%v\", \"%v\", 0, -1),\n",
			parentProcess.Pid,
			parentProcess.Name,
			usernameByUID[parentProcess.User],
			parentProcess.Status,
		)

		for _, child := range parentProcess.Children {

			if child.Pid == -1 {
				continue
			}
			//fmt.Printf("Child pid: %d, name: %s\n", child.Pid, child.Name)
			insertQuery += fmt.Sprintf("(%v, \"%v\", -1, 'X' , 0, %v),\n",
				child.Pid,
				child.Name,
				parentProcess.Pid,
			)
		}
	}
	insertQuery = insertQuery[:len(insertQuery)-2] + ";"

	//Purge first
	db_r := makeDBQuery("DELETE FROM `prac2_procs` WHERE 1")
	if db_r == nil {
		fmt.Println("Error in db while purging procs...")
	} else {
		fmt.Println("Purged procs.")
	}

	//fmt.Println("Insert query for processes:")
	//fmt.Println(insertQuery)
	db_r = makeDBQuery(insertQuery)
	if db_r == nil {
		fmt.Println("Error in db while inserting new processes...")
	} else {
		fmt.Println("Success inserting procs.")
	}
	///////////////////
	db_r = makeDBQuery("DELETE FROM `prac2_stats` WHERE 1")
	if db_r == nil {
		fmt.Println("Error in db while purging stats...")
	} else {
		fmt.Println("Stats purged.")
	}
	var ram RAM
	var ramString = getRAMJSONString()
	err = json.Unmarshal([]byte(ramString), &ram)
	if err != nil {
		log.Fatal(err)
	}
	insertQuery = "INSERT INTO `prac2_stats`(`cpu_usage`, `total_ram`, `free_ram`, `buffered_ram`, `cached_ram`) VALUES \n"
	insertQuery += fmt.Sprintf("(%v, %v, %v, %v, %v);", data.CpuUsage, ram.Total, ram.Free, ram.Buffered, ram.Cached)
	//fmt.Println("Insert query for stats:")
	//fmt.Println(insertQuery)
	db_r = makeDBQuery(insertQuery)
	if db_r == nil {
		fmt.Println("Error in db while inserting stats...")
	} else {
		fmt.Println("Success inserting stats.")
	}
	fmt.Printf("cpu_usage: %v, total_ram:%v, freem_ram:%v, buffered_ram:%v, cached_ram:%v\n", data.CpuUsage, ram.Total, ram.Free, ram.Buffered, ram.Cached)

}

func getCPUJSONString() string {
	cmd := exec.Command("sh", "-c", "cat /proc/cpu_201801290/info.txt")
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println(err)
	}
	return string(out[:])
}

func getUserNames() {
	file, err := os.Open("/etc/passwd")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	usernameByUID = make(map[int]string)

	// Read the file line by line
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()

		// Split the line by ":" to get the fields
		fields := strings.Split(line, ":")

		// Parse the UID as an integer
		uid, err := strconv.Atoi(fields[2])
		if err != nil {
			panic(err)
		}

		// Store the UID and username in the map
		usernameByUID[uid] = fields[0]
	}
}

func getRAMJSONString() string {
	cmd := exec.Command("sh", "-c", "cat /proc/ram_201801290/info.txt")
	out, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println(err)
	}
	return string(out[:])
}

func openDB() (*sql.DB, error) {
	mustGetenv := func(k string) string {
		v := os.Getenv(k)
		if v == "" {
			log.Fatalf("Fatal Error in connect_connector.go: %s environment variable not set.\n", k)
		}
		return v
	}
	var (
		dbUser string
		dbPass string
		dbName string
		dbIP   string
	)

	var db *sql.DB
	var err error
	if is_sql_local {
		dbUser = mustGetenv("L_DB_USER")
		dbPass = mustGetenv("L_DB_PASS")
		dbName = mustGetenv("L_DB_NAME")
		dbIP = mustGetenv("L_DB_IP")
	} else {
		dbUser = mustGetenv("C_DB_USER")
		dbPass = mustGetenv("C_DB_PASS")
		dbName = mustGetenv("C_DB_NAME")
		dbIP = mustGetenv("C_DB_IP")
	}
	db, err = sql.Open("mysql", fmt.Sprint(dbUser, ":", dbPass, "@tcp(", dbIP, ")/", dbName))
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
