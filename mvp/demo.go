package main

import (
	"fmt"
	"net/http"
	"github.com/andeeliao/handlers"
	"github.com/andeeliao/cache"
)


func main() {
	cache.Populate()
	http.HandleFunc("/tables", handlers.TablesListHandler)
	http.HandleFunc("/reviews", handlers.ReviewsHandler)
	http.HandleFunc("/deltaconstructor", handlers.DeltaConstructorHandler)
	http.HandleFunc("/deltatest", handlers.DeltaTestHandler)
	fmt.Println("got to 1")
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.ListenAndServe(":8001", nil)

}


