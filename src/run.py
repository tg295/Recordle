import sys
import os
import logging
import random
import time

sys.path.append(os.path.join(os.getcwd()))

from src import timeit
from src.image import generate, check_cache
from src.action import tweet_question, tweet_answer

logging.basicConfig(stream=sys.stdout, level=logging.INFO)

path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WAIT_TIME = 60 * 60 * 4  # 4 hours - posts at 9am, get answer at 1pm (lunch time)


@timeit
def run_daily(use_cache=True, wait_time=WAIT_TIME, remove=True):
    album_data = generate_daily(use_cache=use_cache, remove=remove)
    tweet_question(**album_data)
    time.sleep(wait_time)
    tweet_answer(**album_data)


@timeit
def generate_daily(use_cache=True, remove=True):
    logging.debug('pulling first album from list')
    with open(path + '/data/albums.txt', 'r') as f:
        albums = [r.strip('\n') for r in f.readlines()]
    album_id = albums[0]
    logging.info('===== {} ===='.format(album_id))

    if use_cache:
        logging.info('checking cache for album {}'.format(album_id))
        album_data = check_cache(album_id)
        if album_data:
            logging.info('found cached files')
        else:
            logging.info('no cached files found - running for album {}'.format(album_id))
            album_data = generate(album_id)
    else:
        logging.info('running for album {}'.format(album_id))
        album_data = generate(album_id)

    logging.debug('updating list')
    if remove:
        albums.remove(album_id)
    random.shuffle(albums)
    with open(path + '/data/albums.txt', 'w') as f:
        f.write('\n'.join(albums))

    return album_data


@timeit
def run_manual(album_id=None, wait_time=WAIT_TIME):
    if not album_id:
        album_id = input("Enter a spotify album URL/URI/ID: ")
    album_data = generate(album_id)
    tweet_question(**album_data)
    time.sleep(wait_time)
    tweet_answer(**album_data)


if __name__ == "__main__":

    run_manual(wait_time=5)