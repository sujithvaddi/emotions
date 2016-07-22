var React = require('react');
var ReactDOM = require('react-dom');
var SearchBar = require('react-search-bar')

$(function() {

	var tabLinks = new Array();
    var contentDivs = new Array();

	function getFirstChildWithTagName( element, tagName ) {
      for ( var i = 0; i < element.childNodes.length; i++ ) {
        if ( element.childNodes[i].nodeName == tagName ) return element.childNodes[i];
      }
    }

    function getHash( url ) {
      var hashPos = url.lastIndexOf ( '#' );
      return url.substring( hashPos + 1 );
    }

	function init() {

      // Grab the tab links and content divs from the page
      var tabListItems = document.getElementById('tabs').childNodes;
      for ( var i = 0; i < tabListItems.length; i++ ) {
        if ( tabListItems[i].nodeName == "LI" ) {
          var tabLink = getFirstChildWithTagName( tabListItems[i], 'A' );
          var id = getHash( tabLink.getAttribute('href') );
          tabLinks[id] = tabLink;
          contentDivs[id] = document.getElementById( id );
        }
      }

      // Assign onclick events to the tab links, and
      // highlight the first tab
      var i = 0;

      for ( var id in tabLinks ) {
        tabLinks[id].onclick = showTab;
        tabLinks[id].onfocus = function() { this.blur() };
        if ( i == 0 ) tabLinks[id].className = 'selected';
        i++;
      }

      // Hide all content divs except the first
      var i = 0;

      for ( var id in contentDivs ) {
        if ( i != 0 ) contentDivs[id].className = 'tabContent hide';
        i++;
      }
    }

    function showTab() {
      var selectedId = getHash( this.getAttribute('href') );

      // Highlight the selected tab, and dim all others.
      // Also show the selected content div, and hide all others.
      for ( var id in contentDivs ) {
        if ( id == selectedId ) {
          tabLinks[id].className = 'selected';
          contentDivs[id].className = 'tabContent';
        } else {
          tabLinks[id].className = '';
          contentDivs[id].className = 'tabContent hide';
        }
      }

      // Stop the browser following the link
      return false;
    }


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
				$('#original-delta').empty().append('<pre><code>' + jsonStr + '</code></pre>');
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
	init();
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
			$reviews.append('<h1>documents in:' + table + '</h1>');
			for(var i = 0; i < reviews.length; i++) {
				var review = reviews[i];
				$reviews.append('<button class="btn btn-default edit-review" type="button"> EDIT: ' + review["~id"] + '</button>');
				$reviews.append('<pre><code id="' + review["~id"] + '">' + JSON.stringify(review, null, 4) + '</code></pre>');
			}
			$('.edit-review').on('click', function () {
				var text = $(this).text();
				var textArr = text.split(': ');
				var docName = textArr[1];
				$('#current-key').val(docName);
				generateEdit(docName);
			});		
		},
		error: function (error) {
			alert('error with getting reviews!');
		}
	});
}

function generateEditButtons(obj) {
	var $nestedJSON = $('#nested-json-buttons');
	for (var key in obj) {
		var value = obj[key];
		if (typeof(value) != "object") {
			if (key[0] != '~') {
				$('#document-edits').append(
					'<button class="btn btn-default edit-field" type="button" value="Submit">' +  key + ':' 
					+ value + '</button>');
			};
		} 
		else {
			$('#nested-json-keys-buttons').append(
				'<button class="btn btn-default nest-key" type="button" value="Submit">' +  key + '</button>');
			if (!value.hasOwnProperty('0')) {
				generateEditButtons(value);
			}
			else {
				// do some stuff if object is an array
				/*for(var idx in value) {

				}*/
			}
		}
	};
}

function generateEdit(doc) {
	$('#document-edits').empty();
	var jsonStr = $("#" + doc).text();
	var obj = $.parseJSON(jsonStr);
	generateEditButtons(obj);
	$('.edit-field').on('click', function () {
		var buttonText = $(this).text();
		var textArr = buttonText.split(':');
		var value = textArr[1];
		//super hacky way of getting around true/false being wrapped in quotes
		if (value != "true" && value != "false") {
			value = "\"" + value + "\"";
		};
		$('#edit-value').val('{..,"' + textArr[0] + '":' + value + '}');
	});
	$('.nest-key').on('click', function () {
		var key = $(this).text();
		var delta = $('#edit-value').val();
		$('#edit-value').val('{..,"' + key + '":' + delta + '}');
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
		var text = $('#edit-value').val();
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
		var text = $('#edit-value').selection();
		if (text == "") {
			text = $('#edit-value').val();
			$('#edit-value').val("");
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
		$('#current-table').val($('.search-bar-input').val());
		getReviews($('.search-bar-input').val());
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

ReactDOM.render(<ButtonList data={deltaButtons} />, document.getElementById('delta-buttons'));
ReactDOM.render(<ButtonList data={condtionalButtons} />, document.getElementById('conditional-buttons'));
ReactDOM.render(<TablesSearchBar throttle={1000} />, document.getElementById('search-bar'));

