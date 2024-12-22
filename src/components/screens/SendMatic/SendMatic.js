/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Modal,
  BackHandler,
  Platform,
  AppState,
} from 'react-native';
import styles from './SendMaticStyle';
import {
  Header,
  InputCustom,
  Button,
  InputCustomWithPasteButton,
  AppAlert,
  ConfirmTxnModal,
} from '../../common';
import {
  exponentialToDecimal,
  getData,
  toFixedExp,
} from '../../../Utils/MethodsUtils';
import {
  requestgasprice,
  requestGasEstimation,
  requestNonce,
  requestSendCoin,
  addAddress,
  fetchNativePrice,
  fetchNative_CoinPrice
} from '../../../Redux/Actions';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Fonts, Images, Colors } from '../../../theme';
import { Actions } from 'react-native-router-flux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ThemeManager } from '../../../../ThemeManager';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { connect } from 'react-redux';
import { LoaderView } from '../../common/LoaderView';
import * as Constants from '../../../Constants';
import Singleton from '../../../Singleton';
import EnterPinForTransaction from '../EnterPinForTransaction/EnterPinForTransaction';
import { bnbDataEncode } from '../../../Utils/BscUtils';
import { getMaticBal, getMaticRaw, getMaticTokenRaw } from '../../../Utils/MaticUtils';
import { EventRegister } from 'react-native-event-listeners';
import { LanguageManager } from '../../../../LanguageManager';
import { getDimensionPercentage, widthDimen } from '../../../Utils';

