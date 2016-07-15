package deltas

import (
	//"fmt"
	"github.com/andeeliao/structs"
	"strings"
)

//turns a struct into the specified delta 

//turns DeltaConstructorData into a map delta



func Map(data structs.DeltaConstructorData) string {
	deltaMap := deltaToDict(data.Value)
	return "{..,\"" + deltaMap["key"] + "\":\"" + deltaMap["value"] + "\"}"
}

func Literal(data structs.DeltaConstructorData) string {
	deltaMap := deltaToDict(data.Value)
	return "{\"" + deltaMap["key"] + "\":\"" + deltaMap["value"] + "\"}"
}

func DeleteDoc(data structs.DeltaConstructorData) string {
	return "~" 
}

func DeleteKey(data structs.DeltaConstructorData) string {
	deltaMap := deltaToDict(data.Value)
	return "{..,\"" + deltaMap["key"] + "\":~}"
}

func Nest(data structs.DeltaConstructorData) string {
	return "{.., \"[insert your key]\":" + data.Value + "}"
}


func MakeConditional(data structs.DeltaConstructorData) string {
	condition := data.Value
	if condition == "" {
		condition = "[insert delta to be applied]"
	}
	return "if [insert condition delta] then " + condition + " end"
}

func Noop(data structs.DeltaConstructorData) string {
	return ".."
}

func AlwaysTrue(data structs.DeltaConstructorData) string {
	return "alwaysTrue()"
}

func AlwaysFalse(data structs.DeltaConstructorData) string {
	return "alwaysFalse()"
}

func deltaToDict(delta string) (deltaMap map[string]string) {
	deltaMap = make(map[string]string)
	
	if deltaPieces := strings.Split(delta, "\"") ; len(deltaPieces) > 3 {
		deltaMap["key"] = deltaPieces[1]
		deltaMap["value"] = deltaPieces[3]
	} else if len(deltaPieces) > 0 {
		deltaMap["key"] = deltaPieces[1]
	}
	return 
}