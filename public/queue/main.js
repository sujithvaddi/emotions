var React = require('react');
var ReactDOM = require('react-dom');
var SearchBar = require('react-search-bar');
//var JQuery = require('jquery');
//var Bootstrap = require('bootstrap');
//var BootstrapDialog = require('bootstrap3-dialog');

const SubscriptionInfo = React.createClass({
	render: function() {
		return (<div>
					<div>Name: {this.props.data.name}</div>
					<div>Claim Count: {this.props.data.claimCount}</div>
					<div>Size: {this.props.data.size}</div>
				</div>
			);
	}
})


var Peek = React.createClass({
	render: function() {
		var peek_string = JSON.stringify(this.props.peek, null, 4);
		return (
			<pre><code>{peek_string}</code></pre>
			);
	}
});


var PeekList = React.createClass({
	render: function() {
		var peeks = this.props.data.map( function(peek) {
			return (
				<Peek key={peek.id} peek={peek} />
				);
		},
		this);
		return (<div>{peeks}</div>);
	}
});


var Message = React.createClass({
	getInitialState: function() {
		return {
			messageClass: "edit-value"
		};
	},
	handleTextAreaChange: function(event) {
		this.setState({
			currentTextAreaValue: event.target.value
		});
		try {
			JSON.parse(event.target.value);
			this.setState({
				messageClass: "edit-value"
			});
		} catch(e) {
			this.setState({
				messageClass: "edit-value error"
			});
		}
		this.props.handleMessagesChanges(this.props.index, event.target.value);
	},
	render: function() {
		return (
			<div>
				<textarea 
		            type="text" 
		            placeholder="construct json here"
		            value={this.props.message}
		            className={this.state.messageClass}
		            style={{width: 300, maxHeight: 50}} 
		            onChange={this.handleTextAreaChange} /> <br/>
		    </div>
			);
	}
});

var MessageList = React.createClass({
	render: function() {
		var messages = this.props.data.map(
			function(message, index) {
				return (
					<Message handleMessagesChanges={this.props.handleMessagesChanges}
	            		message={message}
	            		index={index}
	            		key={index} />
					);
			},
			this);
		return (
			<div>{messages}</div>
			);
	}
});

var NavigationBar = React.createClass({
	render: function() {
		return (
			<div> 
				<nav className="navbar navbar-default">
			        <ul className="nav navbar-nav">
			            <li className="non-active"><a href="/">Datastore<span className="sr-only">(current)</span></a></li>
			            <li className="non-active"><a href="/databus">DataBus</a></li>
			            <li className="active"><a href="/queue">Queue</a></li>
			        </ul>
				</nav>
			</div>
			);
	}
});


var EmoUI = React.createClass({
	getInitialState: function() {
		return {
			currentQueueValue: "",
			currentQueueInfo: {},
			currentPeekList: [],
			currentMessages: [""]
		};
	},
	handleMessagesChanges: function(index, newText) {
		var updatedMessages = this.state.currentMessages;
		updatedMessages[index] = newText
		this.setState({
			currentMessages: updatedMessages
		});
	},
	handleSubscriptionChange: function(sub) {
		this.setState({
			currentQueueValue: sub
		});
	},
	handleQueueUpdate: function(event) {
		this.setState({
			currentQueueValue: event.target.value
		});
	},
	updateCurrentQueueInfo: function(info) {
		this.setState({
			currentQueueInfo: info
		});
	},
	updateCurrentPeekList: function(list) {
		this.setState({
			currentPeekList: list
		})
	},
	findQueue: function() {
		$.ajax({
			type: "GET",
			url: "/queueinfo",
			data: {queue: this.state.currentQueueValue},
			success: function(data) {
				var parsed_data = JSON.parse(data)
				this.updateCurrentQueueInfo(parsed_data)
				this.updateCurrentPeekList(JSON.parse(parsed_data.peek))
			}.bind(this),
			error: function(err) {
				console.log("error with sending queue request");
			}
		});
	},
	sendMessages: function(){
		if (this.state.currentTextAreaClass == "error") {
			alert("Invalid message, required to be json");
			return
		};
		var data = {
			messages: this.state.currentMessages,
			queue: this.state.currentQueueValue
		};
		var json_data = JSON.stringify(data);
		console.log(json_data);
		$.ajax({
			type: "POST",
			url: "/queuemessage",
			data: json_data,
			success: function(data) {
				console.log(data);
				if (data == "{\"success\":true}") {
					alert("success sending!");
				} else {
					alert("message was not successful: " + data);
				}
			},
			error: function(err) {
				alert("error: " + err);
			}
		});
	},
	addMessage: function() {
		this.setState({
			currentMessages: this.state.currentMessages.concat([""])
		});
	},
	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-md-6 left">
						<img src="../upload.jpg" width="30%"/>
						<NavigationBar />
					    <div><h2>Queue</h2></div>
						<div id="current-stuff">
							Current queue: <input id="current-key" 
									            style={{width: 50 + "%"}}
									            placeholder="enter queue name"
												value={this.state.currentQueueValue} 
												onChange={this.handleQueueUpdate} />
							<button className="btn btn-default" type="button" onClick={this.findQueue}>Find Subscription</button>
						</div>
						<div id="content5">
						      <form><h2>Message:</h2><br/>
						            <MessageList data={this.state.currentMessages}
						            			handleMessagesChanges={this.handleMessagesChanges} />
						      Options:
						            <button className="btn btn-default" type="button" onClick={this.sendMessages}>Send Messages</button>
						            <button className="btn btn-default" type="button" onClick={this.addMessage}>Add Another Message</button><br/>
						      </form>
						</div>
		                <div><h2>Peek</h2></div>
						<div>
							<PeekList data={this.state.currentPeekList} />
						</div>
					</div>
					<div className="col-md-3 right deltas-conditionals">
						<h2>Subscription Info</h2>
			        	<SubscriptionInfo data={this.state.currentQueueInfo} />
			        </div>  
				</div>
			</div>
			);
	}
});

ReactDOM.render(<EmoUI />, document.getElementById('emo-ui'))

