import os

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

files = os.listdir(root + '/img')

album_ids = list(set([f.split('_')[0] for f in files]))

for album_id in album_ids:

    print(album_id)
    # rename dates to index
    album_files = [f for f in files if (f.split('_')[0] == album_id) and ('GEN' in f)]
    album_files.sort()
    for i, f in enumerate(album_files):
        os.rename(root + '/img/' + f, root + '/img/' + f.replace(f.split('_')[-1].split('.png')[0], str(i)))