// functions and variables used for caching tables search 
package cache

import (
    "crypto/aes"
    "crypto/cipher"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"sync"

	"github.com/EMOtions/basics"
	"github.com/EMOtions/secret"
	"github.com/EMOtions/structs"
	"github.com/jasonlvhit/gocron"
	"github.com/tchap/go-patricia/patricia"
)


var URL string 

var KEY string 

var TableCache *patricia.Trie

//decrypts the API key, which was encrypted using "EMOtions08152016"
func DecryptKey() {
	key := "EMOtions08152016" 

    block, err := aes.NewCipher([]byte(key))
    basics.Check(err)
    ciphertext := []byte("abcdef1234567890") 
    iv := ciphertext[:aes.BlockSize] 

    decrypter := cipher.NewCFBDecrypter(block, iv) 

    decrypted := make([]byte, 48)
    decrypter.XORKeyStream(decrypted, secret.SystemReadKey)

    KEY = string(decrypted)
}

//hacky way of deciding whether to use public or private VPC
func SetupEmoURL(port string) {
 	if port == "8001" {
 		URL = "https://emodb-cert.qa.us-east-1.nexus.bazaarvoice.com"
 	} else {
 		URL = "http://emodb.cert.us-east-1.nexus.bazaarvoice.com:8080"
 	}
}

//inserting tablenames into the trie
func AddToTrie(trieChan chan *patricia.Trie, tableChan chan []structs.Table, wg *sync.WaitGroup) {
	defer wg.Done()
	trie := <- trieChan
	tables := <- tableChan
	for _, table := range tables {
		trie.Insert(patricia.Prefix(table.Name), table.Name)
	}

	trieChan <- trie
}

//getting, decoding tables and sending to a channel for processing 
func GetTablesFromSplit(split string, tableChan chan []structs.Table) {
	splitTablesResp, err := http.Get(URL + "/sor/1/_split/__system_sor:table/" + 
		split +
		"?APIKey=" + KEY +
		"&limit=10000")
	basics.Check(err)

	var tables_list []structs.Table
	decoder := json.NewDecoder(splitTablesResp.Body)
	decoder.Decode(&tables_list)

	tableChan <- tables_list
}

//gets all tables whose prefix that match the search term. limited to 10
func Search(prefix string) structs.SearchResult {
	var results structs.SearchResult
	TableCache.VisitSubtree(patricia.Prefix(prefix), results.AppendTo)
	if len(results.Result) > 10 {
		results.Result = results.Result[:10]
	}
	return results
}

//grabs splits and concurrently gets and unmarshals their contents
func Populate() {
	fmt.Println("Populating table")

	splitsResp, err := http.Get(URL + "/sor/1/_split/__system_sor:table?APIKey=" + KEY)
	basics.Check(err)
	defer splitsResp.Body.Close()

	data, _ := ioutil.ReadAll(splitsResp.Body);
	splitsStr := string(data)

	//regex to parse out all table names, since split list not returned as json
	r_splits, err := regexp.Compile("\".+?\"")
	basics.Check(err)
	splits_list := r_splits.FindAllString(splitsStr, -1)

	//number of waits before unpausing program
	var splitsWaitGroup sync.WaitGroup
	splitsWaitGroup.Add(len(splits_list))

	bufferedTablesChan := make(chan []structs.Table, len(splits_list) + 1)
	bufferedTrieChan := make(chan *patricia.Trie, 2)
	TableCache = patricia.NewTrie()

	bufferedTrieChan <- TableCache

	for _, split := range splits_list {
		go GetTablesFromSplit(split[1:len(split)-1], bufferedTablesChan)

		go AddToTrie(bufferedTrieChan, bufferedTablesChan, &splitsWaitGroup)
	}

	println("waiting to cache all tables...")

	//waitgroup pauses the program until all expected counts are in
	splitsWaitGroup.Wait()
	fmt.Println("Finished populating table")
}

//schedules a recache every hour. gocron can also do every x minutes with 
// gocron.Every(x).Minutes().Do(Populate)
func Schedule() {
	gocron.Every(1).Hour().Do(Populate)
	go func() {
		<- gocron.Start()
	}()
}