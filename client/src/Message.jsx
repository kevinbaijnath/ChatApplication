import React from 'react';

export default function Message(props){
    const { messageObject, username } = props;

    const fromUser = messageObject.from === username;
    const messageParentClass = fromUser ? "text-right" : "text-left";
    const messageDisplayClass = fromUser ? "to-message" : "from-message";
    return (
        <div className={`message-offset ${messageParentClass}`}>
            <span className={`message-display ${messageDisplayClass}`}>{ messageObject.message }</span>
        </div>
    )
}