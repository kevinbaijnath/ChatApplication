import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ChatDisplay from './ChatDisplay';

import socketIOClient from 'socket.io-client';
import { Input, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      'username': '',
      'usernameInput': '',
      'socket': null,
    }
    this.setUsername = this.setUsername.bind(this);
  }

  componentDidMount(){
    const socket = socketIOClient('http://localhost:8005');
    this.setState({
      socket
    });
  }

  setUsername(){
    this.setState({
      username: this.state.usernameInput
    });
  }

  render() {
    return (
      <div className="App">
        { this.state.username ? <ChatDisplay username={this.state.username} socket={this.state.socket}/> :
        <Modal isOpen={!this.state.username} className={this.props.className}>
          <ModalHeader>Please enter a username to chat</ModalHeader>
          <ModalBody>
            <Input type="text" value={ this.state.usernameInput} onChange={(e) => this.setState({ usernameInput: e.target.value })} />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.setUsername}>Submit</Button>
          </ModalFooter>
        </Modal>
        }
      </div>
    );
  }
}

export default App;
