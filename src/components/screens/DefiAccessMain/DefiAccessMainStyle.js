import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { ThemeManager } from '../../../../ThemeManager';
import { Images, Colors, Fonts } from '../../../theme';
import { dimen, getDimensionPercentage, heightDimen, widthDimen } from '../../../Utils';
import DeviceInfo from 'react-native-device-info';

export default StyleSheet.create({
  emptyView: {
    alignSelf: 'center',
    marginTop: Dimensions.get('screen').height / 3,
  },
  txtTitle: {
    fontSize: 15,
    fontFamily: Fonts.dmMedium,
    marginHorizontal: 23,
    marginTop: 20,
    color: ThemeManager.colors.settingsText,
  },
  ViewStyle2: {
    paddingHorizontal: getDimensionPercentage(25),
    width: '100%',
    marginTop: Platform.OS == 'ios'
      ? DeviceInfo.hasNotch() || DeviceInfo.hasDynamicIsland()
        ? 0
        : 0
      : StatusBar.currentHeight
        ? StatusBar.currentHeight
        : 28,
  },
  ViewStyle1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getDimensionPercentage(20),
    justifyContent: "space-between"
  },
  walletNameIcon: {
    fontFamily: Fonts.dmBold,
    fontSize: dimen(25.46),
    fontWeight: '700',
    lineHeight: dimen(25.46),
    textAlign: 'center',
    letterSpacing: -0.5092,
    marginTop: heightDimen(5),
    marginLeft: widthDimen(3),
  },
  walletName: {
    textTransform: "capitalize",
    marginLeft: widthDimen(6),
    fontSize: getDimensionPercentage(20),
    fontFamily: Fonts.dmSemiBold,
    lineHeight: getDimensionPercentage(20),
    maxWidth: widthDimen(230),
    marginTop: heightDimen(5),
  }
});
