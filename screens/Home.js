import React from "react";
import { View, Text, Button } from "react-native";

function Home({navigation}){
    return(
        <View>
            <Text>
                Home Screen
            </Text>
            <Button title="Add an User"
            onPress={() => navigation.navigate('Additem')}
            />
            <Button title="List of User"
            onPress={() => navigation.navigate('List')}/>
        </View>
    );
}

export default Home;