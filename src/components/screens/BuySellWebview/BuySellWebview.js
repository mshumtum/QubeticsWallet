import { View, Text } from "react-native";
import React, { useState } from "react";
import { HeaderMain, LoaderView } from "../../common";
import { widthDimen } from "../../../Utils";
import WebView from "react-native-webview";

const BuySellWebview = (props) => {
  const [loading, setLoading] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <HeaderMain
        BackButtonText={props?.providerName}
        customStyle={{ paddingHorizontal: widthDimen(24) }}
        showBackBtn={false}
        customMainStyle={{
          borderBottomEndRadius: 0,
          borderBottomStartRadius: 0,
        }}
      />
      <WebView
        onLoadStart={() => {
          setLoading(true);
        }}
        style={{ flex: 1 }}
        source={{ uri: props?.redirectLink }}
        onLoadEnd={() => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        }}
        onMessage={(event) => {
          console.log("onMessage event ======", event);
          const onMessageData = event.nativeEvent.data;
          console.log("onMessage onMessageData 2222======", onMessageData);
        }}
        onNavigationStateChange={(navState) => {
          console.log("onNavigationStateChange ======", navState);
        }}
      />
      {loading == true && <LoaderView isLoading={loading} />}
    </View>
  );
};

export default BuySellWebview;
