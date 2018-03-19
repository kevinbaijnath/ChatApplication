#docker command
#docker run --name database -d -p 27017:27017 mongo --noauth --bind_ip=0.0.0.0
import pymongo
import datetime
MONGODB_URI = 'mongodb://localhost:27017/'
DB_CONNECTION = None

def connect_db(uri=MONGODB_URI):
    global DB_CONNECTION
    if not DB_CONNECTION:
        client = pymongo.MongoClient(uri)
        DB_CONNECTION = client['message_db']['messages']

def create_message(from_username, to_username, message):
    return DB_CONNECTION.insert_one({
        'message': message,
        'to': to_username,
        'from': from_username,
        'created': datetime.datetime.utcnow()
    })

def list_messages_for_user(user):
    return list(DB_CONNECTION.find({
        'from': user
    }))

def list_messages_to_user(user):
    return list(DB_CONNECTION.find({
        'to': user
    }))

def find_message_by_id(id):
    return DB_CONNECTION.find_one({
        '_id': id
    })

def _get_all_relevant_users_related_to_user(user):
    pipeline = [
        {
            "$match":
                {"$or": [{ "to": user},{"from": user}] }
            },
        {
            "$group": {
                "_id": None,
                "uniqueTo": { "$addToSet": "$to" },
                "uniqueFrom": { "$addToSet": "$from" }
            }
        },
    ]

    pipeline_result = list(DB_CONNECTION.aggregate(pipeline))

    if not pipeline_result:
        return None

    user_set = set([user])
    from_result = set(pipeline_result[0]['uniqueFrom']) - user_set
    to_result = set(pipeline_result[0]['uniqueTo']) - user_set

    return (from_result | to_result)

def get_grouped_messages_for_user(user):
    relevant_users = _get_all_relevant_users_related_to_user(user)

    output = {}

    if not relevant_users:
        return output

    for relevant_user in relevant_users:
        query = DB_CONNECTION.find({"$or": [
            { "to": relevant_user, "from": user },
            { "to": user, "from": relevant_user}
        ]}).sort([("constructed", pymongo.ASCENDING)])

        output[relevant_user] = list(query)

    return output
