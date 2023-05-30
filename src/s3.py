import os

root =os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

import boto3
from botocore.exceptions import NoCredentialsError

ACCESS_KEY = 'AKIAS5FZCEDIW46GQ46G'
SECRET_KEY = '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'
S3_ARN = 'arn:aws:s3:eu-west-2:200104091857:accesspoint/alt-covers-dev-access'

def upload_round(album_data, n):
    # upload real file
    filename = album_data['id'] + '_' + album_data['formatted_title'] + '_REAL.png'
    upload_img(filename)

    # upload generated files
    for x in range(n):
        filename = album_data['id'] + '_' + album_data['formatted_title'] + '_GEN_' + str(x) + '.png'
        upload_img(filename)

    # upload data
    upload_data(album_data['id'] + '.json')


def upload_img(filename: str):
    filepath = root + '/img/' + filename
    return upload_to_aws(filepath, S3_ARN, 'img/' + filename)


def upload_data(filename: str):
    filepath = root + '/data/' + filename
    return upload_to_aws(filepath, S3_ARN, 'data/' + filename)


def upload_to_aws(local_file, bucket, s3_file):
    s3 = boto3.client('s3', aws_access_key_id=ACCESS_KEY,
                      aws_secret_access_key=SECRET_KEY)

    try:
        s3.upload_file(local_file, bucket, s3_file)
        print("Upload Successful")
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False


if __name__ == "__main__":

    import json
    
    with open('/Users/theo/GitHub/personal/alt-covers/data/7nXJ5k4XgRj5OLg9m8V3zc.json', 'r') as f:
        album_data = json.load(f)
    upload_round(album_data, 3)
