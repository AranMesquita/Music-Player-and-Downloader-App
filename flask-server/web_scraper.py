from bs4 import BeautifulSoup
import requests
from search import search_artist_songs_thumbnail


def get_artist_songs(artist_name: str) -> list[dict]:
    try:
        artist = artist_name.replace('artist', '').replace(
            ':', '').replace(' ', '+')
        url = f'https://www.google.com/search?q={artist}+songs'

        request = requests.get(url).text
        soup = BeautifulSoup(request, 'html.parser')

        songs = soup.find_all(
            'div', class_="BNeawe deIvCb AP7Wnd")
        # .pop() 1st && last index from song_list as both those values are never songs
        songs.pop(0)
        songs.pop(-1)

        return [{"title": song.string, "thumbnail_url": search_artist_songs_thumbnail(str(song.string))} for song in songs]

    except Exception as error:
        print(error)
        return False
