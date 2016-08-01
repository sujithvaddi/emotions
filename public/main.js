var React = require('react');
var ReactDOM = require('react-dom');
var SearchBar = require('react-search-bar')

var CoordinateCode = React.createClass({
	render: function() {
		return (
			<pre><code id={this.props.coordID}>{this.props.codeStr}</code></pre>
			);
	}
});

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
			error: function(err) {
				alert("error from GenericEditButton: " + err);
			}
		})
	},
	render: function() {
		var faceValueRendner = this.props.faceValue;
		if (faceValueRendner.length > 25) {
			faceValueRendner = faceValueRendner.substring(0, 25) + "...";
		};
		return (
			<button className="btn btn-default" onClick={this.editTextArea} >{faceValueRendner}</button>
			);
	}
});

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

var CoordinateEditButton = React.createClass({
	startEditing: function () {
		var docName = this.props.coordID;
		this.props.onKeyClick(docName);
		this.props.updateCurrentDoc(this.props.codeJSON);
	},
	render: function() {
		var buttonText = "EDIT: " + this.props.coordID;
		return (
			<button className={"btn btn-default"} type="button" onClick={this.startEditing}>{buttonText}</button>
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
		return (<div>{coords}</div>);
	}
});


var deltaButtons = [
	{"name": "Map", "title": "", "title": "create a conditional delta e.g.  {..,\"author\":\"Bob\"}"},
	{"name": "Literal", "title": "create a literal delta e.g. {\"author\":\"Bob\"}"},
	{"name": "Delete Document", "title": "delete the whole document"},
	{"name": "Delete Key", "title": "delete one key-value pair"},
	{"name": "Nest", "title": "nests a delta e.g. "}
]

var condtionalButtons = [
	{"name": "Make Conditional", "title": "makes delta conditional e.g {..,\"author\":\"Bob\"} -> if [insert condition delta] then {..,\"author\":\"Bob\"} end"},
	{"name": "Noop", "title": "delta that does nothing. if [insert condition delta] then <b>{..,\"author\":\"Bob\"}</b> end -> if [insert condition delta] then .. end." },
	{"name": "True", "title": "replaces selected with delta true condition e.g. if <b>[insert condition delta]</b> then .. end -> if alwaysTrue() then .. end"},
	{"name": "False", "title": "replaces selected with delta false condition e.g. if <b>[insert condition delta]</b> then .. end -> if alwaysFalse() then .. end"}
]

var DeltaButton = React.createClass({
	handleClick: function() {
		var text = $('#edit-value').selection();
		if (text == "") {
			text = this.props.currentTextArea;
		};
		var postData = {
			"value": text,
			"type": this.props.buttonText
		};
		var json_data = JSON.stringify(postData);
		$.ajax({
			type: 'POST',
			url: '/deltaconstructor',
			data: json_data,
			success: function(data) {
				this.props.changeTextArea(data);
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
				data-html="true"
         		>{this.props.buttonText}</button>
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

const TablesSearchBar = React.createClass({
	onChange: function(input, resolve) {
		$.ajax({
			type: 'GET',
			url: '/tables',
			data: {query: input},
			success: function(results) {
				resolve(results.Result);
			},
			error: function (error) {
				alert ('error with getting tables search results:', error);
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

var EmoUI = React.createClass({
	getInitialState: function() {
		return {
			currentTableValue: "select a table to edit",
			currentKeyValue: "select a document to edit",
			currentTextAreaValue: "",
			documentList: [],
			currentEditDocument: {}
		};
	},
	componentDidMount: function() {

	},
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
	componentDidMount: function() {
		$('#test-result').on('click', function() {
			var delta = $('#edit-value').val();
			var jsonStr = $("#" + $('#current-key').val()).text();
			var data = {
				"delta": delta,
				"original": jsonStr
			};
			var json = JSON.stringify(data)
			$.ajax({
				type: 'POST',
				url: '/deltatest',
				data: json,
				success: function(data) {
					$('#test-delta-result').empty().append('<pre><code>' + JSON.stringify(data, null, 4) + '</code></pre>');
					for ( var id in contentDivs ) {
				        if ( id == 'test-delta-result' ) {
				          tabLinks[id].className = 'selected';
				          contentDivs[id].className = 'tabContent';
				        } else {
				          tabLinks[id].className = '';
				          contentDivs[id].className = 'tabContent hide';
				        }
				      }
				},
				error: function(err) {
					alert("error with test send");
				}
			});
		});

		$('#send-delta').on('click', function() {
			var delta = $('#edit-value').val();
			var table = $('#current-table').val();
			var tableKey = $('#current-key').val();
			var data = {
				"delta": delta,
				"table": table,
				"tableKey": tableKey
			};
			var json = JSON.stringify(data);
			$.ajax({
				type: "POST",
				url: "/reviews",
				data: json,
				success: function(data) {
					//return some data, print a success statement 
				}
			});
		});
	},
	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-md-6 left">
						<img src="upload.jpg" width="30%"/>
						<div className="search-bar">
							<TablesSearchBar 
								throttle={1000} 
								onSearch={this.handleTableChange} 
								updateDocs={this.handleDocumentListChange} />
						</div>
						<div id="current-stuff">
							Current Table: <input id="current-table" 
												value={this.state.currentTableValue} 
												readOnly 
												onChange={this.onChange}/>
							Current Key: <input id="current-key" 
												value={this.state.currentKeyValue} 
												readOnly 
												onChange={this.onChange} />
						</div>
						<div id="content5">
						      <form><h2>Editable value:</h2><br/>
						            <textarea 
							            id="edit-value" 
							            type="text" 
							            placeholder="once you select a table and a document, delta buttons will appear on the right"
							            value={this.state.currentTextAreaValue}
							            style={{width: 300, maxHeight: 100}} 
							            onChange={this.handleTextAreaChange} /><br/>
						      Options:
						            <button className="btn btn-default" id="test-result" type="button">See Test Result</button>
						            <button className="btn btn-default" id="send-delta" type="button">Send Update</button><br/>
						      </form>
						</div>
		                <div>
		                    <div className="col-md-3" id="original-delta"></div>
		                    <div className="col-md-3" id="test-delta-result"></div>
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
			        			deltas={deltaButtons} 
			        			conditionals={condtionalButtons}
								changeTextArea={this.handleButtonTextAreaChange}
								currentTextArea={this.state.currentTextAreaValue} />
			        	</div>
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

