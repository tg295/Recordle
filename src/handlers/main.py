"""Track parser handler"""
import re
import os
from datetime import datetime
import logging
from typing import Dict, Any
import json
import requests
import random

import boto3
from botocore.exceptions import NoCredentialsError
from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.typing import LambdaContext
from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
import replicate


ACCESS_KEY = 'AKIAS5FZCEDIW46GQ46G'
SECRET_KEY = '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'
S3_ARN = 'arn:aws:s3:eu-west-2:200104091857:accesspoint/alt-covers-dev-access'
BUCKET = 'alt-covers-bucket'
MODEL = "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478"

os.environ['SPOTIPY_CLIENT_ID'] = '65a8170ced3243419460ee7a8568833e'
os.environ['SPOTIPY_CLIENT_SECRET'] = '236632e4ee7e4b28a1fdbfc17127ac7e'
os.environ['SPOTIPY_REDIRECT_URI'] = 'http://localhost'
os.environ['REPLICATE_API_TOKEN'] = 'r8_ZiG5mCM2SipC5enyyXJ0lS41GyZycZG0f4ayi'

logger = Logger(service=None, xray_trace_id=None, timestamp=None)

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def handler(event: Dict[str, Any], context: LambdaContext) -> Dict[str, Any]:
    # crude handling of different event types
    today = datetime.today().strftime("%Y-%m-%d")
    logger.info("Running for date: {}".format(today))


def run(remove=True):
    album_list = get_album_list()
    album_id = album_list[0]
    logging.info('===== {} ===='.format(album_id))
    create_and_upload_images(album_id)
    update_list(album_list, album_id, remove)
    update_done(album_id)


def get_album_list():
    filepath = download_from_aws('albums_todo.txt', 'data/albums_todo.txt')
    with open('{}/{}'.format(root, filepath), 'r') as f:
        album_list = [r.strip('\n') for r in f.readlines()]
    return album_list    


def create_and_upload_images(album_id, n=3):
    album_data = get_album_data(album_id)
    generate_covers(album_data, n)


def get_album_data(album_id):
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
    filename = 'img/{}_{}_REAL.png'.format(album['id'], formatted_title)
    with open('{}/{}'.format(root, filename), 'wb') as f:
        f.write(img)
    upload_to_aws('{}/{}'.format(root, filename), filename)
    
    filename = 'data/{}.json'.format(album['id'])
    with open('{}/{}'.format(root, filename), 'w') as f:
        f.write(json.dumps(album_data, indent=4))
    upload_to_aws('{}/{}'.format(root, filename), filename)

    return album_data


def _format_title(title):
    punc = '''!()-[]{};:'",.'''

    title = title.lower().replace(' ', '_')
    for ele in title:
        if ele in punc:
            title = title.replace(ele, "")
    return title


def generate_covers(album_data, n=3):
    for x in range(n):
       url = replicate.run(
            MODEL,
            input={"prompt": album_data['title']}
        )[0]
       r = requests.get(url)
       filename = "img/{}_{}_GEN_{}.png".format(album_data['id'], album_data['formatted_title'], x)
       with open("{}/{}".format(root, filename), 'wb') as f:
            f.write(r.content)
       upload_to_aws("{}/{}".format(root, filename), filename)
       logger.info("upload {} complete".format(x+1))


def update_list(albums, album_id, remove=True):
    albums = list(set(albums))  # remove duplicates
    if remove:
        albums.remove(album_id)
    random.shuffle(albums)
    with open('{}/data/albums_todo.txt'.format(root), 'w') as f:
        f.write('\n'.join(albums))
    upload_to_aws('{}/data/albums_todo.txt'.format(root), 'albums_todo.txt')
    

def update_done(album_id):
    filepath = download_from_aws('albums_done.txt', 'data/albums_done.txt')
    with open('{}/{}'.format(root, filepath), 'a') as f:
        f.write(album_id+'\n')
    upload_to_aws(filepath, 'albums_done.txt')


def upload_to_aws(local_file, s3_file, bucket=BUCKET):
    s3 = get_boto3_client()
    try:
        s3.upload_file(local_file, bucket, s3_file)
        return True
    except FileNotFoundError:
        logger.warning("The file was not found")
        return False
    except NoCredentialsError:
        logger.warning("Credentials not available")
        return False
    
def download_from_aws(s3_file, local_file, bucket=BUCKET):
    s3 = get_boto3_client()
    try:
        s3.download_file(bucket, s3_file, local_file)
        return local_file
    except FileNotFoundError:
        logger.warning("The file was not found")
        return False
    except NoCredentialsError:
        logger.warning("Credentials not available")
        return False
    

def get_boto3_client():
    return boto3.client('s3', aws_access_key_id=ACCESS_KEY,
                      aws_secret_access_key=SECRET_KEY)
    

if __name__ == "__main__":

    run()


