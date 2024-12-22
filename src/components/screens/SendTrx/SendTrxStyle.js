import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors, Fonts } from '../../../theme';
import { ThemeManager } from '../../../../ThemeManager';

export default StyleSheet.create({
  sendBtnStyle: {
    marginTop: 20,
    marginBottom: 25,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
  },
  sendBtnTextStyle: {
    fontFamily: Fonts.dmRegular,
    fontSize: 16,
    textAlign: 'center',
  },
  ViewStyle8: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  ImgStyle1: {},
  TextStyle2: {
    fontSize: 12,
    fontFamily: Fonts.dmRegular,
    marginTop: -4,
  },
  feeView: {
    paddingVertical: 7,
    width: Dimensions.get('screen').width / 3.6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  TextStyle1: {
    marginBottom: 7,
    fontSize: 16,
    fontFamily: Fonts.dmMedium,
  },
  ViewStyle6: {
    width: '100%',
    justifyContent: 'space-between',
    borderColor: 'grey',
    borderWidth: 0,
    marginTop: 20,
  },
  TextStyle: {
    marginTop: 3,
    fontFamily: Fonts.dmMedium,
    fontSize: 14,
    textAlign: 'right',
    width: '45%',
  },
  ViewStyle5: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    width: '100%',
  },
  fiatStyle: {
    fontFamily: Fonts.dmMedium,
    fontSize: 14,
    // marginHorizontal: 10,
    marginLeft: 3,
    // marginTop: 3,
    width: '40%',
  },
  cameraStyle: {
    height: Dimensions.get('window').height / 2,
    width: '80%',
    alignSelf: 'center',
  },
  maxText: {
    fontSize: 16,
    fontFamily: Fonts.dmMedium,
  },
  ViewStyle4: {
    // borderColor: 'transparent',
    // borderWidth: 0,
    // fontSize: 16,
    // width: '70%',
    // alignSelf:"center",



    borderColor: 'transparent',
    borderWidth: 0,
    fontSize: 16,
    width: '70%',
    paddingLeft: 15,
    alignSelf: "center",

  },
  ViewStyle7: {
    fontSize: 16,
    borderWidth: 1,
  },
  maxStyle: {
    height: 52,
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinSymbolStyle: {
    marginRight: 5,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Fonts.dmMedium,
  },
  ViewStyle: {
    justifyContent: 'center',
    height: 55,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
  },
  ViewStyle1: {
    alignSelf: 'center',
    width: '72%',

  },
  ViewStyle2: {
    marginTop: -20,
    height: 56,
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
  },
  ViewStyle3: {
    width: '22%',
    paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ImgStyle: {
    borderRadius: 25,
    resizeMode: 'contain',
    height: 25,
    width: 25,
    alignSelf: 'center',
  },
  scan: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  centeredView: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalView: {
    backgroundColor: Colors.White,
    borderRadius: 12,
    paddingBottom: 0,
  },
  txtWallet: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.whiteText,
    marginBottom: 10,
  },
  txtWallet1: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.colorVariation,
    marginBottom: 10,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txtTitle: {
    fontSize: 14,
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.whiteText,
  },
  securityItem_list_textstyle: {
    fontFamily: Fonts.dmRegular,
    fontSize: 15,
    color: ThemeManager.colors.whiteText,
    marginLeft: 7,
  },
  securityItem_list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  mainView: {
    paddingHorizontal: 23,
    minHeight: 10,
    marginTop: 20,
  },
  txtCancel: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
    marginTop: 20,
    marginRight: 25,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  view2: {
    backgroundColor: ThemeManager.colors.lightBlack,
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
  },
  lineView: {
    backgroundColor: ThemeManager.colors.Mainbg,
    height: 1,
    width: '100%',
    marginVertical: 5,
  },
  txtCharErr: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    padding: 4,
    color: ThemeManager.colors.colorVariation,
    alignSelf: 'flex-start',
    marginTop: -10,
    marginBottom: 10,
  },
});
