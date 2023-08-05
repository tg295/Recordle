import os
import sys

sys.path.append(os.path.join(os.getcwd()))

import click

from src.handlers.main import get_album_list, upload_to_aws, download_from_aws

from aws_lambda_powertools import Logger

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = Logger(service=None, xray_trace_id=None, timestamp=None)

# @click.command()
# @click.argument('album_ids', type=str)
def add_album_todo(album_ids):
    """ Add album(s) to the list of albums to download """
    album_ids = album_ids.split(',')
    albums = get_album_list(local=True)
    logger.info("total albums in list: {}".format(len(albums)))
    
    albums.extend(album_ids)
    albums = list(set(albums))
    
    prefix = root+'/data'

    with open('{}/albums_todo.txt'.format(prefix), 'w') as f:
        f.write('\n'.join(albums))
    upload_to_aws('{}/albums_todo.txt'.format(prefix), 'albums_todo.txt')
    logger.info('albums added: {}'.format(', '.join(album_ids)))
    logger.info("total albums in list: {}".format(len(albums)))

def remove_album_todo():
    pass

# @click.command()
# @click.argument('album_ids', type=str)
def add_album_todo_immediately(album_ids):
    """ Add album(s) to the list of albums to download """
    albums_new = album_ids.split(',')
    albums_old = get_album_list(local=True)
    logger.info("total albums in list: {}".format(len(albums_old)))
    
    albums_new.extend(albums_old)
    albums = list(set(albums_new))
    
    prefix = root+'/data'

    with open('{}/albums_todo.txt'.format(prefix), 'w') as f:
        f.write('\n'.join(albums))
    upload_to_aws('{}/albums_todo.txt'.format(prefix), 'albums_todo.txt')
    logger.info('albums added: {}'.format(album_ids))
    logger.info("total albums in list: {}".format(len(albums)))

# @click.command()
# @click.argument('album_id', type=str)
def add_album_complete(album_id):
    """ Add album to the list of albums that have been downloaded """
    prefix = root+'/data'
    filepath = download_from_aws('albums_filtered.txt', '{}/albums_filtered.txt'.format(prefix))
    with open(filepath, 'a') as f:
        f.write(album_id+'\n')
    upload_to_aws(filepath, 'albums_filtered.txt')
    logger.info('album {} added to albums_filtered.txt'.format(album_id))


if __name__ == "__main__":
    # add_album_todo_immediately("2aGFVLz0oQPa3uxCfq9lcU")
    add_album_todo("2tMQ2DeB9RydEFl1gcRkHb")
