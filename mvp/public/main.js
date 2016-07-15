var React = require('react');
var ReactDOM = require('react-dom');
var SearchBar = require('react-search-bar')
//import SearchBar from 'react-search-bar';

$(function() {
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
				$('#test-delta-result').empty().append('<h2>Results: </h2>' 
					+ '<pre><code>' + JSON.stringify(data, null, 4) + '</code></pre>');
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
				//stuff
			}
		})
	});
});

function getReviews(table) {
	//console.log("inside getReviews", table)
	var $reviews = $('#content2');
	$reviews.empty();
	$('#document-edits').empty();
	$('#current-key').val("select a document to edit");
	$.ajax({
		type: 'GET',
		url: '/reviews',
		data: {tableName: table},
		success: function(reviews) {
			$reviews.append('<h1>documents</h1>');
			for(var i = 0; i < reviews.length; i++) {
				var review = reviews[i];
				$reviews.append('<h2>document</h2><button class="edit-review" type="button"> Edit: ' + review["~id"] + '</button>');
				$reviews.append('<pre><code id="' + review["~id"] + '">' + JSON.stringify(review, null, 4) + '</code></pre>');
			}
			$('.edit-review').on('click', function () {
				var text = $(this).text();
				var textArr = text.split(': ');
				var docName = textArr[1];
				$('#current-key').val(docName);
				editReview(docName);
			});		
		},
		error: function (error) {
			alert('error with getting reviews!');
		}
	});
}

function editReview(doc) {
	var $buttons = $('#document-edits');
	var jsonStr = $("#" + doc).text();
	var obj = $.parseJSON(jsonStr);
	$buttons.empty();
	for (var key in obj) {
		$buttons.append(
			'<button class="edit-field" type="button" value="Submit">' +  key + ':' 
			+ obj[key] + '</button>');
	};
	$('.edit-field').on('click', function () {
		var buttonText = $(this).text();
		var textArr = buttonText.split(':');
		$('textarea#edit-value').val('{..,"' + textArr[0] + '":"' + textArr[1] + '"}');
	});
}



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
	getDeltaFormat: function() {
		var text = $('textarea#edit-value').val();
		var deltaType = $(this).text();
		var postData = {
			"value": text,
			"type": deltaType
		};
		var json_data = JSON.stringify(postData);
		$.ajax({
			type: 'POST',
			url: '/deltaconstructor',
			data: json_data,
			success: function(data) {
				$('#edit-value').val(data);
			},
			error: function(data) {
				console.log("something went wrong with ajax from DeltaButton");
			}
		});
	},
	handleClick: function() {
		var text = $('textarea#edit-value').selection();
		if (text=="") {
			text = $('textarea#edit-value').val();
			$('textarea#edit-value').val("");
		};
		console.log("text");
		console.log(text);
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
				$('#edit-value').selection('replace', {text: data});
			}
		});
	},
	render: function() {
		return (
			<button onClick={this.handleClick} className={this.props.thisClass} type="button" data-toggle="tooltip" title={this.props.tooltipText} data-html="true"
         		>{this.props.buttonText}</button>
			);
	}
})

var ButtonList = React.createClass({
	getInitialState: function() {
		return {
			data: []
		};
	},
	componentWillMount: function() {
		this.setState({data: this.props.data})
	},
	componentDidMount: function() {
		$('[data-toggle="tooltip"]').tooltip();
	},
	render: function() {
		var buttons = this.state.data.map(function(button) {
			return (
				<DeltaButton buttonText={button.name} key={button.name} tooltipText={button.title} thisClass={"btn btn-default edit-selected"} />
				);
		});
		return (<div>{buttons}</div>);
	}
})


ReactDOM.render(<ButtonList data={deltaButtons} />, document.getElementById('delta-buttons'));
ReactDOM.render(<ButtonList data={condtionalButtons} />, document.getElementById('conditional-buttons'));


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
	onSearch: function(input) {
		$('#current-table').val(input)
		getReviews(input);
	},
	render() {
		return (
			<SearchBar
			placeholder="search for a table"
			onChange={this.onChange}
			onSearch={this.onSearch} />
			);
	}
});

ReactDOM.render(<TablesSearchBar />, document.getElementById('search-bar'));

