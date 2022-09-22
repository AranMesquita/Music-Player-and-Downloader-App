from flask import Flask, send_from_directory
from flask import request
from flask import jsonify
import pytube
from pytube import YouTube
import os
from web_scraper import get_artist_songs
from search import search_songs


app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def start():
    return "hello world"


@app.route("/search", methods=["POST"])
def search_song():
    # searches for a list of songs if a song name is given or a list of songs of an artist if ("artist: Artist Name") is given
    if request.method != "POST":
        return "search page"

    request_data = request.get_json()
    song_name = request_data['song']

    if 'artist:' in song_name:
        if not get_artist_songs(song_name):
            return f'Searching for {song_name} songs was unsuccessful'

        return jsonify(get_artist_songs(song_name))

    return jsonify(search_songs(song_name))


@app.route("/Download", methods=['POST', 'GET'])
def download_song_to_server():
    # Downloads the song to the actual server
    if request.method == "POST":
        dir = f'{os.getcwd()}/mp3Folder/'
        for f in os.listdir(dir):
            os.remove(os.path.join(dir, f))

        request_data = request.get_json()
        song_index = request_data["song_index"]

        try:
            yt = YouTube(f'http://youtube.com/watch?v={song_index["id"]}')
            yt.streams.get_audio_only().download(
                output_path=dir, filename=f'{song_index["title"]}.mp3')

        except pytube.exceptions.VideoRegionBlocked:
            return "this song is unavailable in your region"
        except pytube.exceptions.VideoUnavailable:
            return "this song is unavailable"
        except pytube.exceptions.VideoPrivate:
            return "song unavailable (listed as private)"

        return jsonify({
            'song_index': 'recieved',
        })
    # Sends the downloaded song to the user
    elif request.method == "GET":
        dir = f'{os.getcwd()}/mp3Folder/'
        file_name = os.listdir(dir)
        return send_from_directory(dir, file_name[0], as_attachment=True)

    else:
        return "hello world"


if __name__ == "__main__":
    app.run()  # debug=True
