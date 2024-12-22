import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  ImageBackground,
} from "react-native";
import styles from "./OnboardingStyles";
import { ThemeManager } from "../../../../ThemeManager";
import { LanguageManager } from "../../../../LanguageManager";
import { Button, GradientText } from "../../common";
import { Actions } from "react-native-router-flux";
import images from "../../../theme/Images";
import { heightDimen } from "../../../Utils";
import Video from 'react-native-video';
import { CongratsModel } from "../../common/CongratsModel";




const Onboarding = (props) => {


  return (

    <ImageBackground
      source={ThemeManager.ImageIcons.mainBgImgNew}
      style={{ flex: 1 }}
    >
      <Video
        source={images.welcomeLogo}
        style={styles.backgroundVideo}
        resizeMode="contain"
        loop={true}
        repeat={true}
      />

      <View style={{ ...styles.btnView }}>
        <TouchableOpacity
          style={{ paddingVertical: 10, alignSelf: "center" }}
          onPress={() => {

            Actions.currentScene != "Legal" &&
              Actions.Legal({ from: "ImportWallet" });
          }}
        >

          <Image resizeMode="contain" source={images.alreadyWalletText} />

        </TouchableOpacity>
        <Button
          myStyle={{
            marginBottom: heightDimen(20),
            marginTop: heightDimen(10),
          }}
          onPress={() => {
            Actions.currentScene != "Legal" &&
              Actions.Legal({ from: "createwallet" });
          }}

          buttontext={LanguageManager.onboarding.createWallet}
        />

      </View>
    </ImageBackground>
  );
};

export default Onboarding;
