import React, {Component} from 'react';
import {
  BackHandler,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ThemeManager} from '../../../../ThemeManager';
import {
  AppAlert,
  Button,
  BuyItem,
  Header,
  LoaderView,
  ModalCoinList,
  SelectCurrencyNew,
} from '../../common';
import styles from './BuyStyle';
import {Actions} from 'react-native-router-flux';
import {
  getFiatSupportedList,
  getBuySellStatus,
  getConversionAlchemy,
} from '../../../Redux/Actions/AlchemyAction';
import {connect} from 'react-redux';
import {EventRegister} from 'react-native-event-listeners';
import * as Constants from '../../../Constants';
import {Colors} from '../../../theme';
import {exponentialToDecimal, toFixedExp} from '../../../Utils/MethodsUtils';
import {LanguageManager} from '../../../../LanguageManager';

var debounce = require('lodash.debounce');
const {alertMessages, sendTrx, walletMain, buySell} = LanguageManager;
class Sell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: '',
      isLoading: false,
      fiatList: [],
      search: '',
      showSuccess: false,
      actualFiatList: [],
      showFiatModal: false,
      showAlertDialog: false,
      alertTxt: '',
      selectedCurr: '',
      buttontext: buySell.sell,
      receivingAmount: '',
      text: '',
      conversionRes: '',
      disabled: false,
      minAmount: '0.00',
      maxAmount: '0.00',
    };
  }
  componentDidMount() {
    this.fetchFiatList();
    EventRegister.addEventListener(Constants.DOWN_MODAL, () => {
      this.setState({
        showFiatModal: false,
        search: '',
        showAlertDialog: false,
        alertTxt: '',
        showSuccess: false,
      });
    });
    this.props.navigation.addListener('didFocus', () => {
      this.setState({
        showFiatModal: false,
        search: '',
        showAlertDialog: false,
        alertTxt: '',
        showSuccess: false,
      });
      this.setState({buttontext: this.props.typeOfSwap});
      // this.fetchFiatList()
      BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBackButtonClick,
      );
    });
    this.props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this.handleBackButtonClick,
      );
    });
  }
  handleBackButtonClick = () => {
    console.log('Backhandler Sell');
    Actions.pop('');
    return true;
  };
  /* *********************************************************** Fiat list supported by Alchemy ********************************************************************** */
  fetchFiatList() {
    this.setState({isLoading: true});
    const data = {
      type: 'SELL',
    };
    this.props
      .getFiatSupportedList({data})
      .then(res => {
        // console.log('fetchFiatList:::::::res', res)
        this.setState({
          fiatList: res,
          actualFiatList: res,
          selectedCurr: res[0],
        });
        this.checkAlchemyStatus(this.props.selectedCoin, res[0]);
      })
      .catch(err => {
        this.setState({isLoading: false});
        console.log('fetchFiatList:::::::err', err);
      });
  }
  /* *********************************************************** checkAlchemyStatus ********************************************************************** */
  checkAlchemyStatus(item, fiat) {
    console.log('item:::::', item);
    this.setState({isLoading: true});
    const data = {
      symbol: item.coin_symbol?.toUpperCase(),
      alchemy_network:
        item?.coin_family == 3
          ? 'BTC'
          : item?.coin_family == 2
          ? 'ETH'
          : item?.coin_family == 6
          ? 'TRX'
          : 'MATIC',
      fiat: fiat?.currency || 'USD',
    };
    this.props
      .getBuySellStatus(data)
      .then(res => {
        console.log('chk buysell status res::::::', res);
        const response = res.on_off_ramp_coin_data;
        this.setState({isLoading: false});
        if (response) {
          if (response.sell_enable == 1) {
            return this.setState({
              buttontext: buySell.sell,
              minAmount: toFixedExp(response.min_sell_amount, 4),
              maxAmount: toFixedExp(response.max_sell_amount, 4),
            });
          } else
            return this.setState({
              buttontext: buySell.exchangePairIsNotSupported,
            });
        }
      })
      .catch(err => {
        this.setState({
          isLoading: false,
          buttontext: buySell.exchangePairIsNotSupported,
          amount: '',
          receivingAmount: '',
        });
        console.log('chk buysell status err::::::', err);
      });
  }
  /* *********************************************************** onSell ********************************************************************** */
  onSell() {
    const {
      amount,
      receivingAmount,
      buttontext,
      minAmount,
      maxAmount,
      selectedCurr,
    } = this.state;
    const selectedCoin_ = this.props.selectedCoin;
    console.log(parseFloat(amount), 'parseFloat(amount):::::');
    if (buttontext != 'Sell') {
      return this.setState({
        showAlertDialog: true,
        alertTxt: alertMessages.cannotProceed,
      });
    } else if (amount?.length == 0 || amount == 0) {
      return this.setState({
        showAlertDialog: true,
        alertTxt: alertMessages.pleaseEnterAmount,
      });
    } else if (parseFloat(amount) < parseFloat(minAmount)) {
      return this.setState({
        showAlertDialog: true,
        alertTxt:
          alertMessages.minimumAmountMustBe +
          ' ' +
          `${minAmount} ${selectedCoin_?.coin_symbol?.toUpperCase()}`,
      });
    } else if (parseFloat(amount) > parseFloat(maxAmount)) {
      return this.setState({
        showAlertDialog: true,
        alertTxt:
          alertMessages.maximumAmountMustBe +
          ' ' +
          `${maxAmount} ${selectedCoin_?.coin_symbol?.toUpperCase()}`,
      });
    } else if (
      parseFloat(amount) > parseFloat(this.props.selectedCoin.balance)
    ) {
      return this.setState({
        showAlertDialog: true,
        alertTxt: 'Insufficient Balance',
      });
    } else if (receivingAmount?.length == 0 || receivingAmount == 0) {
      return this.setState({
        showAlertDialog: true,
        alertTxt: alertMessages.cannotProceed,
      });
    }
    Actions.currentScene != 'CheckoutNew' &&
      Actions.CheckoutNew({
        selectedCurr: this.state.selectedCurr,
        amountReceived: this.state.receivingAmount,
        amountEntered: this.state.amount,
        selectedCoin: this.props.selectedCoin,
        typeOfSwap: this.props.typeOfSwap?.toLowerCase(),
        conversionRes: this.state.conversionRes,
      });
  }
  /* *********************************************************** onChangeNumber ********************************************************************** */
  onChangeNumber(value) {
    if (value.includes(',')) value = value.replace(',', '.');
    const expression = new RegExp('^\\d*\\.?\\d{0,' + '}$');
    if (expression.test(value)) {
      console.log('value::::::onChangeNumber', value);
      this.setState({amount: value});
      this.onChangeTextDebounce(value);
    }
  }
  /* *********************************************************** onChangeTextDebounce ********************************************************************** */
  onChangeTextDebounce = debounce(value => {
    if (
      value?.length == 0 ||
      value == 0 ||
      value == '.' ||
      value?.trim() == ''
    ) {
      this.setState({amount: '', receivingAmount: ''});
      return;
    } else {
      this.getConversion(value);
    }
  }, 1000);
  /* *********************************************************** onPressFiatItem ********************************************************************** */
  onPressFiatItem(item) {
    console.log('item::::::onPressFiatItem', item);
    this.setState({
      amount: '',
      receivingAmount: '',
      selectedCurr: item,
      showFiatModal: false,
      search: '',
      fiatList: this.state.actualFiatList,
    });
    this.checkAlchemyStatus(this.props.selectedCoin, item);
  }
  /* *********************************************************** updateSearch ********************************************************************** */
  updateSearch(text) {
    if (this.timer != undefined) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.searchFiat(text);
    }, 1000);
  }
  /* *********************************************************** searchFiat ********************************************************************** */
  searchFiat(text) {
    if (text == '') {
      return this.setState({fiatList: this.state.actualFiatList});
    } else {
      const arr = this.state.actualFiatList.filter(
        res =>
          res?.country.toLowerCase().includes(text.toLowerCase()) ||
          res?.countryName.toLowerCase().includes(text.toLowerCase()) ||
          res?.currency.toLowerCase().includes(text.toLowerCase()),
      );
      console.log('search fiat arr:::::', arr);
      return this.setState({fiatList: arr});
    }
  }
  /* *********************************************************** getConversion ********************************************************************** */
  getConversion(amount) {
    const {minAmount, maxAmount, selectedCurr} = this.state;
    const selectedCoin_ = this.props.selectedCoin;
    console.log(
      'minAmount:::::',
      minAmount,
      'maxAmount:::::',
      maxAmount,
      'amount::::',
      amount,
    );
    if (parseFloat(amount) < parseFloat(minAmount)) {
      Keyboard.dismiss();
      return this.setState({
        text:
          alertMessages.minimumAmountMustBe +
          ' ' +
          `${minAmount} ${selectedCoin_.coin_symbol?.toUpperCase()}`,
        disabled: true,
      });
    } else if (parseFloat(amount) > parseFloat(maxAmount)) {
      Keyboard.dismiss();
      return this.setState({
        text:
          alertMessages.maximumAmountMustBe +
          ' ' +
          `${maxAmount} ${selectedCoin_.coin_symbol?.toUpperCase()}`,
        disabled: true,
      });
    } else {
      this.setState({isLoading: true});
      setTimeout(() => {
        const data = {
          crypto: selectedCoin_.coin_symbol?.toUpperCase(),
          network:
            selectedCoin_.coin_family == 2
              ? 'ETH'
              : selectedCoin_.coin_family == 3
              ? 'BTC'
              : selectedCoin_?.coin_family == 6
              ? 'TRX'
              : 'MATIC',
          fiat: selectedCurr.currency,
          amount: amount,
          side: this.props.typeOfSwap.toUpperCase(),
        };
        this.props
          .getConversionAlchemy({data})
          .then(res => {
            const receivingAmount =
              parseFloat(res.fiatQuantity) - parseFloat(res.rampFee);
            const convertedAmount =
              exponentialToDecimal(receivingAmount) <= 0
                ? ''
                : receivingAmount.toFixed(2);
            this.setState({
              isLoading: false,
              conversionRes: res,
              receivingAmount: convertedAmount,
              disabled:
                exponentialToDecimal(receivingAmount) <= 0 ? true : false,
              text: '',
              buttontext:
                exponentialToDecimal(receivingAmount) <= 0
                  ? buySell.platformFeeTooHigh
                  : buySell.sell,
            });
            console.log('chk res::::::', res);
            Keyboard.dismiss();
          })
          .catch(err => {
            Keyboard.dismiss();
            this.setState({
              isLoading: false,
              buttontext: buySell.exchangePairIsNotSupported,
            });
            console.log('chk err::::::', err);
          });
      }, 100);
    }
  }
  getValue = bal => {
    if (bal > 0) {
      const NewBal =
        bal < 0.000001
          ? toFixedExp(bal, 8)
          : bal < 0.0001
          ? toFixedExp(bal, 6)
          : toFixedExp(bal, 4);
      return NewBal;
    } else return '0.0000';
  };
  render() {
    return (
      <View style={{flex: 1, backgroundColor: ThemeManager.colors.Mainbg}}>
        <Header
          BackButtonText={`${
            this.props.typeOfSwap
          } ${this.props.selectedCoin?.coin_symbol.toUpperCase()}`}
          bgColor={{backgroundColor: ThemeManager.colors.colorVariation}}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: ThemeManager.colors.Mainbg,
            paddingHorizontal: 23,
          }}>
          <View style={styles.ViewStyle1}>
            <View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.txtTitle,
                    {color: ThemeManager.colors.lightText},
                  ]}>
                  {buySell.payment}
                </Text>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.txtTitle,
                    {color: ThemeManager.colors.lightText},
                  ]}>
                  {buySell.Range} {this.state.minAmount} - {this.state.maxAmount}
                </Text>
              </View>
              <SelectCurrencyNew
                value={this.state.amount}
                disabled={true}
                item={this.props.selectedCoin}
                fromBuy={true}
                placeholder={'0.00'}
                onChangeNumber={value => {
                  this.setState({text: '', disabled: false});
                  this.onChangeNumber(value);
                }}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.txtTitle1,
                  {color: ThemeManager.colors.lightText},
                ]}>
                {sendTrx.Balance}
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.txtTitle1,
                    {color: ThemeManager.colors.settingsText},
                  ]}>
                  {' '}
                  {this.getValue(this.props.selectedCoin.balance)}{' '}
                  {this.props.selectedCoin.coin_symbol.toUpperCase()}
                </Text>
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  styles.txtTitle,
                  {color: ThemeManager.colors.lightText, marginTop: 15},
                ]}>
                {walletMain.receive}
              </Text>
              <BuyItem
                disabled={true}
                value={this.state.receivingAmount}
                item={this.state.selectedCurr}
                onPressCoin={() =>
                  this.setState({search: '', showFiatModal: true})
                }
                placeholder={'0.00'}
              />
            </View>
          </View>

          <View style={{justifyContent: 'flex-end', flex: 1}}>
            <Text
              allowFontScaling={false}
              style={[styles.txtTitle2, {color: Colors.lossColor}]}>
              {this.state.text}
            </Text>
            {this.state.disabled ? (
              <View
                style={[
                  styles.sendBtnStyle,
                  {backgroundColor: ThemeManager.colors.underLineColor},
                ]}>
                <Text
                  allowFontScaling={false}
                  style={[styles.sendBtnTextStyle, {color: 'white'}]}>
                  {this.state.buttontext}
                </Text>
              </View>
            ) : (
              <Button
                disabled={this.state.disabled}
                onPress={() => this.onSell()}
                myStyle={{marginTop: 20}}
                buttontext={this.state.buttontext}
              />
            )}
          </View>
        </View>
        {/* *********************************************************** MODAL FOR EXISTING COINS ********************************************************************** */}
        <ModalCoinList
          title={buySell.selectCountry}
          fromAlchemy={true}
          showSearch={true}
          openModel={this.state.showFiatModal}
          handleBack={() => {
            this.setState({showFiatModal: false, search: ''});
          }}
          list={this.state.fiatList}
          onPress={item => {
            this.onPressFiatItem(item);
          }}
          pressClear={() =>
            this.setState({search: '', fiatList: this.state.actualFiatList})
          }
          onChangeNumber={text => {
            this.setState({search: text, fromSearch: true}, () =>
              this.updateSearch(text),
            );
          }}
          search={this.state.search}
          fromSearch={true}
        />

        <LoaderView isLoading={this.state.isLoading} />
        {this.state.showAlertDialog && (
          <AppAlert
            showSuccess={this.state.showSuccess}
            alertTxt={this.state.alertTxt}
            hideAlertDialog={() => {
              this.setState({showAlertDialog: false});
            }}
          />
        )}
      </View>
    );
  }
}
export default connect(null, {
  getFiatSupportedList,
  getBuySellStatus,
  getConversionAlchemy,
})(Sell);
