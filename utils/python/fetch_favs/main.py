import os
import sys
import shutil
import json
import requests
from glob import glob
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlsplit


icons_dir = 'icons/'
path_to_data = '../assets/data.json'
name_column = 18


def check_icons_dir():
    if not os.path.isdir(icons_dir):
        os.makedirs(icons_dir)
        print('Created icon directory at ' + icons_dir)


def transform_name(name):
    return name.replace(' ', '_').lower()


def parse_icon_url(dom, url, rel):
    icon_tag = dom.find('link', rel=rel)
    if icon_tag is not None:
        icon_link = urljoin(url, icon_tag['href'])

        # Search for type if it exists
        if type in icon_tag:
            file_type = icon_tag['type'].split('/')[1]
        else:
            file_type = 'ico'  # defaults to .ico

        r2 = requests.get(icon_link, stream=True)
        return r2, file_type

    return None


def search_icon_url(dom, url):
    # Search for shortcut icon
    r = parse_icon_url(dom, url, 'shortcut icon')
    if r is not None:
        return r

    # Search for icon
    r = parse_icon_url(dom, url, 'icon')
    if r is not None:
        return r

    # Search for base + 'favicon.ico'
    base_url = "{0.scheme}://{0.netloc}/".format(urlsplit(url))
    r2 = requests.get(base_url + 'favicon.ico', stream=True)
    return r2, 'ico'


def fetch_icon(url, name):
    file_name = transform_name(name)

    print(name.ljust(name_column) + file_name.ljust(name_column), end='')

    for f in glob(icons_dir + '*'):
        fn = os.path.splitext(os.path.basename(f))[0]
        if fn == file_name:
            print('Icon already exists.')
            return True

    r = requests.get(url)
    if r.status_code != 200:
        print('Response not OK (code ' + str(r.status_code) + ')')
        return False

    # Parse page
    b = BeautifulSoup(r.text, 'html.parser')

    icon_info = search_icon_url(b, url)
    r2 = icon_info[0]
    file_type = icon_info[1]

    if r2 is not None and r2.status_code == 200:
        print(file_type.upper().ljust(6) + r2.url)
        with open(icons_dir + file_name + '.' + file_type, 'wb') as fi:
            r2.raw.decode_content = True
            shutil.copyfileobj(r2.raw, fi)
    else:
        print('Icon link not found.')
        return False

    return True


if __name__ == "__main__":
    check_icons_dir()

    # Check for arg
    if len(sys.argv) != 2:
        i = input('Path to where the assets data file is [' + path_to_data + ']:').strip()
        if len(i) > 0:
            path_to_data = i
    else:
        path_to_data = sys.argv[1]

    # Check path
    if not os.path.exists(path_to_data):
        print('The path specified does not exists (' + path_to_data + ').')
        exit(0)

    with open(path_to_data, 'r', encoding='UTF-8') as f:
        data = json.loads(f.read())

    if data is None:
        print('Data could not be parsed from file at ' + path_to_data)
        exit(0)

    success = 0
    failed = 0
    for e in data['liens-plus']:
        for ee in e['liens']:
            if fetch_icon(ee['lien'], ee['nom']):
                success += 1
            else:
                failed += 1

    print('= Fetch ended, ' + str(success) + ' success and ' + str(failed) + ' failures, total ' + str(success + failed))
