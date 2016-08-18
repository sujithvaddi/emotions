#EMOtions

A UI to explore EMOdb content and functionality

##Quick Start

Deployed:
[Cert](http://emotions.flynn-qa-us-east-1.nexus.bazaarvoice.com/)

##Local

1. Clone the repo
2. Install Godep, download dependencies:
```
$ go get github.com/tools/godep
$ godep get 
```
3. Run the server in the root directory:
```
$ go run server.go local
```
4. Check [http://localhost:8001/](http://localhost:8001/)


##Deployment
To deploy, run the bvflynn_push script.
```
$ ./bvflynn_push
```
###bvflynn_push
If deploying a new instance, the first build will fail. The flynn default dns is incompatible with go, so the go server has to be run with another dns, set via a flynn environment variable (which does not seem possible unless a deploy is attempted first):

```
$ flynn -a qa-us-east-1 env set GODEBUG=netdns=cgo
```

If updating an instance that's already running, the variable should already be set.

Flynn deployments have a tendency to fail, so if it fails the first couple of times, sometimes with a generic fail message (ERROR: Initial web job failed to start). Try 2-3 times, wait an hour in between, try again, wait a day, try again (this has sometimes worked in the past). 

Flynn takes print statements and logs them. Logs can be viewed with one of:

```
$ flynn log
$ flynn -a [end point] log
``` 
depending on how many endpoints are in use. 

###Procfile 
Procfile's web command is what flynn will run to start the service. 
```
web: [binary file] $PORT
```
The binary file name is the compiled file in $GOPATH/bin. It should be the name of the folder the project is in, currently EMOtions. 


##Tools 
[Go](https://golang.org/doc/install): Server 

[Godep](https://github.com/tools/godep): Golang dependency management tool. EMOtions relies on go-patricia (radix trie) for search and gocron for cron jobs. 

[npm](https://docs.npmjs.com/cli/install): Javascript package management tool

[Browserify](http://browserify.org/): Front-end dependency management tool. Enables 'requires' statements for importing dependencies.

[React](https://facebook.github.io/react/)

[React developer tool](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi): React inspector tool. Useful for current state, props, and other react specific parameters that the regular browser inspector can't detect. 

[jQuery.selection](http://madapaja.github.io/jquery.selection/): highlight text to replace, used for conditionals 

jQuery


##Client 
All client side code is in the public folder. Client was built using React, JS, JSX, jQuery, HTML5 and CSS. 

###Building bundle.js

Make javascript edits to the respective page's main.js file, then build with npm build inside the /public directory (if this doesn't directly run the browserify build commands which can be found inside the package.json file):

```
$ npm run build
```

This will update the bundle[n].js file, which index.html sources. 

To install Browserify:
```
npm install -g browserify
```

Pages are slow to load because all the code renders on client side, server side rendering would speed up page load. 

React-search-bar is not the default src from github as that version did not have search on enter functionality. If this dependency is updated, the functionality might break. 

Dependencies are located in the package.json file. 

###React Notes
React component inner function sometimes require binding or passing in 'this' parameter to use defined functions, props and state. For example, ajax calls require binding 'this' for success calls, and any calls to map requires 'this' to be passed in as a second parameter. 

React components are ALWAYS required to be closed with a '/', including native html elements e.g. `<br>`, which needs to be corrected to `<br/>`. 

The EmoUI component passes a lot of functions down so child nodes can change state that are eventually rendered by other child nodes. This would've been better managed with a Flux implementation such as [Redux](https://github.com/reactjs/redux).


##Server
Server runs locally by checking for the 'local' argument. 

Cert URLs used are in cache/cache.go file, which should be edited for deployment to other environments. EMOtions uses a check to see if PORT# is 8001 to use public URLs. EMOtions will not work if deployed to flynn sbx endpoint, because that endpoint has no access to private or public VPC. 

###Go Notes
Go json unmarshals will sometimes return empty structs if the annotations has a space after the colon ":" e.g. `json: "queue"` will sometimes break.

Unbuffered channels pause their go routine until they're emptied. When a buffered channel is full it will also pause the routine.

Setting headers:
```
w.Header().Set("Content-Type", "application/json")
```
lets the client know it's a json. If headers are not set, data will be received as a string (which can be parsed into a json with JSON.parse). 


##Credits
Krystina Diao for most of the CSS and the overall design.
