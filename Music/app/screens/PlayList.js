import {StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Image, ScrollView, Platform, StatusBar, Modal } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';

const PlayList = () => {
  const [modalstate, setModalState] = useState(false);
  const [create_playlist_title, setCreate_Playlist_title] = useState();
  const [playlist_titles, setPlaylist_titles] = useState([]);
  const [modal_playlist_audios, setModal_playlist_audios] = useState([]);
  const [modal_playlist_state, setModal_playlist_state] = useState(false);
  const [list_thumbnail_url, setList_Thumbnail_Url] = useState([]);
  const [modal_audio_option, setModal_audio_option] = useState(false);
  const [filename, setFilename] = useState('Audio Title');
  const [playlist_audio_index, setPlaylist_audio_index] = useState(0);
  const [playlist, setPlaylist] = useState();
  const [current_audio, setCurrent_audio] = useState([]);
  const [did_just_finnish, setDid_just_finnish] = useState(false);
  const [mini_player, setMini_player] = useState(<View></View>);
  const [modal_player, setModal_Player] = useState(false);
  const [playbackObj, setPlaybackobj] = useState(null);
  const [soundObj, setSoundobj] = useState(null);
  const [playback_position, setPlayback_position] = useState(null);
  const [play_icon, setPlay_icon] = useState(<Ionicons name="pause" size={32} color="white" />);

  // useKeepAwake() a React hook that prevents the screen from sleeping
  useKeepAwake();

  useEffect(() => {
    try{
      // useEffect is a react hook which calls funtion after initial render
      get_Playlists();
      get_Audio_Thumbnail_Url();
      return;
    }catch(error){
      console.log(`Error with useEffect func. in PlayList.js:\n${error}`);
    }
  }, []); // empty array used so useEffect is only called once after initial render

  useEffect(() => {
    try{
      // useEffect is a react hook which calls funtion after initial render
      // This useEffect checks to see if any new playlist has been created
      // + so the new playlist can be rendered to the user
      get_Playlists_update().then(result =>{
        if(result.length !== playlist_titles.length){
          setPlaylist_titles(result);
          return;
        }else{
          return;
        }
      });
    }catch(error){
      console.log(`Error with useEffect func. in PlayList.js:\n${error}`);
    }
  });

  const get_audio_from_playlist = async (item) => {
    // get_audio_from_playlist async func. returns all audio(s) saved to the chosen playlist
    try{
      const playlist_audios = await AsyncStorage.getItem(item);
      if(!playlist_audios || playlist_audios == 'New_Playlist'){
        return;
      }else{
        const jsonData = JSON.parse(playlist_audios);
        setModal_playlist_audios(jsonData);
        setModal_playlist_state(true);
        setPlaylist(item);
        return;
      }
    }catch(error){
      console.log(`Error with get_audio_from_playlist async func. in PlayList.js:\n${error}`);
    }
  }

  const Create_new_playlist = async () => {
    try{
      Keyboard.dismiss();
      await AsyncStorage.setItem(create_playlist_title, 'New_Playlist');
      setModalState(false);
      return;
    }catch(error){
      console.log(`Error with Create_new_playlist async func. in PlayList.js:\n${error}`);
    }
  }
   const get_Playlists = async () => {
    // get_Playlists async func. gets all the playlists that have been created via the app
    try {
      let keys = await AsyncStorage.getAllKeys();
      if(!keys){
        return;
      }else{
        let filtered_keys = keys.filter(item => {
          return item !== '@Song_title&thumbnail_url';
        });
        return setPlaylist_titles(filtered_keys);
      }
    } catch(error) {
      console.log(`Error with get_Playlists async func. in PlayList.js:\n${error}`);
    }
  }

  const get_Playlists_update = async () => {
    // get_Playlists async func. gets all the playlists that have been created via the app
    try {
      let keys = await AsyncStorage.getAllKeys();
      if(!keys){
        return;
      }else{
        let filtered_keys = keys.filter(item => {
          return item !== '@Song_title&thumbnail_url';
        });
        return filtered_keys;
      }
    } catch(error) {
      console.log(`Error with get_Playlists async func. in PlayList.js:\n${error}`);
    }
  }

  const get_Audio_Thumbnail_Url = async () => {
    // get_Audio_Thumbnail_Url async func. returns a saved thumbnail url(via the async-storage key @Song_title&thumbnail_url) of a song that has been downloaded through the app.
    try{
      const song_thumbnail_url_storage = await AsyncStorage.getItem('@Song_title&thumbnail_url');
      if (!song_thumbnail_url_storage){
        const No_Song_title_thumbnail_url = new Array('No_thumbanils_url');
        setList_Thumbnail_Url(No_Song_title_thumbnail_url);
        return;
      }
      const jsonData = JSON.parse(song_thumbnail_url_storage);
      setList_Thumbnail_Url(jsonData);
      return;
    }catch(error){
      console.log(`Error with get_Audio_Thumbnail_Url async func. in PlayList.js:\n${error}`);
    }
  }
  const modal_audio_options = (index, filename) =>{
    // modal_audio_option func. displays selectable options (play , +Playlist, delete) when the vertical ellipises alongside the audio title is pressed.
    try{
        setFilename(filename);
        setPlaylist_audio_index(index);
        setModal_audio_option(true);
    }catch(error){
        console.log(`Error with modal_audio_options func. in PlayList.js:\n${error}`);
    }
    
  }
  const modal_audio_option_play = () =>{
    // modal_option_play func. plays the audio when the 'play' TouchableOpacity Text is pressed in the moadal_audio_options.
    try{
      setCurrent_audio(modal_playlist_audios[playlist_audio_index]);
      setModal_audio_option(false);
      play_audio(modal_playlist_audios[playlist_audio_index], true);
      setModal_Player(true);
    }catch(error){
        console.log(`Error with modal_audio_option_play func. in PlaylistList.js:\n${error}`);
    }
  }
  const modal_audio_option_delete = async () =>{
    // modal_option_add_delete async func. deletes a desired audio when the 'delete' TouchableOpacity Text is pressed in the moadal_audio_options.
    try{
        let new_playlist_audio_list = [...modal_playlist_audios.slice(0, playlist_audio_index), ...modal_playlist_audios.slice(playlist_audio_index + 1)];
        setModal_playlist_audios(new_playlist_audio_list);
        setModal_audio_option(false);
        await AsyncStorage.setItem(playlist, JSON.stringify(new_playlist_audio_list));
    }catch(error){
        console.log(`Error with modal_audio_option_delete func. in PlaylistList.js:\n${error}`);
    }
  }
  const delete_playlist = async (item, index) => {
    // delete_playlist async func. deletes an entire playlist
    try{
        let remove_playlist = [...playlist_titles.slice(0,  index), ...playlist_titles.slice(index + 1)];
        setPlaylist_titles(remove_playlist);
        await AsyncStorage.removeItem(item);
    }catch(error){
        console.log(`Error with delete_playlist async func. in PlaylistList.js:\n${error}`);
    }
  }

  const getDurationFormatted = (Audio_duration) =>{
    // getDurationFormatted func. converts the duration of the audio(in seconds) to a readable digital display, 
    //+ returns the duration in the form 'minutes':'seconds'.
    try{
      const minutes = Audio_duration / 60;
      const minutesDisplay = Math.floor(minutes);
      const seconds = Math.round((minutes - minutesDisplay) * 60);
      const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
      return `${minutesDisplay}:${secondsDisplay}`;
    }catch(error){
      console.log(`Error getDurationFormatted func. in PlaylistList.js:\n${error}`);
    }
  }

  const calculate_seekbar = () =>{
    // calculate_seekbar func. calculates the length of the seek-bar in the audio player
    try{
      if(playback_position !== null && soundObj !== null){
        return playback_position / soundObj.durationMillis;
      }else{
        return 0;
      }
    }catch(error){
      console.log(`Error with onPlaybackStatusUpdate func. in Playlist.js:\n${error}`);
    }
  }

  const onPlaybackStatusUpdate = async (playbackStatus) =>{
    // onPlaybackStatusUpdate async func. allows for callback on the audio's status
    try{
      // + to allow for the duration of the audio to be calculated and shown on the seek-bar
      if(playbackStatus.isLoaded && playbackStatus.isPlaying){
        setPlayback_position(playbackStatus.positionMillis);
        return;
      }
      // + also allows for callback to check whether the audio has just finnished and allow for the next audio to be played
      if(playbackStatus.didJustFinish){
        try{
          setDid_just_finnish(true);
          return;
        }catch(error){
          console.log(`Error with else if(playbackStatus.didJustFinish) condition in onPlaybackStatusUpdate func. in Audio.js(lines: 38-->?):\n${error}`);
        }
      }
    }catch(error){
      console.log(`Error with onPlaybackStatusUpdate func. in PlayList.js:\n${error}`);
    }
  }

  const play_audio = async (audioItem, skip) => {
    try{
      if(soundObj === null){ // play audio for the first time
        const playbackObj = new Audio.Sound();
        const status = await playbackObj.loadAsync({uri: audioItem.uri}, {shouldPlay: true, progressUpdateIntervalMillis: 1000});
        playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setPlaybackobj(playbackObj);
        setSoundobj(status);
        return;
      }else if(soundObj.isLoaded && soundObj.isPlaying && !skip){ // pause audio 
        setPlay_icon(<Ionicons name="play" size={32} color="white" />);
        const status = await playbackObj.pauseAsync();
        setSoundobj(status);
        setPlayback_position(status.positionMillis);
        return;
      }else if(soundObj.isLoaded && !soundObj.isPlaying && !skip){ // resume audio 
        setPlay_icon(<Ionicons name="pause" size={32} color="white" />);
        const status = await playbackObj.playAsync();
        setSoundobj(status);
        return;
      }else if(soundObj.isLoaded && skip){ // Play next or previous audio
        await playbackObj.setStatusAsync({shouldPlay: false});
        await playbackObj.unloadAsync();
        const playback_Obj = new Audio.Sound();
        const status = await playback_Obj.loadAsync({uri: audioItem.uri}, {shouldPlay: true, progressUpdateIntervalMillis: 1000});
        playback_Obj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setPlaybackobj(playback_Obj);
        setSoundobj(status);
        return;
      }
    }catch(error){
      console.log(`Error with play_audio func. in PlayList.js:\n${error}`);
    }
  }

  const Mini_player = () =>{
    // Mini_player func. allows to go back to the actual music player/controller
    setModal_Player(false);
    setMini_player(
    <BlurView tint={'dark'} intensity={'96'} style={[StyleSheet.absoluteFill, styles.MiniPlayer_Container]}>
    <TouchableOpacity onPress={() => Modal_player()}>
    <View style={styles.MiniPlayer_Thumbnail_image}>
      <Image style={styles.MiniPlayer_Thumbnail_image} source={{
        width: 85,
        height: 86,
        uri: !list_thumbnail_url[current_audio.filename] ? "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png" : list_thumbnail_url[current_audio.filename]}}/>
    </View>
    <View style={styles.MiniPlayer_Text_container}>
      <Text style={styles.MiniPlayer_Text} numberOfLines={2}>{current_audio.filename}</Text>
    </View>
    </TouchableOpacity>
    </BlurView>
    );
    return;
  }

  const Mini_player_did_just_finish = (audio_item) =>{
    // Mini_player_did_just_finish func. re-sets the state so the mini-player can be updated
    setModal_Player(false);
    setMini_player(
    <BlurView tint={'dark'} intensity={'96'} style={[StyleSheet.absoluteFill, styles.MiniPlayer_Container]}>
    <TouchableOpacity onPress={() => Modal_player()}>
    <View style={styles.MiniPlayer_Thumbnail_image}>
      <Image style={styles.MiniPlayer_Thumbnail_image} source={{
        width: 85,
        height: 86,
        uri: !list_thumbnail_url[audio_item.filename] ? "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png" : list_thumbnail_url[audio_item.filename]}}/>
    </View>
    <View style={styles.MiniPlayer_Text_container}>
      <Text style={styles.MiniPlayer_Text} numberOfLines={2}>{audio_item.filename}</Text>
    </View>
    </TouchableOpacity>
    </BlurView>
    );
    return;
  }

  const Modal_player = () => {
    // Modal_player func. allows for the mini player and the music player/contoller to alternate
    // + basically just polish
    setMini_player(<View></View>);
    setModal_Player(true);
  }

  if(did_just_finnish){
    // if(did_just_finnish) statement works better to play next audio when the audio finishes playing
    // This if statement is used instead of using in the onPlaybackStatusUpdate async func. as onPlaybackStatusUpdate does not register when a state is updated
    try{
      setDid_just_finnish(false);
      const index = modal_playlist_audios.indexOf(current_audio) + 1 >= modal_playlist_audios.length ? 0 : modal_playlist_audios.indexOf(current_audio) + 1;
      setCurrent_audio(modal_playlist_audios[index]);
      setPlaylist_audio_index(index);
      play_audio(modal_playlist_audios[index], true);
      Mini_player_did_just_finish(modal_playlist_audios[index]);
      return;
    }catch(error){
      console.log(`Error with if condition in PlayList.js:\n${error}`);
    }  
  }

  const play_skip_forward = () => {
    // play_skip_forward func. skips the song to the next song by incrementing(+) the current audios index by 1
    try{
      // index var. has a one liner if statement that checks whether the current audio index is at the end of the array(out of range)
      // index var returns 0 if the condition is satisfied, thus looping through audios, by setting the audios index to the beginning of the audios array  
      const index = modal_playlist_audios.indexOf(current_audio) + 1 >= modal_playlist_audios.length ? 0 : modal_playlist_audios.indexOf(current_audio) + 1;
      setCurrent_audio(modal_playlist_audios[index]);
      setPlaylist_audio_index(index);
      play_audio(modal_playlist_audios[index], true);
      return;
    }catch(error){
      console.log(`Error with play_skip_forward func. in PlayList.js:\n${error}`);
    }
  }
  const play_skip_back = () => {
    // play_skip_back func. skips the song to the previous song by decrementing(-) the current audios index by 1
    try{
      // index var. has a one liner if statement that checks whether the current audio index is at the beginning of the list(out of range)
      // index var returns the length of the audios array -1 (audio_files.length -1) if the condition is satisfied, thus looping through audios, by setting the audios index to the end of the audios array 
      const index = modal_playlist_audios.indexOf(current_audio) - 1 < 0 ? modal_playlist_audios.length - 1 : modal_playlist_audios.indexOf(current_audio) - 1;
      setCurrent_audio(modal_playlist_audios[index]);
      setPlaylist_audio_index(index);
      play_audio(modal_playlist_audios[index], true);
      return;
    }catch(error){
      console.log(`Error with play_skip_back func. in PlayList.js:\n${error}`);
    }
  }

  return (
    <SafeAreaView style={styles.SafeAreaView_Container}>
      <Image style={styles.backgroundimage} source={require("./assets/bkg.jpg")}/>
      <View style={styles.Add_playlist_container}>
        <View style={styles.Gray_backround_add_icon_image_container}>
          <TouchableWithoutFeedback onPress={() => {setModalState(true)}}>
            <Ionicons name="add" size={54} color="white" />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.Create_playlist_text_container}>
          <Text style={styles.Create_playlist_text} numberOfLines={1}>Create New PlayList</Text>
        </View>
      </View>
        <Modal transparent={true} visible={modalstate}>
          <TouchableWithoutFeedback onPress={() => {setModalState(false)}}>
            <View style={styles.ModalContainer}>
              <View style={styles.Create_new_playlist_modal}>
                <TextInput style={styles.Create_playlist_title_text} placeholder={'Create new playlist'} placeholderTextColor="white" value={create_playlist_title} onChangeText={text => setCreate_Playlist_title(text)}/>
                <TouchableOpacity onPress={() => {Create_new_playlist()}} style={styles.Create_playlist_modal_checkmark_container}>
                  <Ionicons name="checkmark" size={48} color="white" />
                  </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      <View style={styles.ScrollView_playlist_Titles_container}>
          <ScrollView>
          {playlist_titles.map((item, index) =>{
            return (
              <BlurView  intensity={'125'} key={index} style={styles.playlists_container}>
                <TouchableWithoutFeedback onPressIn={() => {get_audio_from_playlist(item)}}>
                <View style={styles.playlists_image_container}>
                  <Image style={styles.playlists_image} source={{
                    width: 40,
                    height: 40,
                    uri: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png"}}/>
                </View>
                </TouchableWithoutFeedback>
                <View style={styles.playlists_title_container}>
                  <Text style={styles.playlists_title} numberOfLines={1}>{item}</Text>
                </View>
                <TouchableOpacity style={styles.ellipsis_vertical_sharp} onPress={()=> {delete_playlist(item, index)}}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </BlurView>
          )})}
        </ScrollView>
      </View>
      <Modal transparent={true} visible={modal_playlist_state}>
        <View style={styles.Modal_playlist_audio_container}>
          <Image style={styles.backgroundimage} source={require("./assets/bkg.jpg")}/>
          <TouchableOpacity onPress={() => {setModal_playlist_state(false)}} style={styles.playlist_audio_chevron_down_container}>
            <Ionicons name="chevron-down" size={48} color="white" />
          </TouchableOpacity>
          <View style={styles.ScrollView_playlist_audio_container}>
            <ScrollView>
              {modal_playlist_audios.map(({mediaType, modificationTime, uri, filename, width, id, creationTime, albumId, height, duration}, index) =>{
                return (
                  <BlurView intensity={'125'} key={index} style={styles.playlist_audio_container}>
                    <View style={styles.playlist_audio_image_container}>
                      <Image style={styles.playlist_audio_image} source={{
                        width: 40,
                        height: 40,
                        uri: !list_thumbnail_url[filename] ? "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png" : list_thumbnail_url[filename]}}/>
                    </View>
                    <View style={styles.playlist_audo_text_container}>
                      <Text style={styles.playlist_audio_text} numberOfLines={3}>{filename}</Text>
                    </View>
                    <View style={styles.ellipsis_vertical_sharp}>
                      <TouchableOpacity onPress={() => modal_audio_options(index, filename)}> 
                        <Ionicons name="ellipsis-vertical-sharp" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                )})}
            </ScrollView>
          </View>
          {mini_player}
        </View>
      </Modal>
        <Modal transparent={true} visible={modal_audio_option}>
          <TouchableWithoutFeedback onPress={() => {setModal_audio_option(false)}}>
            <BlurView tint={'dark'} intensity={'62'} style={styles.Modal_playlist_audio_container}>
                <BlurView tint='light' intensity={'75'} style={ styles.Modal_audio_option}>
                <Text style={styles.playlist_audio_option_text} numberOfLines={2}>{filename}</Text>
                <View style={styles.modal_Option_Container}>
                  <TouchableOpacity onPress={()=> {modal_audio_option_play()}}>
                    <Text style={styles.playlist_audio_option_texts}>
                      <Ionicons name="play" size={24} color="white" />
                      Play
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=> {modal_audio_option_delete()}}>
                    <Text style={styles.playlist_audio_option_texts}>
                      <Ionicons name="trash-outline" size={24} color="white" />
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
                </BlurView>
            </BlurView>
          </TouchableWithoutFeedback>
        </Modal>
        <Modal animationType='slide' transparent={true} visible={modal_player}>
          <Image style={styles.backgroundimage} source={require("./assets/bkg.jpg")}/>
          <BlurView tint={'dark'} intensity={'96'} style={[StyleSheet.absoluteFill, styles.ModalContainer]}>
            <View style={styles.mini_player}>
              <View style={styles.chevron_down}>
                <TouchableOpacity onPress={()=> Mini_player()}>
                  <Ionicons name="chevron-down" size={48} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.thumbnail}>
                <Image style={styles.thumbnails} source={{
                  width: 135,
                  height: 135,
                  uri: !list_thumbnail_url[current_audio.filename] ? "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png" : list_thumbnail_url[current_audio.filename]}}/>
              </View>
              <View style={styles.Audio_title_Text_Container}>
                <Text style={styles.Audio_title_Text} numberOfLines={1}>{current_audio.filename}</Text>
              </View>
              <View style={styles.iconimageContainer}>
                <View style={styles.iconimagemusicController}>
                  <TouchableOpacity onPress={() => play_skip_back()}> 
                    <Ionicons name="play-skip-back" size={32} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => play_audio("song", false)} > 
                    {play_icon}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => play_skip_forward()}> 
                    <Ionicons name="play-skip-forward" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.Modal_player_duration_Container}>
                <Text style={styles.Audio_modal_player_duration}>{playback_position !== null ? getDurationFormatted(playback_position / 1000) : "0:00"}</Text>
                <Text style={styles.Audio_modal_player_duration}>{getDurationFormatted(current_audio.duration)}</Text>
              </View>
              <View style={styles.Slider_Container}>
                <Slider
                  style={{width: '98%', height: 40}}
                  minimumValue={0}
                  maximumValue={1}
                  value={calculate_seekbar()}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="white"
                  onValueChange={value => {
                    setPlayback_position(value * current_audio.duration * 1000);
                  }}
                  onSlidingStart={ async () =>{
                    try{
                      if(!soundObj.isPlaying){
                        return;
                      }else{
                        const status = await playbackObj.setStatusAsync({shouldPlay: false});
                        setSoundobj(status);
                      }
                    }catch(error){
                      console.log(`Error with onSlidingStart async callback in PlayList.js:\n${error}`);
                    }
                  }
                  }
                  onSlidingComplete={ async (value) => {
                    try{
                      if(soundObj === null){
                        return console.log("In onSlidingComplete async func.:\n soundObj === null\n");
                      }else{
                        let status = await playbackObj.setPositionAsync(Math.floor(soundObj.durationMillis * value));
                        setPlayback_position(status.positionMillis);
                        status = await playbackObj.playAsync();
                        setSoundobj(status);
                      }
                    }catch(error){
                      console.log(`Error with onSlidingComplete async callback in PlayList.js:\n${error}`);
                    }}}/>
              </View>

            </View>
          </BlurView>
        </Modal>
        {mini_player}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
