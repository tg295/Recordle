import os
import sys

sys.path.append(os.path.join(os.getcwd()))


"""Track parser handler"""
import re

from datetime import datetime
from typing import Dict, Any
import json
import requests
import random

from src.ig import post_to_instagram

import boto3
from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.typing import LambdaContext
from aws_lambda_powertools.utilities import parameters

from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
import replicate

start = datetime(2023, 6, 5)
DAY = (datetime.now() - start).days

ACCESS_KEY = parameters.get_parameter("/recordle/s3_access_key", decrypt=True)
SECRET_KEY = parameters.get_parameter("/recordle/s3_secret_key", decrypt=True)
BUCKET = 'alt-covers-bucket'
MODEL = "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478"

os.environ['SPOTIPY_CLIENT_ID'] = parameters.get_parameter("/recordle/spotify_client_id", decrypt=True)
os.environ['SPOTIPY_CLIENT_SECRET'] = parameters.get_parameter("/recordle/spotify_client_secret", decrypt=True)
os.environ['SPOTIPY_REDIRECT_URI'] = parameters.get_parameter("/recordle/spotify_redirect_uri", decrypt=True)
os.environ['REPLICATE_API_TOKEN'] = parameters.get_parameter("/recordle/replicate_api_token", decrypt=True)

logger = Logger(service=None, xray_trace_id=None, timestamp=None)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def handler(event: Dict[str, Any], context: LambdaContext) -> Dict[str, Any]:
    # crude handling of different event types
    today = datetime.today().strftime("%Y-%m-%d")
    logger.info("Running for date: {}".format(today))
    run(n=event.get("n", 3), remove=event.get("remove", True))
    logger.info("Finished.")


def run(n=3, remove=True, local=False):
    album_list = get_album_list(local)
    album_id = album_list[0]
    logger.info('===== {} ===='.format(album_id))
    album_data = create_and_upload_images(album_id, local, n)
    update_list(album_list, album_id, remove, local)
    update_done(album_id, local)
    post_to_instagram(album_data, BUCKET, DAY)


def get_album_list(local):
    if local:
        prefix = root+'/data'
    else:
        prefix = '/tmp'
    
    filepath = download_from_aws('albums_todo.txt', '{}/albums_todo.txt'.format(prefix))
    with open(filepath, 'r') as f:
        album_list = [r.strip('\n') for r in f.readlines()]
    
    if not local:
        os.remove(filepath)
    return album_list    


def create_and_upload_images(album_id, local, n=3):
    album_data = get_album_data(album_id, local)
    generate_covers(album_data, local, n)
    return album_data


def get_album_data(album_id, local):
    if local:
        prefix = root+'/img'
    else:
        prefix = '/tmp'

    sp = Spotify(client_credentials_manager=SpotifyClientCredentials())
    album = sp.album(album_id)
    img = requests.get(album['images'][1]['url']).content
    title = re.sub("[\(\[].*?[\)\]]", "", album['name']).strip()
    formatted_title = _format_title(title)
    album_data = {
        "id": album['id'],
        'artist': album['artists'][0]['name'],
        "label": album['label'],
        "title": title,
        "formatted_title": formatted_title,
        "release_date": album['release_date'],
        "total_tracks": album['total_tracks']
    }
    filename = '{}_{}_REAL.png'.format(album['id'], formatted_title)

    if local:
        prefix = root+'/img'
    else:
        prefix = '/tmp'

    filepath = '{}/{}'.format(prefix, filename)
    fileloc = 'img/{}'.format(filename)

    with open(filepath, 'wb') as f:
        f.write(img)
    upload_to_aws(filepath, fileloc)
    if not local:
        os.remove(filepath)
    

    filename = '{}.json'.format(album['id'])

    if local:
        prefix = root+'/data'
    else:
        prefix = '/tmp'

    filepath = '{}/{}'.format(prefix, filename)
    fileloc = 'data/{}'.format(filename)

    with open(filepath, 'w') as f:
        f.write(json.dumps(album_data, indent=4))
    upload_to_aws(filepath, fileloc)
    if not local:
        os.remove(filepath)

    return album_data


def _format_title(title):
    punc = '''()-[]{};:'",./@#$%^*~'''

    title = title.lower().replace(' ', '_')
    for ele in title:
        if ele in punc:
            title = title.replace(ele, "")
    return title


def generate_covers(album_data, local, n=3):
    if local:
        prefix = root+'/img'
    else:
        prefix = '/tmp'

    for x in range(n):
       url = replicate.run(
            MODEL,
            input={"prompt": 'A picture or scene that encapsulates the phrase "{}"'.format(album_data['title']), "negative_prompt":"typography, text, writing, titles"}
        )[0]
       r = requests.get(url)

       filename = "{}_{}_GEN_{}.png".format(album_data['id'], album_data['formatted_title'], x)
       filepath = '{}/{}'.format(prefix, filename)
       fileloc = 'img/{}'.format(filename)

       with open(filepath, 'wb') as f:
            f.write(r.content)
       upload_to_aws(filepath, fileloc)
       logger.info("upload {} complete".format(x+1))
       if not local:
            os.remove(filepath)


def update_list(albums, album_id, remove=True, local=False):
    if local:
        prefix = root+'/data'
    else:
        prefix = '/tmp'
        
    albums = list(set(albums))  # remove duplicates
    if remove:
        albums.remove(album_id)
    random.shuffle(albums)
    with open('{}/albums_todo.txt'.format(prefix), 'w') as f:
        f.write('\n'.join(albums))
    upload_to_aws('{}/albums_todo.txt'.format(prefix), 'albums_todo.txt')
    

def update_done(album_id, local):
    if local:
        prefix = root+'/data'
    else:
        prefix = '/tmp'

    filepath = download_from_aws('albums_done.txt', '{}/albums_done.txt'.format(prefix))
    with open(filepath, 'a') as f:
        f.write(album_id+'\n')
    upload_to_aws(filepath, 'albums_done.txt')

    # temporarily update filtered too
    filepath = download_from_aws('albums_filtered.txt', '{}/albums_filtered.txt'.format(prefix))
    with open(filepath, 'a') as f:
        f.write(album_id+'\n')
    upload_to_aws(filepath, 'albums_filtered.txt')


def upload_to_aws(local_file, s3_file, bucket=BUCKET):
    s3 = get_boto3_client()
    s3.upload_file(local_file, bucket, s3_file)


def download_from_aws(s3_file, local_file, bucket=BUCKET):
    s3 = get_boto3_client()
    s3.download_file(bucket, s3_file, Filename=local_file)
    return local_file
    

def get_boto3_client():
    return boto3.client('s3', aws_access_key_id=ACCESS_KEY,
                      aws_secret_access_key=SECRET_KEY)

