//API endpoints for server.go
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
	"github.com/EMOtions/cache"
	"github.com/EMOtions/deltas"
	"github.com/EMOtions/structs"
)

//sends messages to queue
func QueueMessageHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		var message structs.QueueMessage 
		decoder:= json.NewDecoder(r.Body)
		decoder.Decode(&message)

		sendURL := cache.URL + "/queue/1/_sendbatch"
		data_binary := "{\"" + message.Queue + "\":[" + strings.Join(message.Messages, ",") + "]}"

		resp_message, err := http.Post(sendURL, "application/json", strings.NewReader(data_binary))
		basics.Check(err)
		defer resp_message.Body.Close()

		io.Copy(w, resp_message.Body)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method form QueueMessageHandler: %s", r.Method), http.StatusMethodNotAllowed)

	}
}

//gets and sends all information on a queue
func QueueHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		queue := r.URL.Query().Get("queue")

		//size
		resp_size, err := http.Get(cache.URL + "/queue/1/" + queue + "/size")
		basics.Check(err)
		defer resp_size.Body.Close()

		queque_bytes, err := ioutil.ReadAll(resp_size.Body)
		basics.Check(err)
		queque_size, err := strconv.ParseUint(string(queque_bytes), 10, 64)
		basics.Check(err)

		//claimcount
		resp_claim, err := http.Get(cache.URL + "/queue/1/" + queue + "/claimcount")
		basics.Check(err) 
		defer resp_claim.Body.Close()

		queue_bytes_claimcount, err := ioutil.ReadAll(resp_claim.Body)
		basics.Check(err)
		queue_claimcount, err := strconv.ParseUint(string(queue_bytes_claimcount), 10, 64)
		basics.Check(err)

		info := structs.QueueInfo{Name: queue, Size: queque_size, ClaimCount: queue_claimcount}

		//peeks
		resp_peek, err := http.Get(cache.URL + "/queue/1/" + queue + "/peek")
		basics.Check(err)
		defer resp_peek.Body.Close()

		peek_bytes, err := ioutil.ReadAll(resp_peek.Body)
		basics.Check(err)

		peek_string := string(peek_bytes)
		info.Peek = peek_string

		encoded, err := json.Marshal(info)
		basics.Check(err)
		w.Write(encoded)

	default:
		http.Error(w, fmt.Sprintf("Unsupported method from QueueHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
	
}

//gets and sends all info on a subscription
func SubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method{
	case "GET":
		subscription := r.URL.Query().Get("subscription")

		//getting basic subscription info
		resp, err := http.Get(cache.URL + "/bus/1/" + subscription)
		basics.Check(err)
		defer resp.Body.Close()

		var info structs.SubscriptionInfo
		decoder := json.NewDecoder(resp.Body)
		decoder.Decode(&info)

		//getting and decoding size
		resp_size, err := http.Get(cache.URL + "/bus/1/" + subscription + "/size")
		basics.Check(err)
		defer resp_size.Body.Close()

		size_bytes, err := ioutil.ReadAll(resp_size.Body)
		basics.Check(err)
		size_string := string(size_bytes)

		size, err := strconv.ParseUint(size_string, 10, 64)
		basics.Check(err)

		//getting and decoding claimcount
		resp_claim, err := http.Get(cache.URL + "/bus/1/" + subscription + "/claimcount")
		basics.Check(err)
		defer resp_claim.Body.Close()
		claim_bytes, err := ioutil.ReadAll(resp_claim.Body)
		basics.Check(err)
		claim_string := string(claim_bytes)

		claims, err := strconv.ParseUint(claim_string, 10, 64)
		basics.Check(err)

		info.EventCount = size
		info.ClaimCount = claims

		//getting and decoding peek
		resp_peek, err := http.Get(cache.URL + "/bus/1/" + subscription + "/peek")
		basics.Check(err)
		defer resp_peek.Body.Close()
		peek_bytes, err := ioutil.ReadAll(resp_peek.Body)
		basics.Check(err)

		peek_string := string(peek_bytes)
		info.Peek = peek_string

		encoded, err := json.Marshal(info)
		basics.Check(err)
		w.Write(encoded)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method from SubscriptionHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
	
}

//getting document from key and table. should actually be a "GET" request...
func SearchCoordinateHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method{
	case "POST":
		var coord structs.Coordinate 
		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&coord)

		resp, err := http.Get(cache.URL + "/sor/1/" + coord.Table + "/" + coord.TableKey)
		basics.Check(err)
		defer resp.Body.Close()

		io.Copy(w, resp.Body)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method from SearchCoordinateHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

//handles recursive json maps and keys
func ButtonsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method{
	case "GET":
		buttonType := r.URL.Query().Get("buttonType")
		buttonText := r.URL.Query().Get("buttonText")
		currentTextArea := r.URL.Query().Get("currentTextArea")
		
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
		http.Error(w, fmt.Sprintf("Unsupported method from ButtonsHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

//sends original and test delta to emouitesttable, then grabs result
func DeltaTestHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
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
		defer resp3.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		io.Copy(w, resp3.Body)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method from DeltaTestHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

//constructs deltas
func DeltaConstructorHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		var data structs.DeltaConstructorData
		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&data)

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
		http.Error(w, fmt.Sprintf("Unsupported method from DeltaConstructorHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

//handles updates to document, gets tables documents
//initially named because documents were assumed to be reviews
func ReviewsHandler(w http.ResponseWriter, r *http.Request)  {
	switch r.Method {
	case "POST":
		var edit structs.DeltaEdit
		decoder := json.NewDecoder(r.Body)
		decoder.Decode(&edit)

		//writes to emodb, should be conditional, or maybe move other stuff to outside of ReviewsHandler
		details := "/sor/1/" + edit.Table + "/" + edit.TableKey + "?audit=comment:'edit',host:aws-cms-01" + "&APIKey=" + edit.APIKey
		fmt.Println("details: " + details)
		resp, err := http.Post(cache.URL + details, "application/x.json-delta", strings.NewReader(edit.Delta))
		basics.Check(err)
		defer resp.Body.Close()

		io.Copy(w, resp.Body)
	case "GET":
		tableName := r.URL.Query().Get("tableName")
		resp, err := http.Get(cache.URL + "/sor/1/" + tableName)
		basics.Check(err)
		defer resp.Body.Close()

		io.Copy(w, resp.Body)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method from ReviewsHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
}

//handles table searches from cached table list
func TablesListHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		search := r.URL.Query().Get("query")

		w.Header().Set("Content-Type", "application/json")
		encoded, err := json.Marshal(cache.Search(search))
		basics.Check(err)

		w.Write(encoded)
	default:
		http.Error(w, fmt.Sprintf("Unsupported method from TablesListHandler: %s", r.Method), http.StatusMethodNotAllowed)
	}
}











