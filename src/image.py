import sys
import re
import os
import requests
import random
from PIL import Image
from datetime import datetime

sys.path.append(os.path.join(os.getcwd()))

from src import timeit

from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
from diffusers import DiffusionPipeline
from matplotlib import pyplot as plt


os.environ['SPOTIPY_CLIENT_ID'] = '65a8170ced3243419460ee7a8568833e'
os.environ['SPOTIPY_CLIENT_SECRET'] = '236632e4ee7e4b28a1fdbfc17127ac7e'
os.environ['SPOTIPY_REDIRECT_URI'] = 'http://localhost'


path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _format_title(title):
    punc = '''!()-[]{};:'",.'''

    title = title.lower().replace(' ', '_')
    for ele in title:
        if ele in punc:
            title = title.replace(ele, "")
    return title


@timeit
def get_album_data(album_id):
    sp = Spotify(client_credentials_manager=SpotifyClientCredentials())
    album = sp.album(album_id)
    img = requests.get(album['images'][1]['url']).content
    title = re.sub("[\(\[].*?[\)\]]", "", album['name']).strip()
    formatted_title = _format_title(title)
    with open('img/{}_{}_REAL.png'.format(album['id'], formatted_title), 'wb') as handler:
        handler.write(img)
    return {
        "id": album['id'],
        'artist': album['artists'][0]['name'],
        "label": album['label'],
        "title": title,
        "formatted_title": formatted_title,
        "release_date": album['release_date'],
        "total_tracks": album['total_tracks'],
        "track_names": [track['name'] for track in album['tracks']['items']]
    }


@timeit
def generate_new_cover(**kwargs):
    pipe = DiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
    pipe = pipe.to("mps")

    # Recommended if your computer has < 64 GB of RAM
    pipe.enable_attention_slicing()

    prompt = kwargs['title']

    # Results match those from the CPU device after the warmup pass.
#     imgs = pipe(prompt).images[0]
    image = pipe(prompt).images[0]
    time_generated = datetime.utcnow().strftime('%Y%m%d%H%M')
    image.save('img/{}_{}_GEN_{}.png'.format(kwargs['id'], kwargs['formatted_title'], time_generated))
    return time_generated


@timeit
def plot_imgs(time_generated, **kwargs):
    # create figure
    fig = plt.figure(figsize=(10, 7))

    # setting values to rows and column variables
    rows = 1
    columns = 2

    # reading images
    fq = 'img/{}_{}_GEN_{}.png'.format(kwargs['id'], kwargs['formatted_title'], time_generated)

    Image1 = Image.open('img/{}_{}_REAL.png'.format(kwargs['id'], kwargs['formatted_title']))
    Image2 = Image.open(fq)

    # Adds a subplot at the 1st position
    fig.add_subplot(rows, columns, 1)

    # showing image
    plt.imshow(Image1)
    plt.axis('off')
    plt.title("Real")

    # Adds a subplot at the 2nd position
    fig.add_subplot(rows, columns, 2)

    # showing image
    plt.imshow(Image2)
    plt.axis('off')
    plt.title("Generated")

    fig.suptitle('{} - "{}"'.format(kwargs['artist'], kwargs['title']), fontsize=18)
    plt.tight_layout(rect=[0, 0.03, 1, 1.1])

    fa = 'img/{}_{}_COMB_{}.png'.format(kwargs['id'], kwargs['formatted_title'], time_generated)
    plt.savefig(fa)
    return fq, fa


@timeit
def generate(album_id=None):
    if not album_id:
        album_id = input("Enter a spotify album URL/URI/ID: ")
    album_data = get_album_data(album_id)
    time_generated = generate_new_cover(**album_data)
    fq, fa = plot_imgs(time_generated, **album_data)
    album_data['fig_question'] = fq
    album_data['fig_answer'] = fa
    return album_data


@timeit
def check_cache(album_id, pick='first'):
    cached_files = []
    files = os.listdir(path + '/img')
    for f in files:
        if not f.startswith('.'):
            if f.split('_')[0] == album_id:
                if 'GEN' in f:
                    cached_files.append(f)
    if cached_files:
        album_data = get_album_data(album_id)
        cached_files.sort()
        if pick == 'first':
            fq = cached_files[0]
        elif pick == 'last':
            fq = cached_files[-1]
        elif pick == 'random':
            fq = random.choice(cached_files)

        album_data['fig_question'] = fq
        album_data['fig_answer'] = fq.replace('GEN', 'COMB')
        return album_data
