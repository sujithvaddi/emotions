package main

import (
	"fmt"
	"net/http"
	"os"
	"github.com/EMOtions/handlers"
	"github.com/EMOtions/cache"
)


func main() {
	PORT := os.Args[1]

	if PORT == "local" {
		PORT = "8001"
	}
	cache.SetupEmoURL(PORT)
	cache.DecryptKey()
	cache.Populate()
	cache.Schedule()

	http.HandleFunc("/buttons", handlers.ButtonsHandler)
	http.HandleFunc("/tables", handlers.TablesListHandler)
	http.HandleFunc("/reviews", handlers.ReviewsHandler)
	http.HandleFunc("/deltaconstructor", handlers.DeltaConstructorHandler)
	http.HandleFunc("/deltatest", handlers.DeltaTestHandler)
	http.HandleFunc("/searchcoordinate", handlers.SearchCoordinateHandler)
	http.HandleFunc("/subscription", handlers.SubscriptionHandler)
	http.HandleFunc("/queueinfo", handlers.QueueHandler)
	http.HandleFunc("/queuemessage", handlers.QueueMessageHandler)
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.Handle("/databus", http.StripPrefix("/databus", http.FileServer(http.Dir("./public/databus"))))
	http.Handle("/queue", http.StripPrefix("/queue", http.FileServer(http.Dir("./public/queue"))))
	http.ListenAndServe(":" + PORT, nil)
	fmt.Println("past ListenAndServe???")

}


