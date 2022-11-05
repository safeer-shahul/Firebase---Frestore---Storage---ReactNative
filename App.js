/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import { NavigationContainer } from '@react-navigation/native';
 import React from 'react';
 import { StyleSheet, View, Text } from 'react-native';
 import { createStackNavigator } from '@react-navigation/stack' 
 import Home from './screens/Home'
 import AddItem from './screens/AddItem'
 import List from './screens/List';
 
 const Stack = createStackNavigator();
 
 function App(){
   return(
     <NavigationContainer>
       <Stack.Navigator>
         <Stack.Screen name = "Home" component={Home}/>
         <Stack.Screen name="Additem" component={AddItem}/>
         <Stack.Screen name="List" component={List}/>
       </Stack.Navigator>
     </NavigationContainer>
   )
 }
 
 
 const styles = StyleSheet.create({
   container:{
     flex:1,
     justifyContent:'center',
     alignItems:'center'
   }
 });
 
 export default App;
 