class SendMatic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      newObj: '',
      showConfirmModal: false,
      nativePrice: 0,
      modalVisible: false,
      toAddress: '',
      selectedCoin: this.props.selectedCoin,
      isLoading: true,
      gasFeeMultiplier: 0.000000000000000001,
      selectedFeeType: 2,
      amount: '',
      nonce: -1,
      gasEstimate: 21000,
      gasPrice: 0,
      totalFee: 0,
      isVisible: false,
      valueInUSD: 0,
      bioMetricMode: false,
      showAlertDialog: false,
      alertTxt: '',
      maxclicked: false,
      PinModal: false,
      showSaveContactModal: false,
      userName: '',
      showContact: true,
      errorMsg: '',
      gasPriceForTxnSlow: 10 * 10 ** 9,
      gasPriceForTxnMedium: 10 * 10 ** 9,
      gasPriceForTxnHigh: 10 * 10 ** 9,
    };
  }

  /******************************************************************************************/
  componentDidMount() {
    EventRegister.addEventListener(Constants.DOWN_MODAL, () => {
      this.setState({
        showAlertDialog: false,
        alertTxt: '',
        showConfirmModal: false,
        isVisible: false,
        PinModal: false,
        disabled: false,
      });
    });
    this.fetchNativePrice();
    this.props.navigation.addListener('didFocus', async () => {
      // this.state.selectedCoin.is_token == 1 && this.fetchNativeCoinPrice();
      this.generateFeesAndNonceMatic();
    });
    // this.generateFeesAndNonceMatic();
    AppState.addEventListener('change', nextState => {
      if (Platform.OS == 'android')
        this.setState({ isVisible: false, modalVisible: false, PinModal: false });
      else this.setState({ isVisible: false, modalVisible: false });
    });
    getData(Constants.BIOMETRIC_MODE).then(bio_mode => {
      if (bio_mode == 'false') this.setState({ bioMetricMode: false });
      else this.setState({ bioMetricMode: true });
    });
    this.backhandle = BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    if (this.backhandle) this.backhandle.remove();
  }

  /******************************************************************************************/
  fetchNativeCoinPrice() {
    let data = {
      fiat_currency: Singleton.getInstance().CurrencySelected,
      coin_family: 4,
      coin_symbol: this.state.selectedCoin.coin_symbol
    };
    this.props.fetchNative_CoinPrice({ data }).then(res => {
      res?.message?.toLowerCase() == 'going fine' ? '' : this.setState({ disabled: true, showAlertDialog: true, alertTxt: res?.message })
      console.log('chk res fetchNative_CoinPrice price:::::', res);
    }).catch(err => {
      console.log('chk err fetchNative_CoinPrice price:::::', err);
    });
  }

  /******************************************************************************************/
  fetchNativePrice() {
    let data = {
      fiat_currency: Singleton.getInstance().CurrencySelected,
      coin_family: 4
    };
    this.props.fetchNativePrice({ data }).then(res => {
      this.setState({ nativePrice: toFixedExp(res?.fiatCoinPrice?.value, 2) });
      console.log('chk res native price:::::', res);
    }).catch(err => {
      console.log('chk err native price:::::', err);
    });
  }

  /******************************************************************************************/
  generateFeesAndNonceMatic() {
    const { coin_symbol, wallet_address, token_address, is_token } = this.state.selectedCoin;
    let gasEstimationReq = {
      from: wallet_address,
      to: wallet_address,
      amount: '',
    };
    let nonceReq = { amount: '' };
    getData(Constants.ACCESS_TOKEN).then(token => {
      this.props.requestGasEstimation({ url: `polygon/${is_token == 0 ? coin_symbol : token_address}/gas_estimation`, coinSymbol: coin_symbol, gasEstimationReq, token }).then(async res1 => {
        console.log('chk gasEstimate res:::::', res1);
        if (res1.status) {
          const slowGasPrice = parseFloat(res1.resultList.safe_gas_price) * 10 ** 9;
          const mediumGasPrice = parseFloat(res1.resultList.propose_gas_price) * 10 ** 9;
          const heightGasPrice = parseFloat(res1.resultList.fast_gas_price) * 10 ** 9;
          const feeIs = toFixedExp(mediumGasPrice * res1?.gas_estimate * this.state.gasFeeMultiplier, 8);
          const fee = toFixedExp(slowGasPrice * res1?.gas_estimate * this.state.gasFeeMultiplier, 8)
          const bal = await getMaticBal(Singleton.getInstance().defaultMaticAddress);
          console.log(parseFloat(fee), 'chk bal res:::::', parseFloat(bal));
          if (is_token != 0 && (parseFloat(fee) > parseFloat(bal))) {
            this.setState({ disabled: true, showAlertDialog: true, alertTxt: LanguageManager.alertMessages.youhaveInsufficientMaticBalance })
          }

          //  ---------------------------------------------- nonce APi -------------------------------------------------------
          this.props.requestNonce({ url: `polygon/${is_token == 0 ? coin_symbol : token_address}/nonce`, coinSymbol: coin_symbol, nonceReq, token }).then(res2 => {
            this.setState({
              gasEstimate: res1.gas_estimate,
              gasPrice: mediumGasPrice,
              isLoading: false,
              nonce: res2.data.nonce,
              gasPriceForTxnSlow: slowGasPrice,
              gasPriceForTxnMedium: mediumGasPrice,
              gasPriceForTxnHigh: heightGasPrice,
              totalFee: toFixedExp(feeIs, 4),
            });
          }).catch(e => {
            this.setState({ isLoading: false });
          });
        } else {
          this.setState({ isLoading: false });
          return;
        }
      }).catch(e => {
        this.setState({ isLoading: false });
      });
    });
  }

  /******************************************************************************************/
  checkBiometricAvailabilty() {
    ReactNativeBiometrics.isSensorAvailable().then(resultObject => {
      const { available, biometryType } = resultObject;
      if (available && biometryType === ReactNativeBiometrics.TouchID) {
        console.log('TouchID is supported');
        this.bimetricPrompt();
      } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
        console.log('FaceID is supported');
        this.bimetricPrompt();
      } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
        console.log('Biometrics is supported');
        this.bimetricPrompt();
      } else {
        console.log('Biometrics not supported');
      }
    });
  }

  /******************************************************************************************/
  bimetricPrompt() {
    try {
      ReactNativeBiometrics.simplePrompt({ promptMessage: LanguageManager.alertMessages.confirmFingerprint }).then(resultObject => {
        const { success } = resultObject;
        if (success) {
          console.log('successful biometrics provided');
          this.onPinSuccess();
        } else {
          console.log('user cancelled biometric prompt');
        }
      }).catch(() => {
        console.log('biometrics failed');
      });
    } catch (e) {
      console.log('Device not Support Fingerprint');
    }
  }

  /******************************************************************************************/
  setModalVisible = visible => {
    this.setState({ modalVisible: visible });
  };

  /******************************************************************************************/
  requestCameraPermission() {
    Singleton.getInstance().cameraPermission().then(res => {
      if (res == 'granted') {
        Singleton.isCameraOpen = true;
        this.setState({ isVisible: true });
      }
    });
  }

  /******************************************************************************************/
  sendSerializedTxn(tx_raw) {
    const { nonce, toAddress, amount, gasEstimate, gasPrice, selectedCoin } = this.state;
    let sendCoinReq = {
      nonce: nonce,
      tx_raw: tx_raw,
      from: Singleton.getInstance().defaultMaticAddress,
      to: toAddress,
      amount: amount,
      gas_estimate: gasEstimate,
      gas_price: gasPrice,
      tx_type: 'withdraw',
    };
    console.log('sendCoinReq::::', sendCoinReq);
    const { is_token, token_address, coin_symbol } = selectedCoin;
    this.props.requestSendCoin({ url: `polygon/${is_token == 0 ? selectedCoin.coin_symbol : token_address}/send`, coinSymbol: coin_symbol, sendCoinReq }).then(res => {
      Actions.replace('TransactionHistory', { selectedCoin: this.state.selectedCoin });
      this.setState({ isLoading: false });
    }).catch(e => {
      this.setState({ isLoading: false });
      this.setState({ showAlertDialog: true, alertTxt: e });
    });
  }

  //******************************************************************************************/
  sendTransaction() {
    const { alertMessages } = LanguageManager;
    const { toAddress, amount, selectedCoin } = this.state;
    if (toAddress.trim().length == 0)
      return this.setState({ showAlertDialog: true, alertTxt: alertMessages.pleaseEnterWalletAddress });
    else if (!/^(0x){1}[0-9a-fA-F]{40}$/i.test(toAddress))
      return this.setState({ showAlertDialog: true, alertTxt: alertMessages.pleaseEnterValidAddress });
    else if (toAddress.toLowerCase() == Singleton.getInstance().defaultEthAddress.toLowerCase())
      return this.setState({ showAlertDialog: true, alertTxt: alertMessages.youCannotSendToSameAddress });
    else if (amount.trim().length == 0 || amount == 0)
      return this.setState({ showAlertDialog: true, alertTxt: alertMessages.pleaseEnterAmount });
    else if (isNaN(parseFloat(amount)))
      return this.setState({ showAlertDialog: true, alertTxt: alertMessages.pleaseEnterValidAmount });
    else if (!/^\d*\.?\d*$/.test(amount))
      return this.setState({ showAlertDialog: true, alertTxt: alertMessages.youCanEnterOnlyOneDecimal });
    else if (parseFloat(amount) > parseFloat(toFixedExp(selectedCoin.balance, 8)))
      return this.setState({ showAlertDialog: true, alertTxt: alertMessages.youhaveInsufficientBalance });
    else {
      const newObj = {
        valueInUSD: this.state.valueInUSD,
        amount: this.state.amount,
        totalFee: this.state.totalFee,
        nativePrice: this.state.nativePrice,
        toAddress: this.state.toAddress,
        fromAddress: Singleton.getInstance().defaultMaticAddress,
        feeSymbol: 'MATIC',
        fiatAmount: toFixedExp(parseFloat(this.state.amount) * parseFloat(this.state.selectedCoin.currentPriceInMarket), 2),
        fiatCoin: toFixedExp(parseFloat(this.state.totalFee) * parseFloat(this.state.nativePrice), 2)
      };
      this.setState({ showConfirmModal: true, newObj: newObj });
    }
  }

  //******************************************************************************************/
  SendMatic() {
    this.setState({ isLoading: true });
    setTimeout(async () => {
      const { gasEstimate, toAddress, amount, nonce, gasPrice } = this.state;
      const privateKey = await getData(`${Singleton.getInstance().defaultMaticAddress}_pk`);
      const chainId = Constants.network == 'testnet' ? 80001 : 137;
      getMaticRaw(amount, toAddress, nonce, gasPrice, gasEstimate, chainId, privateKey).then(txn_raw => {
        console.log('chk txn raw::::', txn_raw);
        this.sendSerializedTxn(txn_raw);
      }).catch(err => {
        this.setState({ isLoading: false });
        this.setState({ showAlertDialog: true, alertTxt: err });
      });
    }, 200);
  }

  //******************************************************************************************/
  SendMaticErc20() {
    this.setState({ isLoading: true });
    setTimeout(async () => {
      const { gasEstimate, toAddress, amount, nonce, gasPrice } = this.state;
      const { decimals, token_address } = this.state.selectedCoin;
      const privateKey = await getData(`${Singleton.getInstance().defaultMaticAddress}_pk`);
      const chainId = Constants.network == 'testnet' ? 80001 : 137;
      const BigNumber = require("bignumber.js")
      let a = new BigNumber(amount);
      let b = new BigNumber(decimals);
      const amountToSend = ((a.multipliedBy(b)).toString());
      bnbDataEncode(token_address, toAddress, amountToSend).then(encodedData => {
        console.log('chk bep encoded Data::::::', encodedData);
        getMaticTokenRaw(token_address, encodedData, nonce, gasPrice, gasEstimate, chainId, privateKey).then(signedRaw => {
          console.log('chk bep signedRaw::::::', signedRaw);
          this.sendSerializedTxn(signedRaw);
        }).catch(err => {
          this.setState({ isLoading: false });
          this.setState({ showAlertDialog: true, alertTxt: err.message });
        });
      }).catch(err => {
        this.setState({ isLoading: false });
        this.setState({ showAlertDialog: true, alertTxt: err.message });
      });
    }, 200);
  }

  //******************************************************************************************/
  showActualAmount(enteredAmount) {
    const amt = exponentialToDecimal(enteredAmount * this.state.selectedCoin.currentPriceInMarket);
    this.setState({ valueInUSD: isNaN(enteredAmount) ? 0 : amt < 0.000001 ? toFixedExp(amt, 8) : amt < 0.01 ? toFixedExp(amt, 4) : toFixedExp(amt, 2) });
  }

  //******************************************************************************************/
  setToAmountMax() {
    if (this.state.selectedCoin.balance == 0)
      return this.setState({ showAlertDialog: true, alertTxt: LanguageManager.alertMessages.Youdonthaveenoughbalance });
    let val;
    if (this.state.selectedCoin.is_token == 0) {
      val = (this.state.selectedCoin.balance - this.state.totalFee - 0.00003).toFixed(8);
      if (val.toString().includes('-')) {
        return this.setState({ showAlertDialog: true, alertTxt: LanguageManager.alertMessages.YoudonthaveEnoughbalanceAmountTransactionFee });
      }
      this.setState({ amount: (val * 1).toFixed(6).toString() });
      console.log('val', val);
      this.showActualAmount(val);
    } else {
      val = toFixedExp(this.state.selectedCoin.balance, 8);
      if (val.toString().includes('-')) {
        return this.setState({ showAlertDialog: true, alertTxt: LanguageManager.alertMessages.YoudonthaveEnoughbalanceAmountTransactionFee });
      }
      this.setState({ amount: toFixedExp(val * 1, 4).toString() });
      this.showActualAmount(val);
    }
  }

  //******************************************************************************************/
  onPinSuccess() {
    this.setState({ PinModal: false });
    setTimeout(() => {
      this.state.selectedCoin.is_token == 0 ? this.SendMatic() : this.SendMaticErc20();
    }, 1000);
  }

  //******************************************************************************************/
  getAddress = address => {
    this.setState({ toAddress: address, showContact: false });
  };

  //******************************************************************************************/
  onPressAddressBook() {
    Actions.currentScene != 'ContactsBook' && Actions.ContactsBook({ getAddress: this.getAddress, ispop: true, address: Singleton.getInstance().defaultMaticAddress, coin_family: 4 });
  }

  //******************************************************************************************/
  onChangeAmount(val) {
    if (val.includes(',')) val = val.replace(',', '.');
    if (val == '.') val = '0.';
    const decim = this.state.selectedCoin.decimals.toString().length - 1 > 18 ? 8 : this.state.selectedCoin.decimals.toString().length - 1;
    const expression = new RegExp('^\\d*\\.?\\d{0,' + decim + '}$');
    if (expression.test(val)) {
      if (/^\d*\.?\d*$/.test(val)) {
        if (val.includes('.') && val.split('.')[1].length > 18) {
          return;
        }
        this.setState({ amount: val, maxclicked: false });
        this.showActualAmount(val);
      }
    }
  }

  //******************************************************************************************/
  onPressConfirm() {
    this.setState({ PinModal: true });
    this.setState({ showConfirmModal: false });
    setTimeout(() => {
      if (this.state.bioMetricMode) this.checkBiometricAvailabilty();
    }, 2000);
  }

  //******************************************************************************************/
  onMaxClicked() {
    this.setState({ maxclicked: true });
    setTimeout(() => {
      this.setToAmountMax();
    }, 300);
  }

  //******************************************************************************************/
  onClickAction = type => {
    const { gasPriceForTxnSlow, gasPriceForTxnMedium, gasPriceForTxnHigh } = this.state;
    const gasPrice = type == 'slow' ? gasPriceForTxnSlow : type == 'average' ? gasPriceForTxnMedium : gasPriceForTxnHigh;
    this.setState({ selectedFeeType: type == 'slow' ? 1 : type == 'average' ? 2 : 3, gasPriceForTxn: gasPrice, totalFee: toFixedExp(gasPrice * this.state.gasEstimate * this.state.gasFeeMultiplier, 4) }, () => { if (this.state.maxclicked) this.setToAmountMax() });
  };

  //******************************************************************************************/
  getValue = bal => {
    if (bal > 0) {
      const NewBal = bal < 0.000001 ? toFixedExp(bal, 8) : bal < 0.0001 ? toFixedExp(bal, 6) : toFixedExp(bal, 4);
      return NewBal;
    } else return '0.0000';
  };

  //******************************************************************************************/
  render() {
    const { walletMain, sendTrx, merchantCard, placeholderAndLabels } = LanguageManager;
    const { modalVisible } = this.state;
    if (this.state.isVisible)
      return (
        <View style={{ flex: 1, backgroundColor: ThemeManager.colors.Mainbg }}>
          <Modal
            animationType={'slide'}
            transparent={true}
            visible={this.state.isVisible}
            onRequestClose={() => { console.log('Modal has been closed.') }}>
            <View style={[styles.modalView, { flex: 1 }]}>
              <View style={{ backgroundColor: ThemeManager.colors.mainBgNew, flex: 1, marginTop: -5 }}>
                <QRCodeScanner
                  cameraStyle={styles.cameraStyle}
                  onRead={event => { this.setState({ isVisible: false, toAddress: event.data }) }}
                />
                <TouchableOpacity onPress={() => { this.setState({ isVisible: false }) }}>
                  <Text allowFontScaling={false} style={[styles.txtCancel, { color: ThemeManager.colors.blackWhiteText, marginRight: Platform.OS == 'ios' ? getDimensionPercentage(30) : getDimensionPercentage(15) }]}>{sendTrx.Cancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    return (
      <View style={{ flex: 1, backgroundColor: ThemeManager.colors.Mainbg }}>
        <Header
          bgColor={{ backgroundColor: ThemeManager.colors.colorVariation }}
          BackButtonText={walletMain.send + ' ' + this.state.selectedCoin.coin_symbol?.toUpperCase()}
        />
        <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'}>
          <View style={{ flex: 1 }}>
            <View style={styles.mainView}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text allowFontScaling={false} style={[styles.txtWallet, { color: ThemeManager.colors.lightText }]}>{merchantCard.walletAddress}</Text>
              </View>
              <View style={{}}>
                <View style={[styles.ViewStyle, { borderColor: ThemeManager.colors.borderColor }]}>
                  <InputCustomWithPasteButton
                    value={this.state.toAddress}
                    onChangeText={val => { this.setState({ toAddress: val, showContact: val.length > 10 ? true : false }) }}
                    placeHolder={placeholderAndLabels.pasteWalletaddress}
                    customInputStyle={[styles.ViewStyle1, { backgroundColor: ThemeManager.colors.Mainbg, color: ThemeManager.colors.settingsText }]}
                    onPastePress={val => { this.setState({ toAddress: val }) }}
                    placeholderTextColor={ThemeManager.colors.lightWhiteText}
                  />
                  <TouchableOpacity onPress={() => this.onPressAddressBook()} style={{ position: 'absolute', right: 50, top: 15 }}>
                    <Image source={ThemeManager.ImageIcons.addressBook} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.requestCameraPermission()} style={styles.scan}>
                    <Image source={ThemeManager.ImageIcons.scan} />
                  </TouchableOpacity>
                </View>

                {/* ------------------------------------------------------------------- */}
                <Text allowFontScaling={false} style={[styles.txtWallet, { height: 40, marginTop: 25, color: ThemeManager.colors.lightText }]}>{sendTrx.enterAmount}</Text>
                <View style={[styles.ViewStyle2, { borderColor: ThemeManager.colors.borderColor }]}>
                  <View style={styles.ViewStyle3}>
                    {this.state.selectedCoin.coin_image ? (
                      <View style={[styles.ImgStyle, { backgroundColor: ThemeManager.colors.borderUnderLine }]}>
                        <Image style={styles.ImgStyle} source={{ uri: this.state.selectedCoin.coin_image }} />
                      </View>
                    ) : (
                      <View style={[styles.ImgStyle, { backgroundColor: ThemeManager.colors.borderUnderLine }]}>
                        <Text allowFontScaling={false} style={[styles.coinSymbolStyle, { color: ThemeManager.colors.Text, textTransform: 'capitalize', paddingLeft: 0 }]}>{this.state.selectedCoin.coin_symbol?.substring(0, 1)}</Text>
                      </View>
                    )}
                    <Text allowFontScaling={false} style={[styles.coinSymbolStyle, { color: ThemeManager.colors.settingsText }]}>{this.state.selectedCoin.coin_symbol.toUpperCase()}</Text>
                  </View>
                  <InputCustom
                    value={this.state.amount}
                    onChangeText={val => { this.onChangeAmount(val) }}
                    placeHolder=""
                    placeholderColor={Colors.placeholderColor}
                    keyboardType="decimal-pad"
                    maxLength={15}
                    customInputStyle={[styles.ViewStyle4, { color: ThemeManager.colors.settingsText }]}
                    placeholderTextColor={ThemeManager.colors.lightWhiteText}
                  />
                  <TouchableOpacity onPress={() => { this.onMaxClicked() }} style={styles.maxStyle}>
                    <Text allowFontScaling={false} style={[styles.maxText, { color: ThemeManager.colors.Text }]}>{sendTrx.max}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.ViewStyle5}>
                  <Image
                    source={ThemeManager.ImageIcons.approxEqual}
                    style={{ width: widthDimen(8), height: widthDimen(8), resizeMode: "contain", }}
                  />
                  <Text allowFontScaling={false} style={[styles.fiatStyle, { color: ThemeManager.colors.text_Color }]}> {Singleton.getInstance().CurrencySymbol}{this.state.valueInUSD}</Text>
                  <Text allowFontScaling={false} style={[styles.TextStyle, { color: ThemeManager.colors.lightText }]}>
                    {sendTrx.Balance}{' '}
                    {this.getValue(this.state.selectedCoin?.balance)}{' '}
                    {this.state.selectedCoin.coin_symbol.toUpperCase()}
                  </Text>
                </View>
                {/* ------------------------------------------------------------------- */}
                <View style={styles.coinInfo}>
                  <View style={styles.ViewStyle6}>
                    <Text allowFontScaling={false} style={[styles.TextStyle1, { color: ThemeManager.colors.settingsText }]}>{sendTrx.transactionFee}<Text allowFontScaling={false} style={[styles.TextStyle1, { color: ThemeManager.colors.lightText }]}>{' '}(MATIC)</Text>
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <TouchableOpacity onPress={() => this.onClickAction('slow')} style={[styles.feeView, { borderColor: this.state.selectedFeeType == 1 ? ThemeManager.colors.settingsText : ThemeManager.colors.borderColor }]}>
                          <Text allowFontScaling={false} style={[styles.TextStyle2, { color: ThemeManager.colors.lightText, marginTop: 3 }]}>{toFixedExp(this.state.gasPriceForTxnSlow * this.state.gasEstimate * this.state.gasFeeMultiplier, 4)}{' '}MATIC</Text>
                          <Text allowFontScaling={false} style={[styles.TextStyle2, { color: ThemeManager.colors.lightText }]}>{toFixedExp(this.state.gasPriceForTxnSlow * this.state.gasEstimate * this.state.gasFeeMultiplier * this.state.selectedCoin.currentPriceInMarket, 4)}{' '}{Singleton.getInstance().CurrencySelected}</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ color: this.state.selectedFeeType == 1 ? ThemeManager.colors.settingsText : ThemeManager.colors.newTitle, marginTop: 5, textAlign: 'center', fontSize: 14, fontFamily: Fonts.dmMedium }}>{sendTrx.slow}</Text>
                      </View>

                      <View>
                        <TouchableOpacity onPress={() => this.onClickAction('average')} style={[styles.feeView, { borderColor: this.state.selectedFeeType == 2 ? ThemeManager.colors.settingsText : ThemeManager.colors.borderColor }]}>
                          <Text allowFontScaling={false} style={[styles.TextStyle2, { color: ThemeManager.colors.lightText, marginTop: 3 }]}>{toFixedExp(this.state.gasPriceForTxnMedium * this.state.gasEstimate * this.state.gasFeeMultiplier, 4)}{' '}MATIC</Text>
                          <Text allowFontScaling={false} style={[styles.TextStyle2, { color: ThemeManager.colors.lightText }]}>{toFixedExp(this.state.gasPriceForTxnMedium * this.state.gasEstimate * this.state.gasFeeMultiplier * this.state.selectedCoin.currentPriceInMarket, 4)}{' '}{Singleton.getInstance().CurrencySelected}</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ color: this.state.selectedFeeType == 2 ? ThemeManager.colors.settingsText : ThemeManager.colors.newTitle, marginTop: 5, textAlign: 'center', fontSize: 14, fontFamily: Fonts.dmMedium }}>{sendTrx.Average}</Text>
                      </View>

                      <View>
                        <TouchableOpacity onPress={() => this.onClickAction('high')} style={[styles.feeView, { borderColor: this.state.selectedFeeType == 3 ? ThemeManager.colors.settingsText : ThemeManager.colors.borderColor }]}>
                          <Text allowFontScaling={false} style={[styles.TextStyle2, { color: ThemeManager.colors.lightText, marginTop: 3 }]}>{toFixedExp(this.state.gasPriceForTxnHigh * this.state.gasEstimate * this.state.gasFeeMultiplier, 4)}{' '}MATIC</Text>
                          <Text allowFontScaling={false} style={[styles.TextStyle2, { color: ThemeManager.colors.lightText }]}>{toFixedExp(this.state.gasPriceForTxnHigh * this.state.gasEstimate * this.state.gasFeeMultiplier * this.state.selectedCoin.currentPriceInMarket4)}{' '}{Singleton.getInstance().CurrencySelected}</Text>
                        </TouchableOpacity>
                        <Text allowFontScaling={false} style={{ color: this.state.selectedFeeType == 3 ? ThemeManager.colors.settingsText : ThemeManager.colors.newTitle, marginTop: 5, textAlign: 'center', fontSize: 14, fontFamily: Fonts.dmMedium }}>{sendTrx.Fast}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {/* ------------------------------------------------------------------- */}
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View style={styles.ViewStyle8}>
          {this.state.disabled ?
            < View style={[styles.sendBtnStyle, { backgroundColor: ThemeManager.colors.settingBg }]}>
              <Text allowFontScaling={false} style={[styles.sendBtnTextStyle, { color: 'gray' }]}>{sendTrx.SEND}</Text>
            </View>
            : <Button
              onPress={() => { this.sendTransaction() }}
              customStyle={{ marginTop: 20 }}
              buttontext={sendTrx.SEND}
            />}
        </View>

        {/* --------------------------------Modal for Pin----------------------------------- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.PinModal}
          onRequestClose={() => { this.setState({ PinModal: false }) }}>
          <View style={{ flex: 1 }}>
            <EnterPinForTransaction
              onBackClick={() => { this.setState({ PinModal: false }) }}
              closeEnterPin={() => { this.onPinSuccess() }}
            />
          </View>
        </Modal>

        {/* ----------------------------------Modal for scan--------------------------------- */}
        <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.state.isVisible}
          onRequestClose={() => { console.log('Modal has been closed.') }}>
          <View style={[styles.modalView, { flex: 1 }]}>
            <View style={{ backgroundColor: 'black', flex: 1, marginTop: -5 }}>
              <QRCodeScanner
                cameraStyle={styles.cameraStyle}
                onRead={event => { this.setState({ isVisible: false, toAddress: event.data }) }}
              />
              <TouchableOpacity onPress={() => { this.setState({ isVisible: false }) }}>
                <Text allowFontScaling={false} style={[styles.txtCancel, { color: ThemeManager.colors.blackWhiteText }]}>{sendTrx.Cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* --------------------------------ConfirmTxnModal----------------------------------- */}
        <ConfirmTxnModal
          handleBack={() => this.setState({ showConfirmModal: false })}
          showConfirmTxnModal={this.state.showConfirmModal}
          newObj={this.state.newObj}
          selectedCoin={this.state.selectedCoin}
          onPress={() => this.onPressConfirm()}
        />

        {this.state.showAlertDialog && (
          <AppAlert
            alertTxt={this.state.alertTxt}
            hideAlertDialog={() => { this.setState({ showAlertDialog: false }) }}
          />
        )}
        <LoaderView isLoading={this.state.isLoading} />
      </View>
    );
  }
}

export default connect(null, {
  requestgasprice,
  requestGasEstimation,
  requestNonce,
  requestSendCoin,
  addAddress,
  fetchNativePrice,
  fetchNative_CoinPrice
})(SendMatic);
