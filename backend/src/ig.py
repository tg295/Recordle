import requests

APP_ID = 2519453651549511
APP_SECRET = '2f85771b26e4b506540aedef21f4e8ca'
ACCESS_TOKEN = "EAAjzbgPtvUcBABHNpiGfp05wm4a4mstUBdgPV1iZCODntqZA1X2Purh7creun9jbZA6Gz8TfOdYOYgkXcPfei45tlzy3RLw8rNl8UlNZBFxByBZBXNs2K8a8ziprgTZC5Kc0QUm19rH380e2JoGsYMTAhiyQPSLdLfl5kgMcUNXWhpvc4IMvWp9mWhriWaB2LOGVXpXbeOj4PWbaJTuQqjUf2DZC0op2JoZD"
LL_ACCESS_TOKEN = {"access_token":"EAAjzbgPtvUcBAKJQhX6nps8EOFntLFvUepAevg5GpwvHrT0zyFb2kZB4b7C8UsLKNHrmWGVEVZAEBCb1c9215t9tNDVzBDw99HI6eIwXibFxxngspy3pOzYZAhAVXTxuqEy0tNjM5Gtw3pS5M8dt6sjhajLZAwb5B2rgj2Haum6axUL5vDpJ","token_type":"bearer","expires_in":5182639}

client_id = '2519453651549511'
client_secret = '2f85771b26e4b506540aedef21f4e8ca'
redirect_url = 'localhost'
access_url = 'https://www.facebook.com/v13.0/dialog/oauth?response_type=token&display=popup&client_id=your_client_id&redirect_uri=your_redirect_uri&auth_type=rerequest&scope=user_location%2Cuser_photos%2Cuser_friends%2Cuser_gender%2Cpages_show_list%2Cinstagram_basic%2Cinstagram_manage_comments%2Cinstagram_manage_insights%2Cpages_read_engagement%2Cpublic_profile'
graph_url = 'https://graph.facebook.com/v15.0/'

def func_get_url():
    print('\n access code url',access_url)
    code = input("\n enter the url")
    code = code.rsplit('access_token=')[1]
    code = code.rsplit('&data_access_expiration')[0]
    return code

def func_get_long_lived_access_token(access_token = ACCESS_TOKEN):
    url = graph_url + 'oauth/access_token'
    param = dict()
    param['grant_type'] = 'fb_exchange_token'
    param['client_id'] = client_id
    param['client_secret'] = client_secret
    param['fb_exchange_token'] = access_token
    response = requests.get(url = url,params=param)
    return response

def post_carousel(caption = '',media_url = [],instagram_account_id='',access_token=''):
    url = graph_url + instagram_account_id + '/media'
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
    url = graph_url + instagram_account_id + '/media'
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
    url = graph_url + instagram_account_id + '/media_publish'
    param = dict()
    param['access_token'] = access_token
    param['creation_id'] = creation_id
    response = requests.post(url,params=param)
    response = response.json()
    return response


if __name__ == "__main__":

    # r = func_get_long_lived_access_token()
    # print(r.text)
    # print(r.json())
    img_urls = [
        "https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/7nXJ5k4XgRj5OLg9m8V3zc_purple_rain_GEN_0.png",
        "https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/7nXJ5k4XgRj5OLg9m8V3zc_purple_rain_GEN_1.png",
        "https://alt-covers-bucket.s3.eu-west-2.amazonaws.com/img/7nXJ5k4XgRj5OLg9m8V3zc_purple_rain_GEN_2.png"
    ]
    creation_id = post_carousel(caption="Day 1", media_url=img_urls, instagram_account_id='17841460755599884', access_token=LL_ACCESS_TOKEN['access_token'])
    # print(creation_id)
    publish_container(creation_id=creation_id,instagram_account_id='17841460755599884',access_token=LL_ACCESS_TOKEN['access_token'])
