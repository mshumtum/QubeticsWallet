import { StyleSheet, Dimensions, Platform } from 'react-native';
import { ThemeManager } from '../../../../ThemeManager';
import { Images, Colors, Fonts } from '../../../theme/';
import { getDimensionPercentage } from '../../../Utils';
import fonts from '../../../theme/Fonts';

export default StyleSheet.create({
  btnSelected: {
    borderColor: Colors.buttonPrimary,
    backgroundColor: Colors.buttonPrimary,
  },
  wrap: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.screenBg,
  },
  tab_wrapstyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  tabsWrap: {
    backgroundColor: Colors.tabsWrapBg,
    height: 55,
    borderRadius: 14,
    paddingHorizontal: 3,
    width: '93%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 6,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  tab_itemTextStyle: {
    fontFamily: Fonts.dmBold,
    fontSize: 14,
    color: Colors.tabTextColor,
    paddingHorizontal: 12,
  },
  tab_itemStyle: {},
  tab_inActiveStyle: {
    width: '50%',
    justifyContent: 'center',
    height: "100%",
  },
  tab_inActiveStyleLeft: {
    justifyContent: 'center',
    height: "100%",
    lex: 1, borderTopLeftRadius: 14, borderBottomLeftRadius: 14
  },
  tab_inActiveStyleRight: {
    justifyContent: 'center',
    height: "100%",
    borderTopRightRadius: 14, borderBottomRightRadius: 14
  },
  tab_isActiveStyle: {
    backgroundColor: Colors.White,
    height: 50,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tab_isActiveTextStyle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 16,
    color: ThemeManager.colors.whiteText,
    paddingHorizontal: 15,
    textAlign: 'center',

  },
  subHeader: {
    paddingHorizontal: 23,
    marginTop: 18,
    marginBottom: 18,
  },
  subHeaderTitleStyle: {
    fontFamily: Fonts.dmBold,
    fontSize: 32,
    color: Colors.textColor,
    paddingHorizontal: 8,
    marginBottom: 7,
  },
  subHeaderTextStyle: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: Colors.textColor,
    paddingHorizontal: 8,
  },
  seprator: {
    height: 14,
    width: 2,
    backgroundColor: Colors.themeColor,
    position: 'absolute',
    zIndex: 10,
    left: 18,
    top: 19,
  },
  amoutReceived: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 15,
  },
  amountValueTextStyle: {
    fontFamily: Fonts.dmBold,
    fontSize: 18,
    color: Colors.themeColor,
    marginRight: 8,
  },
  amountTextStyle: {
    fontFamily: Fonts.dmMedium,
    fontSize: 12,
    color: Colors.amountReceivedColor,
  },
  exchangeTextWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  exTextStyle: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: Colors.textColor,
    marginBottom: 4,
  },
  ContainerView: {},

  container: {
    flex: 1,
    alignItems: 'center', // horizontal center
    flexDirection: 'column',
    backgroundColor: Colors.OrangeColor,
    marginTop: 0,
  },

  TopContainerView: {
    flex: 0.2,
    backgroundColor: Colors.OrangeColor,
    flexDirection: 'column',
    width: '100%',
  },
  mainViewStylenew: {
    width: '100%',
    justifyContent: 'center',
    flex: 1
  },
  mainViewStyle: {
    width: '100%',
    backgroundColor: 'white',
    opacity: 82,
    justifyContent: 'center',
  },
  KeyboardInsideView: {
    flex: 1,
    width: '92%',
    alignSelf: 'center',
    height: Dimensions.get('window').height > 736 ? Dimensions.get('window').height - 200 : Dimensions.get('window').height - 180
  },
  textStyle: {
    fontFamily: Fonts.osSemibold,
    fontSize: 12,
    paddingBottom: 10,
    color: '#1D1D1D',
    marginTop: 15,
  },
  ViewStyle: {
    flexDirection: 'row',
    paddingVertical: 3,
    width: '100%',
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: '#9999995C',
  },
  txtInputStyle: {
    color: '#1D1D1D',
    fontFamily: Fonts.osSemibold,
    fontSize: 12,
    marginLeft: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  ViewStyle2: {
    height: '100%',
    width: '30%',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  txtStyle2: {
    fontFamily: Fonts.osSemibold,
    alignSelf: 'center',
    fontSize: 12,
    color: '#1D1D1D',
  },
  imgstyle: { marginTop: 5, justifyContent: 'center', tintColor: '#2783F3' },
  ViewStyle3: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lightTxtStyle: { color: '#84899B', fontSize: 12, fontFamily: Fonts.osSemibold },
  imgstyle2: { tintColor: '#2783F3', alignSelf: 'center', height: 30, width: 30 },
  dropdwnStyle: {
    fontFamily: Fonts.osSemibold,
    fontSize: 12,
    justifyContent: 'center',
  },
  btnStyle: {
    width: '92%',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 45,
    height: Dimensions.get('window').height < 667 ? 40 : 50,
    backgroundColor: Colors.btnColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  btnTxtStyle: { color: '#fff', fontSize: 14, fontFamily: Fonts.osRegular },
  modalView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.White,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderWidth: 1,
    borderColor: '#D5D6D7',
    shadowColor: Colors.borderShadowColor,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '99%',
  },
  FlatlistCell: {
    width: '100%',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#D2D2D2',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    minHeight: '10%',
    elevation: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tokenItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tokenItem_first: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tokenImage_style: {
    width: 38,
    height: 38,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    borderRadius: 38 / 2,
  },
  tokenText_style: {
    fontFamily: Fonts.osBold,
    fontSize: 16,
    color: Colors.textDark,
    marginRight: 5,
    marginLeft: 10,
  },
  tokenItem_last: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tokenValueTextStyle_style: {
    fontFamily: Fonts.osRegular,
    fontSize: 14,
    color: 'rgba(50,55,73,0.33)',
  },
  tokeUsdValue_style: {
    fontFamily: Fonts.osRegular,
    fontSize: 12,
    color: 'rgba(50,55,73,0.33)',
  },
  nameImage_style: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 38 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenImageText_style: {
    fontFamily: Fonts.osBold,
    fontSize: 16,
    color: Colors.white,
  },
  bar: {
    backgroundColor: 'transparent',
    marginTop: Platform.OS === 'ios' ? 28 : 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backgroundImage: {
    alignSelf: 'center',
    top: 20,
    left: 0,
    right: 0,
    width: null,
    height: 30,
    resizeMode: 'cover',
  },
  ViewStyle8: {
    width: '100%',
    height: 50,
    borderColor: '#D2D2D2',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: '2%',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tchbleStyle: {
    height: '100%',
    width: '33%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  txtStyle3: {
    fontWeight: '500',
    fontFamily: Fonts.osSemibold,
    fontSize: 12,
  },
  txtTitle: {
    fontSize: 14,
    fontFamily: Fonts.dmLight,
    color: ThemeManager.colors.lightWhiteText,
    marginBottom: 5,
    marginTop: 5,
    alignSelf: 'center',
    lineHeight: 20,
    textAlign: 'center',
  },
  txtPercentage: {
    fontSize: 16,
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.whiteText,
  },
  tabsView: {
    justifyContent: 'space-around',
  },
  sliderView: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginRight: 45,
  },
  titleTextStyle: {
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.whiteText,
    fontSize: 14,
    paddingRight: 5,
  },
  NoList: {
    fontFamily: Fonts.dmRegular,
    fontSize: 18,
    color: Colors.White,
    paddingHorizontal: 8,
    alignSelf: 'center',
    marginTop: Dimensions.get('screen').height / 3.5,
  },

  // *********
  centeredView2: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    minHeight: '10%',
  },
  tokenImage_style: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  tokenImage_stylee: {
    alignSelf: 'center',
    width: 35,
    height: 35,
    marginRight: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  tokenAbr_style: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.whiteText,
  },
  tokenAbr_stylee: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.whiteText,
  },
  coinTextStyle: {
    fontSize: 14,
    fontFamily: Fonts.dmMedium,
    color: Colors.themeColor,
    alignSelf: 'center',
  },
  coinText: {
    fontSize: 16,
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.whiteText,
    paddingLeft: 10,
    alignSelf: 'center',
  },
  txtTitle: {
    fontSize: 14,
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.lightWhiteText,
    marginTop: 20,
    marginBottom: 10,
  },

  txtView: {
    fontSize: 12,
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.whiteText,
    alignSelf: 'center',
    textAlign: 'center',
  },
  //************************ ON CHIAN Style ************************
  onChainItem: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  onChainSubView: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  iconViewStyle: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  iconStyle: {
    borderRadius: 28,
    resizeMode: 'contain',
  },
  dapView: { marginRight: 20, marginLeft: 15 },
  dapTxt: {
    fontSize: 16,
    fontFamily: Fonts.dmRegular,
  },
  dapAboutTxt: {
    lineHeight: 18,
    marginRight: 10,
    textAlign: 'left',
    fontSize: 12,
    fontFamily: Fonts.dmLight,
  },
  // DAP confirmation modal
  modalView2: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalinner: {
    backgroundColor: ThemeManager.colors.whiteText,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.White,
    paddingHorizontal: 15,
    paddingVertical: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 2,
    width: '85%',
  },
  vwSignTransaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
    marginBottom: 8,
  },
  titleSign: {
    fontFamily: Fonts.dmMedium,
    fontSize: 17,
  },
  textLbl: {
    fontFamily: Fonts.dmMedium,
    fontSize: 15,
  },
  txtValue: {
    width: '75%',
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
  },
  enabledFessStyle: {
    fontSize: 14,
    fontFamily: Fonts.dmMedium,
    color: Colors.White,
  },
  enabledFessvalueStyle: {
    fontSize: 11,
    fontFamily: Fonts.dmMedium,
    color: Colors.White,
  },

  disabledFessStyle: {
    fontSize: 14,
    fontFamily: Fonts.dmMedium,
    color: Colors.Black,
  },

  disabledFessvalueStyle: {
    fontSize: 11,
    fontFamily: Fonts.dmMedium,
    color: Colors.Black,
  },

  mainFeeView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 8,
    marginBottom: 14,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    borderColor: '#E6E6E6',
    backgroundColor: '#E6E6E6',
  },
  feeStyle: {
    marginTop: 35,
    flexDirection: 'row',
    marginHorizontal: 26,
    justifyContent: 'space-between',
  },

  feeslowStyle: {
    paddingVertical: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: Colors.White,
    width: '33%',
    paddingLeft: 12,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textColor,
    marginBottom: 15,
    alignSelf: 'center',
  },
  feesText: {
    fontSize: 12,
    fontFamily: Fonts.dmRegular,
    width: '80%',
  },
  cmingSoonText: {
    fontSize: getDimensionPercentage(20),
    textAlign: 'center',
    fontFamily: fonts.dmBold
  }
});
