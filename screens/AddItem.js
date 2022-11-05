import React, { useState } from "react";
import { ImageBackground, Platform, StyleSheet, Text, Alert, TextInput, TouchableOpacity, View } from "react-native";
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'

function AddItem(){
const [image, setImage] = useState('https://www.citypng.com/public/uploads/preview/profile-user-round-black-icon-symbol-hd-png-11639594326nxsyvfnkg9.png');
const [username, setUsername] = useState(null);
const [password, setPassword] = useState(null);

const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true
      }).then(image => {
        console.log(image);
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
      });      
}

const submitUser = async () => {
    const imageUrl = await uploadImage();
    console.log('Image Url: ', imageUrl);
    console.log('username: ', username);
    console.log('password: ', password);

    firestore()
    .collection('users')
    .add({
      username: username,
      password: password,
      profileImg: imageUrl,
    })
    .then(() => {
      console.log('User Added!');
      Alert.alert(
        'User Added!',
        'User has been published Successfully!',
      );
      setUsername(null);
      setPassword(null);
    })
    .catch((error) => {
      console.log('Something went wrong with added post to firestore.', error);
    });
  }

  const uploadImage = async () => {
    if( image == null ) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop(); 
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setImage(null);

      Alert.alert(
        'Image uploaded!',
        'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      );
      return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };

return(
    <View style={styles.container}>
       <ImageBackground
       source={{
        uri:image,
       }}
       style={{height:100,width:100, marginBottom:10}}
       imageStyle={{borderRadius:15}}
       />
       <TouchableOpacity style={styles.imgUploadBtn}
        onPress={choosePhotoFromLibrary}>
            <Text style={{color:'white',fontSize:18}}>
                Upload Photo
            </Text>
        </TouchableOpacity>
        <TextInput 
            placeholder="Username"
            style={styles.textInput}
            value={username}
            onChangeText={(uname) => setUsername(uname)}
            />
        <TextInput 
            placeholder="Password"
            style={styles.textInput}
            value={password}
            onChangeText={(pwd) => setPassword(pwd)}
            secureTextEntry={true}
            />
        <TouchableOpacity style={styles.imgUploadBtn}
        onPress={submitUser}>
            <Text style={{color:'white',fontSize:18}}>
                Submit User
            </Text>
        </TouchableOpacity>
    </View>
)
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    imgUploadBtn:{
        color:'white',
        height:35,
        backgroundColor:'black',
        borderRadius:8,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10,
        width:200,
    },
    textInput:{
        height:50,
        padding:4,
        marginRight:5,
        fontSize:18,
        borderWidth:1,
        borderColor:'black',
        borderRadius:8,
        color:'black',
        width:300,
        marginBottom:10
    }
})


export default AddItem;