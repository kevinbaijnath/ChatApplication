# Overview
This is a proof of concept application that enables two people to chat together.  It uses websockets to enable realtime communication between the chat participants.

Inspired by the Messages application in OSX and made with <3 using Python (Flask), Javascript (React.js) and MongoDB

# Why it was built this way

## Websockets
Websockets are used in this application because of their ability to provide realtime communication from a client and to a server.

## Backend
Flask was used on the backend because of its simple API and the ease of use during development.  It can also scale very well in production by adding more WSGI processes/threads

## Frontend
React.js was chosen on the frontend because of the

## Database
MongoDB was chosen as the DB because of its ease of use in development and its ability to scale in production.

# Prerequisites
Python 3.x  
NPM  
Yarn (can be installed using `npm install yarn`)  
Docker (used to run and install mongoDB.  Local mongo can be used instead if installed)

# Setup Instructions
Clone the repo  
`git clone https://github.com/kevinbaijnath/ChatApplication`

Navigate to the client directory install the dependencies by running the following command  
`yarn`

Navigate to the src directory and install the dependencies by running the following command    
`pip install -r requirements.txt`

(Optional) If mongoDB is not installed, you can set it up with the following following command    
`docker run --name database -d -p 27017:27017 mongo --noauth --bind_ip=0.0.0.0`

# How to run the application

In a terminal window (at the root directory) run the following command to start the server  
`python server.py`

In another terminal window run the following command to start the client code  
`yarn start`

In a browser navigate to http://localhost:3000

# How to scale the application

Depending on where the application load is occurring, different parts of the application may need to scale.

### Large amounts of messages being read
If there are a large amount of messages that are being read, there are several options.  One of the best options would be to verify that the mongo queries are  all using indexes (can be verified easily using .explain() on the query).  If they are not, indexes can be added.  Caching is also another option that can be used to prevent unnecessary DB access and reduce the load on the DB.  Another option would be to add a replica set to the database to spread the load.

### Large amounts of active users
If there are a large amount of active users then there may be some issues with the backend because of the amount of active connections to the server.  Because socket.io is used, sticky sessions are needed which means that in order to scale the backend, the clients need to connect to the same server.  One way to maintain this would be to have set a cookie on the client which would tell it which server to connect to.  The load balancer can then delegate new requests to servers that have a lower load.  This way, the backend can be scaled horizontally as the load increases. 

### Large amounts of messages being written
If there are a large number of messages that are being written, the mongoDB host may need to be scaled.  The easiest way to do this would be scale the host vertically (but the cost may be prohibitive).  If this is not feasible, another way to do scale the database would be by sharding.  The shard key could be a hash of the to and from fields (these would be moved to the _id).

## Future enhancements
1. Add indexes on the to, from and created fields.
2. Add registration/login capability
3. Add the ability to have group conversations
4. Add the ability to check if a user is typing (and send that event to other people in the chat)
5. Segment the users into channels to prevent broadcasting all of the messages to all of the users
6. Communicate over https (both REST API and Websocket)
