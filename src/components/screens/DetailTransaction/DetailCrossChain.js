import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking,
  BackHandler,
  StyleSheet,
} from 'react-native';
import DropShadow from 'react-native-drop-shadow';
import styles from './DetailTransactionStyle';
import { ThemeManager } from '../../../../ThemeManager';
import { Colors, Images } from '../../../theme';
import moment from 'moment';
import { Header, HeaderMain, LoaderView } from '../../common';
import { useDispatch } from 'react-redux';
import { getOrderState } from '../../../Redux/Actions';
import { Actions } from 'react-native-router-flux';
import { LanguageManager } from '../../../../LanguageManager';
import fonts from '../../../theme/Fonts';
import { widthDimen } from '../../../Utils';
import Singleton from '../../../Singleton';

const DetailCrossChain = props => {
  const { browser, detailTrx } = LanguageManager;
  const dispatch = useDispatch();
  const [item, setItem] = useState(props.item);
  const [orderData, setOrderData] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /******************************************************************************************/
  useEffect(() => {
    fetchOrderDetail();
    props.navigation.addListener('didFocus', () => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    });
    props.navigation.addListener('didBlur', () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    });
  }, []);

  /******************************************************************************************/
  const handleBackButtonClick = () => {
    console.log('Backhandler crosschain detail');
    Actions.pop('');
    return true;
  };

  /******************************************************************************************/
  const fetchOrderDetail = () => {
    setIsLoading(true);
    setTimeout(() => {
      const order_id = item?.order_id;
      console.log("ORDER_ID>>", order_id);

      dispatch(getOrderState(order_id)).then(res => {
        console.log('chk res::::::getOrderState', res);
        setOrderData(res?.data);
        setIsLoading(false);
      }).catch(err => {
        console.log('chk err::::::getOrderState', err);
        setIsLoading(false);
      });
    }, 100);
  };

  /******************************************************************************************/
  return (
    <View style={{ flex: 1, backgroundColor: ThemeManager.colors.mainBgNew }}>
      {/* <Header bgColor={{ backgroundColor: ThemeManager.colors.colorVariation }} BackButtonText={detailTrx.transactionDetails} /> */}


      <HeaderMain
        BackButtonText={detailTrx.transactionDetails}
        TextcustomStyle={{ fontFamily: fonts.dmExtraLight, }}
        customStyle={{
          paddingHorizontal: widthDimen(24),
        }}
      />
      <TouchableOpacity
        onPress={() => orderData?.transactionId?.length > 0 ? Linking.openURL(orderData?.receiveHashExplore) : null}
        activeOpacity={0.7}
        style={{ marginTop: 20, marginHorizontal: widthDimen(10), }}>
        <Image source={ThemeManager.ImageIcons.sendCardMain} style={[StyleSheet.absoluteFillObject, {
          width: '100%', height: '100%', borderRadius: 10,
        }]} />

        <DropShadow style={styles.ViewStyle}>
          <View style={[styles.listStyle, {
            padding: widthDimen(10),
            borderColor: ThemeManager.colors.borderColor
          }]}>
            <View style={[styles.ViewStyle1, { borderColor: ThemeManager.colors.borderColor }]}>

              <View style={styles.ViewStyle2}>
                <View style={{ ...styles.ViewStyle4, backgroundColor: '#69DADB33', borderColor: ThemeManager.colors.borderColor }}>
                  <Image style={{ alignSelf: 'center', height: 36, width: 36 }} source={Singleton.getInstance().getStatusImage(item)} />
                </View>
                <View style={{ paddingLeft: 8 }}>
                  <Text allowFontScaling={false} style={[styles.fromValueStyle, { color: ThemeManager.colors.blackWhiteText }]}>{detailTrx.crossChainSwap}</Text>
                  <Text allowFontScaling={false} style={[styles.transtimeStyle, { color: ThemeManager.colors.lightText, marginTop: -5 }]}>{moment(item.created_at).format('ll')} |{' '}{moment(item.created_at).format('LT')}</Text>
                </View>
              </View>

              <View style={{ width: '25%', alignItems: 'flex-end' }}>
                <Text allowFontScaling={false} style={[styles.transStatusStyle, { textAlign: 'center', marginTop: 10, color: orderData?.transactionId?.length > 0 ? Colors.successColor : 'rgba(211, 155, 73, 1)' }]}>{orderData?.transactionId?.length > 0 ? detailTrx.completed : detailTrx.pending}</Text>
              </View>
            </View>

            <Text allowFontScaling={false} style={[styles.fromAddressStyle, { color: ThemeManager.colors.lightText }]}>{browser.From} :{' '}</Text>
            <Text allowFontScaling={false} numberOfLines={1} style={[styles.fromAddressStyleNew, { color: ThemeManager.colors.blackWhiteText }]}>{item.from_adrs}</Text>
            <Text allowFontScaling={false} style={[styles.fromAddressStyle, { color: ThemeManager.colors.lightText, marginTop: 10 }]}>{browser.to} :{' '}</Text>
            <Text allowFontScaling={false} numberOfLines={1} style={[styles.fromAddressStyleNew, { color: ThemeManager.colors.blackWhiteText }]}>{item.to_adrs}</Text>

            <View style={{ flexDirection: 'row', marginTop: 5 }}></View>
          </View>
        </DropShadow>

      </TouchableOpacity>

      <LoaderView isLoading={isLoading} />
    </View>
  );
};

export default DetailCrossChain;
