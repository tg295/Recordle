import os
import requests
import re

from aws_lambda_powertools.utilities import parameters

IG_GRAPH_URL = 'https://graph.facebook.com/v15.0/'
IG_ACCESS_URL = 'https://www.facebook.com/v13.0/dialog/oauth?response_type=token&display=popup&client_id=your_client_id&redirect_uri=your_redirect_uri&auth_type=rerequest&scope=user_location%2Cuser_photos%2Cuser_friends%2Cuser_gender%2Cpages_show_list%2Cinstagram_basic%2Cinstagram_manage_comments%2Cinstagram_manage_insights%2Cpages_read_engagement%2Cpublic_profile'
IG_ACCOUNT_ID = parameters.get_parameter("/recordle/ig_account_id", decrypt=True)
IG_REDIRECT_URL = parameters.get_parameter("/recordle/ig_redirect_url", decrypt=True)
IG_ACCESS_TOKEN = parameters.get_parameter("/recordle/ig_access_token", decrypt=True)
IG_LL_ACCESS_TOKEN = parameters.get_parameter("/recordle/ig_ll_access_token", decrypt=True)
IG_CLIENT_ID = parameters.get_parameter("/recordle/ig_client_id", decrypt=True)
IG_CLIENT_SECRET = parameters.get_parameter("/recordle/ig_client_secret", decrypt=True)

def func_get_url():
    print('\n access code url',IG_ACCESS_URL)
    code = input("\n enter the url")
    code = code.rsplit('access_token=')[1]
    code = code.rsplit('&data_access_expiration')[0]
    return code

def get_long_lived_access_token(access_token = IG_ACCESS_TOKEN):
    url = IG_GRAPH_URL + 'oauth/access_token'
    param = dict()
    param['grant_type'] = 'fb_exchange_token'
    param['client_id'] = IG_CLIENT_ID
    param['client_secret'] = IG_CLIENT_SECRET
    param['fb_exchange_token'] = access_token
    response = requests.get(url = url,params=param)
    return response

def post_carousel(caption = '',media_url = [],instagram_account_id='',access_token=''):
    url = IG_GRAPH_URL + instagram_account_id + '/media'
    param = dict()
    param['access_token'] = access_token
    param['is_carousel_item'] = 'true'
    container_id = []
    for i in media_url:
        param['image_url'] = i
        response = requests.post(url, params=param)
        response = response.json()
        print(response)
        container_id.append(response['id'])
    carousel_container_id = make_carousel_container(container_id=container_id,caption=caption,access_token=access_token,instagram_account_id=instagram_account_id)
    return carousel_container_id

def make_carousel_container(container_id='',caption='',access_token='',instagram_account_id=''):
    url = IG_GRAPH_URL + instagram_account_id + '/media'
    container_id = ','.join(container_id)
    param = dict()
    param['access_token'] = access_token
    param['media_type'] = 'CAROUSEL'
    param['children'] = container_id
    param['caption'] = caption
    response = requests.post(url, params=param)
    response = response.json()
    return response['id']

# creation_id is container_id
def publish_container(creation_id = '',instagram_account_id='',access_token=''):
    url = IG_GRAPH_URL + instagram_account_id + '/media_publish'
    param = dict()
    param['access_token'] = access_token
    param['creation_id'] = creation_id
    response = requests.post(url,params=param)
    response = response.json()
    return response

def post_to_instagram(album_data, bucket, day):
    caption = f"Day {day}: {re.sub('[A-Za-zÀ-ÖØ-öø-ÿ]', '_', album_data['artist'])} • {re.sub('[A-Za-zÀ-ÖØ-öø-ÿ]', '_', album_data['title'])} ({album_data['release_date'][:4]}) \n𝒂𝒏𝒔𝒘𝒆𝒓 𝒃𝒆𝒍𝒐𝒘...\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n{album_data['artist']} • {album_data['title']} ({album_data['release_date'][:4]})\n #aiart #albumcovers #albumart #records #musicartist #musicart #artsciencetechnology #art #digitalart #artificialintelligence #musiclovers #music #fantano @afantano"
    # r = get_long_lived_access_token()
    # print(r.json())
    img_urls = [f"https://{bucket}.s3.eu-west-2.amazonaws.com/img/{album_data['id']}_{album_data['formatted_title']}_GEN_{i}.png" for i in range(3)]
    creation_id = post_carousel(caption=caption, media_url=img_urls, instagram_account_id=IG_ACCOUNT_ID, access_token=IG_LL_ACCESS_TOKEN)
    publish_container(creation_id=creation_id,instagram_account_id=IG_ACCOUNT_ID,access_token=IG_LL_ACCESS_TOKEN)


if __name__ == "__main__":

    import os
    import sys
    import time

    sys.path.append(os.path.join(os.getcwd()))

    n = 2
    m = 0
    i = 0
    j = 58

    from src.handlers.main import download_from_aws
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prefix = root+'/data'

    filepath = download_from_aws('albums_filtered.txt', '{}/albums_filtered.txt'.format(prefix))

    # j += 1 # account for 0 index

    for album_id in open(filepath, 'r').readlines():

        if i < j:
            i += 1
            continue
        album_id = album_id.strip('\n')

        print('------ {} ------'.format(j))

        url = 'https://alt-covers-bucket.s3.eu-west-2.amazonaws.com'
        r = requests.get(f"{url}/data/{album_id}.json")
        album_data = r.json()
        print(album_data)
        post_to_instagram(album_data, 'alt-covers-bucket', j)

        j += 1
        m += 1
        i += 1

        if m == n:
            break

        time.sleep(5)

    # r = requests.get('https://graph.facebook.com/oauth/access_token?client_id={}&client_secret={}&grant_type=client_credentials'.format(IG_CLIENT_ID, IG_CLIENT_SECRET))
    # r = get_long_lived_access_token('k0kfknDtgl9ndb0CXaiau3UfVJo')
    # print(r.text)
    # print(r.json())
    # img_urls = [
    #     "https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/7nXJ5k4XgRj5OLg9m8V3zc_purple_rain_GEN_0.png",
    #     "https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/7nXJ5k4XgRj5OLg9m8V3zc_purple_rain_GEN_1.png",
    #     "https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/7nXJ5k4XgRj5OLg9m8V3zc_purple_rain_GEN_2.png"
    # ]
    # creation_id = post_carousel(caption="Day 1", media_url=img_urls, instagram_account_id='17841460755599884', access_token=IG_LL_ACCESS_TOKEN['access_token'])
    # # print(creation_id)
    # publish_container(creation_id=creation_id,instagram_account_id='17841460755599884',access_token=IG_LL_ACCESS_TOKEN['access_token'])
