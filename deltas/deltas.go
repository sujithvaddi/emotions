package deltas

import (
	//"fmt"
	"github.com/andeeliao/structs"
)

//turns a struct into the specified delta 

//turns KeyValuePair into a map delta

func Map(kvp structs.KeyValuePair) string {
	return "{..,\"" + kvp.Key + "\":\"" + kvp.Value + "\"}"
}
