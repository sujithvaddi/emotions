$(function () {
	var $reviews = $('#content4');
	var $tables = $('#content2');
	var $newField = $('#newField');
	var $newFieldVal = $('#newFieldValue');

	$.ajax({
		type: 'GET',
		url: '/tables',
		success: function(tables) {
			$tables.append('<h1>tables</h1>');
			console.log(tables);
			for(var i = 0; i < tables.length; i++) {
				$tables.append('<li>' + tables[i]['Name'] + '</li>')
			}
		},
		error: function (error) {
			alert ('error with tables:', error);
		}
	});

	$.ajax({
		type: 'GET',
		url: '/reviews',
		data: {tablename: "sometable"},
		success: function(reviews) {
			$reviews.append('<h1>reviews</h1>');
			
			for (var key in reviews) {
				$reviews.append('<p>' + key + '    : ' + reviews[key] + '</p>');
				$reviews.append('<form name="demoform" onsubmit="" method="post"> Edit: <input type="text" name="edit"  value="' 
					+ reviews[key] +'"><input type="submit" value="Submit"></form>');
			};
		},
		error: function (error) {
			alert('error!');
		}
	});



	$('#submit-new').on('click', function() {
		var postData = {};
		postData[$newField.val()] = $newFieldVal.val();
		$.ajax({
			type: 'POST',
			url: '/reviews',
			contentType:"application/json",
  			dataType:"json",
			data: {
				test:1, 
				test2:2
			},
			success: function (data) {
				//do stuff with the success? what to return?
			}
		});

	});
});
