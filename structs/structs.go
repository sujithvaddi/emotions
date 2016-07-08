package structs

type Table struct {
	Name 	string 	`json: "name"`
	//possible to add: availability, placement, facade	
}

type KeyValuePair struct {
	Key 		string 	`json: "key"`
	Value 		string 	`json: "value"`
	Type 		string 	`json: "type"`
}

type SuccessResponse struct {
	Success 	bool 	`json: "success"`
}

type DeltaTest struct {
	Delta 		string `json: "delta"`
	Original 	string `json: "original"`
}

type DeltaEdit struct {
	Delta 		string `json: "delta"`
	Table 		string 	`json: "table"`
	TableKey 	string 	`json: "tableKey"`
}