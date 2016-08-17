package main

import (
	"fmt"
	"net/http"
	"os"
	
	"github.com/EMOtions/cache"
	"github.com/EMOtions/handlers"
)


func main() {

	fmt.Println("Starting EMOtions...")

	//checking if port is local or not
	PORT := os.Args[1]
	if PORT == "local" {
		PORT = "8001"
	}

	cache.SetupEmoURL(PORT)
	cache.DecryptKey()
	cache.Populate()
	cache.Schedule()

	//available API calls
	http.HandleFunc("/buttons", handlers.ButtonsHandler)
	http.HandleFunc("/tables", handlers.TablesListHandler)
	http.HandleFunc("/reviews", handlers.ReviewsHandler)
	http.HandleFunc("/deltaconstructor", handlers.DeltaConstructorHandler)
	http.HandleFunc("/deltatest", handlers.DeltaTestHandler)
	http.HandleFunc("/searchcoordinate", handlers.SearchCoordinateHandler)
	http.HandleFunc("/subscription", handlers.SubscriptionHandler)
	http.HandleFunc("/queueinfo", handlers.QueueHandler)
	http.HandleFunc("/queuemessage", handlers.QueueMessageHandler)

	//serving pages
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.Handle("/databus", http.StripPrefix("/databus", http.FileServer(http.Dir("./public/databus"))))
	http.Handle("/queue", http.StripPrefix("/queue", http.FileServer(http.Dir("./public/queue"))))

	//program should pause after this line
	http.ListenAndServe(":" + PORT, nil)
	fmt.Println("Server ListenAndServe ended unexpectedly")

}


