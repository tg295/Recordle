import os
import sys

sys.path.append(os.path.join(os.getcwd()))

from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials

import pandas as pd
import requests
from datetime import datetime

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
print(root)
r = requests.get("https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/albums_todo.txt")

albums = r.text.split('\n')

os.environ['SPOTIPY_CLIENT_ID'] = '65a8170ced3243419460ee7a8568833e'
os.environ['SPOTIPY_CLIENT_SECRET'] = '236632e4ee7e4b28a1fdbfc17127ac7e'
os.environ['SPOTIPY_REDIRECT_URI'] = 'http://localhost'

sp = Spotify(client_credentials_manager=SpotifyClientCredentials())

df = pd.DataFrame()
idx = 0

for album in albums:

    album = sp.album(album)
    df = pd.concat([df, pd.DataFrame([{
            "id": album["id"],
            "artist": album["artists"][0]["name"],
            "name": album["name"],
            "label": album["label"],
            "release_date": album["release_date"],
            "total_tracks": album["total_tracks"],
        }])], ignore_index=True)
    
    idx += 1
    print('album {} of {}'.format(idx, len(albums)))

df.to_csv("{}/data/albums-todo-{}.csv".format(root, datetime.today().strftime("%Y%m%d")), index=False)