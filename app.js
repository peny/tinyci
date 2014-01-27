var http = require('http');
var spawn = require('child_process').spawn;

var server = http.createServer(function (request, response) {
  if(request.url.match(/ci/)){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("OK\n");
    testCommit();
  } else {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.end("Not found\n");
  }
});

function cloneRepo(repo){
  if(!repo){
    repo = process.env.TINYCI_DEFAULT_REPO;
  }
  var git = spawn('git',['clone', repo]);
  git.stdout.on('data', function(code){
    console.log(''+code);
  });
  git.stderr.on('data', function(code){
    console.log(''+code);
  });
  git.on('exit', function(code){
    if(code === 0){
      startServer();
    }
  });
}

function startServer(){
  startServerScript = process.env.START_SERVER_SCRIPT.split(' ');
  var server = spawn(startServerScript.reverse().pop(),startServerScript.reverse());
  server.stdout.on('data', function(code){
    console.log(''+code);
  });
  server.stderr.on('data', function(code){
    console.log(''+code);
  });
  server.on('exit', function(code){
    if(code === 0){
      console.err('Server shut down');
    }
  });

}


server.listen(3000);
