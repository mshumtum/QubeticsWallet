import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Modal,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  Platform,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { Colors, Fonts, Images } from "../../theme/";
import { ThemeManager } from "../../../ThemeManager";
import { Header } from "./Header";
import Singleton from "../../Singleton";
import { bigNumberSafeMath, CommaSeprator1, exponentialToDecimal, toFixedExp } from "../../Utils/MethodsUtils";
import { InputtextSearch } from "./InputTextSearch";
import * as Constants from "../../Constants";
import CrosschainSwapItem from "../screens/Swap/CrosschainSwapItem";
import FastImage from "react-native-fast-image";
import CountryFlag from "react-native-country-flag";
import { LanguageManager } from "../../../LanguageManager";
import { HeaderMain } from "./HeaderMain";
import LinearGradient from "react-native-linear-gradient";
import { SearchToken } from "./SearchToken";
import {
  getDimensionPercentage,
  hasNotchWithIOS,
  heightDimen,
} from "../../Utils";

let List = [];


export const ChangellyCoinList = (props) => {
  const { commonText } = LanguageManager;
  const [CoinList, setList] = useState([]);

  //******************************************************************************************/
  useEffect(() => {
    // console.log("herelist::::: ", props.list);
    List = props.showSearch || props.contactUs ? props.list : Constants.AssetList;
    setList(List);
  }, [props.list]);

  //******************************************************************************************/
  const getTagLabel = (item) => {
    if (item.coin_family == 2 && item.is_token == 1) {
      return " | ERC20";
    } else if (item.coin_family == 1 && item.is_token == 1) {
      return " | BEP20";
    } else if (item.coin_family == 4 && item.is_token == 1) {
      return " | POL ERC20";
    } else if (item.coin_family == 6 && item.is_token == 1) {
      return " | TRC20";
    } else {
      return "";
    }
  };

  //******************************************************************************************/
  return (
    <Modal
      statusBarTranslucent
      animationType="fade"
      transparent={true}
      visible={props.openModel}
      onRequestClose={props.handleBack || props.onPressIn}
    >

      <ImageBackground
        source={ThemeManager.ImageIcons.mainBgImgNew}
        style={{
          flex: 1,
          backgroundColor: ThemeManager.colors.mainBgNew,
          //  paddingTop: Platform.OS === 'ios' ? 40 : 30
        }}
      >
        <View style={{ flex: 1 }}>
          <HeaderMain
            backCallBack={props.handleBack}
            BackButtonText={props.title ? props.title : commonText.ChooseAsset}
          />
          {props.children}
          {(List?.length > 0 ||
            props.search?.length > 0 ||
            props.fromSearch == true) && (
              <View style={{ marginHorizontal: 10 }}>
                <SearchToken
                  isIconsShow={false}
                  value={props.search}
                  onSubmitEditing={props.onSubmitEditing}
                  onChangeText={props.onChangeNumber}
                  inputProps={{
                    autoCorrect: false,
                  }}
                />
              </View>
            )}
          <View style={{ flex: 1, marginTop: 15 }}>
            <FlatList
              bounces={false}
              keyExtractor={(item, index) => index + ""}
              onScroll={props.onScroll}
              showsVerticalScrollIndicator={false}
              data={CoinList}
              style={{ marginBottom: heightDimen(20) }}
              ListEmptyComponent={() => {
                return (
                  <View style={[styles.emptyView1, , props.noStyle]}>
                    <Text
                      allowFontScaling={false}
                      style={[
                        {
                          ...styles.textStyle,
                          color: ThemeManager.colors.blackWhiteText,
                        },
                      ]}
                    >
                      {commonText.NoListFound}
                    </Text>
                  </View>
                );
              }}
              renderItem={({ item, index }) => {
                return (
                  <CrossChainItem
                    disabled={false}
                    onPress={() => props.onPress(item)}
                    item={item}
                    index={index}
                    key={item?.id}
                  />
                );
              }}
            />
          </View>
        </View>
      </ImageBackground>
    </Modal>
  );
};

const getCoinName = (item) => {
  const target = Constants.AssetList.find((val) => val.coin_family == item.coinFamily);
  if (target) {
    return target.coin_symbol.toUpperCase();
  }
  return "";
};

