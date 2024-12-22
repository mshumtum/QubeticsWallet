import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Alert, Platform, ImageBackground } from 'react-native';
import styles from './ManageOnboardingStyles'
import { ThemeManager } from '../../../../ThemeManager';
import { LanguageManager } from '../../../../LanguageManager';
import { Button, HeaderMain } from '../../common';
import { Actions } from 'react-native-router-flux';
import { getDimensionPercentage, heightDimen } from '../../../Utils';
import images from '../../../theme/Images';
import Video from 'react-native-video';

const ManageOnboarding = (props) => {
  return (
    <ImageBackground
      source={ThemeManager.ImageIcons.mainBgImgNew}
      style={{
        flex: 1, backgroundColor: ThemeManager.colors.mainBgNew
      }}>
      <Video
        source={images.welcomeLogo}
        resizeMode="contain"
        style={styles.backgroundVideo}
        repeat={true}
        loop={true}
      />

      <HeaderMain BackButtonText={LanguageManager.manageWallet.manageWallet} />
      <View style={styles.mainView}>
        <View style={styles.subView} />


        <View style={{ marginBottom: getDimensionPercentage(50) }}>
          <TouchableOpacity
            style={{ marginBottom: heightDimen(10), alignSelf: "center" }}
            // onPress={() => { Actions.currentScene != 'ManageImportWallet' && Actions.ManageImportWallet({}) }}
            onPress={() => {
              Actions.currentScene != "ManageImportWallet" &&
                Actions.ManageImportWallet({});
            }}
          >
            <Image resizeMode="contain" source={images.alreadyWalletText} />
          </TouchableOpacity>
          <Button
            myStyle={{ marginBottom: heightDimen(0), marginTop: heightDimen(10) }}
            onPress={() => { Actions.currentScene != 'WalletName' && Actions.WalletName({ screen: props?.screen }) }}
            // customStyle={{ marginTop: 20 }}
            buttontext={LanguageManager.onboarding.createWallet}
          />


        </View>
      </View>
    </ImageBackground>
  );
};

export default ManageOnboarding;