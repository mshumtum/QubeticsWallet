import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { View, Text, Modal, Platform, StyleSheet, Image } from 'react-native';
import { ThemeManager } from '../../../ThemeManager';
import { Colors, Fonts, Images } from '../../theme';
import * as Constants from '../../Constants';
import { BlurView } from '@react-native-community/blur';
import { getData } from '../../Utils/MethodsUtils';
import Lottie from 'lottie-react-native';
import { Button } from './Button';
import { LanguageManager } from '../../../LanguageManager';
import { EventRegister } from 'react-native-event-listeners';
import { getDimensionPercentage, heightDimen } from '../../Utils';

export const CongratsModel = props => {
  const { pins, merchantCard } = LanguageManager;
  const [themeSelected, setThemeSelected] = useState('');

  //******************************************************************************************/
  useEffect(() => {
    EventRegister.addEventListener('getThemeChanged', data => {
      setThemeSelected(data);
    });
  }, []);

  //******************************************************************************************/
  return (
    <>
      <Modal
        statusBarTranslucent
        animationType="fade"
        transparent={true}
        visible={props.openModel}
        onRequestClose={() => { false }}>
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        <View style={[styles.centeredView]}>
          <View />
          <View style={{ alignItems: 'center' }}>
            <View>
              <Lottie
                style={{ height: 400, }}
                source={Images.tickAnimation}
                autoPlay
              />
            </View>

          </View>
          <View style={{ width: '100%' }}>
            <Button buttontext={pins.Continue} onPress={props.onPress} />
          </View>
        </View>
      </Modal>
    </>
  );
};

//******************************************************************************************/
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00000077',
    paddingBottom: 50
  },
  modalView: {
    backgroundColor: Colors.White,
    borderRadius: 10,
    width: '90%',
    elevation: 4,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: getDimensionPercentage(30),
    fontFamily: Fonts.dmBold,
    marginTop: heightDimen(30),
    color: ThemeManager.colors.headersTextColor,
    lineHeight: getDimensionPercentage(40)
  },
  modalSubTitle: {
    textAlign: 'center',
    fontSize: getDimensionPercentage(16),
    fontFamily: Fonts.dmRegular,
    marginTop: heightDimen(10),
    color: ThemeManager.colors.headersTextColor,
    lineHeight: getDimensionPercentage(24)
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flex: 1,
  },
  textStyle: {

  }
});
