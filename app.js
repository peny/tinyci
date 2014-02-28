var http = require('http');
var spawn = require('child_process').spawn;

var mailgun = require('mailgun-js')(process.env.MAILGUN_API_KEY, process.env.MAILGUN_DOMAIN);

var SERVER_PORT = '8777';

var server = http.createServer(function (request, response) {
  request.body && console.log(request.body)
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
  var git = spawn('git',['clone', repo, '/tmp/tinyci']);
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
  server.on('exit', function(code){
    if(code === 0){
      console.err('Server shut down');
    }
  });
  server.stdout.on('data', function(code){
    console.log(''+code);
  });
  server.stderr.on('data', function(code){
    console.log(''+code);
  });
  console.log('Server started');
  setTimeout(function(){
    //startTest();
    console.log('Running tests');
  },5000);
}

function startTest(){
  var startTestScript = process.env.TINYCI_START_TEST.split(' ');
  var test = spawn(startTestScript.reverse().pop(),startTestScript.reverse());
  test.stdout.on('data', function(code){
    console.log(''+code);
  });
  test.stderr.on('data', function(code){
    console.log(''+code);
  });
  test.on('exit', function(code){
    if(code === 0){
      console.err('Test finished');
      mailResult('petter@pttr.se','much success');
    }
  });
}

function mailResult(to, result){
  mailgun.messages.send({
    from: 'TinyCI <tinyci@'+process.env.MAILGUN_DOMAIN+'>',
    to: to,
    subject: 'TinyCI done',
    text: result
  },
  function(err,res, body){
    console.log(err,res);
  });

}

process.on('SIGINT', function() {
  console.log('SIGINT');
  var rm = spawn('rm',['-rf', '/tmp/tinyci']); 
  rm.on('exit', function(){
    process.kill();
  });
});

cloneRepo();
server.listen(SERVER_PORT);
console.log('CI server started at '+SERVER_PORT);