const CrossChainItem = (props) => {
  const { item, index } = props;
  const data = item?.coins_changelly_rel;
  /******************************************************************************************/
  return (
    <View
      style={{
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 10,
        marginHorizontal: 15,
        padding: 5,
        backgroundColor: ThemeManager.colors.mnemonicsBg
      }}
    >
      <TouchableOpacity
        key={data?.id || index}
        onPress={() => {
          props.onPress(index);
        }}
        disabled={props.disabled}
      >
        <View style={[styles.tokenItem, { flex: 1 }]}>
          <View style={[styles.tokenItem_first, { flex: 1 }]}>
            {item?.coin_image == "" || item?.coin_image == null ? (
              <View
                style={[
                  styles.tokenImage_stylee,
                  { backgroundColor: ThemeManager.colors.borderUnderLine },
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.tokenAbr_stylee,
                    { color: ThemeManager.colors.Text },
                  ]}
                >
                  {item.coin_name?.charAt(0)}
                </Text>
              </View>
            ) : (
              <View
                style={{ justifyContent: "center", alignContent: "center" }}
              >
                <Image style={styles.icon} source={{ uri: item?.coin_image }} />
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                // width: "70%",
                flex: 1
              }}
            >
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.tokenAbr_style,
                  { color: ThemeManager.colors.blackWhiteText },
                ]}
              >
                {item.coin_name}
                {data?.coinFamily != null && (
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.tokenAbr_style,
                      { color: "#A1A1A1", fontSize: 12, marginLeft: 0 },
                    ]}
                  >
                    {data.coinFamily == 6
                      ? " | TRX"
                      : data.coinFamily == 2
                        ? " | ETH"
                        : data.coinFamily == 1
                          ? " | BNB"
                          : data.coinFamily == 4
                            ? " | MATIC"
                            : ""}
                  </Text>
                )}
              </Text>

            </View>
          </View>
          {item?.wallet_data?.balance ? <View style={{ flex: .4 }}>
            <Text
              // numberOfLines={1}
              allowFontScaling={false}
              style={[
                styles.tokenAbr_style,
                {
                  fontSize: 12,
                  fontFamily: Fonts.dmRegular,
                  color: ThemeManager.colors.blackWhiteText,
                  textAlign: 'right',
                },
              ]}
            >
              {Singleton.getInstance().isHideBalance ? "*****" : toFixedExp(item?.wallet_data?.balance, item?.wallet_data?.balance > 1 ? 2 : 4)} {!!data?.isToken ? data.name?.toUpperCase() : getCoinName(data)}
            </Text>
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[
                styles.tokenAbr_style,
                {
                  fontSize: 12,
                  fontFamily: Fonts.dmRegular,
                  color: ThemeManager.colors.blackWhiteText,
                  textAlign: 'right',
                  marginTop: 5
                },
              ]}
            >
              {Singleton.getInstance().CurrencySymbol}{(Singleton.getInstance().isHideBalance ? "*****" : toFixedExp(bigNumberSafeMath(item?.wallet_data?.balance, "*", item?.fiat_price_data?.value), 2))}
            </Text>
          </View> : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

//******************************************************************************************/
const styles = StyleSheet.create({
  TextStyle: {
    fontSize: 12,
    marginVertical: 2,
  },
  emptyView1: {
    alignSelf: "center",
    marginTop: Dimensions.get("screen").height / 2.5,
  },
  viewStyle22: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 3,
  },
  titleTextStyleNew: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    paddingRight: 5,
  },
  ViewStyle1: {
    flexDirection: "column",
    marginLeft: 13,
  },
  ViewStyle3: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    paddingVertical: 8,
  },
  txtCoin: {
    fontFamily: Fonts.dmMedium,
    fontSize: 16,
  },
  txtValue: {
    fontFamily: Fonts.dmRegular,
    fontSize: 12,
    color: ThemeManager.colors.lightText,
  },
  ViewStyle2: {
    height: 33,
    alignSelf: "center",
    width: 33,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  imgCoin: {
    width: 33,
    height: 33,
    borderRadius: 30,
    resizeMode: "contain",
    alignSelf: "center",
  },
  ViewStyle: {
    flexDirection: "row",
    // width: "95%",
    flex: 1,
    marginHorizontal: 15,
    // paddingVertical:8,
    justifyContent: "center",
    alignSelf: "center",
  },
  tokenImage_stylee: {
    alignSelf: "center",
    width: 30,
    height: 30,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  tokenAbr_stylee: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.whiteText,
  },
  textStyle: {
    fontFamily: Fonts.dmSemiBold,
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },
  textStyle1: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: Fonts.dmRegular,
    textAlign: "center",
  },
  modalView: {
    backgroundColor: Colors.White,
    width: "100%",
    paddingHorizontal: getDimensionPercentage(15),
    flex: 1,
  },
  centeredView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  centeredView1: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  touchableStyle: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 5,
    justifyContent: "space-between",
  },
  imgStyle: {
    height: 32,
    width: 32,
    borderRadius: 32,
  },
  blurView: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flex: 1,
  },

  //*************************************** STYLES OFRENDER ITEM OF LIST ***************************************/
  tokenItem: {
    alignItems: "center",
    marginHorizontal: 15,
    flexDirection: "row",
    // justifyContent: "space-between",
    paddingVertical: 8,
  },
  tokenItem_first: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  tokenImage_stylee: {
    alignSelf: "center",
    width: 33,
    height: 33,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#B9CADB",
    //
  },
  tokenAbr_stylee: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.whiteText,
    textAlign: "center",
  },
  tokenAbr_style: {
    fontFamily: Fonts.dmMedium,
    fontSize: 16,
    color: ThemeManager.colors.whiteText,
    marginRight: 5,
    marginLeft: 10,
  },
  icon: {
    width: 33,
    height: 33,
    borderRadius: 30,
    backgroundColor: "white",
  },
});
