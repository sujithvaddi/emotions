$(function() {

	$('[data-toggle="tooltip"]').tooltip();
	
	var $tables = $('#content4');
	var $newField = $('#newField');
	var $newFieldVal = $('#newFieldValue');

	$.ajax({
		type: 'GET',
		url: '/tables',
		success: function(tables) {
			$tables.append('<h1>tables</h1>');
			console.log(tables);
			for(var i = 0; i < tables.length; i++) {
				$tables.append('<button id="' + tables[i]['Name'] 
					+ '"type="button" class="load-table" table-id="'
					+ tables[i]['Name'] 
					+'">' 
					+ tables[i]['Name'] 
					+ '</button>');
			}
			$('.load-table').on('click', function() {
				var table = $(this).attr('table-id');
				$('#current-table').val(table)
				getReviews(table);
			});
		},
		error: function (error) {
			alert ('error with tables:', error);
		}
	});

	/*$('#submit-new').on('click', function() {
		var postData = {
			"key": $newField.val(),
			"value": $newFieldVal.val(),
			"type": "newField",
			"table": "review:testcustomer",
			"tableKey": "demo1"
		};
		console.log(postData);
		var json_data = JSON.stringify(postData);
		$.ajax({
			type: 'POST',
			url: '/reviews',
			data: json_data,
			success: function (data) {
				//do stuff
			},
			error: function(err) {
				alert('error on submit-new');
			}
		});
	});*/

	$('.make-delta').on('click', function() {
		var text = $('textarea#edit-value').val();
		var textArr = text.split(': ')
		var deltaType = $(this).text();
		var postData = {
			"key": textArr[0],
			"value": textArr[1],
			"type": deltaType
		};
		var json_data = JSON.stringify(postData);
		$.ajax({
			type: 'POST',
			url: '/deltaconstructor',
			data: json_data,
			success: function(data) {
				$('#edit-value').val(data);
			}
		});
	});

	$('.edit-selected').on('click', function() {
		var text = $('textarea#edit-value').selection();
		if (text=="") {
			text = $('textarea#edit-value').val();
			$('textarea#edit-value').val("");
		};
		var deltaType = $(this).text();
		var postData = {
			"value": text,
			"type": deltaType
		};
		console.log(postData);
		var json_data = JSON.stringify(postData);
		$.ajax({
			type: 'POST',
			url: '/deltaconstructor',
			data: json_data,
			success: function(data) {
				$('#edit-value').selection('replace', {text: data});
			}
		});
	});

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
		}
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
	$('#current-key').val("select a document to edit");
	$.ajax({
		type: 'GET',
		url: '/reviews',
		data: {tableName: table},
		success: function(reviews) {
			$reviews.append('<h1>documents</h1>');
			//console.log(reviews);
			for(var i = 0; i < reviews.length; i++) {
				var review = reviews[i];
				$reviews.append('<h2>document</h2><button class="edit-review" type="button"> Edit: ' + review["~id"] + '</button>');
				//console.log(review)
				$reviews.append('<pre><code id="' + review["~id"] + '">' + JSON.stringify(review, null, 4) + '</code></pre>');
				//console.log(JSON.stringify(review, null, 4));
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
	for (var key in obj) {
		$buttons.append(
			'<button class="edit-field" type="button" value="Submit">' + key + ': ' 
			+ obj[key] + '</button>');
	};
	$('.edit-field').on('click', function () {
		$('textarea#edit-value').val($(this).text());
	});
}


var DeltaButton = React.createClass({
	getDeltaFormat: function() {
		var text = $('textarea#edit-value').val();
		var textArr = text.split(': ')
		var deltaType = $(this).text();
		var postData = {
			"key": textArr[0],
			"value": textArr[1],
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
	render: function() {
		return (
			<button className="btn btn-default make-delta" type="button" data-toggle="tooltip" title={this.props.tooltipText} data-html="true"
         		>{this.props.buttonText}</button>
			);
	}
})

var DeltaButtonList = React.createClass({
	getInitialState: function() {
		return {
			data: [
				{"title": "stuff <b>stuff</b>", "name": "Map"},
				{"title": "stuff <b>stuff</b>", "name": "Literal"},
				{"title": "stuff <b>stuff</b>", "name": "Delete Document"},
				{"title": "stuff <b>stuff</b>", "name": "Delete Key"},
				{"title": "stuff <b>stuff</b>", "name": "Nest"}
			]
		}
	},
	componentDidMount: function() {
		$('[data-toggle="tooltip"]').tooltip();
		$('.make-delta').on('click', function() {
			var text = $('textarea#edit-value').val();
			var textArr = text.split(': ')
			var deltaType = $(this).text();
			var postData = {
				"key": textArr[0],
				"value": textArr[1],
				"type": deltaType
			};
			var json_data = JSON.stringify(postData);
			$.ajax({
				type: 'POST',
				url: '/deltaconstructor',
				data: json_data,
				success: function(data) {
					$('#edit-value').val(data);
				}
			});
		});
	},
	render: function() {
		var buttons = this.state.data.map(function(button) {
			return (
				<DeltaButton buttonText={button.name} key={button.name} tooltipText={button.title} />
				);
		});

		return (<div>{buttons}</div>);
	}
})


ReactDOM.render(<DeltaButtonList />, document.getElementById('delta-buttons'));

/*var Review = React.createClass({
	render: function() {
		return (
			<div>{this.props.review.author} </div>
			);
	}
});

var ReviewsList = React.createClass({
	loadReviewsFromTable: function() {
		var $reviews = $('#content4');
		$.ajax({
			type: 'GET',
			url: '/reviews',
			data: {tableName: "testtable2"},
			success: function(reviews) {
				console.log(reviews)
				this.setState({data: reviews})
			}.bind(this),
			error: function (error) {
				alert('error!');
			}
		});
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadReviewsFromTable();
	},
	render: function() {
		var reviewNodes = this.state.data.map( function(review) {
			return (
				<Review review={review} key={review.author}>
				</Review>
				);
		});
		return (<div>
				<h1>reviews</h1>
				{reviewNodes}
			</div>);
	}
});*/
/*
var Table = React.createClass({
    render: function() {
        return (
            <div><li><a href="#">{this.props.tableName} </a></li> </div>
            );
    }
});

var TablesList = React.createClass({
	loadTableList: function() {
		$.ajax({
			type: 'GET',
			url: '/tables',
			success: function(tables) {
				this.setState({data: tables});
			}.bind(this),
			error: function (error) {
				alert ('error with tables:', error);
			}
		});
	},
	componentDidMount: function() {
		this.loadTableList();
	},
	getInitialState: function() {
		return {data: []};
	},
	render: function() {
		var tableNodes = this.state.data.map(function(table) {
			return (
				<Table tableName={table.Name} key={table.Name}>
				</Table>
				);
		});
		return (

			<nav class="navbar navbar-inverse sidebar" role="navigation">
			<div class="container">
				<div class="col-sm-4 col-md-3 sidebar">
				<h1>Tables</h1>
					<ul class="dropdown-menu forAnimate" role="menu">
	        		{tableNodes}
        			</ul>
        		</div>
      		</div> 
      		</nav>     		
    	);
	}
});


ReactDOM.render(<ReviewsList />, 
	document.getElementById('content3'));


ReactDOM.render(<TablesList/>, 
	document.getElementById('content'));*/
