import sys
import os
import logging
import random

sys.path.append(os.path.join(os.getcwd()))

from src import timeit
from src.image import create_images_for_round, generate_multiple_covers, get_album_data
from src.s3 import upload_round

logging.basicConfig(stream=sys.stdout, level=logging.INFO)

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@timeit
def create_and_upload_round(n=3):
    logging.debug('pulling first album from list')
    albums = get_album_list()
    album_id = albums[0]
    logging.info('===== {} ===='.format(album_id))

    album_data = check_cache(album_id, n)
    if not album_data:
        logging.info('generating album data')
        album_data = create_images_for_round(album_id, n)

    logging.debug('updating lists')
    update_list(albums=albums, album_id=album_id)
    update_done(album_id=album_id)

    logging.info('uploading files to S3')
    upload_round(album_data, n)


@timeit
def check_cache(album_id, n):
    album_data = get_album_data(album_id)
    cached_files = []
    files = os.listdir(root + '/img')
    for f in files:
        if not f.startswith('.'):
            if f.split('_')[0] == album_id:
                if 'GEN' in f:
                    cached_files.append(f)

    n_missing_files = n - len(cached_files)
    if n_missing_files:
        logging.info('missing {} files'.format(n_missing_files))
        logging.info('generating files')
        generate_multiple_covers(n=n_missing_files, start_idx=len(cached_files), **album_data)
    else:
        logging.info('all files cached')
    return album_data


def get_album_list():
    with open(root + '/data/albums_todo.txt', 'r') as f:
        return [r.strip('\n') for r in f.readlines()]
    
@timeit
def update_list(albums, album_id, remove=True):
    albums = list(set(albums))  # remove duplicates
    if remove:
        albums.remove(album_id)
    random.shuffle(albums)
    with open(root + '/data/albums_todo.txt', 'w') as f:
        f.write('\n'.join(albums))
    
@timeit
def update_done(album_id):
    with open(root + '/data/albums_ready.txt', 'a') as f:
        f.write(album_id+'\n')


if __name__ == "__main__":
    
    create_and_upload_round()
    