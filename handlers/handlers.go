package handlers

import (
	"fmt"
	"net/http"
	"github.com/andeeliao/basics"
	"github.com/andeeliao/table"
	"io"
	"io/ioutil"
	"encoding/json"
)

const URL = "http://localhost:8080"

var Tables_list []table.Table

func ReviewsHandler(w http.ResponseWriter, r *http.Request)  {

	fmt.Println("got request 1")
	switch r.Method {
	case "POST":
		body, err := ioutil.ReadAll(r.Body)
		basics.Check(err)

		fmt.Println(string(body))


	case "GET":

		fmt.Println("got request 2")
		resp, err := http.Get(URL + "/sor/1/review:testcustomer/demo1")
		basics.Check(err)

		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// stream the contents of the file to the response

		io.Copy(w, resp.Body)

	default:
		// Don't know the method, so error
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
	//fmt.Println(data)
}

func TablesListHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		resp, err := http.Get(URL + "/sor/1/_table")
		basics.Check(err)

		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// stream the contents of the file to the response
		
		decoder := json.NewDecoder(resp.Body)
		decoder.Decode(&Tables_list)

		fmt.Println(Tables_list)

		encoded, err := json.Marshal(Tables_list)
		basics.Check(err)
		fmt.Println(string(encoded))

		w.Write(encoded)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}