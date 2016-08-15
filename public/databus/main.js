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
					<div>Event Count: {this.props.data.eventCount}</div>
					<div>Event TTL: {this.props.data.eventTtl}</div>
					<div>Expiration: {this.props.data.expiresAt}</div>
					<div>Table Filter: {this.props.data.tableFilter}</div>
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
				<Peek key={peek.eventKey} peek={peek} />
				);
		},
		this);
		return (<div>{peeks}</div>);
	}
});


var EmoUI = React.createClass({
	getInitialState: function() {
		return {
			currentSubscriptionValue: "",
			currentSubscriptionInfo: {},
			currentPeekList: []
		};
	},
	handleSubscriptionChange: function(sub) {
		this.setState({
			currentSubscriptionValue: sub
		});
	},
	handleSubscriptionUpdate: function(event) {
		this.setState({
			currentSubscriptionValue: event.target.value
		});
	},
	updateCurrentSubscriptionInfo: function(info) {
		this.setState({
			currentSubscriptionInfo: info
		});
	},
	updateCurrentPeekList: function(list) {
		this.setState({
			currentPeekList: list
		})
	},
	findSubscription: function() {
		$.ajax({
			type: "GET",
			url: "/subscription",
			data: {subscription: this.state.currentSubscriptionValue},
			success: function(data) {
				var parsed_data = JSON.parse(data);
				this.updateCurrentSubscriptionInfo(parsed_data);
				this.updateCurrentPeekList(JSON.parse(parsed_data.peek));
			}.bind(this),
			error: function(err) {
				console.log("error with sending subscription");
			}
		});
	},
	render: function() {
		return (
			<div>
				<div className="row">
					<div className="col-md-6 left">
						<img src="upload.jpg" width="30%"/>
					    <div><h2>Databus</h2></div>
						<div id="current-stuff">
							Current subscription: <input id="current-key" 
									            style={{width: 50 + "%"}}
									            placeholder="enter your subscription here"
												value={this.state.currentSubscriptionValue} 
												onChange={this.handleSubscriptionUpdate} />
							<button className="btn btn-default" type="button" onClick={this.findSubscription}>Find Subscription</button>
						</div>
		                <div><h2>Peek</h2></div>
						<div>
							<PeekList data={this.state.currentPeekList} />
						</div>
					</div>
					<div className="col-md-3 right deltas-conditionals">
						<h2>Subscription Info</h2>
			        	<SubscriptionInfo data={this.state.currentSubscriptionInfo} />
			        </div>  
				</div>
			</div>
			);
	}
});

ReactDOM.render(<EmoUI />, document.getElementById('emo-ui'))

