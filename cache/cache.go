package cache

import (
	"fmt"
	"net"
	"net/http"
	"encoding/json"

	"github.com/tchap/go-patricia/patricia"
	"github.com/andeeliao/structs"
	"github.com/andeeliao/basics"
	"github.com/jasonlvhit/gocron"
)


var URL string 

func SetupEmoURL() {
 	IPAddr, err := net.ResolveIPAddr("ip4", "localhost")
 	basics.Check(err)
 	if IPAddr.String() == "127.0.0.1" {
 		URL = "https://emodb-cert.qa.us-east-1.nexus.bazaarvoice.com"
 	} else {
 		URL = "emodb.cert.us-east-1.nexus.bazaarvoice.com:8080"
 	}
}

var TableCache *patricia.Trie

func BuildTrie(tables []structs.Table) *patricia.Trie {	
	trie := patricia.NewTrie()
	for _, table := range tables {
		trie.Insert(patricia.Prefix(table.Name), table.Name)
	}
	return trie
}

func Search(prefix string) structs.SearchResult {
	var results structs.SearchResult
	TableCache.VisitSubtree(patricia.Prefix(prefix), results.AppendTo)
	if len(results.Result) > 5 {
		results.Result = results.Result[:5]
	}
	return results
}

func Populate() {
	fmt.Println("Populating table")
	resp, err := http.Get(URL + "/sor/1/_table?limit=1000000000")
	basics.Check(err)
	defer resp.Body.Close()
	
	var Tables_list []structs.Table
	decoder2 := json.NewDecoder(resp.Body)
	fmt.Println("made NewDecoder")
	decoder2.Decode(&Tables_list)
	fmt.Println("decoded table, building table")

	TableCache = BuildTrie(Tables_list)
	fmt.Println("Finished populating table")
}

func Schedule() {
	gocron.Every(1).Hour().Do(Populate)

	go func() {
		<- gocron.Start()
	}()
}