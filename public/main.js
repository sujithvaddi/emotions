//datastore page

//npm packages installed, bundled with browserify
var React = require('react');
var ReactDOM = require('react-dom');
var SearchBar = require('react-search-bar');

//button names and hovertext for constant delta buttons
var DELTA_BUTTONS = [
	{"name": "Map", "title": "", "title": "create a conditional delta e.g.  {..,\"author\":\"Bob\"}"},
	{"name": "Literal", "title": "create a literal delta e.g. {\"author\":\"Bob\"}"},
	{"name": "Delete Document", "title": "delete the whole document"},
	{"name": "Delete Key", "title": "delete one key-value pair"},
	{"name": "Nest", "title": "nests a delta e.g. "}
]

var CONDITIONAL_BUTTONS = [
	{"name": "Make Conditional", "title": "makes delta conditional e.g {..,\"author\":\"Bob\"} -> if [insert condition delta] then {..,\"author\":\"Bob\"} end"},
	{"name": "Noop", "title": "delta that does nothing. if [insert condition delta] then <b>{..,\"author\":\"Bob\"}</b> end -> if [insert condition delta] then .. end." },
	{"name": "True", "title": "replaces selected with delta true condition e.g. if <b>[insert condition delta]</b> then .. end -> if alwaysTrue() then .. end"},
	{"name": "False", "title": "replaces selected with delta false condition e.g. if <b>[insert condition delta]</b> then .. end -> if alwaysFalse() then .. end"}
]

//edit button for a key-value pair in the json document
var GenericEditButton = React.createClass({
	editTextArea: function() {
		$.ajax({
			type: "GET",
			url: "/buttons",
			data: {
				buttonType: this.props.buttonType,
				buttonText: this.props.faceValue,
				currentTextArea: this.props.currentTextArea
			},
			success: function(value) {
				this.props.changeTextArea(value);
			}.bind(this),
			//bind is required to use 'this' in non-top level functions (e.g. ajax calls, maps)
			error: function(err) {
				alert("error from GenericEditButton: " + err);
			}
		})
	},
	render: function() {
		var faceValueRender = this.props.faceValue;
		if (faceValueRender.length > 25) {
			faceValueRender = faceValueRender.substring(0, 25) + "...";
		};
		return (
			<button 
				className="btn btn-default" 
				onClick={this.editTextArea} >{faceValueRender}</button>
			);
	}
});

//recursively parses the json to generate the edit buttons
var EditButtons = React.createClass({
	render: function() {
		var editButtons = [];
		var nestedKeyButtons = [];
		function generateEditButtons(obj, this_component) {
			for (var key in obj) {
				var value = obj[key];
				if (typeof(value) != "object") {
					if (key[0] != '~') {
						editButtons.push(<GenericEditButton 
											key={key + ':' + value} 
											buttonType="edit" 
											faceValue={key + ':' + value} 
											currentTextArea={this_component.props.currentTextArea}
											changeTextArea={this_component.props.changeTextArea} />);
					};
				} 
				else {
					nestedKeyButtons.push(<GenericEditButton 
											key={key} 
											buttonType="key" 
											faceValue={key}
											currentTextArea={this_component.props.currentTextArea}
											changeTextArea={this_component.props.changeTextArea} />)
					if (!value.hasOwnProperty('0')) {
						generateEditButtons(value, this_component);
					}
					else {
						editButtons.push(<GenericEditButton 
											key={key} 
											buttonType="edit" 
											faceValue={key + ':' + value} 
											currentTextArea={this_component.props.currentTextArea}
											changeTextArea={this_component.props.changeTextArea} />);
					}
				}
			};
		}
		generateEditButtons(this.props.currentDoc, this);
		return (<div>
					<div> Nested JSON object keys (click to wrap current JSON): <br/>{nestedKeyButtons}</div><br/>
					<div> Edit fields: <br/>{editButtons}</div><br/>
				</div>
			);
	}
});

