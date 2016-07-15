package cache

import (
	"fmt"
	"github.com/tchap/go-patricia/patricia"
	"github.com/andeeliao/structs"
	"github.com/andeeliao/basics"
	"net/http"
	"encoding/json"
)


const URL = "http://localhost:8080"

var TableCache *patricia.Trie

func printItem(prefix patricia.Prefix, item patricia.Item) error {
    fmt.Printf("%q: %v\n", prefix, item)
    return nil
}

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
	return results
}

func Populate() {
	fmt.Println("Populating cache")
	resp, err := http.Get(URL + "/sor/1/_table")
	basics.Check(err)

	defer resp.Body.Close()
	
	var Tables_list []structs.Table
	decoder2 := json.NewDecoder(resp.Body)
	decoder2.Decode(&Tables_list)

	//fmt.Println(Tables_list)

	TableCache = BuildTrie(Tables_list)
}