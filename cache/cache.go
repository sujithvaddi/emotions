package cache

import (
	"fmt"
	"net/http"
	"encoding/json"
	"io/ioutil"
	"regexp"
	"sync"
    "crypto/aes"
    "crypto/cipher"

	"github.com/andeeliao/structs"
	"github.com/andeeliao/basics"
	"github.com/andeeliao/secret"
	"github.com/jasonlvhit/gocron"
	"github.com/tchap/go-patricia/patricia"
)


var URL string 

var KEY string 

func DecryptKey() {
	key := "EMOtions08152016" // 16 bytes!

    block,err := aes.NewCipher([]byte(key))
    basics.Check(err)

    // 16 bytes for AES-128, 24 bytes for AES-192, 32 bytes for AES-256
    ciphertext := []byte("abcdef1234567890") 
    iv := ciphertext[:aes.BlockSize] // const BlockSize = 16

    // decrypt

    decrypter := cipher.NewCFBDecrypter(block, iv) // simple!

    decrypted := make([]byte, 48)
    decrypter.XORKeyStream(decrypted, secret.SystemReadKey)

    KEY = string(decrypted)

    fmt.Printf("%v decrypted", secret.SystemReadKey)
}

func SetupEmoURL(port string) {
 	if port == "8001" {
 		URL = "https://emodb-cert.qa.us-east-1.nexus.bazaarvoice.com"
 	} else {
 		URL = "http://emodb.cert.us-east-1.nexus.bazaarvoice.com:8080"
 	}
}

var TableCache *patricia.Trie

func AddToTrie(trieChan chan *patricia.Trie, tableChan chan []structs.Table, wg *sync.WaitGroup) {
	defer wg.Done()
	trie := <- trieChan
	tables := <- tableChan
	for _, table := range tables {
		trie.Insert(patricia.Prefix(table.Name), table.Name)
	}

	trieChan <- trie
}

func GetTablesFromSplit(split string, c chan []structs.Table) {
	splitTablesResp, err := http.Get(URL + "/sor/1/_split/__system_sor:table/" + 
		split +
		"?APIKey=" + KEY +
		"&limit=10000")
	basics.Check(err)

	var tables_list []structs.Table
 
	decoder := json.NewDecoder(splitTablesResp.Body)
	decoder.Decode(&tables_list)

	c <- tables_list
}

func Search(prefix string) structs.SearchResult {
	var results structs.SearchResult
	TableCache.VisitSubtree(patricia.Prefix(prefix), results.AppendTo)
	if len(results.Result) > 10 {
		results.Result = results.Result[:10]
	}
	return results
}

func Populate() {
	fmt.Println("Populating table")
	splitsResp, err := http.Get(URL + "/sor/1/_split/__system_sor:table?APIKey=" + KEY)

	fmt.Println("get from this: " + URL + "/sor/1/_split/__system_sor:table?APIKey=" + KEY)
	basics.Check(err)
	defer splitsResp.Body.Close()

	data, _ := ioutil.ReadAll(splitsResp.Body);

	splitsStr := string(data)

	r_splits, err := regexp.Compile("\".+?\"")
	basics.Check(err)
	splits_list := r_splits.FindAllString(splitsStr, -1)


	var splitsWaitGroup sync.WaitGroup
	splitsWaitGroup.Add(len(splits_list))

	bufferedTablesChan := make(chan []structs.Table, len(splits_list) + 1)

	bufferedTrieChan := make(chan *patricia.Trie, 2)
	TableCache = patricia.NewTrie()
	bufferedTrieChan <- TableCache


	println("got to hereeee")

	for _, split := range splits_list {
		go GetTablesFromSplit(split[1:len(split)-1], bufferedTablesChan)

		go AddToTrie(bufferedTrieChan, bufferedTablesChan, &splitsWaitGroup)
	}

	println("waiting...")

	splitsWaitGroup.Wait()


	fmt.Println("Finished populating table")
}

func Schedule() {
	gocron.Every(1).Hour().Do(Populate)

	go func() {
		<- gocron.Start()
	}()
}