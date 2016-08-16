package handlers

import (
	"fmt"
	"net/http"
	"io"
	"io/ioutil"
	"strings"
	"encoding/json"
	"strconv"

	"github.com/EMOtions/basics"
	"github.com/EMOtions/structs"
	"github.com/EMOtions/deltas"
	"github.com/EMOtions/cache"
)

func QueueMessageHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("inside QueueMessageHandler")
	switch r.Method {
	case "POST":
		var message structs.QueueMessage 
		decoder:= json.NewDecoder(r.Body)
		decoder.Decode(&message)
		fmt.Println(message)

		sendURL := cache.URL + "/queue/1/_sendbatch"
		data_binary := "{\"" + message.Queue + "\":[" + strings.Join(message.Messages, ",") + "]}"
		fmt.Println(data_binary)
		resp_message, err := http.Post(sendURL, "application/json", strings.NewReader(data_binary))
		basics.Check(err)

		/*b := ioutil.ReadAll(resp_message.Body)
		fmt.Println(string(b))*/

		io.Copy(w, resp_message.Body)

	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)

	}
}

func QueueHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("inside QueueHandler")
	switch r.Method {
	case "GET":
		queue := r.URL.Query().Get("queue")
		fmt.Println(queue)
		resp_size, err := http.Get(cache.URL + "/queue/1/" + queue + "/size")
		basics.Check(err)

		queque_bytes, err := ioutil.ReadAll(resp_size.Body)
		queque_size, err := strconv.ParseUint(string(queque_bytes), 10, 64)

		resp_claim, err := http.Get(cache.URL + "/queue/1/" + queue + "/claimcount")
		basics.Check(err) 

		queue_bytes_claimcount, err := ioutil.ReadAll(resp_claim.Body)
		queue_claimcount, err := strconv.ParseUint(string(queue_bytes_claimcount), 10, 64)

		info := structs.QueueInfo{Name: queue, Size: queque_size, ClaimCount: queue_claimcount}

		resp_peek, err := http.Get(cache.URL + "/queue/1/" + queue + "/peek")
		peek_bytes, err := ioutil.ReadAll(resp_peek.Body)

		peek_string := string(peek_bytes)
		info.Peek = peek_string

		encoded, err := json.Marshal(info)
		w.Write(encoded)

	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
	
}


func SubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("inside SubscriptionHandler")
	switch r.Method{
	case "GET":
		subscription := r.URL.Query().Get("subscription")
		fmt.Println(subscription)

		resp, err := http.Get(cache.URL + "/bus/1/" + subscription)
		basics.Check(err)

		var info structs.SubscriptionInfo
		decoder := json.NewDecoder(resp.Body)
		decoder.Decode(&info)
		fmt.Println(info)

		resp_size, err := http.Get(cache.URL + "/bus/1/" + subscription + "/size")
		basics.Check(err)

		size_bytes, err := ioutil.ReadAll(resp_size.Body)
		basics.Check(err)
		size_string := string(size_bytes)

		size, err := strconv.ParseUint(size_string, 10, 64)
		basics.Check(err)

		fmt.Println(size)


		resp_claim, err := http.Get(cache.URL + "/bus/1/" + subscription + "/claimcount")
		claim_bytes, err := ioutil.ReadAll(resp_claim.Body)
		basics.Check(err)
		claim_string := string(claim_bytes)

		claims, err := strconv.ParseUint(claim_string, 10, 64)
		basics.Check(err)

		info.EventCount = size
		info.ClaimCount = claims

		resp_peek, err := http.Get(cache.URL + "/bus/1/" + subscription + "/peek")
		peek_bytes, err := ioutil.ReadAll(resp_peek.Body)

		peek_string := string(peek_bytes)
		info.Peek = peek_string

		encoded, err := json.Marshal(info)
		w.Write(encoded)

	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
	
}


func SearchCoordinateHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("insider SearchCoordinateHandler")
	switch r.Method{
	case "POST":
		//stuff
		var coord structs.Coordinate 
		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&coord)
		fmt.Println(coord)

		resp, err := http.Get(cache.URL + "/sor/1/" + coord.Table + "/" + coord.TableKey)
		basics.Check(err)

		io.Copy(w, resp.Body)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
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
			val = deltas.AddQuotes(val)
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

		sendURL := cache.URL + "/sor/1/emouitesttable/testdelta?audit=comment:'testing',host:aws-cms-01"
		_, err := http.Post(sendURL, "application/x.json-delta", strings.NewReader(test.Original))
		basics.Check(err)
		_, err2 := http.Post(sendURL, "application/x.json-delta", strings.NewReader(test.Delta))
		basics.Check(err2)

		
		resp3, err3 := http.Get(cache.URL + "/sor/1/emouitesttable/testdelta")
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
		fmt.Println(edit)


		//writes to emodb, should be conditional, or maybe move other stuff to outside of ReviewsHandler
		details := "/sor/1/" + edit.Table + "/" + edit.TableKey + "?audit=comment:'edit',host:aws-cms-01" + "&APIKey=" + edit.APIKey
		fmt.Println("details: " + details)
		resp, err := http.Post(cache.URL + details, "application/x.json-delta", strings.NewReader(edit.Delta))
		basics.Check(err)

		/*data, _ := ioutil.ReadAll(resp.Body)
		fmt.Println("data: " + string(data))*/
		

		io.Copy(w, resp.Body)

	case "GET":
		tableName := r.URL.Query().Get("tableName")
		resp, err := http.Get(cache.URL + "/sor/1/" + tableName)
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
		fmt.Println(search)

		//basics.PrintJSON(Tables_list)

		w.Header().Set("Content-Type", "application/json")
		encoded, err := json.Marshal(cache.Search(search))
		basics.Check(err)
		w.Write(encoded)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method: %s", r.Method), http.StatusMethodNotAllowed)
	}
}











