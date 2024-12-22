import React, { useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { ThemeManager } from "../../../ThemeManager";
import { Fonts } from "../../theme";
import FastImage from "react-native-fast-image";
import LinearGradient from "react-native-linear-gradient";

export const Item = (props) => {
  //******************************************************************************************/
  useEffect(() => {
    console.log("props.img::::", props.img);
  }, []);

  //******************************************************************************************/
  return (
    <LinearGradient
      colors={["#69DADB00", "#69DADB33"]}
      style={[
        styles.mainView,
        props.mainView,
        {
          backgroundColor: ThemeManager.colors.nmemonicsInputColor,
          borderRadius: 10,
        },
      ]}
    >
      <TouchableOpacity
        onPress={props.onDappPress}
      // style={[
      //   styles.mainView,
      //   props.mainView,
      //   {
      //     backgroundColor: ThemeManager.colors.nmemonicsInputColor,
      //     borderRadius: 10,
      //   },
      // ]}
      >
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 15 }}
        >
          <FastImage
            style={[styles.imgStyle, props.imgStyle]}
            resizeMode="contain"
            source={{ uri: props.img }}
          />
          <View>
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[
                styles.textStyle,
                props.textStyle,
                { color: ThemeManager.colors.primaryColor },
              ]}
            >
              {props.title ? props.title?.substring(0, 15) + "..." : ""}
            </Text>
            <Text
              allowFontScaling={false}
              style={[
                styles.subTextStyle,
                { color: ThemeManager.colors.blackWhiteText },
              ]}
            >
              {props.subtitle ? props.subtitle?.substring(0, 30) + "..." : ""}
            </Text>
            {/* <Image
            style={{ alignSelf: "flex-end", marginTop: 5 }}
            source={ThemeManager.ImageIcons.dappForward}
          ></Image> */}
          </View>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

//******************************************************************************************/
const styles = StyleSheet.create({
  mainView: {
    // paddingHorizontal: 10,
    // paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    flex: 0.5,
    // width: "40%",
    marginHorizontal: 15,
    height: 190,
    flexWrap: "wrap",
  },
  imgStyle: {
    height: 50,
    width: 50,
    resizeMode: "contain",
    borderRadius: 50,
    alignSelf: "center",
  },
  textStyle: {
    fontFamily: Fonts.dmBold,
    fontSize: 16,
    textTransform: "capitalize",
    marginLeft: 10,
    marginTop: 5
  },
  subTextStyle: {
    fontFamily: Fonts.dmMedium,
    fontSize: 14,
    marginLeft: 10,
    marginTop: 5
  },
});
