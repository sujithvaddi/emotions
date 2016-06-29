package structs

type Table struct {
	Name 	string 	`json: "name"`
	//possible to add: availability, placement, facade	
}

type KeyValuePair struct {
	Key 		string 	`json: "key"`
	Value 		string 	`json: "value"`
	Type 		string 	`json: "type"`
	Table 		string 	`json: "table"`
	TableKey 	string 	`json: "tableKey"`
}

type SuccessResponse struct {
	Success 	bool 	`json: "success"`
}