import re

username_regex = '([a-zA-Z0-9-_]*)'

social_patterns = {
  'GITHUB': 'https://github.com/{}'.format(username_regex),
  'TWITTER': 'https://twitter.com/{}'.format(username_regex),
  'LINKEDIN': 'https://linkedin.com/in/{}'.format(username_regex),
  'KEYBASE': 'https://keybase.io/{}'.format(username_regex),
}

def get_social_info_from_url(url: str):
  for service, pattern in social_patterns.items():
    match = re.match(pattern, url)
    if match:
      return {
        'service': service,
        'username': match.group(1)
      }
