import os
import sys

sys.path.append(os.path.join(os.getcwd()))

from src.handlers.main import run, upload_to_aws, download_from_aws

from aws_lambda_powertools import Logger

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = Logger(service=None, xray_trace_id=None, timestamp=None)


def redo_day():
    """
    remove latest done day and redo it in the event that it turns out badly
    """
    prefix = root+'/data'
    filepath = download_from_aws('albums_filtered.txt', '{}/albums_filtered.txt'.format(prefix))
    with open(filepath, 'r') as f:
        album_list = [x.strip('\n') for x in f.readlines()]
    with open(filepath, 'w') as f:
        f.write('\n'.join(album_list[:-1])+'\n')
    
    upload_to_aws(filepath, 'albums_filtered.txt')
    run()

if __name__ == "__main__":

    redo_day()