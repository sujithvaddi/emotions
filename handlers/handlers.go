package handlers

import (
	"fmt"
	"net/http"
	"github.com/andeeliao/basics"
	"github.com/andeeliao/structs"
	"github.com/andeeliao/deltas"
	"io"
	//"io/ioutil"
	"strings"
	"encoding/json"
)

const URL = "http://localhost:8080"

var Tables_list []structs.Table

func ReviewsHandler(w http.ResponseWriter, r *http.Request)  {

	fmt.Println("got request from review 1")
	

	switch r.Method {
	case "POST":
		fmt.Println("got POST request from ReviewsHandler")
		

		var kvpair structs.KeyValuePair

		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&kvpair)

		fmt.Println("json: ")
		basics.PrintJSON(kvpair)
		fmt.Println(deltas.Map(kvpair))

		details := "/sor/1/" + kvpair.Table + "/" + kvpair.TableKey + "?audit=comment:'moderation+complete',host:aws-cms-01"
		resp, err := http.Post(URL + details, "application/x.json-delta", strings.NewReader(deltas.Map(kvpair)))
		basics.Check(err)


		var success structs.SuccessResponse
		decoder2 := json.NewDecoder(resp.Body)
		decoder2.Decode(&success)

		fmt.Println(success)
		//need to go back and send this to client so it knows success status
		/*io.Copy(w, resp.Body)*/

	case "GET":
		tableName := r.URL.Query().Get("tableName")
		resp, err := http.Get(URL + "/sor/1/" + tableName)
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

		//fmt.Println(Tables_list)

		//basics.PrintJSON(Tables_list)

		encoded, err := json.Marshal(Tables_list)
		w.Write(encoded)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}