import React, { Component } from 'react';
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
      'forceModalOpen': false
    }
    this.setUsername = this.setUsername.bind(this);
    this.forceModalOpen = this.forceModalOpen.bind(this);
  }

  componentDidMount(){
    const socket = socketIOClient('http://localhost:8005');
    this.setState({
      socket
    });
  }

  setUsername(){
    this.setState({
      username: this.state.usernameInput,
      forceModalOpen: false
    });
  }

  forceModalOpen(){
    this.setState({
      forceModalOpen: true
    })
  }

  render() {
    return (
      <div className="App">
        { this.state.username && !this.state.forceModalOpen ? <ChatDisplay username={this.state.username} socket={this.state.socket} openModal={this.forceModalOpen}/> :
        <Modal isOpen={!this.state.username || this.state.forceModalOpen} className={this.props.className}>
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
