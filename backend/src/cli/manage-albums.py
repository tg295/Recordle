import os
import sys

sys.path.append(os.path.join(os.getcwd()))

import click

from src.handlers.main import get_album_list, upload_to_aws, download_from_aws

from aws_lambda_powertools import Logger

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = Logger(service=None, xray_trace_id=None, timestamp=None)

def _format_spotify_url(url):
    if 'https://open.spotify.com/album/' in url:
        album_id = url.split('https://open.spotify.com/album/')[1].split('?')[0]
    elif 'spotify:album:' in url:
        album_id = url.split('spotify:album:')[1]
    else:
        album_id = url
    return album_id

@click.group()
def manage():
    pass

@manage.command()
@click.argument('album_ids', type=str)
def add_album_todo(album_ids):
    """ Add album(s) to the list of albums to download """
    album_ids = album_ids.split(',')
    album_ids = [_format_spotify_url(a) for a in album_ids]
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

@manage.command()
@click.argument('album_id', type=str)
def remove_album_todo(album_id: str):
    album_id = _format_spotify_url(album_id)
    prefix = root+'/data'
    albums = get_album_list(local=True)
    logger.info("total albums in list: {}".format(len(albums)))
    albums.remove(album_id)
    with open('{}/albums_todo.txt'.format(prefix), 'w') as f:
        f.write('\n'.join(albums))
    upload_to_aws('{}/albums_todo.txt'.format(prefix), 'albums_todo.txt')
    logger.info('album removed: {}'.format(album_id))
    logger.info("total albums in list: {}".format(len(albums)))

@manage.command()
@click.argument('album_ids', type=str)
def add_album_todo_immediately(album_ids):
    """ Add album(s) to the list of albums to download """
    albums_new = album_ids.split(',')
    albums_new = [_format_spotify_url(a) for a in albums_new]

    albums_old = get_album_list(local=True)
    logger.info("total albums in list: {}".format(len(albums_old)))
    
    albums_new.extend(albums_old)
    albums = sorted(set(albums_new), key=albums_new.index)
    
    prefix = root+'/data'

    with open('{}/albums_todo.txt'.format(prefix), 'w') as f:
        f.write('\n'.join(albums))
    upload_to_aws('{}/albums_todo.txt'.format(prefix), 'albums_todo.txt')
    logger.info('albums added: {}'.format(album_ids))
    logger.info("total albums in list: {}".format(len(albums)))

@manage.command()
@click.argument('album_id', type=str)
def add_album_complete(album_id):
    """ Add album to the list of albums that have been downloaded """
    prefix = root+'/data'
    filepath = download_from_aws('albums_filtered.txt', '{}/albums_filtered.txt'.format(prefix))
    with open(filepath, 'a') as f:
        f.write(album_id+'\n')
    upload_to_aws(filepath, 'albums_filtered.txt')
    logger.info('album {} added to albums_filtered.txt'.format(album_id))


if __name__ == "__main__":
    manage()
