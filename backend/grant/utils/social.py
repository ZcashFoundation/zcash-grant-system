import abc

from grant.settings import (
    SITE_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET
)
from requests_oauthlib import OAuth1Session, OAuth2Session


class VerifySocialException(Exception):
    pass


class SocialItem(abc.ABC):
    @abc.abstractmethod
    def url_pattern(self, username):
        pass

    @abc.abstractmethod
    def get_login_url(self):
        pass

    @abc.abstractmethod
    def verify_and_get_user(self, code):
        pass


class Github(SocialItem):
    def url_pattern(self, username):
        url = 'https://github.com/{}'
        return url if not username else url.format(username)

    def get_login_url(self):
        url = 'https://github.com/login/oauth/authorize?scope=read:user&client_id={}'
        return url.format(GITHUB_CLIENT_ID)

    def verify_and_get_user(self, code):
        github = OAuth2Session(GITHUB_CLIENT_ID)
        token_url = 'https://github.com/login/oauth/access_token'
        user_url = 'https://api.github.com/user'
        github.fetch_token(token_url, client_secret=GITHUB_CLIENT_SECRET, code=code)
        user = github.get(user_url).json()
        return user['login']


class Twitter(SocialItem):
    def url_pattern(self, username):
        url = 'https://twitter.com/{}'
        return url if not username else url.format(username)

    def get_login_url(self):
        twitter = OAuth1Session(client_key=TWITTER_CLIENT_ID, client_secret=TWITTER_CLIENT_SECRET)
        request_token_url = 'https://api.twitter.com/oauth/request_token'
        authorization_url = 'https://api.twitter.com/oauth/authorize'
        data = twitter.fetch_request_token(request_token_url)
        url = twitter.authorization_url(authorization_url)
        return url

    def verify_and_get_user(self, code):
        oauth_token, oauth_verifier = code.split(':')
        twitter = OAuth1Session(
            client_key=TWITTER_CLIENT_ID,
            client_secret=TWITTER_CLIENT_SECRET,
            resource_owner_key=oauth_token)
        url = 'https://api.twitter.com/oauth/access_token'
        data = twitter.fetch_access_token(url, verifier=oauth_verifier)
        return data['screen_name']


class Linkedin(SocialItem):
    def url_pattern(self, username=None):
        url = 'http://www.linkedin.com/in/{}'
        return url if not username else url.format(username)

    def get_login_url(self):
        authorization_url = 'https://www.linkedin.com/uas/oauth2/authorization'
        redirect_uri = '{}/callback/linkedin'.format(SITE_URL)
        linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, redirect_uri=redirect_uri)
        url = linkedin.authorization_url(authorization_url)
        return url

    def verify_and_get_user(self, code):
        redirect_uri = '{}/callback/linkedin'.format(SITE_URL)
        linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, redirect_uri=redirect_uri)
        token_url = 'https://www.linkedin.com/uas/oauth2/accessToken'
        user_url = 'https://api.linkedin.com/v1/people/~:(public-profile-url)?format=json'
        linkedin.fetch_token(token_url, client_secret=LINKEDIN_CLIENT_SECRET, code=code)
        user = linkedin.get(user_url).json()
        profile_url = user['publicProfileUrl']
        profile_base_url = self.url_pattern().format('')
        username = profile_url.replace(profile_base_url, '')
        return username


social_items = {
    'GITHUB': Github(),
    'TWITTER': Twitter(),
    'LINKEDIN': Linkedin(),
}


def get_social(service):
    if service in social_items:
        return social_items[service]
    raise VerifySocialException('Social service "{}" is not supported.'.format(service))


def generate_social_url(service, username):
    return get_social(service).url_pattern(username)


def verify_social(service, code):
    return get_social(service).verify_and_get_user(code)


def get_social_login_url(service):
    return get_social(service).get_login_url()
