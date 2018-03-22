from flask import Flask, jsonify, Response
from flask_socketio import SocketIO, emit
from db_interface import connect_db, get_grouped_messages_for_user, create_message, find_message_by_id
from bson.json_util import dumps

HOST = 'localhost'
PORT = 8005
SECRET_KEY = 'somesecret'

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

socketio = SocketIO(app)


@socketio.on('create_new_message')
def handle_message(from_user, to_user, message):
    """
    Handles the create_new_message event from the frontend and creates a message in the database.
    After creation, a new event is emitted with the new document to clients who are listening
    to the 'newly_created_message' event

    :param str from_user: user that the message was sent from
    :param str to_user: user that the message was sent to
    :param str message: content of the message
    :return: None
    """

    insert_result = create_message(from_user, to_user, message)
    created_document = find_message_by_id(insert_result.inserted_id)
    created_document['_id'] = str(created_document['_id'])
    created_document['created'] = str(created_document['created'])
    emit('newly_created_message', {
        'data': created_document
    }, broadcast=True)


@app.route('/messages/<user_id>')
def get_messages_for_user(user_id):
    """
    Route used to fetch all messages for a given user

    :param str user_id: user to find messages for
    :return: Response that contains a JSON object mapping users to their messages (for a given user)
    """
    resp = Response(
            dumps(get_grouped_messages_for_user(user_id)), #  bson dumps is used because of mongo serialization issues
            mimetype='application/json'
    )

    #  TODO: this should be removed once the frontend and backend are on the same host
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


if __name__ == '__main__':
    print('Server is running on port '+ str(PORT))
    connect_db()
    socketio.run(app, host=HOST, port=PORT)