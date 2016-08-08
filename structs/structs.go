package structs

import (
	//"fmt"
	
	"github.com/tchap/go-patricia/patricia"
)

type Table struct {
	Name	 	string 	`json:"~id"`
}

type DeltaConstructorData struct {
	Value 		string 	`json:"value"`
	Type 		string 	`json:"type"`
}

type SuccessResponse struct {
	Success 	bool 	`json:"success"`
}

type DeltaTest struct {
	Delta 		string `json:"delta"`
	Original 	string `json:"original"`
}

type DeltaEdit struct {
	Delta 		string `json:"delta"`
	Table 		string 	`json:"table"`
	TableKey 	string 	`json:"tableKey"`
}

type SearchResult struct {
	Result []string `json:"result"`
}

func (sr *SearchResult) AppendTo(prefix patricia.Prefix, item patricia.Item) error {
	(*sr).Result = append((*sr).Result, item.(string))
	return nil
}

