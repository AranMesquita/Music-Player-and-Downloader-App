<h1 align="center">Music Player && Downloader App</h1>
<p align="center">
This is a Full-stack music player🎵 and music downloader📲 app made using React Native⚛️(for the front end) and Flask🐍(for the backend).
</p>

<h2 align="center">

Demo:

</h2>
<p align="center">
 <img src="./Music/assets/Music_app_demo.gif" width="275" height="600"/>
</p>

<h2 align="center">

Description (The **how** and **why**):

</h2>
<p align="center">

I use [Spotify](https://www.spotify.com/) to stream all the music I enjoy listening to, while I am programming, however with all the [load shedding](https://www.google.com/search?q=what+is+Load+shedding) happening in South Africa most of the time I am unable to stream the songs that I want to listen to, I'm also not prepaired to pay for Spotify Premium, so being a developer I decided to just make my own music app where I could download the songs for offline use, so I did some reasearch and found [pytube](https://pytube.io/en/latest/). I was then reading through pytubes documentation and noticed that you could download the audio stream of a given video in a ".mp4" format, which sparked an idea💡, I could create an audio downloader by replacing the ".mp4" format extension with ".mp3" before pytube creates the ".mp4" file, which resulted in pytube creating a ".mp3" file instead, and voilà I had a music downloader, I then went down a deep rabbit🐇 whole and eventually decided that React Native⚛️ would be the best choice for making the UI for this music app, as it is quite easy for a begginer pick up and React is use widely by many developers and reputable companies, so I then made a [To-Do list app](https://github.com/AranMesquita/To-Do-List)📝 to learn the fundementals of React Native⚛️, to make this Music app🎵. I then needed a simple server to run python code with pytube and handle some requests, to search, download and send the songs from the server to the music app, So I decided to use [Flask](https://flask.palletsprojects.com/en/2.2.x/) as Flask is a simple micro web framework, that allowed me to code up a backend server in minutes.
After all of that I had developed a Full-stack music app that I could use on my phone, I do **not** recommend any one to copy my code and use this app, as this is just a personal project I made to gain experience, making mobile apps using React Native⚛️ along with [Javascript](https://github.com/AranMesquita/ProblemSolving/tree/main/Javascript), and to demonstrate my determination, skill and potential as a programmer and developer.

</p>

<h2 align="center">
Features:
</h2>

- ▶️Play and ⏸️Pause songs

- Skip to the ⏭️next song and Skip ⏮️back to the previous song
- 💽Create playlists
- ➕Add songs to playlists
- 🗑️Remove songs from playlist
- ▶️Play songs from specific playlist
- 📲Download searched songs
- 🗑️Delete songs
- 🔍Search bar:
  - Search for a specific song
  - Search for a list of songs from a specific artist or band
- SeekBar:
  - Play the song at different time stamps
  - Seeing how long the audio has left untill it is finnished
- Automatically ▶️plays the next song when the song finnishes
- On Startup:
  - Gets all audios on the device
  - Automatically filters all the audios for audios that are only songs🎶
- Mini music controller for playing songs and navigating through the app at the same time
