import os
import sys

sys.path.append(os.path.join(os.getcwd()))

import click

from src.handlers.main import get_album_list, upload_to_aws

from aws_lambda_powertools import Logger

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = Logger(service=None, xray_trace_id=None, timestamp=None)

@click.command()
@click.argument('album_ids', type=str)
def add_album(album_ids):
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



if __name__ == "__main__":
    add_album()