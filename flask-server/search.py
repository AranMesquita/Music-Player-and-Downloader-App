from youtubesearchpython import VideosSearch


def search_songs(song_name: str) -> list[dict]:
    # use in server.py
    try:
        song = song_name.replace(' ', '+') + '+official+audio'

        # VideosSearch searches youtube with the song input
        video_search_result = VideosSearch(
            song, limit=20, language='en', timeout=None).result()

        # A dictonary is returned with all the information of the song
        key_terms_song = video_search_result['result']

        return [{"id": item.pop("id"), "duration": item.pop("duration"), "title": item.pop(
                "title").replace("(Official Video)", "(Official Audio)").replace("/", ""), "thumbnail_url": item.pop('thumbnails').pop(0).pop('url')} for item in key_terms_song]

    except Exception as error:
        return print(error)


def search_artist_songs_thumbnail(song_name: str) -> str:
    # use in web_scraper.py
    try:
        song = song_name.replace(' ', '+') + '+official+audio'

        # VideosSearch searches youtube with the song input
        video_search_result = VideosSearch(
            song, limit=1, language='en', timeout=None).result()

        # A dictonary is returned with all the information of the song
        key_terms_song = video_search_result['result']

        return key_terms_song[0].pop('thumbnails').pop(0).pop('url')

    except Exception as error:
        return print(error)
