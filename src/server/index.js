/**
 * Server Entry File
 */

import express from 'express'
import io from 'engine.io'
import {userClass} from './userClass'
import {validateMessage} from './messageClass'

process.chdir(__dirname);

var app = express();

app.use(express.static('./static'));
app.use(express.static('../static'));

// app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    res.type('html').end(template());
});

app.listen(8888, () => console.log('App is listening on http://localhost:8888/'));

var server = io.listen(8889);

//Init userNames array
var userNames = new userClass({});

//Adding broadcast function for later use
//If socketId is furnished the broadcast will only be sent to other sockets
server.broadcast = function(packet, socketId = undefined) {
	for( var key in server.clients ) {
		if(typeof socketId !== 'undefined' && key == socketId) {
			continue;
		}
		server.clients[key].send(packet)
	}
}

server.on('connection', function(socket){
	//Initialize connection to chat
	console.log("Connection on socket")
	var name = "";

  //Data transfer is made with on:message
  // JSON transfered: packet {packetType, data: {...}}
  socket.on('message', function(packet){
  	packet = JSON.parse(packet)

  	switch (packet.packetType) {
  		case 'init':
  			//Init connection asked from client
  			//We validate the username giver and verify its not taken
  			if (userNames.validateName(packet.data.name)){
					if (userNames.claimUsername(packet.data.name)) {
			      name = packet.data.name;
			      
			      //Set name and send him the list of current users as a callback of init
			      socket.send(formatMessage('init', {
			      	users: userNames.getUsers(),
			      	user: {name: name, state: 'ok'}
			      }));
			      console.log("New user on name:", name);

			      //Broadcast the new guest to connected users 
			      server.broadcast(formatMessage('user:join', {
			        name: name
			      }), socket.id);
			    } else {
			    	//If the username is not free send callback with state nameTaken
			      socket.send(formatMessage('init', {
			      	users: [],
			      	user: {name: '', state:'nameTaken'}
			      }));
			    }
				}else {
					//If the username is not valid send callback with state invalidName
					socket.send(formatMessage('init', {
						users: [],
						user: {name: '', state:'invalidName'}
					}));
				}
  			break;

  		case 'send:message':
  			//We first validate the message
  			if (validateMessage(packet.data.text)){
  				//Simulate latency
  				setTimeout(function() {
  					//Send a callback to the user that the message is ok
		  			socket.send(formatMessage('callback:message', {
					    name: name,
				      text: packet.data.text,
				      messageState: "ok",
				      uid: packet.data.uid,
				      userUid: packet.data.userUid
					  }));

		  			//And broadcast the new message to other clients
		  			server.broadcast(formatMessage('send:message', {
				      user: name,
				      text: packet.data.text,
				      messageState: "ok",
				      uid: packet.data.uid,
				      userUid: packet.data.userUid
				    }), socket.id);
			    }, 1000); 
  			}else {
  				//Simulate latency
  				setTimeout(function() {
  					//If the message is not valid we send a callback message with message state 'refused'
			      socket.send(formatMessage('callback:message', {
					    name: name,
				      text: packet.data.text,
				      messageState: "refused",
				      uid: packet.data.uid
					  }));
			    }, 1000);	
  			}
  			break;

  		case 'delete:message':
  			//Broadcast the uid of the deleted message to everyone
  			server.broadcast(formatMessage('delete:message', {
		      userUid: packet.data.userUid,
		      uid: packet.data.uid
		    }));	
  			break;

			case 'change:name':
				//We first validate the name and check if it's free
				if (userNames.validateName(packet.data.name)){
					if (userNames.claimUsername(packet.data.name)) {
			      var oldName = name;
			      //We free the oldname place
						userNames.freeUser(oldName);

			      name = packet.data.name;
			      
			      //And send a callback to the user saying the name is changed
			      socket.send(formatMessage('callback:name', {name: name, state:'ok'}));

			      //Then broadcast the new name to everyone
			      server.broadcast(formatMessage('change:name', {
					    oldName: oldName,
			        newName: name
			      }));
			    } else {
			    	//If the username is not free send callback with state nameTaken
			      socket.send(formatMessage('callback:name', {name: name, state:'nameTaken'}));
			    }
				}else {
					//If the username is not valid send callback with state invalidName
					socket.send(formatMessage('callback:name', {name: name, state:'invalidName'}));
				}
				break;
  	}
  })

  //On connexion close 
  socket.on('close', function(){
  	//Broadcast the username who left 
  	server.broadcast(formatMessage('user:left', {
	    name: name
    }), socket.id);
    //and free the username
    userNames.freeUser(name);
  });
});

//Template used
function template () {
return `
<!DOCTYPE html>
<html>
<head>
  <title>Fullstack Challenge</title>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="/normalize.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
</head>
<body>
</body>
  <div id='app' class='main-container'></div>
  <script src="/client.js"></script>
</html>
`
}

function formatMessage(packetType, data) {
	var message = {'packetType': packetType, 'data': data};
	return JSON.stringify(message);
}
