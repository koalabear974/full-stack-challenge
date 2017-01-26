import React from 'react'
import {formatMessage, guid, findMessage, scrollDownChatView} from './tools.js'

export class Message extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      canModify: false,
      modifierClass: ''
    };
  }

  //Its important to have those two state just after mounting to ensure normal displaying of the message
  componentDidMount(){
    this.setState({
      canModify: this.props.fromSelf && (this.props.messageState != 'deleted') && (this.props.messageState != 'refused'),
      modifierClass: " message-container--" + this.props.messageState
    });
  }

  //And we keep them update as the messageState can change
  componentWillReceiveProps(nextProps) {
    this.setState({
      canModify: nextProps.fromSelf && (nextProps.messageState != 'deleted') && (this.props.messageState != 'refused'),
      modifierClass: " message-container--" + nextProps.messageState
    });
  }

  handleOnClickEdit = (e) => {
    //Set the message uid we want to modify
    var message = {
      user: this.props.user,
      text: this.props.text,
      uid: this.props.uid
    }
    this.props.handleEditMessage(message);
  }

  handleOnClickDelete = (e) => {
    this.props.handleDeleteMessage(this.props.uid);
  }

  render() {
    return (
      <div className={'message-container' + this.state.modifierClass + (this.props.fromSelf ? ' message-container--self' : '')}>
        <div className='message-container__user-name'>{this.props.user} :</div>
        <div className='message-container__message'>{this.props.text}</div>
        {this.state.canModify &&
          <div className='message-container__buttons'>
            <button
              className='message-container__edit'
              onClick={this.handleOnClickEdit}
              title='Edit message'
              type='button'
            >
              Edit
            </button>
            <button
              className='message-container__delete'
              onClick={this.handleOnClickDelete}
              title='Delete message'
              type='button'
            >
              x
            </button>
          </div>
        }
      </div>
    );
  }
}

export class MessageList extends React.Component {
  constructor(props) {
    super(props);
  }

  handleDeleteMessage = (uid) => {
    this.props.handleDeleteMessage(uid);
  }

  handleEditMessage = (message) => {
    this.props.handleEditMessage(message);
  }

  render() {
    return (
      <div className='chat-box-container'>
        {
          this.props.messages.map((message, i) => {
            //We compare the userUid on the message with our to know if its a message 
            //from yourself or not
            var fromSelf = message.userUid == this.props.currentUser.userUid;
            return (
              <Message
                key={i}
                user={message.user}
                messageState={message.messageState}
                text={message.text}
                uid={message.uid}
                fromSelf={fromSelf}
                handleEditMessage={this.handleEditMessage}
                handleDeleteMessage={this.handleDeleteMessage}
              />
            );
          })
        }
      </div>
    );
  }
}

export class MessageForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      uid: ''
    };
  }

  //If editMessage props is set we set the uid this way we know its not a new message
  //we also set the existing text to modify
  componentWillReceiveProps(nextProps) {
    if (nextProps.editMessage.uid != undefined) {
      this.setState({uid: nextProps.editMessage.uid, 'text': nextProps.editMessage.text});
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    //If state.uid is empty generate a new uid
    var message = {
      user : this.props.currentUser.name,
      userUid: this.props.currentUser.userUid,
      text : this.state.text,
      messageState : 'sending',
      uid : (this.state.uid != '' ? this.state.uid : guid())
    };

    //Do not send the message if its empty
    if (message.text != ''){
      this.props.onMessageSubmit(message); 
      this.setState({ text: '', uid: '' });
    }
  }

  handleOnChange = (e) => {
    this.setState({ text : e.target.value });
  }

  render() {
    return(
      <div className='message-form-container'>
        <form 
          className='message-form-container__form' 
          onSubmit={this.handleSubmit}
        >
          <input
            className='message-form-container__input'
            placeholder='write a message'
            onChange={this.handleOnChange}
            value={this.state.text}
          />
          <button
            className='message-form-container__button'
            type='submit'
          >
            Send
          </button>
        </form>
      </div>
    );
  }
}