//generate all the key-value pairs for the specified document
var CoordinateEditButton = React.createClass({
	startEditing: function () {
		var docName = this.props.coordID;
		this.props.onKeyClick(docName);
		this.props.updateCurrentDoc(this.props.codeJSON);
	},
	render: function() {
		var buttonText = "EDIT: " + this.props.coordID;
		return (
			<button 
				className={"btn btn-default"} 
				type="button" 
				onClick={this.startEditing}>{buttonText}</button>
			);
	}
});


var CoordinateCode = React.createClass({
	render: function() {
		return (
			<pre><code id={this.props.coordID}>{this.props.codeStr}</code></pre>
			);
	}
});

var Coordinate = React.createClass({
	render: function() {
		return (
			<div>
			<CoordinateEditButton 
				coordID={this.props.data["~id"]} 
				codeJSON={this.props.data} 
				onKeyClick={this.props.onKeyClick} 
				changeTextArea={this.props.changeTextArea}
				currentTextArea={this.props.currentTextArea}
		        updateCurrentDoc={this.props.updateCurrentDoc} />
			<CoordinateCode 
				coordID={this.props.data["~id"]} 
				codeStr={JSON.stringify(this.props.data, null, 4)} />
			</div>
			);
	}
});


//creates the list of documents shown when searching for a table
var CoordinateList = React.createClass({
	render: function() {
		var coords = this.props.data.map(
			function(coord) {
			return (
				<Coordinate 
					key={coord["~id"]} 
					data={coord} 
					onKeyClick={this.props.onKeyClick} 
					changeTextArea={this.props.changeTextArea}
					currentTextArea={this.props.currentTextArea}
			        updateCurrentDoc={this.props.updateCurrentDoc} />
				);
		},
		this);
		//pass in this to maps to bind 'this'
		return (<div>{coords}</div>);
	}
});

//const edit buttons on the right that toggles in between the different deltas
var DeltaButton = React.createClass({
	handleClick: function() {
		var text = $("#edit-value").selection();
		var postData = {
			"type": this.props.buttonText
		};
		if (text == "") {
			postData["value"] = this.props.currentTextArea;
		} else {
			postData["value"] = text;
		}
		var json_data = JSON.stringify(postData);
		$.ajax({
			type: "POST",
			url: "/deltaconstructor",
			data: json_data,
			success: function(data) {
				if (text != "") {
					$("#edit-value").selection("replace", {text: data});
				} else {
					this.props.changeTextArea(data);
				}
			}.bind(this),
			error: function(err) {
				alert("error from DeltaButton: " + error);
			}
		});
	},
	render: function() {
		return (
			<button 
				onClick={this.handleClick} 
				className={this.props.thisClassName} 
				type="button" 
				data-toggle="tooltip" 
				title={this.props.tooltipText} 
				data-html="true" >{this.props.buttonText}</button>
			);
	}
});

var ButtonList = React.createClass({
	componentDidMount: function() {
		$('[data-toggle="tooltip"]').tooltip();
	},
	render: function() {
		var buttons = this.props.data.map(function(button) {
			return (
				<DeltaButton 
					buttonText={button.name} 
					key={button.name} 
					tooltipText={button.title} 
					thisClassName={"btn btn-default"}
					changeTextArea={this.props.changeTextArea}
					currentTextArea={this.props.currentTextArea} />
				);
		}, this);
		return (<div>{buttons}</div>);
	}
});

//search bar for table 
const TablesSearchBar = React.createClass({
	onChange: function(input, resolve) {
		$.ajax({
			type: 'GET',
			url: '/tables',
			data: {query: input},
			success: function(results) {
				resolve(results.result);
			},
			error: function (error) {
				alert('error with getting tables search results:', error);
			}
		});
	},
	onSubmit: function(input) {
    	if (!input) return;
		//edit this to use the new react components
		$.ajax({
			type: 'GET',
			url: '/reviews',
			data: {tableName: input},
			success: function(docs) {
				this.props.updateDocs(docs);
			}.bind(this),
			error: function (error) {
				alert('error with getting docs!');
			}
		});
		this.props.onSearch(input);
	},
	render() {
		return (
			<SearchBar 
				placeholder="search for a table"
				onChange={this.onChange}
				onSubmit={this.onSubmit} />
			);
	}
});


