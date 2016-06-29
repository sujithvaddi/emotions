$(function () {
	
	var $tables = $('#content4');
	var $newField = $('#newField');
	var $newFieldVal = $('#newFieldValue');

	$.ajax({
		type: 'GET',
		url: '/tables',
		success: function(tables) {
			$tables.append('<h1>tables</h1>');
			//console.log(tables);
			for(var i = 0; i < tables.length; i++) {
				$tables.append('<button id="' + tables[i]['Name'] 
					+ '"type="button" class="load-table" table-id="'
					+ tables[i]['Name'] 
					+'">' 
					+ tables[i]['Name'] 
					+ '</button><br>');
			}
			$('.load-table').on('click', function() {
			var table = $(this).attr('table-id');
			//console.log(table);
			getReviews(table);
	});
		},
		error: function (error) {
			alert ('error with tables:', error);
		}
	});


	//getReviews("testtable2");

	$('#submit-new').on('click', function() {
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
			}
		});

	});
});

function getReviews(table) {
	//console.log("inside getReviews", table)
	var $reviews = $('#content2');
	$.ajax({
		type: 'GET',
		url: '/reviews',
		data: {tableName: table},
		success: function(reviews) {
			$reviews.append('<h1>reviews</h1>');
			//console.log(reviews);
			for(var i = 0; i < reviews.length; i++) {
				var review = reviews[i];
				$reviews.append('<h2>review</h2>');
				for (var key in review) {
							$reviews.append('<p>' + key + '    : ' + review[key] + '</p>');
							$reviews.append('<form name="demoform" onsubmit="" method="post"> Edit: <input type="text" name="edit"  value="' 
								+ review[key] +'"><button type="button" value="Submit">Edit</button></form>');
						};
					}
		},
		error: function (error) {
			alert('error with getting reviews!');
		}
	});
}

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
