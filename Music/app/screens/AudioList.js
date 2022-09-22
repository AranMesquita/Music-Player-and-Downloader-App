import { StyleSheet, Text, View, TouchableWithoutFeedback, TouchableOpacity, Image, ScrollView, Platform, StatusBar, Modal, Alert } from 'react-native';
import React, {useState, useEffect} from 'react';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useKeepAwake } from 'expo-keep-awake';

const AudioList = () => {
  const [modalstate, setModalState] = useState(false);
  const [audio_files, setAudio_Files] = useState([]);
  const [audiotitle, setAudioTitle] = useState("Audio Title:");
  const [list_thumbnail_url, setList_Thumbnail_Url] = useState([]);
  const [modal_player, setModal_Player] = useState(false);
  const [audio_item, setAudio_Item] = useState([]);
  const [play_icon, setPlay_icon] = useState(<Ionicons name="pause" size={32} color="white" />);
  const [audio_file_item_index, setAudio_File_Item_Index] = useState(null);
  const [playbackObj, setPlaybackobj] = useState(null);
  const [soundObj, setSoundobj] = useState(null);
  const [playback_position, setPlayback_position] = useState(null);
  const [did_just_finnish, setDid_just_finnish] = useState(false);
  const [mini_player, setMini_player] = useState(<View></View>);
  const [playlist_titles, setPlaylist_titles] = useState([]);
  const [modal_playlist, SetModal_playlist] = useState(false);

  useEffect(() => {
    try{
      // useEffect is a react hook which calls funtion after initial render
      getPermission();
      get_Audio_Thumbnail_Url();
      get_AsyncStorage_keys();
      return;
    }catch(error){
      console.log(`Error with useEffect func. in AudioList.js:\n${error}`);
    }
  }, []); // empty array used so useEffect is only called once after initial render

  useEffect(() => {
    try{
      // useEffect is a react hook which calls funtion after initial render
      // This useEffect checks to see if any new audo files have been downloaded in-order to add them to the array of audio files
      // + so the new audio files can be rendered to the user
      _get_AudioFiles().then(result =>{
        if(result.length !== audio_files.length){
          get_Audio_Thumbnail_Url();
          setAudio_Files(result);
          return;
        }else{
          return;
        }
      });
      _get_AsyncStorage_keys().then(result =>{
        if(result.length !== playlist_titles.length){
          setPlaylist_titles(result);
          return;
        }else{
          return;
        }
      });
      
    }catch(error){
      console.log(`Error with useEffect func. in AudioList.js:\n${error}`);
    }
  });

  const _get_AudioFiles = async () => {
    // getAudioFiles async func. retrieves a promise obj. containing all the audio files on the users device 
    // + relative information about the audio files e.g. Duration & file name e.g.(Song Title.mp3).
    try{
        let AudioMedia = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
        });
        AudioMedia = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
          first: AudioMedia.totalCount, // 1
        });
        let filter_audio = AudioMedia.assets.filter((audio) =>{
          // filters out some unnecessary audio files that most likely is not a song
          return audio.duration > 60 && audio.filename.endsWith('mp3');
        });
        // Set() object is a collection of values where each value may only occur once
        // + each value is unique when added to the Set and checked whether the value equates to any other value that has already been added to the Set before adding said value to the Set
        // + thus allowing the filtering of an array of objects as a specific key value pair can be added into the Set
        // + then filtering out duplicate objects if its key value pair has already been added to the set 
        const unique_keys = new Set();
        const filter_duplicates = filter_audio.filter(element => {
          const isDuplicate = unique_keys.has(element.filename);

          unique_keys.add(element.filename);

          if (!isDuplicate) {
            return true;
          }
          return false;
        });
        return filter_duplicates;
    }catch(error){
        console.log(`Error with getAudioFiles async func. in AudioList.js:\n${error}`);
    }   
  }

  // useKeepAwake() a React hook that prevents the screen from sleeping
  useKeepAwake();

  const calculate_seekbar = () =>{
    // calculate_seekbar func. calculates the length of the seek-bar in the audio player
    try{
      if(playback_position !== null && soundObj !== null){
        return playback_position / soundObj.durationMillis;
      }else{
        return 0;
      }
    }catch(error){
      console.log(`Error with calculate_seekbar func. in AudioList.js:\n${error}`);
    }
  }

  const onPlaybackStatusUpdate = (playbackStatus) => {
    // onPlaybackStatusUpdate func. allows for callback on the audio's status
    try{
      // + to allow for the duration of the audio to be calculated and shown on the seek-bar
      if(playbackStatus.isLoaded && playbackStatus.isPlaying){
        setPlayback_position(playbackStatus.positionMillis);
        return;
      }
      // + also allows to check whether the audio has just finnished and allow for the next audio to be played
      if(playbackStatus.didJustFinish){
          setDid_just_finnish(true);
          return;
      }
    }catch(error){
      console.log(`Error with onPlaybackStatusUpdate func. in AudioList.js:\n${error}`);
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
      console.log(`Error with play_audio async func. in AudioList.js:\n${error}`);
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
      const index = audio_files.indexOf(audio_item) + 1 >= audio_files.length ? 0 : audio_files.indexOf(audio_item) + 1;
      setAudio_Item(audio_files[index]);
      setAudio_File_Item_Index(index);
      play_audio(audio_files[index], true);
      Mini_player_did_just_finish(audio_files[index]);
      return;
    }catch(error){
      console.log(`Error with if condition in AudioList.js:\n${error}`);
    }  
  }

  const play_skip_forward = () => {
    // play_skip_forward func. skips the song to the next song by incrementing(+) the current audios index by 1
    try{
      // index var. has a one liner if statement that checks whether the current audio index is at the end of the array(out of range)
      // index var returns 0 if the condition is satisfied, thus looping through audios, by setting the audios index to the beginning of the audios array  
      const index = audio_files.indexOf(audio_item) + 1 >= audio_files.length ? 0 : audio_files.indexOf(audio_item) + 1;
      setAudio_Item(audio_files[index]);
      setAudio_File_Item_Index(index);
      play_audio(audio_files[index], true);
      return;
    }catch(error){
      console.log(`Error with play_skip_forward func. in AudioList.js:\n${error}`);
    }
  }
  const play_skip_back = () => {
    // play_skip_back func. skips the song to the previous song by decrementing(-) the current audios index by 1
    try{
      // index var. has a one liner if statement that checks whether the current audio index is at the beginning of the list(out of range)
      // index var returns the length of the audios array -1 (audio_files.length -1) if the condition is satisfied, thus looping through audios, by setting the audios index to the end of the audios array 
      const index = audio_files.indexOf(audio_item) - 1 < 0 ? audio_files.length - 1 : audio_files.indexOf(audio_item) - 1;
      setAudio_Item(audio_files[index]);
      setAudio_File_Item_Index(index);
      play_audio(audio_files[index], true);
      return;
    }catch(error){
      console.log(`Error with play_skip_back func. in AudioList.js:\n${error}`);
    }
  }

  const get_Audio_Thumbnail_Url = async () => {
    // get_Audio_Thumbnail_Url async func. retrivies a saved thumbnail url(via the async-storage key @Song_title&thumbnail_url) of a song that has been downloaded through the app.
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
      console.log(`Error with get_Audio_Thumbnail_Url async func. in AudioList.js:\n${error}`);
    }
  }

  const modal_audio_options = (Audio_file_item_index) =>{
    // modal_audio_option func. displays selectable options (play , +Playlist, delete) when the vertical ellipises alongside the audio title is pressed.
    try{
      setAudio_File_Item_Index(Audio_file_item_index);
      setAudioTitle(`${audio_files[Audio_file_item_index].filename}:`);
      setModalState(true);
      return;
    }catch(error){
      console.log(`Error with modal_audio_options func. in AudioList.js:\n${error}`);
    }
  }

  const modal_option_play = () =>{
    // modal_option_play func. plays the audio when the 'play' TouchableOpacity Text is pressed in the moadal_audio_options.
    try{
      setAudio_Item(audio_files[audio_file_item_index]);
      setModal_Player(true);
      setModalState(false);
      play_audio(audio_files[audio_file_item_index], true);
      return;
    }catch(error){
      console.log(`Error with modal_option_play func. in AudioList.js:\n${error}`);
    }
  }

  const modal_option_add_to_playlist = async () =>{
    // modal_option_add_to_playlist func. adds the audio to a desired playlist when the 'Add to Playlist' TouchableOpacity Text is pressed in the moadal_audio_options
    try{
      SetModal_playlist(true);
      return;
    }catch(error){
      console.log(`Error with modal_option_add_to_playlist func. in AudioList.js(lines: 236-->243):\n${error}`);
    }
  }

  const modal_option_delete = async () =>{
    // modal_option_add_delete async func. deletes a chosen audio when the 'delete' TouchableOpacity Text is pressed in the moadal_audio_options.
    try{
      await MediaLibrary.deleteAssetsAsync(audio_files[audio_file_item_index].uri)
      .catch(error => {
        console.log(error);
      });
      let audio_item_copy = [...audio_files.slice(0, audio_file_item_index), ...audio_files.slice(audio_file_item_index + 1)];
      setAudio_Files(audio_item_copy);
      setModalState(false);
      return;
    }catch(error){
      console.log(`Error modal_option_delete async func. in AudioList.js(lines: 246-->255):\n${error}`);
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
      console.log(`Error getDurationFormatted func. in AudioList.js:\n${error}`);
    }
  }

  const permissionAlert = () => { 
    // permissionAlert func. sends an alert(similar to a pop-up) to the user when they have denied permission to read their media files.
    // The alert is used to inform the user that the permission needs to be granted in order for the app to work.
    try{
        Alert.alert("Permission Required", "Permission required in-order to play music from the device", [{
            text: "Ok",
            onPress: () => getPermission()
        },{
            text: "Cancel",
            onPress: () => permissionAlert()
        }]);
      }catch(error){
        console.log(`Error with permissionAlert func. in AudioList.js:\n${error}`);
      }
    }

