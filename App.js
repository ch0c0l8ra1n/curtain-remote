import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://192.168.1.73:5001/";

export default function App() {
  const [keyInput,setKeyInput] = useState("");
  const [name,setName] = useState("");

  const [socket,setSocket] = useState(null);
  const [connected,setConnected] = useState(false);
  const [roomJoined,setRoomJoined] = useState(false);

  const [state,setState] = useState({
    appState: {
      appName: "MainMenu",
      selectedAppIndex: 0
    }
  })

  const sendNavigation = (dir) => {
    socket.emit("navigate",{direction:dir,key:keyInput})
  }

  const joinRoom = (key,name) => {
    socket.emit("joinRoom",{key,name});
  };

  const leaveRoom = () => {

  };

  const sendLaunch = (dir) => {
    socket.emit("launch",{key:keyInput})
  }

  const sendOption = (option) => {
    socket.emit("select",{
      key:keyInput,
      option})
  }

  const seen = () => {
    socket.emit("seen",{
      key:keyInput,
    })
  }

  const unseen = () => {
    socket.emit("unseen",{
      key:keyInput,
    })
  }

  useEffect( () => {
    const s = socketIOClient(ENDPOINT,{transports: ['websocket','polling']});
    setSocket(s);
    s.on("connect", () => {
      setConnected(true);
    })

    s.on("disconnect", () => {
      setConnected(false);
    })

    s.on("controllerUpdate",(data) => {
      setRoomJoined(data.roomJoined);
      setState({
        appName: data.appName,
        appState: data.appState
      })
    })

  },[]);
  
  if (roomJoined){
    return (
      <View style={styles.container}>
        { state.appName === "MainMenu" ? 
          <>
          <Text>{state.appName}</Text>
          <View style={{width:"100%",borderWidth:1,borderColor:"red",alignItems: 'center',justifyContent: 'center',height:100,flexDirection:"row"}}>
          <View styles={{flex:1}}>
            <Button title="⬅" onPress={() => sendNavigation("left")}/>
          </View>
          <View styles={{flex:1}}>
            <Button title="➡" onPress={() => sendNavigation("right")}/>
          </View>
        </View>
        <View>
          <Button title="Enter" onPress={()=>sendLaunch()}/>
        </View>
        </>: null}
        { state.appName === "Trivia" ?
        <>
        <Text>TRIVIA!</Text>
        <View style={{width:"100%",borderWidth:1,borderColor:"red",alignItems: 'center',justifyContent: 'center',height:100,flexDirection:"row"}}>
          <Button title="A" onPress={() => sendOption("A")}></Button>
          <Button title="B" onPress={() => sendOption("B")}></Button>
          <Button title="C" onPress={() => sendOption("C")}></Button>
          <Button title="D" onPress={() => sendOption("D")}></Button>
        </View>
        </>: null}
        { state.appName === "MemoryGame" ?
        <>
        <View style={{width:"100%",borderWidth:1,borderColor:"red",alignItems: 'center',justifyContent: 'center',height:100,flexDirection:"row"}}>
          <Button title="SEEN" onPress={() => seen()} />
          <Button title="Unseen" onPress={() => unseen()} />
        </View>
        </> : null}
        
      </View>
    )
  }

  if (connected){
    return (
      <View style={styles.container}>
        <View>
          <Text>Connected to {ENDPOINT}</Text>
          <TextInput style={{height:50,borderColor:"gray",borderWidth:1}} value={name} onChangeText={setName} placeholder="Name"/>
          <TextInput style={{height:50,borderColor:"gray",borderWidth:1}} value={keyInput} onChangeText={setKeyInput} placeholder="Room key"/>
          <Button title="Join" color="#454500" onPress={() => joinRoom(keyInput,name)}/>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View>
        <Text>Connecting to {ENDPOINT} beep!</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
