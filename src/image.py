import sys
import json
import re
import os
import requests

sys.path.append(os.path.join(os.getcwd()))

from src import timeit

from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
from diffusers import DiffusionPipeline


os.environ['SPOTIPY_CLIENT_ID'] = '65a8170ced3243419460ee7a8568833e'
os.environ['SPOTIPY_CLIENT_SECRET'] = '236632e4ee7e4b28a1fdbfc17127ac7e'
os.environ['SPOTIPY_REDIRECT_URI'] = 'http://localhost'


path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@timeit
def create_images_for_round(album_id=None, n=3):
    if not album_id:
        album_id = input("Enter a spotify album URL/URI/ID: ")
    album_data = get_album_data(album_id)
    generate_multiple_covers(n=n **album_data)
    return album_data


@timeit
def generate_multiple_covers(n=3, start_idx=0, **kwargs):
    pipe = DiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
    pipe = pipe.to("mps")

    # Recommended if your computer has < 64 GB of RAM
    pipe.enable_attention_slicing()

    prompt = [ kwargs['title'] ] * n

    # Results match those from the CPU device after the warmup pass.
    i = 0
    for x in range(start_idx, start_idx+n):
        image = pipe(prompt).images[i]
        image.save('img/{}_{}_GEN_{}.png'.format(kwargs['id'], kwargs['formatted_title'], x))
        i += 1


@timeit
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
    with open('img/{}_{}_REAL.png'.format(album['id'], formatted_title), 'wb') as handler:
        handler.write(img)
    with open('data/{}.json'.format(album['id']), 'w') as handler:
        handler.write(json.dumps(album_data, indent=4))
    return album_data


def _format_title(title):
    punc = '''!()-[]{};:'",.'''

    title = title.lower().replace(' ', '_')
    for ele in title:
        if ele in punc:
            title = title.replace(ele, "")
    return title


def add_image_todo_list(album_id):
    sp = Spotify(client_credentials_manager=SpotifyClientCredentials())
    album = sp.album(album_id)
    with open(path + '/data/albums_todo.txt', 'a') as f:
        f.write(album['id'] + '\n')


if __name__ == "__main__":

    for album in [
        'https://open.spotify.com/album/6I58qJMqZHhb8jtNT3CuJB?si=z4ZMIc5sRMWg0JAh15bxJA',
        'https://open.spotify.com/album/6BRq5g6CWiFgN3NrjLGAYq?si=7flHfnRfSC-vsxrxKPJKwA',
        'https://open.spotify.com/album/41GuZcammIkupMPKH2OJ6I?si=Cd4dKOy0R1G1NW9mr-y7cQ',
        'https://open.spotify.com/album/4PWBTB6NYSKQwfo79I3prg?si=--tDISo7QVWJIFnGzI8eaw',
        'https://open.spotify.com/album/4dIPUQHheyH9e6ioplvNT2?si=TYcinHC3Tzqua6WxMxSGXg',
        'https://open.spotify.com/album/6NjOkiaNpDXEjXvBoN4JOj?si=Oc7gwYwoRx6oKJGmRppu9g',
        'https://open.spotify.com/album/7m2yEFYxnjmEyq7IXa9sXp?si=4ZGiSaAKSyW7fNX8SOm6yQ',
        'https://open.spotify.com/album/5Ki4YFQrUx7hCcQx1LJUQb?si=stQPGPdGSASlz7AKQuWRdA',
        'https://open.spotify.com/album/4Wwm4xg2748zhYuzDRFTgY?si=dY9ug89zS2yE1o9iFM28fQ',
        'https://open.spotify.com/album/6s4vWWWxNrGcKhrOFYRZzk?si=q2zsPPEOQEKty0ezOiWVuQ',
        'https://open.spotify.com/album/1UcS2nqUhxrZjrBZ3tHk2N?si=elzF9f1bS4i0YA_raKnU9w',
        'https://open.spotify.com/album/6nVACH6a27eOWiumAJhDWS?si=Q2gBGa-ORz2IwPFUZAb9Nw',
        'https://open.spotify.com/album/34vlTd4355ddD4q9pPsoqF?si=6zrngXc7RXaEVnxs504R8A',
        'https://open.spotify.com/album/2ANVost0y2y52ema1E9xAZ?si=2cxOlJQiQ9yFthGIRr__Xw',
        'https://open.spotify.com/album/2ZytN2cY4Zjrr9ukb2rqTP?si=YQ1rAvBXRoKe_2wjBjZOmA',
        'https://open.spotify.com/album/3Dz7wlDnf5GT8l0xg5r91q?si=yGfOWxefQziBDz-WVoAoZQ',
        'https://open.spotify.com/album/1dZZh7PvVgce1DDsDPzy8Z?si=KuKykR0TTXec5VKsyQT1tA',
        'https://open.spotify.com/album/0gpxUkqSnLwD50aaRir6jH?si=Toq57n8KQE-ctTdODW3q-w',
        'https://open.spotify.com/album/6xNFuLOko8gjxi5kUAyGyM?si=QoxtdePYQ0akmoBfhri7Eg',
        'https://open.spotify.com/album/6kzoWb4UzvKYgbDfAwgaFq?si=xEKCLn7sSiWmcJcg4e06Gw',
        'https://open.spotify.com/album/6pwuKxMUkNg673KETsXPUV?si=Nniq3QQbTSqMHH3kam_1Sg',
        'https://open.spotify.com/album/1OnCqi7IuzjnrOh2ZNvJHd?si=-TwUfYucQW-UWjbe9o633w',
        'https://open.spotify.com/album/5fy0X0JmZRZnVa2UEicIOl?si=MoFp5QARTaS_GFEfF5AdvA',
        'https://open.spotify.com/album/0bOEKxKa00RPU5OscdYdC5?si=MYd1wt-tT4CQ6qeeBCTc1g',
        'https://open.spotify.com/album/1yDakrbF2ddXhBd6c8bV0G?si=Ts9n-FyVTf-Ss8apprtclA',
        'https://open.spotify.com/album/4fdgcEVMdJe0KVgupMNJAP?si=56cHS4CIQsiXDl5IBnjThA',
        'https://open.spotify.com/album/0HiZ8fNXwJOQcrf5iflrdz?si=20moh5kwQOG924yAGhUwCA',
        'https://open.spotify.com/album/3RDqXDc1bAETps54MSSOW0?si=-EixT22RQUOn3eQgBSnDbw',
        'https://open.spotify.com/album/06SY6Ke6mXzZHhURLVU57R?si=Pss1a15SQOWCZODOfQMXCw',
        'https://open.spotify.com/album/5gDkjyJBK8VLZjKqqUd79K?si=AwW--YTUTw2ClBLtt9XOvw',
        'https://open.spotify.com/album/2eV6DIPDnGl1idcjww6xyX?si=iGoR-tnZSACg1kCxkdBkyw',
        'https://open.spotify.com/album/5dllg7LmHBB2pOSzr9aOg0?si=uzM4gT6BSKSXwTaKWNQgoA',
        'https://open.spotify.com/album/0V7TZQmJBgI81M9Z7GWxCI?si=v_x_P-qPSwSF8m0PzFQ2Yg',
        'https://open.spotify.com/album/6lBTYoX7ZzU2Xbf8RHAv0u?si=gtQ6iyArRLS6vNUIMaRxbA',
    ]:
        add_image_todo_list(album)
