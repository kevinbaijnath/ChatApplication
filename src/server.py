from flask import Flask, jsonify, Response
from flask_socketio import SocketIO, emit
from db_interface import connect_db, get_grouped_messages_for_user, create_message, find_message_by_id
from bson.json_util import dumps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@socketio.on('create_new_message')
def handle_message(from_user, to_user, message):
    insertResult = create_message(from_user, to_user, message)
    createdDocument = find_message_by_id(insertResult.inserted_id)
    createdDocument['_id'] = str(createdDocument['_id'])
    createdDocument['created'] = str(createdDocument['created'])
    emit('newly_created_message', {
        'data': createdDocument
    }, broadcast=True)

@app.route('/messages/<user_id>')
def get_messages_for_user(user_id):
    resp = Response(
            dumps(get_grouped_messages_for_user(user_id)),
            mimetype='application/json'
    )
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

if __name__ == '__main__':
    print('Server is running on port 8005')
    connect_db()
    socketio.run(app, host='localhost', port=8005)