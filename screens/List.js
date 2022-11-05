import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View, Button, FlatList, TouchableOpacity,ImageBackground, Alert } from "react-native";
import firestore from '@react-native-firebase/firestore'
import storage, { firebase } from '@react-native-firebase/storage'
import ImagePicker from 'react-native-image-crop-picker'



function List(){

const [username, setUsername] = useState();
const [password, setPassword] = useState();
const [users, setUsers] = useState([]);
const [ifUpdate,setIfUpdate] = useState(null);
const [profileImg, setProfileImg] = useState();
const [deleted, setDeleted] = useState(false);
const [userid, setUserid] =useState(null);
const [imqge, setImage] = useState(null)

const fetchUsers = async () => {
        try{
            const list = [];

            await firestore()
            .collection('users')
            .orderBy('username')
            .get()
            .then((querySnapshot) => {
                // console.log('Total users: ',querySnapshot.size);
                querySnapshot.forEach(doc => {
                    const {username, password, profileImg} = doc.data(); 
                    list.push({
                        id: doc.id,
                        username,
                        password,
                        profileImg
                    });
                });
            })
        
        setUsers(list);
        console.log('users: ',users)

        } catch (e){
            console.log(e);
        }
    }

    useEffect(() => {
    fetchUsers();
},[])

const handleUpdate = async(username,password,profileImg,id) => {
    setUsername(username);
    setPassword(password);
    setProfileImg(profileImg);

    setIfUpdate(true);

}

const submitUpdate = async (id) => {
    let imgUrl = await uploadImage();

    if( imgUrl == null && profileImg ) {
      imgUrl = profileImg;
    
}

firestore()
    .collection('users')
    .doc(id)
    .update({
      username: username,
      password: password,
      profileImg: imgUrl,
    })
    .then(() => {
      console.log('User Updated!');
      Alert.alert(
        'User Updated!',
        'User has been updated successfully.'
      );
    })
  }

  const uploadImage = async () => {
    if( profileImg == null ) {
      return null;
    }
    const uploadUri = profileImg;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop(); 
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;


    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    try {
      await task;

      const url = await storageRef.getDownloadURL();

   
      setProfileImg(profileImg);

      // Alert.alert(
      //   'Image uploaded!',
      //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      // );
      return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };


const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true
      }).then(image => {
        console.log(image);
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setProfileImg(imageUri);
      });      
}

useEffect(() => {
    setDeleted(false);
  }, [deleted]);

const handleDelete = (id) => {
    Alert.alert(
      'Delete User',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed!'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => deletePost(id),
        },
      ],
      {cancelable: false},
    );
  };

  const deletePost = (id) => {
    console.log('Current Post Id: ', id);

    firestore()
      .collection('users')
      .doc(id)
      .get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          const {profileImg} = documentSnapshot.data();

          if (profileImg != null) {
            const storageRef = storage().refFromURL(profileImg);
            const imageRef = storage().ref(storageRef.fullPath);
            console.log('ref ', imageRef)
            imageRef
              .delete()
              .then(() => {
                console.log(`${profileImg} has been deleted successfully.`);
                deleteFirestoreData(id);
              })
              .catch((e) => {
                console.log('Error while deleting the image. ', e);
              });
          } else {
            deleteFirestoreData(id);
            setProfileImg(null);
            setUsername(null)
          }
        }
      });
  };

  const deleteFirestoreData = (id) => {
    firestore()
      .collection('users')
      .doc(id)
      .delete()
      .then(() => {
        Alert.alert(
          'Post deleted!',
          'Your post has been deleted successfully!',
        );
        setDeleted(true);
      })
      .catch((e) => console.log('Error deleting posst.', e));
  };
return(
    <View style={styles.container}>
       {/* <FlatList
            data={users}
            renderItem={({item}) => (
                <View style = {{justifyContent:'center',alignItems:'center'}}>
                    <ImageBackground
                        source={{uri: item.profileImg,}}
                    style={{height:100,width:100, marginBottom:10}}
                    imageStyle={{borderRadius:15}}/>
                <TextInput style={styles.name}>{item.username}</TextInput>
                <TextInput style={styles.name}>{item.password}</TextInput>
                <TouchableOpacity style={styles.button} onPress={ () => handleUpdate()}>
                    <Text style={{color:'white',fontSize:18}}>Update</Text>
                </TouchableOpacity>
                </View>
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          /> */}
            {users.length > 0 
            ? 
            
                ifUpdate ?
                <View>
                {users.map((item) => {
                    return(
                <View style={styles.container}>
                   
                    <ImageBackground
                        source={{uri: profileImg}}
                    style={{height:100,width:100, marginBottom:10}}
                    imageStyle={{borderRadius:15}}/>
                    <TouchableOpacity style={styles.imgUploadBtn}
                        onPress={choosePhotoFromLibrary}>
                        <Text style={{color:'white',fontSize:18}}>
                        Change Photo
                        </Text>
                    </TouchableOpacity>
                    <TextInput style={styles.name} value={username} onChangeText={setUsername}/>
                    <TextInput style={styles.name} value={password} onChangeText={setPassword}/>
                    <TouchableOpacity style={styles.button}  onPress={() => submitUpdate(item.id)}>
                    <Text style={{color:'white',fontSize:18}}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => setIfUpdate(false)}>
                    <Text style={{color:'white',fontSize:18}}>Cancel</Text>
                </TouchableOpacity>
                
                </View>
                )
            })}
            </View>
            :
            <View style={styles.list}>
                {users.map((item) => {
                return(
                    <View style={styles.items}>
                        <ImageBackground
                        source={{uri: item.profileImg,}}
                    style={{height:100,width:100, marginBottom:10}}
                    imageStyle={{borderRadius:15}}/>
                    <Text style={styles.name}>{item.username}</Text>
                    <TouchableOpacity style={styles.button} onPress={ () => handleUpdate(item.username,item.password,item.profileImg,item.id)}>
                    <Text style={{color:'white',fontSize:18}}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={ () => handleDelete(item.id)}>
                    <Text style={{color:'white',fontSize:18}}>Delete</Text>
                </TouchableOpacity>
                    </View>
                )
            })}
            </View>
            
            
            : <Text>No Items</Text>
            }
    </View>
)
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        backgroundColor:'#fff',
        alignItems:'center'
    },
    itemText:{
        fontSize:24,
        fontWeight:'bold',
        textAlign:'center'
    },
    list:{
        flex:1,
        justifyContent:"center",
        alignItems:'center',
    },
    items:{
        flexDirection:'column',
        marginBottom:10,
        justifyContent:"center",
        alignItems:'center',
        borderWidth:1,
        borderColor:'black',
        padding:20,
        borderRadius:8
    },
    name:{
        paddingEnd:10,
        color:'black',
        borderWidth:1,
        borderColor:'black',
        width:300,
        marginBottom:10,
        borderRadius:8,
        padding:10,
        height:45,
    },
    input:{
        borderWidth:2,
        borderColor:"#000",

    },
    button:{
        color:'white',
        height:45,
        backgroundColor:'black',
        borderRadius:8,
        justifyContent:'center',
        alignItems:'center',
        marginBottom:10,
        width:200,
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
})

export default List;