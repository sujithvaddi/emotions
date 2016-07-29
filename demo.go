package main

import (
	"fmt"
	"net/http"
	"os"
	"github.com/andeeliao/handlers"
	"github.com/andeeliao/cache"
)


func main() {
	PORT := os.Args[1]

	cache.Populate()
	cache.Schedule()
	http.HandleFunc("/buttons", handlers.ButtonsHandler)
	http.HandleFunc("/tables", handlers.TablesListHandler)
	http.HandleFunc("/reviews", handlers.ReviewsHandler)
	http.HandleFunc("/deltaconstructor", handlers.DeltaConstructorHandler)
	http.HandleFunc("/deltatest", handlers.DeltaTestHandler)
	fmt.Println("got to 1")
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.ListenAndServe(":" + PORT, nil)

}

