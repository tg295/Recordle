import os

import click

from src.handlers.main import get_album_list, upload_to_aws

from aws_lambda_powertools import Logger

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# new_albums = [
# 'https://open.spotify.com/album/0GPvraFrPjbXzY0H3fcudk?si=pcmN-0sTR3mlXs1ze27U2g',
# 'https://open.spotify.com/album/6PanEvuo9ZNvGT39v50xp6?si=STpYdmlRQJ6LsISTwLx95g',
# 'https://open.spotify.com/album/6haDxdERWK3rdVCGc2jr8E?si=QEWiTjfBSXyxOHW_DFoIeA'
# ]


logger = Logger(service=None, xray_trace_id=None, timestamp=None)

@click.argument('album_id', type=str, help='Album ID, or comma separated list of IDs')
def add_album(album_ids):
    """ Add album(s) to the list of albums to download """
    album_ids = album_ids.split(',')
    albums = get_album_list()
    
    albums.extend(album_ids)
    albums = list(set(albums))

    prefix = root+'/data'

    with open('{}/albums_todo.txt'.format(prefix), 'w') as f:
        f.write('\n'.join(albums))
    upload_to_aws('{}/albums_todo.txt'.format(prefix), 'albums_todo.txt')
    logger.info('albums added: {}'.format(', '.join(album_ids)))


if __name__ == "__main__":
    add_album()