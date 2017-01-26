import React from 'react'
import {formatMessage, guid, findMessage, scrollDownChatView} from './tools.js'

export class UsersList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className='users-list-container'>
        <h3> Online Users </h3>
        <ul>
          {
            this.props.users.map((user, i) => {
              return (
                <li key={i}>
                  {user} 
                  {this.props.currentUser.name == user &&
                   <span className='users-list-container__info'>(me)</span>
                  }
                </li>
              );
            })
          }
        </ul>                
      </div>
    );
  }
}

export class ChangeNameForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newName: '',
      placeholder: 'Change name...'
    };
  }

  //We switch placeholder with the currentUser.state who's comming from the server
  componentWillReceiveProps(nextProps) {
    switch (nextProps.currentUser.state) {
      case 'nameTaken':
        var placeholder = 'Name already taken !';
        break;
      case 'invalidName':
        var placeholder = 'Name is invalid !';
        break;
      case 'ok':
      default:
          var placeholder = 'Change name...';
        break;
    }

    this.setState({placeholder: placeholder});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    var newName = this.state.newName;

    if(newName != ''){
      this.props.onChangeName(newName);    
      this.setState({ newName: '' });
    }
  }

  handleOnChange = (e) => {
    this.setState({ newName : e.target.value });
  }

  render() {
    return(
      <div className='change-name-form-container'>
        <form 
          className='change-name-form-container__form'
          onSubmit={e => this.handleSubmit(e)}
        >
          <input
            className='change-name-form-container__input'
            placeholder={this.state.placeholder}
            onChange={e => this.handleOnChange(e)}
            value={this.state.newName}
          />
          <button
            className='change-name-form-container__button'
            type='submit'
          >
            Change
          </button>
        </form>  
      </div>
    );
  }
}
