package handlers

import (
	"fmt"
	"net/http"
	"github.com/andeeliao/basics"
	"github.com/andeeliao/structs"
	"github.com/andeeliao/deltas"
	"github.com/andeeliao/cache"
	"io"
	//"io/ioutil"
	"strings"
	"encoding/json"
)

const URL = "https://emodb-ci.dev.us-east-1.nexus.bazaarvoice.com"

func addQuotes(val string) string {
	if val == "true" || val == "false" {
		return val
	} else if val[0] == '{' || val[0] == '[' {
		return val
	} else {
		return "\"" + val + "\""
	}
}


func ButtonsHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("insider ButtonsHandler")
	switch r.Method{
	case "GET":
		buttonType := r.URL.Query().Get("buttonType")
		buttonText := r.URL.Query().Get("buttonText")
		currentTextArea := r.URL.Query().Get("currentTextArea")

		fmt.Println("buttonType:" + buttonType + "buttonText:" + buttonText+ "currentTextArea:" + currentTextArea)

		switch buttonType {
		case "edit":
			key_val := strings.Split(buttonText, ":")
			key, val := key_val[0], key_val[1]
			val = addQuotes(val)
			response := "{..,\"" + key + "\":" + val + "}"
			io.Copy(w, strings.NewReader(response))

		case "key":
			response :="{..,\"" + buttonText + "\":" + currentTextArea + "}"
			io.Copy(w, strings.NewReader(response))
		default:
			fmt.Println("unrecognized buttonType")
		}
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

func DeltaTestHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("inside DeltaTestHandler")
	switch r.Method {
	case "POST":
		fmt.Println("inside Delta test Post")
		var test structs.DeltaTest

		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&test)

		fmt.Println("test: ", test)

		details := "/sor/1/emouitesttable/testdelta?audit=comment:'testing',host:aws-cms-01"
		_, err := http.Post(URL + details, "application/x.json-delta", strings.NewReader(test.Original))
		basics.Check(err)
		_, err2 := http.Post(URL + details, "application/x.json-delta", strings.NewReader(test.Delta))
		basics.Check(err2)

		
		resp3, err3 := http.Get(URL + "/sor/1/emouitesttable/testdelta")
		basics.Check(err3)

		w.Header().Set("Content-Type", "application/json")
		io.Copy(w, resp3.Body)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

func DeltaConstructorHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("inside DeltaConstructorHandler")
	
	switch r.Method {
	case "POST":
		fmt.Println("inside DeltaConstructorHandler Post")
		var data structs.DeltaConstructorData

		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&data)

		fmt.Println(data)

		var deltaString string

		switch data.Type {
		case "Map":
			deltaString = deltas.Map(data)
		case "Literal":
			deltaString = deltas.Literal(data)
		case "Delete Document":
			deltaString = deltas.DeleteDoc(data)
		case "Delete Key":
			deltaString = deltas.DeleteKey(data)
		case "Noop":
			deltaString = deltas.Noop(data)
		case "Nest":
			deltaString = deltas.Nest(data)
		case "Make Conditional":
			deltaString = deltas.MakeConditional(data)
		case "True":
			deltaString = deltas.AlwaysTrue(data)
		case "False":
			deltaString = deltas.AlwaysFalse(data)
		default:
			fmt.Println("unknown delta type")
		}
		w.Header().Set("Content-Type", "text/plain")
		io.Copy(w, strings.NewReader(deltaString))
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
		//io.Copy(w, strings.NewReader(deltas.Map(data)))

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
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

func TablesListHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		fmt.Println("got GET request from TablesListHandler")
		search := r.URL.Query().Get("query")
		//fmt.Println(search)

		//basics.PrintJSON(Tables_list)

		w.Header().Set("Content-Type", "application/json")
		encoded, err := json.Marshal(cache.Search(search))
		basics.Check(err)
		w.Write(encoded)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}











