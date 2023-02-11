package main

import (
	"database/sql"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

var is_docker = true
var is_sql_docker = true

var db_user = "so1"
var db_password = "featupz97"
var logs_filepath = "./main.logs"

type operationElement struct {
	Value string `json:"element"`
}

type operation struct {
	Left      string `json:"left"`
	Right     string `json:"right"`
	Operation string `json:"operation"`
	Result    string `json:"result"`
	Timestamp string `json:"timestamp"`
}

var logs = []operation{
	//{Left: "2", Right: "2", Operation: "+", Result: "5"},
}

var stack []float64

func makeDBQuery(query string) *sql.Rows {

	var db *sql.DB
	var err error

	if is_sql_docker {
		db, err = sql.Open("mysql", fmt.Sprint(db_user, ":", db_password, "@tcp(192.168.2.102:3306)/so1"))
	} else {
		db, err = sql.Open("mysql", fmt.Sprint(db_user, ":", db_password, "@tcp(127.0.0.1:3306)/so1"))
	}
	defer db.Close()

	if err != nil {
		log.Println("Error connecting to db...")
		log.Println(err)
		return nil
	}
	result, err2 := db.Query(query)
	if err2 != nil {
		log.Println("Error querying to db...")
		log.Println(err)
		return nil
	}
	return result

}

func main() {

	if is_docker {
		logs_filepath = "/logs/main.log"
	} else {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			log.Fatal(err)
		}
		logs_filepath = homeDir + "/Documents/SO1/Prac1/dockerized/logs/actual_logs/main.log"
	}
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}
	router.Use(cors.New(config))

	router.GET("/cleans", cleanStack)
	router.GET("/cleanl", cleanLogs)
	router.GET("/logs", getLogs)
	router.POST("/operate", receiveElement)

	err := router.Run("0.0.0.0:5000")
	if err != nil {
		return
	}
}

func cleanStack(c *gin.Context) {
	stack = []float64{}
	c.IndentedJSON(http.StatusCreated, gin.H{"status": "0", "message": "Stack cleaned successfully"})
}

func cleanLogs(c *gin.Context) {
	logs = []operation{}
	result := makeDBQuery("DELETE FROM prac1 WHERE 1")
	if result == nil {
		c.IndentedJSON(http.StatusCreated, gin.H{"status": "1", "message": "Error in db..."})
		return
	}
	c.IndentedJSON(http.StatusCreated, gin.H{"status": "0", "message": "Logs cleaned successfully"})
}

func getLogs(c *gin.Context) {
	logs = []operation{}
	result := makeDBQuery("SELECT LeftOperator,RightOperator,Operator,Result,TIMESTAMP FROM prac1")
	if result == nil {
		c.IndentedJSON(http.StatusOK, logs)
		return
	}
	for result.Next() {
		var operation_log operation
		err := result.Scan(&operation_log.Left, &operation_log.Right, &operation_log.Operation,
			&operation_log.Result, &operation_log.Timestamp)
		if err != nil {
			log.Println("Error iterating query results")
			log.Println(err)
		}
		fmt.Printf("%v\n", operation_log)
		logs = append(logs, operation_log)
	}
	c.IndentedJSON(http.StatusOK, logs)
}

