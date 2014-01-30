var http = require('http');
var spawn = require('child_process').spawn;

var SERVER_PORT = '8777';

var server = http.createServer(function (request, response) {
  if(request.url.match(/ci/)){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("OK\n");
    cloneRepo();
    console.log('Started cloning repo');
  } else {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.end("Not found\n");
  }
});

function cloneRepo(repo){
  if(!repo){
    repo = process.env.TINYCI_DEFAULT_REPO;
  }
  var git = spawn('git',['clone', repo, '/tmp/test']);
  git.stdout.on('data', function(code){
    console.log(''+code);
  });
  git.stderr.on('data', function(code){
    console.log(''+code);
  });
  git.on('exit', function(code){
    if(code === 0){
      startServer();
      console.log('Repo copied, starting server');
    }
  });
}

function startServer(){
  var startServerScript = process.env.TINYCI_START_SERVER.split(' ');
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

function startTest(){
  var startTestScript = process.env.TINYCI_START_TEST.split(' ');
  var server = spawn(startTestScript.reverse().pop(),startTestScript.reverse());
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

process.on('SIGINT', function() {
 console.log('SIGINT');
 var rm = spawn('rm',['-rf', '/tmp/tinyci']); 
 rm.on('exit', function(){
  process.kill();
 });
});

server.listen(SERVER_PORT);
console.log('CI server started at '+SERVER_PORT);
