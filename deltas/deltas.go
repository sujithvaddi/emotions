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

func Literal(kvp structs.KeyValuePair) string {
	return "{\"" + kvp.Key + "\":\"" + kvp.Value + "\"}"
}

func DeleteDoc(kvp structs.KeyValuePair) string {
	return "~" 
}

func DeleteKey(kvp structs.KeyValuePair) string {
	return "{..\"" + kvp.Key + "\":~}"
}

func Nest(kvp structs.KeyValuePair) string {
	return "{.., \"[insert your key]\":" + kvp.Value + "}"
}


func MakeConditional(kvp structs.KeyValuePair) string {
	condition := kvp.Value
	if condition == "" {
		condition = "[insert delta to be applied]"
	}
	return "if [insert condition delta] then " + condition + " end"
}

func Noop(kvp structs.KeyValuePair) string {
	return ".."
}

func AlwaysTrue(kvp structs.KeyValuePair) string {
	return "alwaysTrue()"
}

func AlwaysFalse(kvp structs.KeyValuePair) string {
	return "alwaysFalse()"
}