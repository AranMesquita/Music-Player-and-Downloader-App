import React, {useState} from 'react';
import {KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, Image, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {server_song_download} from '../../components/DownloadComponent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import {
  AndroidImportance,
  AndroidNotificationVisibility,
  NotificationChannel,
  NotificationChannelInput,
  NotificationContentInput,
} from "expo-notifications";
import { downloadToFolder } from "expo-file-dl";
import SearchAnimation from '../../components/SearchAnimation';
import DownloadAnimation from '../../components/DownloadAnimation';
import {flask_server_Download_url, flask_server_search_url} from '../../components/server_urls'

const AudioDownload = () => {
  const [task, setTask] = useState('');
  const [taskItems, setTaskItems] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState("0%");
  const [downloading, setDownloading] = useState(false);
  const [search_pending, setSearch_pending] = useState(false);
  const[ artist_songs_search, setArtist_songs_search] = useState(false);

  const store_download_image = async (value) => {
    // store_download_image async func. uses AsyncStorage to store an object of all the thumbnail images of the audio(s) that are downloaded via the app
    try {
      const song_thumbnail_url_storage = await AsyncStorage.getItem('@Song_title&thumbnail_url');
      if (song_thumbnail_url_storage === null){
          await AsyncStorage.setItem('@Song_title&thumbnail_url', JSON.stringify(value));
      }else{
        const jsonData = JSON.parse(song_thumbnail_url_storage);
        const objList = [jsonData, value];
        const objObj = Object.assign({}, ...objList);
        await AsyncStorage.setItem('@Song_title&thumbnail_url', JSON.stringify(objObj));
        };
    } catch (error) {
      console.log(`Error with storeData async func. in AudioDownload.js:\n${error}`);
    }
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  
  const channelId = "DownloadInfo";

  const setNotificationChannel = async () => {
    const loadingChannel = await Notifications.getNotificationChannelAsync(
      channelId
    );

    // if we didn't find a notification channel set how we like it, then we create one
    if (loadingChannel == null) {
      const channelOptions= {
        name: channelId,
        importance: AndroidImportance.HIGH,
        lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
        sound: "default",
        vibrationPattern: [250],
        enableVibrate: true,
      };
      await Notifications.setNotificationChannelAsync(
        channelId,
        channelOptions
      );
    }
  }

  // IMPORTANT: You MUST obtain MEDIA_LIBRARY permissions for the file download to succeed
    // If you don't the downloads will fail
    const getMediaLibraryPermissions = async () => {
      await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    }
  
    // You also MUST obtain NOTIFICATIONS permissions to show any notification
    // https://docs.expo.io/versions/latest/sdk/notifications/#fetching-information-about-notifications-related-permissions
    const getNotificationPermissions = async() => {
      await Permissions.askAsync(Permissions.NOTIFICATIONS);
    }
    const downloadProgressUpdater = ({
      totalBytesWritten,
      totalBytesExpectedToWrite,
    }) => {
      const pctg = 100 * (totalBytesWritten / totalBytesExpectedToWrite);
      setDownloadProgress(`${pctg.toFixed(0)}%`);
    };

    const askForPermissions = async () => {
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA,
        Permissions.MEDIA_LIBRARY,
      );
      if (status !== 'granted') {
        Alert.alert('Permission Required", "Permission required in-order to download music');
        return false;
      }
      return true;
    }

  const Search_for_song = (search_for_artist_song = null) => {
    setSearch_pending(true)
    
    // Search_for_song func. searches for a song with a given input that is sent, via(post request), to a python server where the request is handled
    // + an object containing the songs name, thumbnail image, duration and youtube id is sent back as the response
    Keyboard.dismiss();
    fetch(flask_server_search_url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      song: search_for_artist_song? search_for_artist_song :  task
    })
  })
  .then((response) => response.json())
  .then((json) => {
    if(task.includes('artist:')){
      setArtist_songs_search(true);
    }
    if(search_for_artist_song){
      setArtist_songs_search(false);
      setTask('');
    }
    setSearch_pending(false);
    setTaskItems(json);
  })
  .catch((error) => {
    console.error(error);
  });
  };


  const Download_song = (index) =>{
    // Download_song func. sends a post to download song to the actual server and then sends a get request to download song to the user
    if(task.includes('artist:')){
      let search_song = taskItems[index]['title'];
      Search_for_song(task.replace("artist:", "") + search_song)
      return;
    }
    if(downloading){
      return;
    }
    setDownloading(true);
    let itemsCopy = [...taskItems];
    let download_index =itemsCopy[index];
    server_song_download(download_index);
    askForPermissions();
    getMediaLibraryPermissions();
    getNotificationPermissions();
    setNotificationChannel();
    const downloadSong = async () => {
      // downloadSong async func. downloads song to the user
      await downloadToFolder(flask_server_Download_url, `${download_index["title"]}.mp3`, "Download", channelId, {
      downloadProgressCallback: downloadProgressUpdater,
    });
    setDownloading(false);
    }
    setTimeout(downloadSong, 30000);
    setTaskItems(itemsCopy);
    const value = { [`${download_index["title"]}.mp3`] : download_index["thumbnail_url"] };
    store_download_image(value);
    setDownloadProgress("0%");
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {search_pending? <SearchAnimation/> : null}
      {downloading? <DownloadAnimation/> : null}
      <Image style={styles.backgroundimage} source={require("./assets/bkg.jpg")}/> 
      <View style={styles.container}>
        <ScrollView styles={styles.items}>
          {taskItems.map((item, index) =>{
            return (
            <View key={index} style = {styles.item}>
              <BlurView  intensity={'125'} style={[StyleSheet.absoluteFill, styles.blurContainers]}/>
              <View style={styles.itemLeft}>
                <View style={styles.square}>
                  <Image  style={styles.square} source={{
                    width: 40,
                    height: 40,
                    uri: item['thumbnail_url']}}/>
                </View>
                <Text numberOfLines={3} style={styles.itemText}>{item['title']}{"\n"}{!item['duration']? null : item['duration']}</Text>
                <View style={styles.circular}>
                  <View style={styles.iconimage}>
                      <TouchableOpacity key={index} onPress={() => Download_song(index)}>
                        {!artist_songs_search? <Feather name="download" size={24} color="white" /> : <Ionicons name="search" size={24} color="#ffffff" />}
                      </TouchableOpacity>
                      {/*task.includes('artist:') */}
                  </View>
                </View>
              </View>
            </View>
            )})}
            </ScrollView>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.writeTasksWrapper}>
                <View style={styles.input}>
                <BlurView tint='light' intensity={'80'} style={[StyleSheet.absoluteFill, styles.blurContainer]}/>
                  <TextInput style={styles.search} placeholder={'Search Song'} placeholderTextColor="white" value={task} onChangeText={text => setTask(text)}/>
                  <TouchableOpacity onPress={() => Search_for_song()} style={styles.addWrapper}>
                    <Ionicons name="search" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  )};

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
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },  
  items: {
    marginTop: 40,
  },
  writeTasksWrapper: {
    position: 'absolute',
    top: 30,
    width: '100%', 
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  input: {
    height: '60%',
    backgroundColor: 'transparent',
    borderRadius: 60,
    borderColor: 'transparent',
    borderWidth: 1,
    width: 340,
    justifyContent: 'space-between',
    bottom: 40,

    shadowOpacity: 0.08,
    shadowOffset:{
      width: 0,
      height: 20,
    },
    shadowRadius: 10,
    elevation: 15,
  },  
  addWrapper: {
    width: 50,
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'transparent',
    borderWidth: 1,
    marginLeft: '82%',
    bottom: 45,
  },
  search: {
    height: 50,
    width: 200,
    top: 6,
    left: 15,
    color: 'white',
  },
  backgroundimage:{
    position: 'absolute',
    height: '100%',
    width: '100%',
    aspectRatio: 1,
  },
  blurContainer:{
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'white',
    shadowOpacity: 0.08,
    shadowOffset:{
      width: 0,
      height: 20,
    },
    shadowRadius: 10,
    elevation: 20,
  },
  item: {
    backgroundColor: 'transparent',
    borderColor: 'black',
    borderRadius: 60,
    top: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    width: '99%',
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
    height: 50,
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
});


export default AudioDownload;