import React, { Component } from 'react';
import { View, Image, Text, FlatList, ImageBackground, Platform } from 'react-native';
import { Colors, Fonts, Images } from '../../../theme';
import { ThemeManager } from '../../../../ThemeManager';
import { AllocationGraph, AppAlert } from '../../common';
import { connect } from 'react-redux';
import { exponentialToDecimal, toFixedExp } from '../../../Utils/MethodsUtils';
import styles from './WalletStatsStyle';
import Singleton from '../../../Singleton';
import * as Constants from '../../../Constants';
import { EventRegister } from 'react-native-event-listeners';
import { LanguageManager } from '../../../../LanguageManager';
import { getDimensionPercentage as dimen, heightDimen, widthDimen } from '../../../Utils';
import fonts from '../../../theme/Fonts';
import { color } from 'react-native-reanimated';
import colors from '../../../theme/Colors';

let data = [Colors.btcColor, Colors.ethColor, Colors.solanaColor, Colors.tetherColor];

class WalletStats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalFiat: 0,
      pieData: [],
      showAlertDialog: false,
      alertTxt: '',
    };
  }

  //******************************************************************************************/
  componentDidMount() {
    EventRegister.addEventListener(Constants.DOWN_MODAL, () => {
      this.setState({ showAlertDialog: false, alertTxt: '' });
    });
    this.props.navigation.addListener('didFocus', () => {
      if (!global.isConnected) {
        this.setState({
          showAlertDialog: true,
          alertTxt: LanguageManager.alertMessages.pleaseCheckYourNetworkConnection,
        });
      }
      this.getPieData();
    });
  }

  //******************************************************************************************/
  getPieData() {
    let TotalFiat = 0;
    if (this.props.coinList.length > 0) {
      console.log("coinList wallet>>>>", this.props.coinList);
      let list = this.props.coinList.filter(item => item.fiatBal > 0);
      if (list.length > 0) {
        list.map((item, index) => {
          console.log("items?????", item);
          TotalFiat += parseFloat(item.fiatBal < 0.000001 ? toFixedExp(item.fiatBal, 8, '1') :
            item.fiatBal < 0.0001 ? toFixedExp(item.fiatBal, 6, '1') :
              item.fiatBal < 0.01 ? toFixedExp(item.fiatBal, 4, '2') : toFixedExp(item.fiatBal, 2, '3'));
          (item.value = parseFloat(item.fiatBal < 0.000001 ? toFixedExp(item.fiatBal, 8, '4') :
            item.fiatBal < 0.0001 ? toFixedExp(item.fiatBal, 6, '1') :
              item.fiatBal < 0.01 ? toFixedExp(item.fiatBal, 4, '5') : toFixedExp(item.fiatBal, 2, '6'))),
            (item.svg = { fill: this.stringToColour(item.coin_name) }),
            (item.key = `pie-${index}`);
        });
        console.log("pieData==", list)
        this.setState({ totalFiat: toFixedExp(TotalFiat, 4, '10') });
        this.setState({ pieData: list });
      } else {
        this.setState({ pieData: [], totalFiat: 0.0 });
      }
    } else {
      this.setState({ pieData: [], totalFiat: 0.0 });
    }
  }

  //******************************************************************************************/
  stringToColour = function (str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 55)) & 0xff;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  };

  //******************************************************************************************/
  render() {
    const { walletMain } = LanguageManager;
    return !this.props.isVisible && !this.props.isWatchList ? (
      <View />
    ) : (
      <View style={{ flex: 1 }}>
        <AllocationGraph pieData={this.state.pieData} />
        <View style={{ marginTop: dimen(this.state.pieData?.length > 0 ? 90 : 50) }}>
          <Text allowFontScaling={false} style={[styles.textStyle2, { color: ThemeManager.colors.legalGreyColor }]}>{walletMain.totalInvestedAmount}:<Text
            style={{
              color: ThemeManager.colors.blackWhiteText,

              fontSize: dimen(18), lineHeight: 23, fontFamily: fonts.dmBold
            }}>{' '}
            {Singleton.getInstance().CurrencySymbol}{(Singleton.getInstance().isHideBalance ? "*****" : this.state.totalFiat ? toFixedExp(this.state.totalFiat, 2, '7') : '0.00')}
          </Text></Text>
        </View>




        <View style={{
          flexDirection: 'row',
          marginHorizontal: widthDimen(43),
          justifyContent: 'space-between',
        }}>

          <FlatList

            bounces={false}
            keyExtractor={(item, index) => index + ''}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            data={this.state.pieData}
            // data={data}

            renderItem={({ item, index }) => {
              const color = item.svg?.fill;
              // const color = item;
              return (
                <View style={{
                  backgroundColor: `${color}20`,
                  flexDirection: 'row',
                  borderRadius: widthDimen(6),
                  alignItems: 'center',
                  overflow: 'hidden',
                  marginRight: widthDimen(12),

                }}>
                  <View style={{ backgroundColor: color, width: widthDimen(6.7), height: '100%' }} />
                  <Text allowFontScaling={false} style={[{
                    fontFamily: Fonts.dmRegular,
                    fontSize: dimen(12),
                    lineHeight: heightDimen(18),
                    paddingVertical: heightDimen(6.5),
                    paddingLeft: widthDimen(11),
                    paddingRight: widthDimen(18),
                    color: ThemeManager.colors.blackWhiteText,

                  }]}>{item.coin_name.toUpperCase()}</Text>
                </View>
              );
            }}
          />
        </View>

        <FlatList
          style={{ marginTop: heightDimen(10) }}
          bounces={false}
          keyExtractor={(item, index) => index + ''}
          showsVerticalScrollIndicator={false}
          data={this.state.pieData}
          ListEmptyComponent={() => {
            return (
              <View style={styles.ViewNew}>
                <Text allowFontScaling={false} style={{ fontSize: 16, fontFamily: Fonts.dmMedium, color: ThemeManager.colors.TextColor }}>{walletMain.noassetsfound}</Text>
              </View>
            );
          }}
          renderItem={({ item, index }) => {
            // const color = item.svg?.fill;
            return (
              <View style={{ ...styles.ViewStyle2, marginBottom: index == this.state.pieData.length - 1 ? 180 : 0, marginTop: dimen(10), backgroundColor: ThemeManager.colors.mnemonicsBg }}>
                {/* <ImageBackground source={ThemeManager.ImageIcons.cardViewImg} style={{ ...styles.ViewStyle2, marginBottom: index == this.state.pieData.length - 1 ? 180 : 0, marginTop: dimen(10) }}> */}
                {/* <View style={[styles.TriangleShapeCSS, { borderBottomColor: color }]} /> */}
                <View style={styles.ViewStyle}>
                  {item.coin_image ? (
                    <Image style={{ height: heightDimen(44), width: widthDimen(44), borderRadius: dimen(14), marginLeft: widthDimen(15) }} source={{ uri: item.coin_image }} />
                  ) : (
                    <View style={[styles.imgViewStyle, { backgroundColor: ThemeManager.colors.borderUnderLine, marginLeft: widthDimen(15) }]}>
                      <Text allowFontScaling={false} style={{ color: ThemeManager.colors.Text }}>{item?.coin_symbol?.toUpperCase()?.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 8 }}>
                    <Text allowFontScaling={false} style={{ ...styles.textStyle1, color: ThemeManager.colors.blackWhiteText }}>{item.coin_symbol.toUpperCase()}</Text>
                    <Text allowFontScaling={false} style={[styles.textStyle, { color: ThemeManager.colors.legalGreyColor }]}>{walletMain.percentage + ' '}<Text style={{ color: ThemeManager.colors.primaryColor }}>{toFixedExp((exponentialToDecimal(item.value) / this.state.totalFiat) * 100, 2, '8')}%</Text></Text>
                  </View>


                </View>
                <View style={{ width: '30%', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                  <Text allowFontScaling={false}
                    style={{
                      fontSize: dimen(18), fontFamily: Fonts.dmSemiBold,
                      color: ThemeManager.colors.blackWhiteText
                    }}>
                    {Singleton.getInstance().CurrencySymbol}{(Singleton.getInstance().isHideBalance ? "*****" : toFixedExp(item.value, 2, '9'))}</Text>
                  <Text allowFontScaling={false} style={[styles.textStyle, { color: ThemeManager.colors.legalGreyColor }]}>{walletMain.amount}</Text>
                </View>
                {/* <View style={{ width: '20%', justifyContent: 'flex-end' }}>
                  <Text allowFontScaling={false} style={[styles.textStyle, { color: ThemeManager.colors.lightText }]}>{walletMain.percentage}</Text>
                  <Text allowFontScaling={false} style={{ fontSize: 14, fontFamily: Fonts.dmSemiBold, color: ThemeManager.colors.TextColor }}>{toFixedExp((item.value / this.state.totalFiat) * 100, 2)}%</Text>
                </View> */}
                {/* </ImageBackground> */}
              </View>
            );
          }}
        />

        {this.state.showAlertDialog && (
          <AppAlert
            alertTxt={this.state.alertTxt}
            hideAlertDialog={() => { this.setState({ showAlertDialog: false }) }}
          />
        )}
      </View>
    );
  }
}
const mapStateToProp = state => {
  const { coinList } = state.walletReducer;
  // console.log("coinlist.......????", coinList);
  return { coinList };
};
export default connect(mapStateToProp, {})(WalletStats);
