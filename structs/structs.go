//all structs used to marshal and unmarshal json
//whitespace between : and "jsonannocation" could potentially cause problems
package structs

import (
	"github.com/tchap/go-patricia/patricia"
)

type QueueMessage struct {
	Queue 		string `json:"queue"`
	Messages 	[]string `json:"messages"`
}

type SubscriptionInfo struct {
	Name 		string	`json:"name"`
	TableFilter string	`json:"tableFilter"`
	ExpiresAt 	string	`json:"expiresAt"`
	EventTtl 	uint64	`json:"eventTtl"`
	EventCount 	uint64	`json:"eventCount"`
	ClaimCount 	uint64	`json:"claimCount"`
	Peek 		string	`json:"peek"`
}

type QueueInfo struct {
	Name 		string	`json:"name"`
	Size		uint64 	`json:"size"`
	ClaimCount 	uint64	`json:"claimCount"`
	Peek 		string	`json:"peek"`
}			

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
	Delta 		string	`json:"delta"`
	Table 		string 	`json:"table"`
	TableKey 	string 	`json:"tableKey"`
	APIKey		string 	`json:"APIKey"`
}

type Coordinate struct {
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

