import React from 'react'
import ReactDOM from 'react-dom'
import eio from 'engine.io-client'

import {UsersList, ChangeNameForm} from './User.js'
import {Message, MessageList, MessageForm} from './Message.js'
import {formatMessage, guid, findMessage, scrollDownChatView} from './tools.js'

export class ChatHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='chat-header-container'>
        <h3 className='chat-header__title'> General Discussion </h3>
        <p className='chat-header__info'>({this.props.users.length} online)</p>               
      </div>
    );
  }
}

export class ChatView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      currentUser: {name:'', state:'', userUid: ''},
      loggedIn: false,
      messages: [],
      editMessage: {},
      text: ''
    };

    //Init socket and bind to context
    this.socket = new eio.Socket('ws://localhost:8889/');
  }

  //When DOM ready 
  componentDidMount() {
    var that = this;
    
    //open connection with the server
    that.socket.on('open', function(){
      console.log("Connection opened");

      //we use method message from engine.io to transfer packet
      that.socket.on('message', function(packet){
        packet = JSON.parse(packet);

        switch (packet.packetType) {
          //these are all the message types we can recieve
          case 'init':
            that._initialize(packet.data);
            break;
          case 'send:message':
            that._messageRecieve(packet.data);
            break;
          case 'callback:message':
            that._messageCallback(packet.data);
            break;
          case 'delete:message':
            that._messageDelete(packet.data);
            break;
          case 'user:join':
            that._userJoined(packet.data);
            break;
          case 'user:left':
            that._userLeft(packet.data);
            break;
          case 'change:name':
            that._userChangedName(packet.data);
            break;
          case 'callback:name':
            that._userChangedNameCallback(packet.data);
            break;
          default:
            break;
        }
      })
    });
  }

  //Scroll down the chat when new message/info
  componentDidUpdate(prevProps, prevState) {
    scrollDownChatView();
  }

  //Used as a callback to validate username
  _initialize = (data) => {
    if (data.user.state == 'ok') {
      //Retrieve list of users online 
      var users = data.users;
      //Create uid for user
      var currentUser = {name: data.user.name, state: 'ok', userUid: guid()};
      this.setState({users: users, currentUser: currentUser, loggedIn: true});
    }else {
      //If the username is not valid, will display error
      var currentUser = {name: '', state: data.user.state};
      this.setState({currentUser: currentUser});
    }

  }

  //Whenever your recieve a message from another user
  _messageRecieve = (message) => {
    var messages = this.state.messages;
    var messageId = findMessage(messages, message);

    //If message is found update it
    if(messageId !== false) {
      messages[messageId].text = message.text;
      messages[messageId].messageState = message.messageState;
    }else {
      //If not add it to the messages array
      messages.push(message);
    }
    this.setState({messages: messages});
  }

  //This is use as a message callback of your own sent message
  _messageCallback = (message) => {
    var messages = this.state.messages;
    var messageId = findMessage(messages, message);

    //As your own message is already in your chat your just update it
    if (messageId !== false) {
      messages[messageId].text = message.text;
      //MessageState will transfer state as deleted, refused, sending or ok
      messages[messageId].messageState = message.messageState;
      this.setState({message: messages});
    }
  }

  //Whenever anybody deleted a message
  _messageDelete = (data) => {
    var messages = this.state.messages;
    var messageId = findMessage(messages, {uid: data.uid});

    if (messageId !== false) {
      //If its a message from you update the status to deleted
      if (data.userUid == this.state.currentUser.userUid) {
        messages[messageId].messageState = 'deleted';
      }else {
        //If its not from you remove from messages array
        messages.splice(messageId,1);
      }
      this.setState({message: messages});
    }
  }

  //Whenever a user join, adding the user to our list
  _userJoined = (data) => {
    if (this.state.loggedIn){
      var users = this.state.users;
      var messages = this.state.messages;
      var name = data.name;
      users.push(name);
      messages.push({
        user: 'APPLICATION BOT',
        text : name +' joined the chat.',
        messageState: 'bot',
        userUid: 'bot'
      });
      this.setState({users:users, messages:messages});
    }
  }

  //Whenever a user leave, remove the user from our list
  _userLeft = (data) => {
    if (this.state.loggedIn){
      var users = this.state.users;
      var messages = this.state.messages;
      var name = data.name;
      var index = users.indexOf(name);
      users.splice(index, 1);
      messages.push({
        user: 'APPLICATION BOT',
        text : name +' left the chat.',
        messageState: 'bot',
        userUid: 'bot'
      });
      this.setState({users:users, messages:messages});
    }
  }

  //Whenever a user change his name we replace the new name in our list
  _userChangedName = (data) => {
    var {oldName, newName} = data;
    var {users, messages} = this.state;
    var index = users.indexOf(oldName);
    users.splice(index, 1, newName);
    messages.push({
      user: 'APPLICATION BOT',
      text : 'Change Name : ' + oldName + ' ==> '+ newName,
      messageState: 'bot',
        userUid: 'bot'
    });
    this.setState({users: users, messages: messages});
  }
  
  //This is used as a callback when you modify your name
  _userChangedNameCallback = (data) => {
    //currentUser.state will transfer error like name taken or invalid
    this.setState({currentUser:{name: data.name, state: data.state, userUid: this.state.currentUser.userUid}});
  }

  //Handler for message form
  handleMessageSubmit = (message) => {
    //If an editing message is not pending 
    if (this.state.editMessage.uid == undefined ) {
      //Push the new message in the array
      var messages = this.state.messages;
      messages.push(message);
      this.setState({messages: messages});
    }else {
      //If and editing message is pending reset the local state as it will be updated
      this.setState({editMessage: {}});
    }

    //Send or update message
    this.socket.send(formatMessage('send:message', message));
  }

  //Handle change name form
  handleChangeName = (newName) => {
    this.socket.send(formatMessage('change:name', {name: newName}))
  }

  //Handle the click on edit message button
  handleEditMessage = (message) => {
    var messages = this.state.messages;

    //If another edit message is pending reset him to 'ok'
    if(this.state.editMessage.uid != undefined){
      var editMessageId = findMessage(messages, this.state.editMessage);
      messages[editMessageId].messageState = 'ok';
    }

    //Setting current editing message to 'sending' to highlight it
    var messageId = findMessage(messages,message);
    messages[messageId].messageState = 'sending';

    //By setting the state of editMessage we force the messageForm to use those value
    this.setState({messages: messages, editMessage: message});
  }

  //Handle the delete message button
  handleDeleteMessage = (uid) => {
    this.socket.send(formatMessage('delete:message', {'userUid': this.state.currentUser.userUid, 'uid': uid}));
  }

  //Handle the change name form from login page
  handleLoginSubmit = (name) => {
    //We init the connection with the name entered
    this.socket.send(formatMessage('init', {'name': name}));
  }

  render() {
    return (
      <div className={'chat-container ' + (!this.state.loggedIn ? 'chat-container--hidden' : '')}>
        {!this.state.loggedIn &&
          <div className='login-view-container'>
            <LoginView 
              currentUser={this.state.currentUser}
              handleLoginSubmit={this.handleLoginSubmit} 
            />
          </div>
        }
        <div className='chat-container__header'>
          <ChatHeader
            users={this.state.users}
          />
        </div>
        <div className='chat-container__top'>
          <MessageList
            messages={this.state.messages}
            currentUser={this.state.currentUser}
            handleEditMessage={this.handleEditMessage}
            handleDeleteMessage={this.handleDeleteMessage}
          />
          <UsersList
            users={this.state.users}
            currentUser={this.state.currentUser}
          />
        </div>
        <div className='chat-container__bottom'>
          <MessageForm
            onMessageSubmit={this.handleMessageSubmit}
            editMessage={this.state.editMessage}
            currentUser={this.state.currentUser}
          />
          <ChangeNameForm
            onChangeName={this.handleChangeName}
            currentUser={this.state.currentUser}
          />
        </div>
      </div>
    );
  }
}

class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: this.props.currentUser
    };
  }

  //CurrentUser.state will transfer errors to changeNameForm so we keep it updated
  componentWillReceiveProps(nextProps) {
    this.setState({currentUser: nextProps.currentUser});
  }

  handleSetName = (newName) => {
    this.props.handleLoginSubmit(newName);
  }

  render() {
    return (
      <div className='login-form-container'>
        <h3 className='login-form__header'>
          Set your username:
        </h3>
        <ChangeNameForm
            onChangeName={this.handleSetName}
            currentUser={this.state.currentUser}
          />
      </div>
    );
  }
}
