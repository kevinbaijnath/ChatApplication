import pymongo
import datetime

MONGODB_URI = 'mongodb://localhost:27017/'
DATABASE_NAME = 'message_db'
COLLECTION_NAME = 'messages'
DB_CONNECTION = None


def connect_db(uri=MONGODB_URI):
    """
    Sets the DB_CONNECTION
    :param str uri: (optional) Custom MongoDB URI to use.  Use
    :return: None
    """
    global DB_CONNECTION
    if not DB_CONNECTION:
        client = pymongo.MongoClient(uri)
        DB_CONNECTION = client[DATABASE_NAME][COLLECTION_NAME]


def create_message(from_username, to_username, message, connection=DB_CONNECTION):
    """
    Creates a new message in the DB and returns an InsertOneResult

    :param str from_username: username to
    :param str to_username:
    :param str message:
    :return: InsertOneResult
    :rtype: pymongo.results.InsertOneResult
    """
    return connection.insert_one({
        'message': message,
        'to': to_username,
        'from': from_username,
        'created': datetime.datetime.utcnow()
    })


def find_message_by_id(_id, connection=DB_CONNECTION):
    """
    Finds a message for a given id

    :param ObjectId _id: Object id of a message to search for
    :return: find_one result
    """
    return connection.find_one({
        '_id': _id
    })


def _get_all_relevant_users_related_to_user(user, connection=DB_CONNECTION):
    """
    Helper function that is used to determine which users have been sent messages by a given users and which messages
    have been sent from a given user

    :param str user:
    :rtype: set
    :return: Set that has all of the users who have communicated/been communicated with by a given user
    """
    pipeline = [
        {
            "$match":
                {"$or": [{"to": user}, {"from": user}]}
            },
        {
            "$group": {
                "_id": None,
                "uniqueTo": {"$addToSet": "$to"},
                "uniqueFrom": {"$addToSet": "$from"}
            }
        },
    ]

    pipeline_result = list(connection.aggregate(pipeline))

    if not pipeline_result:
        return None

    user_set = set([user])
    from_result = set(pipeline_result[0]['uniqueFrom']) - user_set
    to_result = set(pipeline_result[0]['uniqueTo']) - user_set
    return (from_result | to_result)


def get_grouped_messages_for_user(user, connection=DB_CONNECTION):
    """
    Used to get all messages that have been sent to and from a user

    :param str user: User to get messages for
    :return: dictionary mapping of users and messages
    :rtype: diict
    """
    relevant_users = _get_all_relevant_users_related_to_user(user)

    output = {}

    if not relevant_users:
        return output

    for relevant_user in relevant_users:
        query = connection.find({"$or": [
            {"to": relevant_user, "from": user},
            {"to": user, "from": relevant_user}
        ]}).sort([("constructed", pymongo.ASCENDING)])

        output[relevant_user] = list(query)

    return output
