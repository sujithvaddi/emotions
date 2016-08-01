package deltas

import (
	"fmt"
	"regexp"
	"strconv"
	
	"github.com/andeeliao/structs"
)

//turns a struct into the specified delta 

//turns DeltaConstructorData into a map delta



func Map(data structs.DeltaConstructorData) string {
	deltaMap := splitIntoKeyValue(data.Value)
	return "{..,\"" + deltaMap["key"] + "\":" + AddQuotes(deltaMap["value"]) + "}"
}

func Literal(data structs.DeltaConstructorData) string {
	deltaMap := splitIntoKeyValue(data.Value)
	return "{\"" + deltaMap["key"] + "\":" + AddQuotes(deltaMap["value"]) + "}"
}

func DeleteDoc(data structs.DeltaConstructorData) string {
	return "~" 
}

func DeleteKey(data structs.DeltaConstructorData) string {
	deltaMap := splitIntoKeyValue(data.Value)
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

func splitIntoKeyValue(delta string) (deltaMap map[string]string) {
	deltaMap = make(map[string]string)

	rKey, _ := regexp.Compile("{.+?:")
	rValue, _ := regexp.Compile(":.+}")
	keyHalf := rKey.FindString(delta)
	valueHalf := rValue.FindString(delta)

    rInsideQuotes, _ := regexp.Compile("\".+\"")
    key := rInsideQuotes.FindString(keyHalf)

    fmt.Println(key)
    fmt.Println(valueHalf)

    deltaMap["key"] = key[1:len(key)-1]
    deltaMap["value"] = valueHalf[1:len(valueHalf)-1]
    return 
	
}


func AddQuotes(val string) string {
	if val == "true" || val == "false" {
		return val
	} else if val[0] == '{' || val[0] == '[' { //should replace this with regexp
		return val
	} else if _, err := strconv.Atoi(val) ; err == nil {
		return val
	} else {
		return "\"" + val + "\""
	}
}