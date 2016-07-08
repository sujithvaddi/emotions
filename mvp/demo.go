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
	http.HandleFunc("/deltaconstructor", handlers.DeltaConstructorHandler)
	http.HandleFunc("/deltatest", handlers.DeltaTestHandler)
	fmt.Println("got to 1")
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.ListenAndServe(":8001", nil)

}


