/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import { View, Text, BackHandler, FlatList, SectionList, Image, Dimensions, ImageBackground, TouchableOpacity, Platform } from 'react-native';
import styles from './DefiAccessMainStyle';
import {
  LoaderView,
  Header,
  Item,
  InputtextSearch,
  AppAlert,
  HeaderMain,
} from '../../common';
import { ThemeManager } from '../../../../ThemeManager';
import Singleton from '../../../Singleton';
import * as Constants from '../../../Constants';
import { ActionConst, Actions } from 'react-native-router-flux';
import { requestDefiLinks, fetchNativePrice, getDaapList } from '../../../Redux/Actions';
import { connect } from 'react-redux';
import { getData, saveData, toFixedExp } from '../../../Utils/MethodsUtils';
import { EventRegister } from 'react-native-event-listeners';
import { Images } from '../../../theme';
import { ConfirmAlert } from '../../common/ConfirmAlert';
import { LanguageManager } from '../../../../LanguageManager';
import { SwapHeader } from '../../common/SwapHeader';
import DapsCards from '../../common/DapsCards';
import { getDimensionPercentage, heightDimen, widthDimen } from '../../../Utils';
import DeviceInfo from 'react-native-device-info';
const { width } = Dimensions.get("window");

class DefiAccessMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: false,
      isLoading: false,
      enteredURL: '',
      isFavoriteSelected: true,
      favoriteArray: [],
      showAlertDialog: false,
      alertTxt: '',
      defiList: [],
      defiListNew: [],
      isSearchVisible: false,
      showLoader: false,
      themeSelected: '',
      showAlertDialogConfirm: false,
      alertTxtConfirm: '',
      maticFiatPrice: 0,
      bnbFiatPrice: 0,
      ethFiatPrice: 0,
      walletName: ''
    };
    this.scrollRef = React.createRef();
  }

  componentDidMount() {
    getData(Constants.WALLET_NAME).then(async (res) => {
      this.setState({ walletName: res })
    });

    EventRegister.addEventListener(Constants.DOWN_MODAL, () => {
      this.setState({
        showAlertDialog: false,
        alertTxt: '',
        alertTxtConfirm: '',
        showAlertDialogConfirm: false,
      });
    });
    this.props.navigation.addListener('didFocus', () => {
      getData(Constants.FAVORITE).then(response => {
        response ? this.setState({ defiList: JSON.parse(response), isLoading: false }) : null;
      });
      getData(Constants.WALLET_NAME).then(async (res) => {
        this.setState({ walletName: res })
      });
      this.getDappList();
      this.setState({ enteredURL: '', isSearchVisible: false });
      this.backhandle = BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
      EventRegister.addEventListener('getThemeChanged', data => {
        this.setState({ themeSelected: data });
      });
    });
    this.props.navigation.addListener('didBlur', () => {
      this._scrollToTop();
      if (this.backhandle) this.backhandle.remove();
      this.setState({ showLoader: false });
    });
  }

  /******************************************************************************************/
  _scrollToTop() {
    if (this.scrollRef !== null) {
      if (this.scrollRef.current !== null) {
        this.state.defiList?.length > 0 &&
          this.scrollRef.current.scrollToIndex({ animated: true, index: 0 });
      }
    }
  }

  /******************************************************************************************/
  handleBackButtonClick() {
    console.log('Backhandler Defi');
    Singleton.bottomBar?.navigateTab('WalletMain');
    // Actions.pop();
    Actions.Main({ type: ActionConst.RESET });

    return true;
  }

  /******************************************************************************************/
  getDappList() {
    const Ethdata = {
      fiat_currency: Singleton.getInstance().CurrencySelected,
      coin_family: 2,
    };
    const Bnbdata = {
      fiat_currency: Singleton.getInstance().CurrencySelected,
      coin_family: 1,
    };
    const Maticdata = {
      fiat_currency: Singleton.getInstance().CurrencySelected,
      coin_family: 4,
    };

    this.props.getDaapList().then(res => {
      this.setState({ defiListNew: res, isLoading: false });
      console.log("dapp list>>>>>", res);
    })


    // fetchRpc() {
    //   this.props.getRpcUrl({});
    // }




    this.props.fetchNativePrice({ data: Maticdata }).then(Maticdata => {
      this.props.fetchNativePrice({ data: Bnbdata }).then(Bnbdata => {
        this.props.fetchNativePrice({ data: Ethdata }).then(Ethdata => {
          console.log('chk Ethdata native price:::::', Ethdata);
          this.setState({ maticFiatPrice: toFixedExp(Maticdata?.fiatCoinPrice?.value, 2), bnbFiatPrice: toFixedExp(Bnbdata?.fiatCoinPrice?.value, 2), ethFiatPrice: toFixedExp(Ethdata?.fiatCoinPrice?.value, 2), });
          getData(Constants.FAVORITE).then(response => {
            const res = response?.length > 0 ? JSON.parse(response) : [];
            console.log('chk res dapplist::::::', res);
            if (res) {
              res.map(item => { item.MaticNativePrice = toFixedExp(Maticdata?.fiatCoinPrice?.value, 2) });
              this.setState({ defiList: res, isLoading: false });
            }
          });
        });
      })
    }).catch(err => {
      if (err == LanguageManager.alertMessages.pleaseCheckYourNetworkConnection) {
        this.setState({ showAlertDialog: true, alertTxt: LanguageManager.alertMessages.pleaseCheckYourNetworkConnection });
      }
    });
  }

  notiPressed() {
    Singleton.isNotification = false
    this.setState({ is_notification: false });
    Actions.currentScene != "NotificationsTab" &&
      Actions.NotificationsTab({ themeSelected: this.state.themeSelected });
  }




  /******************************************************************************************/
  validURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  }

  /******************************************************************************************/
  submitPressed(url, item = '') {
    console.log(url, 'chk url?.includes::::::', url?.includes('pancake'))
    if (!global.isConnected) {
      return this.setState({
        showAlertDialog: true,
        alertTxt: LanguageManager.alertMessages.pleaseCheckYourNetworkConnection,
      });
    }
    Actions.currentScene != 'DappBrowserNew' && Actions.DappBrowserNew({
      item: item,
      url: url,
      themeSelected: this.state.themeSelected,
      maticFiatPrice: this.state.maticFiatPrice,
      bnbFiatPrice: this.state.bnbFiatPrice,
      ethFiatPrice: this.state.ethFiatPrice,
      // chainId: url?.includes('pancake') ? 56 : 1,
      // selectedNetwork: url?.includes('pancake') ? 'Binance' : 'Ethereum',
      // selectedNetworkImageUri: url?.includes('pancake') ? Constants.BSC_Img : Constants.ETH_Img,
      // rpcUrl: url?.includes('pancake') ? Constants.BSC_MAINNET_URL : Constants.ETH_MAINNET_URL,
    });
    this.setState({ enteredURL: '', isSearchVisible: false });
  }

  /******************************************************************************************/
  onSubmit() {
    if (this.validURL(this.state.enteredURL)) {
      if (!this.state.enteredURL.startsWith('http')) {
        this.setState({ enteredURL: 'https://' + this.state.enteredURL }, () =>
          this.submitPressed(this.state.enteredURL),
        );
      } else {
        this.setState({ enteredURL: this.state.enteredURL }, () =>
          this.submitPressed(this.state.enteredURL),
        );
      }
    } else {
      this.setState({ enteredURL: 'https://www.google.com/search?q=' + this.state.enteredURL }, () => this.submitPressed(this.state.enteredURL),);
    }
  }

  /******************************************************************************************/
  clearBookMark() {
    this.setState({
      showAlertDialogConfirm: true,
      alertTxtConfirm: LanguageManager.alertMessages.doYouWantToDeleteBookmarks,
    });
  }

  /******************************************************************************************/
  callDelete() {
    this.setState({ defiList: [] }, () => {
      saveData(Constants.FAVORITE, JSON.stringify(this.state.defiList));
    });
  }

  /******************************************************************************************/
  render() {
    const { browser, walletMain, setting } = LanguageManager;
    const baseURL = 'https://stage-novatide-wallet.s3.us-east-2.amazonaws.com';
    return (
      <ImageBackground
        source={ThemeManager.ImageIcons.mainBgImgNew}
        style={{ flex: 1, backgroundColor: ThemeManager.colors.mainBgNew }}
      >
        {/* <SwapHeader
          name={this.state.walletName}
          // fromDapp={true}
          onPress={() => {
            this.setState({ defiList: [] }, () => {
              saveData(Constants.FAVORITE, []);
            });
          }}
        /> */}
        {/* <HeaderMain
          TextcustomStyle={{ marginLeft: -14 }}
          showBackBtn={true}
          BackButtonText={browser.Dapp}
          backCallBack={() => { }}
          imgSecond={this.state.defiList?.length > 0 && Images.icon_delete}
          onPressIcon={() =>
            this.state.defiList?.length > 0 && this.clearBookMark()
          }
        /> */}
        <View
          style={{
            width: Dimensions.get('screen').width,
            paddingTop: Platform.OS == 'ios'
              ? DeviceInfo.hasNotch() || DeviceInfo.hasDynamicIsland()
                ? getDimensionPercentage(50)
                : getDimensionPercentage(20)

              : getDimensionPercentage(0),
          }}
        >
          <View style={[styles.ViewStyle2]}>
            <View style={[styles.ViewStyle, {}]}>

              <TouchableOpacity
                onPress={() => {
                  if (Actions.currentScene !== "MyWalletList") {
                    Actions.MyWalletList();
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <ImageBackground
                    source={Images.portfolio_active_bg}
                    resizeMode="contain"
                    style={{ height: heightDimen(46), width: widthDimen(46), alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={[styles.walletNameIcon, { color: ThemeManager.colors.blackWhiteText }]}>{this.state.walletName?.charAt(0)?.toUpperCase()}</Text>
                  </ImageBackground>
                  <Text
                    ellipsizeMode="tail"
                    style={[styles.walletName, { color: ThemeManager.colors.blackWhiteText }]}
                  >
                    {this.state.walletName}
                  </Text>
                  <Image source={ThemeManager.ImageIcons.newDropDown}
                    style={{ resizeMode: "contain", marginLeft: widthDimen(8) }} />

                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.notiPressed()}
                style={[styles.touchableStyle]}
              >

                <Image
                  style={[styles.imgNoti]}
                  source={
                    // Images.notiDot
                    Singleton.isNotification
                      ? Images.notiDot
                      : Images.noti
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
          <InputtextSearch
            style={{ width: "88%" }}
            placeholder={walletMain.searchOnly}
            onSubmitEditing={() => {
              this.onSubmit();
            }}
            value={this.state.enteredURL}
            search={!this.state.enteredURL ? true : false}
            // clear={this.state.enteredURL ? true : false}
            onChangeNumber={(text) => {
              this.setState({ enteredURL: text });
            }}
            pressClear={() => {
              this.setState({ enteredURL: "" });
            }}
            autoCapitalize={"none"}
            returnKeyType={"done"}
          />
        </View>
        <View style={{ flex: 1, marginTop: 10, marginBottom: 10 }}>
          {/* <FlatList
            numColumns={2}
            ref={this.scrollRef}
            bounces={false}
            showsVerticalScrollIndicator={false}
            // data={this.state.defiList}
            data={this.state.defiListNew}

            renderItem={({ item, index }) => {
              console.log("itemsss>>>>>", item);
              const value = (index + 1) / 2;
              return (
                <Item
                  // img={item.iconUrl?.icon}
                  // title={item.title}
                  img={`${baseURL}${item?.image}`}
                  title={item.dapp_name}
                  index={value}
                  subtitle={item.url}
                  onDappPress={() => this.submitPressed(item.url, item)}
                  mainView={{ marginBottom: index == this.state.defiList?.length - 1 ? 50 : 0 }}
                />
              );
            }}
            keyExtractor={item => item.id}
            ListEmptyComponent={() => {
              return (
                <View style={styles.emptyView}>
         { this.state.defiList?.length ==0 && <Text allowFontScaling={false} style={[styles.txtTitle, { color: ThemeManager.colors.blackWhiteText }]}>
                    {browser.noListFound}
                  </Text>}
                </View>
              );
            }}
          /> */}

          <FlatList
            ref={this.scrollRef}
            bounces={false}
            showsVerticalScrollIndicator={false}
            // data={this.state.defiList}
            data={this.state.defiListNew}
            style={{ width: width - 44, alignSelf: "center" }}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => {
              return (
                <DapsCards
                  data={item}
                  onPress={(data) => {
                    console.log("item:::::!", data);
                    this.submitPressed(data?.url, data);
                  }}
                />
              );
            }}
            ItemSeparatorComponent={() => (
              <View style={{ marginTop: heightDimen(22) }} />
            )}
            ListEmptyComponent={() => {
              return (
                <View style={styles.emptyView}>
                  {this.state.defiList?.length == 0 && (
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.txtTitle,
                        { color: ThemeManager.colors.blackWhiteText },
                      ]}
                    >
                      {browser.noListFound}
                    </Text>
                  )}
                </View>
              );
            }}
          />
        </View>

        {/* /****************************************************************************************** */}
        {this.state.showAlertDialog && (
          <AppAlert
            alertTxt={this.state.alertTxt}
            hideAlertDialog={() => {
              this.setState({ showAlertDialog: false });
            }}
          />
        )}

        {/* /****************************************************************************************** */}
        {this.state.showAlertDialogConfirm && (
          <ConfirmAlert
            text={setting.yes}
            alertTxt={this.state.alertTxtConfirm}
            hideAlertDialog={() => {
              this.setState({ showAlertDialogConfirm: false });
            }}
            ConfirmAlertDialog={() => {
              this.setState({ showAlertDialogConfirm: false });
              this.callDelete();
            }}
          />
        )}
        <LoaderView isLoading={this.state.isLoading} />

      </ImageBackground>
    );
  }
}

export default connect(null, { requestDefiLinks, fetchNativePrice, getDaapList })(
  DefiAccessMain,
);
