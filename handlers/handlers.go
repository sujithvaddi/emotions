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

func DeltaTestHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("inside DeltaTestHandler")
	switch r.Method {
	case "POST":
		fmt.Println("inside Delta test Post")
		var test structs.DeltaTest

		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&test)

		fmt.Println("test: ", test)

		details := "/sor/1/testonly/testdelta?audit=comment:'testing',host:aws-cms-01"
		_, err := http.Post(URL + details, "application/x.json-delta", strings.NewReader(test.Original))
		basics.Check(err)
		_, err2 := http.Post(URL + details, "application/x.json-delta", strings.NewReader(test.Delta))
		basics.Check(err2)

		
		resp3, err3 := http.Get(URL + "/sor/1/testonly/testdelta")
		basics.Check(err3)

		w.Header().Set("Content-Type", "application/json")
		io.Copy(w, resp3.Body)
	case "GET":
		fmt.Println("inside Delta test Get")
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

func DeltaConstructorHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("inside DeltaConstructorHandler")
	
	switch r.Method {
	case "POST":
		fmt.Println("inside DeltaConstructorHandler Post")
		var kvpair structs.KeyValuePair

		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&kvpair)

		var deltaString string

		switch kvpair.Type {
		case "Map":
			deltaString = deltas.Map(kvpair)
		case "Literal":
			deltaString = deltas.Literal(kvpair)
		case "Delete Document":
			deltaString = deltas.DeleteDoc(kvpair)
		case "Delete Key":
			deltaString = deltas.DeleteKey(kvpair)
		case "Noop":
			deltaString = deltas.Noop(kvpair)
		case "Nest":
			deltaString = deltas.Nest(kvpair)
		case "Make Conditional":
			deltaString = deltas.MakeConditional(kvpair)
		case "True":
			deltaString = deltas.AlwaysTrue(kvpair)
		case "False":
			deltaString = deltas.AlwaysFalse(kvpair)
		default:
			fmt.Println("unknown delta type")
		}

		w.Header().Set("Content-Type", "text/plain")
		io.Copy(w, strings.NewReader(deltaString))
	case "GET":
		fmt.Println("inside DeltaConstructorHandler Get")
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

func ReviewsHandler(w http.ResponseWriter, r *http.Request)  {

	fmt.Println("got request from review 1")
	

	switch r.Method {
	case "POST":
		fmt.Println("got POST request from ReviewsHandler")
		
		var edit structs.DeltaEdit
		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&edit)


		//writes to emodb, should be conditional, or maybe move other stuff to outside of ReviewsHandler
		details := "/sor/1/" + edit.Table + "/" + edit.TableKey + "?audit=comment:'edit',host:aws-cms-01"
		resp, err := http.Post(URL + details, "application/x.json-delta", strings.NewReader(edit.Delta))
		basics.Check(err)

		var success structs.SuccessResponse
		decoder2 := json.NewDecoder(resp.Body)
		decoder2.Decode(&success)

		fmt.Println(success)
		//need to go back and send this to client so it knows success status


		w.Header().Set("Content-Type", "text/plain")
		//io.Copy(w, strings.NewReader(deltas.Map(kvpair)))

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

		fmt.Println("got POST request from TablesListHandler")
		resp, err := http.Get(URL + "/sor/1/_table")
		basics.Check(err)

		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// stream the contents of the file to the response
		
		var Tables_list []structs.Table
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