SafeAreaView_Container:{
  flex: 1,
  position: 'relative',
  paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  alignItems:'center',
},
Add_playlist_container:{
  width: 340,
  height: 85,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderColor: 'white',
  borderWidth: 1, 
  borderBottomRightRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 60,
  borderTopLeftRadius: 60,
  flexDirection: 'row',
},
Gray_backround_add_icon_image_container:{
  width: 85,
  height: 85,
  backgroundColor: 'lightgrey',
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  right: 2,
},
Create_playlist_text_container:{
  width: 145,
  height: 42.5,
  justifyContent: 'center',
  right: 95,
},
Create_playlist_text:{
  fontWeight: 'bold',
  color: 'white',
},
ModalContainer:{
  flex: 1,
  alignItems:'center',
  justifyContent:'center',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
},
Create_new_playlist_modal:{
  width: 300,
  height: 100,
  backgroundColor: 'grey',
  alignItems:'center',
  justifyContent:'center',

},
Create_playlist_title_text: {
  color: 'white',
  width: 200,
  height: 50,
  right: 30,
  top: 25,
},
Create_playlist_modal_checkmark_container:{
  alignItems:'center',
  justifyContent:'center',
  width: 50,
  height: 50,
  left: 100,
  bottom: 25,
},
ScrollView_playlist_Titles_container:{
  width:'107%',
  flex: 1,
  justifyContent: 'center',
  alignItems:'center',
  top: '23%',
  position: 'absolute',
},
playlists_container:{
  width: "92%",
  height: 85,
  borderWidth: 1,
  borderColor: 'white',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottomRightRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 60,
  borderTopLeftRadius: 60,
  flexDirection: 'row',
  left: 27,
  marginBottom: 10,
},
playlists_image_container:{
  width: 85,
  height: 85,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  right: '27.7%',
  justifyContent: 'center',
},
playlists_image:{
  width: 85,
  height: 85,
  borderRadius: 20,
},
playlists_title_container:{
  width: 210,
  height: 42.5,
  justifyContent: 'center',
  right: '15%',
},
playlists_title:{
  fontWeight: 'bold',
  color:'white',
},
Modal_playlist_audio_container:{
  flex: 1,
  alignItems:'center',
  justifyContent:'center',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
},
ScrollView_playlist_audio_container:{
  flex: 1,
  justifyContent:'center',
  alignItems:'center',
  top: '4.1%',
  padding: 10,
  width:'107%',
  position: 'absolute',
},
playlist_audio_container:{
  height: 85,
  alignItems: 'center',
  borderColor: 'white',
  borderWidth: 1,
  justifyContent: 'center',
  borderBottomRightRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 60,
  borderTopLeftRadius: 60,
  flexDirection: 'row',
  marginBottom: 10,
  width: "90.5%",
  left: 30,
},
ellipsis_vertical_sharp:{
    width: 25,
    height: 25,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
},
playlist_audio_image_container:{
  width: 85,
  height: 85,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  right: '21.7%',
  justifyContent: 'center',
},
playlist_audio_image:{
  width: 85,
  height: 85,
  borderRadius: 20,
},
playlist_audo_text_container:{
  width: 210,
  height: 70,
  justifyContent: 'center',
  right: '15%',
},
playlist_audio_text:{
  fontWeight: 'bold',
  color: 'white',
},
backgroundimage:{
    position: 'absolute',
    width: '100%',
    height: '110%',
    aspectRatio: 1,
},
playlist_audio_chevron_down_container:{
    right: '43%',
    bottom: '48%',
},
Modal_audio_option:{
    position: 'relative',
    backgroundColor: 'transparent',
    paddingTop: 10,
    width: '85%',
    height: '31%',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
},
modal_Option_Container:{
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 5,
    paddingTop: 5,
    marginBottom: 10,
},
playlist_audio_option_text:{
    fontSize: 20,
    fontWeight: 'bold',
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom:0,
    paddingTop: 5,
    color: 'white',
    zIndex:1000,
},
playlist_audio_option_texts:{
    fontSize: 17,
    fontWeight: 'bold',
    paddingVertical: 10,
    letterSpacing: 1,
    color: 'white',
},
MiniPlayer_Container:{
  position: 'absolute',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  height: 86,
  backgroundColor: 'white',
  borderTopRightRadius: 20,
  borderTopLeftRadius: 20,
  justifyContent: 'space-between',
  top: '91.5%',
},
MiniPlayer_Thumbnail_image:{
  alignItems: 'center',
  top: 10,
  borderTopRightRadius: 20,
  borderTopLeftRadius: 20,
  borderBottomRightRadius: 20, 
  right: 44,
},
MiniPlayer_Text_container:{
  left: 100,
  bottom: 40,
  height: 40,
  width: 250,
  justifyContent: 'center',
},
MiniPlayer_Text:{
  color: 'white',
  fontWeight: 'bold',
},
mini_player:{
  position: 'absolute',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  width: '100%',
  height: '100%',
},
thumbnail: {
  width: "60%",
  bottom: "15%",
  borderRadius: 20,
  alignItems: 'center',
}, 
thumbnails: {
  borderRadius: 20,
}, 
Audio_title_Text_Container: {
  width: '88%',
  height: 45,
  justifyContent: 'space-around',
  alignItems: 'center',
  color: 'white',
  fontWeight: 'bold',
  bottom: 85,
},
Audio_title_Text: {
  color: 'white',
  fontWeight: 'bold',
},
iconimageContainer: {
  width: '40%',
  borderRadius: 5,
  borderColor: 'transparent',
  borderWidth: 2,
  alignItems: 'center',
  bottom: 90,
},
iconimagemusicController:{
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},
chevron_down:{
  right: '43%',
  bottom:'28%',
},
Slider_Container:{
  width: '100%',
  height: 20,
  alignItems: 'center',
  justifyContent: 'space-around',
  bottom: 75,
},
Modal_player_duration_Container:{
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '90%',
  bottom: 75,
  alignItems: 'center',
},
Audio_modal_player_duration: {
  color: 'white',
},
});

export default PlayList;