var ButtonColumn = React.createClass({
	render: function() {
		return (
			<div>
			<div id="delta-buttons">Deltas: <ButtonList 
												data={this.props.deltas}
												changeTextArea={this.props.changeTextArea}
												currentTextArea={this.props.currentTextArea} /><br/></div>
			<div id="conditional-buttons">Conditionals: <ButtonList 
															data={this.props.conditionals}
															changeTextArea={this.props.changeTextArea}
															currentTextArea={this.props.currentTextArea} /><br/></div>
			</div>
			);
	}
});

var NavigationBar = React.createClass({
	render: function() {
		return (
			<div> 
				<nav className="navbar navbar-default">
			        <ul className="nav navbar-nav">
			            <li className="active"><a href="/">Datastore<span className="sr-only">(current)</span></a></li>
			            <li className="non-active"><a href="/databus">DataBus</a></li>
			            <li className="non-active"><a href="/queue">Queue</a></li>
			        </ul>
				</nav>
			</div>
			);
	}
});

//page 
var EmoUI = React.createClass({
	getInitialState: function() {
		return {
			currentTableValue: "select a table to edit",
			currentKeyValue: "select a document to edit",
			currentTextAreaValue: "",
			documentList: [],
			currentEditDocument: {},
			userAPIKey: ""
		};
	},
	//sends the test delta to server, which will format and forward to emo
	sendTestDelta: function() {
		var delta = this.state.currentTextAreaValue;
		var jsonStr = $("#" + this.state.currentKeyValue).text();
		var data = {
			"delta": delta,
			"original": jsonStr
		};
		var json = JSON.stringify(data)
		$.ajax({
			type: "POST",
			url: "/deltatest",
			data: json,
			success: function(data) {
				$('#original-delta').empty().append('<pre><code>' + jsonStr + '</code></pre>');
				$('#test-delta-result').empty().append('<pre><code>' + JSON.stringify(data, null, 4) + '</code></pre>');
			},
			error: function(err) {
				alert("error with test send");
			}
		});
	},
	//sends data to server that will route the update request to the specified document
	sendDelta: function() {
		if (this.state.userAPIKey == "") {
			alert("Please enter a valid API Key");
			return
		};
		var data = {
			"delta": this.state.currentTextAreaValue,
			"table": this.state.currentTableValue,
			"tableKey": this.state.currentKeyValue,
			"APIKey": this.state.userAPIKey
		};
		var json = JSON.stringify(data);
		$.ajax({
			type: "POST",
			url: "/reviews",
			data: json,
			success: function(data) {
				$('#original-delta').empty();
				$('#test-delta-result').empty();
				if (data == "{\"success\":true}") {
					this.findCoordinate();
					alert("success making changes!");
				} else {
					alert("update was not successful: " + data);
				}
			}.bind(this),
			error: function(err) {
				alert("error: " + err);
			}
		});
	},
	findCoordinate: function() {
		var data = {
			"table": this.state.currentTableValue,
			"tableKey": this.state.currentKeyValue
		};
		var json = JSON.stringify(data);
		$.ajax({
			type: "POST",
			url: "/searchcoordinate",
			data: json,
			success: function(data) {
				this.handleDocumentListChange([data]);
			}.bind(this),
			error: function(err) {
				alert(err);
			}
		});
	},
	//functions that handle changes to the state
	handleTableChange: function(table) {
		this.setState({
			currentTableValue: table
		});
	},
	handleKeyChange: function(key) {
		this.setState({
			currentKeyValue: key
		});
	},
	handleTextAreaChange: function(event) {
		this.setState({
			currentTextAreaValue: event.target.value
		});
	},
	handleButtonTextAreaChange: function(val) {
		this.setState({
			currentTextAreaValue: val
		});
	},
	handleDocumentListChange: function(docs) {
		this.setState({
			documentList: docs
		});
	},
	handleCurrentDocumentChange: function(doc) {
		this.setState({
			currentEditDocument: doc
		});
	},
	handleAPIKeyChange: function(event) {
		this.setState({
			userAPIKey: event.target.value
		});
	},
	handleCurrentTableChange: function(event) {
		this.setState({
			currentTableValue: event.target.value
		});
	},
	handleCurrentKeyChange: function(event) {
		this.setState({
			currentKeyValue: event.target.value
		});
	},
	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-md-6 left">
						<img src="upload.jpg" width="30%" alt="Bazaarvoice"/>
						<NavigationBar />
					    <div><h3>API Key:</h3>
					    	<input
								value={this.state.userAPIKey}
					            style={{width: 50 + "%"}}
								placeholder="please enter your API key here"
								onChange={this.handleAPIKeyChange}/>
						</div>
						<div className="search-bar">
							<TablesSearchBar 
								throttle={1000} 
								onSearch={this.handleTableChange} 
								updateDocs={this.handleDocumentListChange} />
						</div>
						<div id="current-stuff">
							Current Table: <input id="current-table" 
									            style={{width: 50 + "%"}}
												value={this.state.currentTableValue} 
												onChange={this.handleCurrentTableChange}/><br/>
							Current Key: <input id="current-key" 
									            style={{width: 50 + "%"}}
												value={this.state.currentKeyValue} 
												onChange={this.handleCurrentKeyChange} />
							<button 
								className="btn btn-default" 
								type="button" 
								onClick={this.findCoordinate}
								>Find Document</button>
						</div>
						<div id="content5">
						      <form><h2>Editable value:</h2><br/>
						            <textarea 
						            	id="edit-value"
							            className="edit-value" 
							            type="text" 
							            placeholder="once you select a table and a document, delta buttons will appear on the right"
							            value={this.state.currentTextAreaValue}
							            style={{width: 300, maxHeight: 100}} 
							            onChange={this.handleTextAreaChange} /><br/>
						      Options:
						            <button 
						            	className="btn btn-default" 
						            	id="test-result" 
						            	type="button" 
						            	onClick={this.sendTestDelta}
						            	>See Test Result</button>
						            <button 
						            	className="btn btn-default" 
						            	id="send-delta" 
						            	type="button" 
						            	onClick={this.sendDelta}
						            	>Send Update</button><br/>
						      </form>
						</div>
		                <div id="edit-document-container">
		                Original: <br/>
		                    <div id="original-delta"></div>
		                    Test Results (some fields will be marked EmoUI):<br/>
		                    <div id="test-delta-result"></div>
		                </div>
		                <div><h2>Documents</h2></div>
						<div>
							<CoordinateList 
								data={this.state.documentList} 
								onKeyClick={this.handleKeyChange} 
								changeTextArea={this.handleButtonTextAreaChange} 
								currentTextArea={this.state.currentTextAreaValue}
			        			updateCurrentDoc={this.handleCurrentDocumentChange} />
						</div>
					</div>
					<div className="col-md-3 right deltas-conditionals">
			        	<div><ButtonColumn
			        			deltas={DELTA_BUTTONS} 
			        			conditionals={CONDITIONAL_BUTTONS}
								changeTextArea={this.handleButtonTextAreaChange}
								currentTextArea={this.state.currentTextAreaValue} />
			        	</div><br/>
			        	<div className="document-edits">
			        		<EditButtons 
			        			currentDoc={this.state.currentEditDocument} 
								changeTextArea={this.handleButtonTextAreaChange}
								currentTextArea={this.state.currentTextAreaValue} />
						</div>
						<div>*Hover to see usage and example. <b>Bolded</b> text means text has been selected</div>
			        </div>  
				</div>
			</div>
			);
	}
});

ReactDOM.render(<EmoUI />, document.getElementById('emo-ui'))

