import os

# import twitter
import requests
import base64

os.environ['TWITTER_API_KEY'] = "RIpGUZrQVN0N134LhGoWT7si1"
os.environ['TWITTER_API_SECRET'] = "xcUEDCzhhlZtJ2BCQRhtEVXyAkUJ0gfoeqmRPdMzhjx5AyTyme"
os.environ['TWITTER_BEARER_TOKEN'] = "AAAAAAAAAAAAAAAAAAAAAALYnQEAAAAArNotFB9oDcbh6HY3QKYNty2Ggdg%3DBzAaQmJpKdoclKDBNJISx7yyTzmK1eJs49xOyckGL2eOP1gJNt"
os.environ['TWITTER_ACCESS_TOKEN'] = "1657304065213071361-xEoVA3heG4iptXoZVm45BocjtPoyoa"
os.environ['TWITTER_ACCESS_TOKEN_SECRET'] = "d604DSlW55yTG3zsHz5bLJEpQ4xEy6Ly4zt7gwjn9Ed9u"

path = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/img/'

# def twitter_client():
#     return twitter.Api(consumer_key=os.environ['TWITTER_API_KEY'],
#                       consumer_secret=os.environ['TWITTER_API_SECRET'],
#                       access_token_key=os.environ['TWITTER_ACCESS_TOKEN'],
#                       access_token_secret=os.environ['TWITTER_ACCESS_TOKEN_SECRET'])     

consumer_key=os.environ['TWITTER_API_KEY']
consumer_secret=os.environ['TWITTER_API_SECRET']

def tweet_question(**kwargs):


    # #Reformat the keys and encode them
    # key_secret = '{}:{}'.format(consumer_key, consumer_secret).encode('ascii')
    # #Transform from bytes to bytes that can be printed
    # b64_encoded_key = base64.b64encode(key_secret)
    # #Transform from bytes back into Unicode
    # b64_encoded_key = b64_encoded_key.decode('ascii')

    # base_url = 'https://api.twitter.com/'
    # auth_url = '{}oauth2/token'.format(base_url)
    # auth_headers = {
    #     'Authorization': 'Basic {}'.format(b64_encoded_key),
    #     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    # }
    # auth_data = {
    #     'grant_type': 'client_credentials'
    # }
    # auth_resp = requests.post(auth_url, headers=auth_headers, data=auth_data)
    # print(auth_resp.status_code)
    # access_token = auth_resp.json()['access_token']
    # print(access_token)
    auth_data = {
        'grant_type': 'client_credentials'
    }
    file = open(path+kwargs['fig_question'], 'rb')
    data = file.read()
    resource_url='https://upload.twitter.com/1.1/media/upload.json'
    upload_image={
        'media':data,
        'media_category':'tweet_image'}
        
    image_headers = {
        'Authorization': 'Bearer {}'.format(os.environ['TWITTER_BEARER_TOKEN'])    
    }
    media_id=requests.post(resource_url,headers=image_headers, params=upload_image)
    print(media_id.text)

    tweet_meta={ "media_id": media_id,
    "alt_text": {
        "text":"AlbumCover" 
    }}
    metadata_url = 'https://upload.twitter.com/1.1/media/metadata/create.json'    
    metadata_resp = requests.post(metadata_url,params=tweet_meta,headers=auth_data)
    print(metadata_resp.status_code)
    print(metadata_resp.text)

    tweet={'status':'hello world','media_ids':media_id}
    post_url = 'https://api.twitter.com/1.1/statuses/update.json'    
    post_resp = requests.post(post_url,params=tweet,headers=image_headers)
    print(post_resp.status_code)
    print(metadata_resp.text)

# def tweet_question(**kwargs):
#     media = open(path+kwargs['fig_question'], 'rb')
#     api = twitter_client()
#     api.PostUpdate(media=media, status="test")


# def tweet_answer(**kwargs):
#     api = twitter_client()
#     print(path+kwargs['fig_answer'])
#     api.PostUpdate(media=path+kwargs['fig_answer'], status="test")    
    
