package main

import (
	"fmt"
	"net/http"
	"github.com/andeeliao/handlers"
		//"encoding/json"
	//"io"
	//"os"
	//"bufio"
		//"log"
	//"io/ioutil"
	//"bytes"
)


func main() {

	http.HandleFunc("/tables", handlers.TablesListHandler)
	http.HandleFunc("/reviews", handlers.ReviewsHandler)
	fmt.Println("got request 1")
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.ListenAndServe(":8001", nil)

}


