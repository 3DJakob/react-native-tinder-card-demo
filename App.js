import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TinderCard from "./components/TinderCard";
import styled from "styled-components/native";
import ExampleComponent from "./components/ExampleComponent";

const Card = styled.View`
  width: 200px;
  height: 200px;
  background-color: red;
`;

export default function App() {
  return (
    <View style={styles.container}>
      <TinderCard>
        <Card />
      </TinderCard>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
