// useful functions for checking and debugging 
package basics

import (
	"encoding/json"
	"fmt"
	)

func Check(e error) {
	if e != nil {
		fmt.Println("error:", e)
	}
}

//unmarshals any generic json object
func PrintJSON(v interface{}) {
	encoded, err := json.Marshal(v)
	Check(err)
	fmt.Println(string(encoded))
}