const getPermission = async () =>{
    // getPermission func. requests permission from user to read the media files(video, image, & audio) on the device.
    // once permission is granted getPermission func. then retrieves all the audio files from the users device in a promise.
    try{
        const permission = await MediaLibrary.requestPermissionsAsync();
        const Expo_av_permission = await Audio.requestPermissionsAsync();
        if(permission.granted){
            // get all the audio files
            await getAudioFiles();
        }else if(!permission.granted && permission.canAskAgain){
            const {status, canAskAgain} = await MediaLibrary.requestPermissionsAsync();
            if (status === 'denied' && canAskAgain){
                // display an alert to user that user must alow permission to use this app
                permissionAlert();
            }else if(status === 'granted'){
                // get all the audio files
                await getAudioFiles();
            }else if(status === 'denied' && !canAskAgain){
                // display an alert to user that user must alow permission to use this app
                permissionAlert();
            }
        }
        if (Expo_av_permission.granted) {
          await Audio.setAudioModeAsync({
            staysActiveInBackground: true,
          });
        }else if(!Expo_av_permission.granted && Expo_av_permission.canAskAgain){
          const {status, canAskAgain} = await Audio.requestPermissionsAsync();
          if (status === 'denied' && canAskAgain){
            // display an alert to user that user must alow permission to use this app
            permissionAlert();
          }else if(status === 'granted'){
            // get all the audio files
            await getAudioFiles();
          }else if(status === 'denied' && !canAskAgain){
              // display an alert to user that user must alow permission to use this app
              permissionAlert();
          }
        }
      }catch(error){
        console.log(`Error with getPermission async func. in AudioList.js:\n${error}`);
      }
    }

