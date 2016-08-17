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


##Deploy
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

Flynn deployments have a tendency to fail the first couple of times, sometimes with a generic fail message (ERROR: Initial web job failed to start). Try 2-3 times, wait an hour in between, try again, wait a day, try again (this has sometimes worked in the past). Logs can be viewed with one of:

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
The binary file name is the compiled file in $GOPATH/bin. It should be the name of the folder the project is in. 


##Client 
All client side code is in the public folder.

Make javascript edits to the respective page's main.js file, then build with npm build inside the /public directory (if this doesn't directly run the browserify build commands which can be found inside the package.json file). This will update the bundle[n].js file, which index.html sources. 

To install Browserify:
```
npm install -g browserify
```

Pages are slow to load because all the code renders on client side, server side rendering would speed up page load. 


##Server
Server runs locally by checking for the 'local' argument. 

Cert URLs used are in cache/cache.go file, which should be edited for deployment to other environments. EMOtions uses a check to see if PORT# is 8001 to use public URLs. EMOtions will not work if deployed to flynn sbx endpoint, because that endpoint has no access to private or public VPC. 

##Tools 
[Go](https://golang.org/doc/install): Server 
[Godep](https://github.com/tools/godep): Golang dependency management tool. EMOtions relies on go-patricia (radix trie) for search and gocron for cron jobs. 
[npm](https://docs.npmjs.com/cli/install): Javascript package management tool
[Browserify](http://browserify.org/): Front-end dependency management tool. Enables 'requires' statements for importing dependencies.
[React](https://facebook.github.io/react/)
jQuery
