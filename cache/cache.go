package cache

import (
	//"fmt"
	"net/http"
	"encoding/json"

	"github.com/tchap/go-patricia/patricia"
	"github.com/andeeliao/structs"
	"github.com/andeeliao/basics"
	"github.com/jasonlvhit/gocron"
)


const URL = "https://emodb-ci.dev.us-east-1.nexus.bazaarvoice.com"

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
	resp, err := http.Get(URL + "/sor/1/_table?limit=1000000000")
	basics.Check(err)
	defer resp.Body.Close()
	
	var Tables_list []structs.Table
	decoder2 := json.NewDecoder(resp.Body)
	decoder2.Decode(&Tables_list)

	TableCache = BuildTrie(Tables_list)
}

func Schedule() {
	gocron.Every(1).Hour().Do(Populate)

	go func() {
		<- gocron.Start()
	}()
}