const getAudioFiles = async () => {
    // getAudioFiles async func. retrieves a promise obj. containing all the audio files on the users device 
    // + relative information about the audio files e.g. Duration & file name e.g.(Song Title.mp3).
    try{
        let AudioMedia = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
        });
        AudioMedia = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
          first: AudioMedia.totalCount,
        });
        let filter_audio = AudioMedia.assets.filter((audio) =>{
          // filters out some unnecessary audio files that most likely is not a song
          return audio.duration > 60 && audio.filename.endsWith('mp3');
        });
        // Set() object is a collection of values where each value may only occur once
        // + each value is unique when added to the Set and checked whether the value equates to any other value that has already been added to the Set before adding said value to the Set
        // + thus allowing the filtering of an array of objects as a specific key value pair can be added into the Set
        // + then filtering out duplicate objects if its key value pair has already been added to the set 
        const unique_keys = new Set();
        const filter_duplicates = filter_audio.filter(element => {
          const isDuplicate = unique_keys.has(element.filename);

          unique_keys.add(element.filename);

          if (!isDuplicate) {
            return true;
          }
          return false;
        });
        setAudio_Files(filter_duplicates);
        return;
    }catch(error){
        console.log(`Error with getAudioFiles async func. in AudioList.js:\n${error}`);
    }   
  }
  
  const get_AsyncStorage_keys = async () => {
    // get_AsyncStorage_keys async func. gets all the keys from the AsyncStorage
    // + then filters the keys so only the keys that are linked to a playlist are shown
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
      console.log(`Error with get_AsyncStorage_keys async func. in AudioList.js:\n${error}`);
    }
  }
  const _get_AsyncStorage_keys = async () => {
    // get_AsyncStorage_keys async func. gets all the keys from the AsyncStorage
    // + then filters the keys so only the keys that are linked to a playlist are shown
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
      console.log(`Error with get_AsyncStorage_keys async func. in AudioList.js:\n${error}`);
    }
  }
  const Add_to_playlist = async (playlist) => {
    // Add_to_playlist async func. adds the desired audio to a chosen playlist
    try {
      const AsyncStorage_playlist = await AsyncStorage.getItem(playlist);
      // this if condition checks whether the chosen playlist is a new playlist
      // + as AsyncStorage only stores data as a string, thus new data has to be overlayed over the old data
      if (AsyncStorage_playlist !== 'New_Playlist'){
        const jsonData = JSON.parse(AsyncStorage_playlist);
        const objList = [...jsonData, audio_files[audio_file_item_index]];
        await AsyncStorage.setItem(playlist, JSON.stringify(objList));
        SetModal_playlist(false);
        return;   
      }else{
        const array_first_audio = new Array(audio_files[audio_file_item_index]);
        await AsyncStorage.setItem(playlist, JSON.stringify(array_first_audio));
        SetModal_playlist(false);
        return;
      };
    } catch (error) {
      console.log(`Error with Add_to_playlist async function in AudioList.js:\n${error}`);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image style={styles.backgroundimage} source={require("./assets/bkg.jpg")}/>
      <View style={styles.container}>
        <Modal transparent={true} visible={modalstate}>
          <TouchableWithoutFeedback onPress={() => {setModalState(false)}}>
            <BlurView tint={'dark'} intensity={'62'} style={[StyleSheet.absoluteFill, styles.ModalContainer]}>
              <BlurView tint='light' intensity={'75'} style={[StyleSheet.absoluteFill, styles.modal_Container]}></BlurView>
              <View style={styles.modal_Text_Container}>
                <Text style={styles.modal_Audio_Title} numberOfLines={2}>{audiotitle}</Text>
                <View style={styles.modal_Option_Container}>
                  <TouchableOpacity onPress={()=> {modal_option_play()}}>
                    <Text style={styles.modal_Option}>
                      <Ionicons name="play" size={24} color="white" />
                      Play
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=> {modal_option_add_to_playlist()}}>
                    <Text style={styles.modal_Option}>
                      <MaterialCommunityIcons name="playlist-plus" size={24} color="white" />
                      Add To Paylist
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=> {modal_option_delete()}}>
                    <Text style={styles.modal_Option}>
                      <Ionicons name="trash-outline" size={24} color="white" />
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </TouchableWithoutFeedback>
        </Modal>
        <ScrollView >
          {audio_files.map((item, index) => {
            return(
            <View key={index} style = {styles.item}>
              <BlurView  intensity={'125'} style={[StyleSheet.absoluteFill, styles.blurContainers]}/>
              <View style={styles.itemLeft}>
                  <View style={styles.square}>
                    <Image style={styles.square} source={{
                      width: 40,
                      height: 40,
                      uri: !list_thumbnail_url[item.filename] ? "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png" : list_thumbnail_url[item.filename]}}/>
                  </View>
                    <Text style={styles.itemText} numberOfLines={3}>{item.filename}{"\n"}{getDurationFormatted(item.duration)}</Text>
                    <View style={styles.circular}>
                      <View style={styles.iconimage}>
                        <TouchableOpacity key={index} onPress={() => modal_audio_options(index)}> 
                          <Ionicons name="ellipsis-vertical-sharp" size={24} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
              </View>
            </View>
          )}
        )}
        </ScrollView>
        <Modal animationType='slide' transparent={true} visible={modal_player}>
        <Image style={styles.backgroundimage} source={ 
          require("./assets/bkg.jpg")}/>
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
              uri: !list_thumbnail_url[audio_item.filename] ? "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png" : list_thumbnail_url[audio_item.filename]}}/>
          </View>
          <View style={styles.Audio_title_Text_Container}>
            <Text style={styles.Audio_title_Text} numberOfLines={1}>{audio_item.filename}</Text>
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
            <Text style={styles.Audio_modal_player_duration}>{getDurationFormatted(audio_item.duration)}</Text>
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
                setPlayback_position(value * audio_item.duration * 1000);
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
                  console.log(`Error with onSlidingStart async callback in AudioList.js(lines: 135-->150):\n${error}`);
                }
              }}
              onSlidingComplete={ async (value) => {
                try{
                  if(soundObj === null){
                    return "In onSlidingComplete async func.:\n soundObj === null\n";
                  }else{
                    let status = await playbackObj.setPositionAsync(Math.floor(soundObj.durationMillis * value));
                    setPlayback_position(status.positionMillis);
                    status = await playbackObj.playAsync();
                    setSoundobj(status);
                  }
                }catch(error){
                  console.log(`Error with onSlidingComplete async callback in AudioList.js(lines: 135-->150):\n${error}`);
                }
              }}/>
          </View>

        </View>
        </BlurView>
        </Modal>
        {mini_player}
        <Modal animationType='slide' transparent={true} visible={modal_playlist}>
          <Image style={styles.backgroundimage} source={ 
            require("./assets/bkg.jpg")}/>
          <BlurView tint={'dark'} intensity={'96'} style={[StyleSheet.absoluteFill, styles.ModalContainer]}>
            <View style={styles.mini_player}>
              <View style={styles.Add_to_playlist_chevron_down}>
                <TouchableOpacity onPress={()=> SetModal_playlist(false)}>
                  <Ionicons name="chevron-down" size={48} color="white" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {playlist_titles.map((item, index) => {
                  return(
                  <View key={index} style = {styles.item}>
                    <TouchableOpacity activeOpacity={0.9} onPress={() => Add_to_playlist(item)}>
                    <BlurView  intensity={'125'} style={[StyleSheet.absoluteFill, styles.blurContainers]}/>
                      <View style={styles.itemLeft}>
                        <View style={styles.square}>
                          <Image style={styles.square} source={{
                            width: 40,
                            height: 40,
                            uri: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/e7981d38-6ee3-496d-a6c0-8710745bdbfc/db6zlbs-68b8cd4f-bf6b-4d39-b9a7-7475cade812f.png"}}/>
                        </View>
                        <Text style={styles.itemText} numberOfLines={1}>{item}</Text>
                        </View>
                    </TouchableOpacity>
                  </View>
                  )})}
              </ScrollView>
            </View>
          </BlurView>
        </Modal>
      </View>
    </SafeAreaView>
      
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    position: 'relative',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: 'transparent',
},
container: {
  flex: 1,
  backgroundColor: 'transparent',
  paddingBottom: 19,
},
item: {
  backgroundColor: 'transparent',
  borderColor: 'black',
  borderRadius: 60,
  top: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
  width: '98.5%',
},
itemLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
},
square: {
  width: 85,
  height: 85,
  borderRadius: 20,
  marginRight: '1.5%',
  alignItems: 'center',
  justifyContent: 'center',
},
itemText: {
  width: '60%',
  height: 55,
  maxWidth: '70%',
  borderRadius: 5,
  borderColor: 'transparent',
  borderWidth: 2,
  color: 'white',
  fontWeight: 'bold',
},
circular: {
  width: 45,
  height: 45,
  borderRadius: 5,
  borderColor: 'transparent',
  borderWidth: 2,
  alignItems: 'center',
  marginRight: -15,
},
iconimage:{
  alignItems: 'center',
  marginTop: 6,
},
blurContainers:{
  flex: 1,
  justifyContent: 'center',
  borderBottomRightRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 60,
  borderTopLeftRadius: 60,
  left: 20,
  right: 4,
  borderWidth: 1.5,
  borderColor: "white",
},
backgroundimage:{
  position: 'absolute',
  height: '100%',
  width: '100%',
  aspectRatio: 1,
},
ModalContainer:{
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
},
modal_Container:{
  position: 'relative',
  backgroundColor: 'transparent',
  paddingTop: 10,
  width: '85%',
  height: '31%',
  borderColor: 'white',
  borderWidth: 1,
  borderRadius: 20,
},
modal_Text_Container:{
  position: 'absolute',
  flex: 1,
  backgroundColor: 'transparent',
  paddingTop: 10,
  width: '85%',
  height: '31%',
  borderColor: 'white',
  borderWidth: 1,
  borderRadius: 20,
},
modal_Audio_Title:{
  fontSize: 20,
  fontWeight: 'bold',
  padding: 20,
  paddingBottom:0,
  paddingTop: 5,
  color: 'white',
  zIndex:1000,
},
modal_Option_Container:{
  padding: 20,
  flexDirection: 'column',
  justifyContent: 'center',
  paddingBottom: 5,
  paddingTop: 5,
},
modal_Option:{
  fontSize: 17,
  fontWeight: 'bold',
  paddingVertical: 10,
  letterSpacing: 1,
  color: 'white',
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
  top: '88.5%',
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
Add_to_playlist_chevron_down:{
  right: '43%',
},
});

export default AudioList;