import React, { Component } from 'react';
import { Container, Row, Col, Card, CardTitle, CardText, Input } from 'reactstrap';
import './ChatDisplay.css';
import Message from './Message';

const BASEURL = 'http://localhost:8005';

export default class ChatDisplay extends Component {
  constructor(props){
    super(props);
    this.state = {
        'messages': {},
        'activeConversationUser': '',
        'conversation': [],
        'newMessageToUser': '',
        'newMessageToWrite': ''
    }

    this.createNewMessageToUser = this.createNewMessageToUser.bind(this);
    this.setNewUserInput = this.setNewUserInput.bind(this);
    this.sendNewMessage = this.sendNewMessage.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  componentDidMount(){
      fetch(`${BASEURL}/messages/${this.props.username}`)
      .then((response) => {
        return response.json()
      })
      .then((messages) => {
        this.setState({
            'messages': messages
        });
      });

      const { socket } = this.props;
      if(!socket){
          return;
      }
      
      const componentContext = this;
      socket.on('newly_created_message', (result) => {
        const { messages } = componentContext.state;
        const { to, from } = result.data;

        if(componentContext.props.username !== from && componentContext.props.username !== to){
            return;
        }
        const indexToMessages = componentContext.props.username !== to ? to : from;
        const newMessages = Object.assign({}, messages);
        const newMessageForUser = newMessages[indexToMessages].slice();
        newMessageForUser.push(result.data);
        newMessages[indexToMessages] = newMessageForUser;
        componentContext.setState({
            'messages': newMessages,
            'newMessageToWrite': '',
            'conversation': newMessageForUser,
        }, () => {
            componentContext.forceUpdate();
            componentContext.scrollToBottom();
        });
      });
  }

  scrollToBottom(behavior="smooth") {
    if(this.endOfMessages){
        this.endOfMessages.scrollIntoView({ behavior });
    }
  }

  cardClick(person){
    const messagesWithPerson = this.state.messages[person];
    const hasNoMessages = (!messagesWithPerson || messagesWithPerson.length === 0);
    const conversation = hasNoMessages ? [] : messagesWithPerson

    this.setState({
        'activeConversationUser': person,
        'conversation': conversation,
        'newMessageToWrite': ''
    }, () => this.scrollToBottom("instant"));
  }

  setNewUserInput(e){
    this.setState({
        'newMessageToUser': e.target.value
    });
  }

  createNewMessageToUser(e,isKeyPress){
    if(isKeyPress && (e.key !== 'Enter')){
        return;
    }

    const { newMessageToUser, messages } = this.state;
    if(!newMessageToUser){
        return;
    }

    const newMessages =  Object.assign({}, messages);
    if(!newMessages[newMessageToUser]){
        newMessages[newMessageToUser] = [];
    }

    this.setState({
        'messages': newMessages,
        'newMessageToUser': '',
    });

    this.cardClick(newMessageToUser);
  }

  sendNewMessage(e){
    const {newMessageToWrite, activeConversationUser } = this.state;
    const { socket, username } = this.props;
    if(!activeConversationUser || (e.key !== 'Enter') || (!newMessageToWrite)){
        return;
    }

    if(!socket){
        console.log('The socket was unable to be connected for some reason');
        return;
    }

    socket.emit('create_new_message', username, activeConversationUser, newMessageToWrite);
    console.log(`submitting ${newMessageToWrite}`)
  }

  logout(e){
      e.preventDefault();
      this.props.openModal();
  }

  render(){
    return(
        <Container fluid={true}>
            <Row>
                <Col md="4" sm="4" className="card-section">
                    <div>
                        <div className="input-group new-message-user-input">
                            <Input type="text" value={this.state.newMessageToUser} onChange={ this.setNewUserInput } className="form-control" onKeyPress={ (e) => this.createNewMessageToUser(e, true) }/>
                            <span className="input-group-addon">
                                <button onClick={ this.createNewMessageToUser }>
                                    <i className="fas fa-edit fa-2x"></i>
                                </button>
                            </span>
                        </div>
                        <div className="message-list">
                            { Object.keys(this.state.messages).map((person) => {
                                const className = (person === this.state.activeConversationUser) ? 'conversationpicker-set'  : 'conversationpicker-default';
                                return (
                                    <Card key={person} onClick={ this.cardClick.bind(this, person) } className={className}>
                                        <CardTitle>{person}</CardTitle>
                                        <CardText>{''}</CardText>
                                    </Card>
                                )
                            }) }
                        </div>
                        <div className="user-information">Logged in as {this.props.username}</div>
                        { // <a href="" onClick={this.switchUser}>(switch user)</a> 
                        }
                    </div>
                </Col>
                <Col sm="8" md="8" className="message-section">
                    <div className="message-section-header">
                        { this.state.activeConversationUser ? 
                            `Chatting with ${this.state.activeConversationUser}` : 'Select someone to chat with or start a new conversation' }
                    </div>
                    <div className="message-section-content">
                        <div className="message-list">
                            {
                                this.state.activeConversationUser ? 
                                    this.state.conversation.map((convo, index) => {
                                        return (
                                            <Message key={index} messageObject={convo} username={this.props.username} />
                                        );
                                    })
                                    : null
                            }
                            <div ref={(el) => { this.endOfMessages = el; }} />
                        </div>
                        <div>
                            <Input type="text" value={this.state.newMessageToWrite}
                                onChange={(e) => this.setState({newMessageToWrite: e.target.value})} className="new-message-input"
                                onKeyPress={ this.sendNewMessage } />
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    )
  }
}
