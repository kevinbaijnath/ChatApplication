from mock import MagicMock

def test_create_message():
    from ..db_interface import create_message
    mock_connection = MagicMock()
    create_message('test1','test2','test3', connection=mock_connection)
    assert mock_connection.insert_one.called

def test_find_message_by_id():
    from ..db_interface import find_message_by_id

    fake_id = MagicMock()
    mock_connection = MagicMock()
    find_message_by_id(fake_id, connection=mock_connection)
    mock_connection.find_one.assert_called_once_with({ '_id': fake_id})