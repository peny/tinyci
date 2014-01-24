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

function testCommit(repo){
  if(!repo){
    repo = process.env.TINYCI_DEFAULT_REPO;
  }
  spawn('git clone '+repo);

}

server.listen(3000);
