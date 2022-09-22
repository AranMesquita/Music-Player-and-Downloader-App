import {flask_server_download_url} from '../components/server_urls'
const server_song_download = (download_index) =>{
  // server_song_download func. downloads song to the server 
  // 200 response --> {song_index : recieved}
  fetch(flask_server_download_url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      song_index: download_index
      })
    })
    // Below code left commented to aid in Debugging if an error occurs
    // .then((response) => response.text())
    // .then((json) => {
      // console.log('requested to download song to server this was the response:\n'+ json);
    // })
    .catch((error) => {
      console.log(`Error with server_song_download func. in DownloadComponent.js:\n${error}`);
    });
  return;
};

export {server_song_download};