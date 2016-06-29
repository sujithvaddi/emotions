package basics

import (
	"fmt"
	"encoding/json"
	)

func Check(e error) {
	if e != nil {
		fmt.Println("error:", e)
	}
}

func PrintJSON(v interface{}) {
	encoded, err := json.Marshal(v)
	Check(err)
	fmt.Println(string(encoded))
}