func appendToLocalLog(theLog operation) {
	fmt.Printf("Attempting to open logfile <%v>\n", logs_filepath)
	file, err := os.OpenFile(logs_filepath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	defer file.Close()
	if err != nil {
		fmt.Printf("Could not open logs file. Error code:%v\n", err)
		return
	}
	parsed := fmt.Sprintf("%v Left:%v Right:%v Operator:%v Result:%v\n",
		theLog.Timestamp, theLog.Left, theLog.Right, theLog.Operation, theLog.Result)

	_, err2 := file.WriteString(parsed)

	if err2 != nil {
		fmt.Println("Could not write text to log")

	} else {
		fmt.Println("Local log appended successfully")
	}

}

func receiveElement(c *gin.Context) {
	var theElement operationElement
	if err := c.BindJSON(&theElement); err != nil {
		return
	}

	if strings.Contains("+-*/", theElement.Value) { //Operator

		if len(stack) < 2 {
			a := ""
			b := ""
			if len(stack) == 1 {
				a = strconv.FormatFloat(stack[len(stack)-1], 'f', 3, 32)
				stack = stack[:0]
			}

			currentTime := time.Now()
			parsed_time := fmt.Sprintf("%v", currentTime.Format("2006-01-02 15:04:05"))
			theErrorLog := operation{
				Left:      a,
				Right:     b,
				Operation: theElement.Value,
				Result:    "Error => Stack doesn't have sufficient elements",
				Timestamp: parsed_time,
			}
			logs = append(logs, theErrorLog)
			appendToLocalLog(theErrorLog)
			theQuery := fmt.Sprint(
				"INSERT INTO `prac1`(`LeftOperator`, `RightOperator`, `Operator`, `Result`)",
				" VALUES (",
				"\"", theErrorLog.Left, "\",",
				"\"", theErrorLog.Right, "\",",
				"\"", theErrorLog.Operation, "\",",
				"\"", theErrorLog.Result, "\"",
				")")
			fmt.Printf("Query:%v\n", theQuery)
			db_r := makeDBQuery(theQuery)
			if db_r == nil {
				c.IndentedJSON(http.StatusCreated, gin.H{"status": "1", "message": "Error in db..."})
				return
			}
			c.IndentedJSON(http.StatusCreated, gin.H{
				"message": "Error => Stack doesn't have sufficient elements",
				"result":  "ERROR",
				"logs":    logs,
				"status":  "0",
			})
			return
		}
		a := stack[len(stack)-2]
		b := stack[len(stack)-1]
		currentTime := time.Now()
		parsed_time := fmt.Sprintf("%v", currentTime.Format("2006-01-02 15:04:05"))
		theLog := operation{
			Left:      strconv.FormatFloat(a, 'f', 3, 32),
			Right:     strconv.FormatFloat(b, 'f', 3, 32),
			Operation: theElement.Value,
			Result:    "42",
			Timestamp: parsed_time,
		}

		switch theElement.Value {
		case "+":
			theLog.Result = strconv.FormatFloat(a+b, 'f', 3, 32)
			break
		case "-":
			theLog.Result = strconv.FormatFloat(a-b, 'f', 3, 32)
			break
		case "*":
			theLog.Result = strconv.FormatFloat(a*b, 'f', 3, 32)
			break
		case "/":
			if b == 0 {
				currentTime := time.Now()
				parsed_time := fmt.Sprintf("%v", currentTime.Format("2006-01-02 15:04:05"))
				theErrorLog := operation{
					Left:      strconv.FormatFloat(a, 'f', 3, 32),
					Right:     "0",
					Operation: "/",
					Result:    "Error => Division by 0",
					Timestamp: parsed_time,
				}
				logs = append(logs, theErrorLog)
				appendToLocalLog(theErrorLog)
				theQuery := fmt.Sprint(
					"INSERT INTO `prac1`(`LeftOperator`, `RightOperator`, `Operator`, `Result`)",
					" VALUES (",
					"\"", theErrorLog.Left, "\",",
					"\"", theErrorLog.Right, "\",",
					"\"", theErrorLog.Operation, "\",",
					"\"", theErrorLog.Result, "\"",
					")")
				fmt.Printf("Query:%v\n", theQuery)
				db_r := makeDBQuery(theQuery)
				if db_r == nil {
					c.IndentedJSON(http.StatusCreated, gin.H{"status": "1", "message": "Error in db..."})
					return
				}
				c.IndentedJSON(http.StatusCreated, gin.H{
					"message": "Operation registered correctly",
					"result":  theLog.Result,
					"logs":    logs,
					"status":  "0",
				})
				return
			}
			theLog.Result = strconv.FormatFloat(a/b, 'f', 3, 32)
			break
		default:
			c.IndentedJSON(http.StatusCreated, gin.H{"status": "1", "message": "Error parsing element"})
			return
		}
		stack = stack[:len(stack)-2]
		logs = append(logs, theLog)
		appendToLocalLog(theLog)
		theQuery := fmt.Sprint(
			"INSERT INTO `prac1`(`LeftOperator`, `RightOperator`, `Operator`, `Result`)",
			" VALUES (",
			"\"", theLog.Left, "\",",
			"\"", theLog.Right, "\",",
			"\"", theLog.Operation, "\",",
			"\"", theLog.Result, "\"",
			")")
		fmt.Printf("Query:%v\n", theQuery)
		db_r := makeDBQuery(theQuery)
		if db_r == nil {
			c.IndentedJSON(http.StatusCreated, gin.H{"status": "1", "message": "Error in db..."})
			return
		}

		c.IndentedJSON(http.StatusCreated, gin.H{
			"message": "Operation registered correctly",
			"result":  theLog.Result,
			"logs":    logs,
			"status":  "0",
		})
	} else { //Received is number
		elem, parseError := strconv.ParseFloat(theElement.Value, 64)

		if parseError != nil {
			c.IndentedJSON(http.StatusCreated, gin.H{"status": "1", "message": "Error parsing element"})
			return
		}
		stack = append(stack, elem)
		c.IndentedJSON(http.StatusCreated, gin.H{
			"message": "Element registered correctly",
			"result":  "0",
			"logs":    logs,
			"status":  "0",
		})
	}
}

//jsonByteArray, _ := io.ReadAll(c.Request.Body)
//var result map[string]any
//err := json.Unmarshal(jsonByteArray, &result)
//if err != nil {
//	return
//}
//fmt.Println(result["element"])
