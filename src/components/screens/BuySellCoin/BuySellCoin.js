import React, { useCallback, useEffect, useState } from "react";
import { ImageBackground, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LanguageManager } from "../../../../LanguageManager";
import { ThemeManager } from "../../../../ThemeManager";
import {
  onOffRampCreateOrder,
  onOffRampDetails,
  onOffRampOffer,
} from "../../../Redux/Actions";
import { dimen, widthDimen } from "../../../Utils";
import { AppAlert, Button, HeaderMain, LoaderView } from "../../common";
import ModalList from "../../common/ModalList";
import ProviderOfferCard from "../../common/ProviderOfferCard";
import TextInputDropDown from "../../common/TextInputDropDown";
import { styles } from "./styles";
import { AppAlertDialog } from "../../common/AppAlertDialog";
import { toFixedExp } from "../../../Utils/MethodsUtils";
import { Actions } from "react-native-router-flux";
import Singleton from "../../../Singleton";
import { EventRegister } from "react-native-event-listeners";
import * as Constants from "../../../Constants";

const BuySellCoin = ({ navigation }) => {
  const [selectedTabData, setSelectedTabData] = useState("buy");
  const [youPay, setYouPay] = useState("");
  const [payModal, setPayModal] = useState(false);
  const [countryModal, setCountryModal] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [receiveModal, setReceiveModal] = useState(false);
  const [initialCurrencies, setInitialCurrencies] = useState([]);
  const [initialCryptos, setInitialCryptos] = useState([]);
  const tabData = ["buy", "sell"];
  const [selectedCurrencies, setSelectedCurrencies] = useState({});
  const [selectedCrypto, setSelectedCrypto] = useState({});
  const [providerOffer, setProviderOffer] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [getOfferStatus, setGetOfferStatus] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    const blurListener = navigation.addListener("didBlur", () => {
      setIsLoading(false);
    });

    getonOffRampDetails();

    // this event is handled when user moves the app to background
    EventRegister.addEventListener(Constants.DOWN_MODAL, () => {
      setCountryModal(false);
      setPayModal(false);
      setReceiveModal(false);
      setAlertText("");
      setShowAlert(false);
    });

    return () => {
      blurListener && blurListener.remove();
    };
  }, []);

  useEffect(() => {
    const focusListener = navigation.addListener("didFocus", () => {
      if (!getOfferStatus) {
        onPressGetOffer();
      }
    });
    return () => focusListener && focusListener.remove();
  }, [getOfferStatus]);

  const getonOffRampDetails = useCallback(() => {
    onOffRampDetails()
      .then((res) => {
        const { onOffRampCountries, onOffRampFiats, onOffRampCryptos } =
          res?.data || {};

        console.log(onOffRampCountries, "Countries Data");

        setCountryData(onOffRampCountries);
        setSelectedCountry(onOffRampCountries?.[0]);

        const defaultCurrency = onOffRampFiats?.[0];
        // onOffRampFiats?.find(
        //   (item) => item?.ticker?.toLowerCase() === "usd"
        // ) || onOffRampFiats?.[0];

        console.log("onOffRampFiats ======", JSON.stringify(onOffRampFiats));
        setInitialCurrencies(onOffRampFiats);
        setSelectedCurrencies(defaultCurrency);

        setInitialCryptos(onOffRampCryptos);
        setSelectedCrypto(onOffRampCryptos?.[0]);

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching on/off ramp details:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log("Inputs changed ===========");
    setGetOfferStatus(true);
    setSelectedOffer({});
  }, [selectedCountry, selectedCurrencies, selectedCrypto, youPay]);

  const onSelectedTab = (item) => {
    if (selectedTabData == item) {
      return;
    }
    setSelectedTabData(item);
    setYouPay("");
    setSelectedOffer({});
    setSelectedCountry(countryData[0]);
    setSelectedCurrencies(
      item == "sell" ? initialCryptos[0] : initialCurrencies[0]
    );
    setSelectedCrypto(
      item == "sell" ? initialCurrencies[0] : initialCryptos[0]
    );
    setProviderOffer([]);
    setGetOfferStatus(true);
  };

  const getValue = (bal) => {
    console.log(bal, "balbalbalbalbalbal");

    if (bal > 0) {
      const NewBal =
        bal < 0.000001
          ? toFixedExp(bal, 8)
          : bal < 0.0001
            ? toFixedExp(bal, 6)
            : toFixedExp(bal, 4);
      return NewBal;
    } else return "0.0000";
  };
  const onPressGetOffer = () => {
    Keyboard.dismiss();
    const showAlert = (message) => {
      setAlertText(message);
      setShowAlert(true);
    };

    const validationChecks = [
      {
        condition: !selectedCountry,
        message: LanguageManager.changellyBuySell.pleaseSelectCountryFirst,
      },
      {
        condition: !selectedCurrencies,
        message: LanguageManager.changellyBuySell.pleaseSelectCurrenciesFirst,
      },
      {
        condition: !selectedCrypto,
        message:
          LanguageManager.changellyBuySell.pleaseSelectCryptocurrencyFirst,
      },
      {
        condition: !youPay,
        message: LanguageManager.alertMessages.pleaseEnterAmount,
      },
    ];

    for (let check of validationChecks) {
      if (check.condition) {
        showAlert(check.message);
        return;
      }
    }

    const currencyFrom =
      selectedTabData === "buy"
        ? selectedCurrencies?.ticker
        : selectedCurrencies?.coins_changelly_on_off_ramp_rel?.ticker;

    const currencyTo =
      selectedTabData === "buy"
        ? selectedCrypto?.coins_changelly_on_off_ramp_rel?.ticker
        : selectedCrypto?.ticker;

    console.log("selectedCrypto  =======", JSON.stringify(selectedCrypto));

    console.log(
      "selectedCountryselectedCountry",
      JSON.stringify(selectedCountry)
    );
    const data = {
      type: selectedTabData,
      currencyFrom: currencyFrom.toUpperCase(),
      currencyTo: currencyTo.toUpperCase(),
      amountFrom: youPay,
      country: selectedCountry?.code,
      state: selectedCountry?.state_code ?? null,
    };

    console.log(data, "datadatadata");
    setIsLoading(true);
    onOffRampOffer(data)
      .then((res) => {
        const { data } = res || {};
        console.log("onOffRampOffer res ------", JSON.stringify(res));

        if (data?.offers) {
          const isAnyValidPair = data?.offers.some(
            (val) =>
              (!val?.errorType && !val?.errorMessage) ||
              val.errorType == "limits"
          );
          if (!isAnyValidPair) {
            setAlertText("No Valid Offers for this Pair");
            setShowAlert(true);
            setIsLoading(false);
            return;
          }
        }

        const providersList = data?.providersList || [];
        const providersMap = new Map(
          providersList.map((provider) => [provider.code, provider])
        );

        console.log(
          "Original offers =======",
          data?.offers ? JSON.stringify(data?.offers) : "no offers"
        );
        const filteredOffers = (data?.offers || [])?.filter(
          (val) =>
            !val.errorType || (val.errorType && val.errorType == "limits")
        );
        const newArray = filteredOffers.map((item) => {
          const provider = providersMap.get(item?.providerCode);
          const tempItem = { ...item };
          if (tempItem?.errorType == "limits" && tempItem?.errorDetails) {
            tempItem.errorMessage = `${Number(tempItem?.errorDetails?.[0]?.value) < Number(youPay) ? 'Max' : 'Min'} value required for exchange is ${tempItem?.errorDetails?.[0]?.value}`;
          }
          return provider ? { ...tempItem, ...provider } : tempItem;
        });
        console.log("Updated Offers", JSON.stringify(newArray));

        const maxAmountObject = newArray.reduce((prev, current) => {
          return parseFloat(prev.amountExpectedTo) >
            parseFloat(current.amountExpectedTo)
            ? prev
            : current;
        });

        // to handle refreshing offer on screen focus and keeping same provider offer
        // but with updated values, maybe amountExpectedto might have changed, etc.
        setSelectedOffer((prev) => {
          if (!!prev?.providerCode) {
            const targetIndex = newArray.findIndex(
              (val) => val?.providerCode == prev?.providerCode
            );
            if (targetIndex != -1) {
              return { ...newArray[targetIndex] };
            }
            return maxAmountObject;
          }
          return maxAmountObject;
        });

        setProviderOffer(newArray);
        setGetOfferStatus(false);
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error fetching offers:", error);
      });
  };

  const onPressContinue = (paymentClicked) => async () => {
    try {
      setIsLoading(true);
      const data = {
        type: selectedTabData,
        providerCode: selectedOffer.providerCode,
        currencyFrom:
          selectedTabData === "buy"
            ? selectedCurrencies.ticker
            : selectedCurrencies?.coins_changelly_on_off_ramp_rel?.ticker,
        currencyTo:
          selectedTabData === "buy"
            ? selectedCrypto.coins_changelly_on_off_ramp_rel?.ticker
            : selectedCrypto?.ticker,
        amountFrom: youPay,
        country: selectedCountry?.code,
        state: selectedCountry?.state_code ?? null,
        recipientWalletAddress:
          selectedTabData === "buy"
            ? getAddress(selectedCrypto?.coin_family)
            : getAddress(selectedCurrencies?.coin_family),
        paymentMethod: paymentClicked?.method,
      };
      console.log("onPressContinue data ======", data);

      const res = await onOffRampCreateOrder(data);
      console.log("onPressContinue res =======", JSON.stringify(res));

      Actions.currentScene != "BuySellWebview" &&
        Actions.BuySellWebview({
          providerName: selectedOffer?.name,
          redirectLink: res?.data?.redirectUrl,
          providerInfo: selectedOffer,
        });
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.log("onPressContinue error =======", error);
      setIsLoading(false);
      setAlertText(error?.message || error?.data?.message);
      setShowAlert(true);
    }
  };

  /******************************************************************************************/
  const getAddress = (coinFamily) => {
    const address =
      coinFamily == 6
        ? Singleton.getInstance().defaultTrxAddress
        : coinFamily == 3
          ? Singleton.getInstance().defaultBtcAddress
          : coinFamily == 5
            ? Singleton.getInstance().defaultLtcAddress
            : Singleton.getInstance().defaultEthAddress;

    console.log('defaultEthAddress ======', Singleton.getInstance().defaultEthAddress)
    console.log('defaultBnbAddress ======', Singleton.getInstance().defaultBnbAddress)
    return address;
  };

  // console.log('initialCryptos ======', JSON.stringify(initialCryptos))
  // console.log('selectedOffer ======', JSON.stringify(selectedOffer))
  // console.log("selectedCurrencies ======", JSON.stringify(selectedCurrencies));
  // console.log('selectedCountry ======', JSON.stringify(selectedCountry))
  // console.log("selectedCrypto ======", JSON.stringify(selectedCrypto));
  return (
    <ImageBackground
      source={ThemeManager.ImageIcons.mainBgImgNew}
      style={{ flex: 1, backgroundColor: ThemeManager.colors.mainBgNew }}
    >
      <HeaderMain
        BackButtonText={LanguageManager.contactUs.buySell}
        customStyle={{ paddingHorizontal: widthDimen(24) }}
        showBackBtn={false}
      />
      <KeyboardAwareScrollView style={{ flexGrow: 1 }} bounces={false}>
        <View style={[styles.mainView, { paddingHorizontal: dimen(24) }]}>
          <View style={{ flexDirection: "row" }}>
            {tabData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tabView,
                  {
                    borderColor:
                      item === selectedTabData
                        ? ThemeManager.colors.primaryColor
                        : ThemeManager.colors.legalGreyColor,
                  },
                ]}
                activeOpacity={0.9}
              // onPress={() => onSelectedTab(item)}
              >
                <Text
                  style={[
                    {
                      color:
                        item === selectedTabData
                          ? ThemeManager.colors.primaryColor
                          : ThemeManager.colors.legalGreyColor,
                    },
                    styles.tabText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.spaceRow, styles.receiveView, { marginTop: dimen(0), }]}>
            <Text
              style={[
                { color: ThemeManager.colors.blackWhiteText },
                styles.payText,
              ]}
            >
              {selectedTabData == "sell"
                ? LanguageManager.changellyBuySell.youSell
                : LanguageManager.changellyBuySell.youPay}
            </Text>
            {selectedTabData == "sell" &&
              !!selectedCrypto &&
              !!selectedCurrencies && (
                <Text
                  style={[
                    { color: ThemeManager.colors.blackWhiteText },
                    styles.payText,
                  ]}
                >
                  {LanguageManager.commonText.Balance}:{" "}
                  <Text style={{ color: ThemeManager.colors.primaryColor }}>
                    {getValue(
                      selectedCrypto?.wallet_data?.balance ||
                      selectedCurrencies?.wallet_data?.balance
                    )}{" "}
                    {(
                      selectedCrypto?.coin_symbol ||
                      selectedCurrencies?.coin_symbol
                    )?.toUpperCase()}
                  </Text>
                </Text>
              )}
          </View>
          <TextInputDropDown
            value={youPay}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9.]/g, "");
              setYouPay(numericText.trim());
            }}
            cointImage={
              selectedCurrencies?.icon_url || selectedCurrencies?.coin_image
            }
            cointName={
              selectedCurrencies?.ticker || selectedCurrencies?.coin_symbol
            }
            dropDown={true}
            onPressDropDown={() => setPayModal(true)}
            keyboardType={"numeric"}
            placeholder={"0.00"}
            maxLength={20}
          />
          <View style={styles.receiveView}>
            <Text
              style={[
                { color: ThemeManager.colors.blackWhiteText },
                styles.payText,
              ]}
            >
              {LanguageManager.changellyBuySell.youReceive}
            </Text>
          </View>
          <TextInputDropDown
            value={selectedOffer?.amountExpectedTo}
            cointImage={selectedCrypto?.coin_image || selectedCrypto?.icon_url}
            cointName={selectedCrypto?.coin_symbol || selectedCrypto?.ticker}
            dropDown={true}
            onPressDropDown={() => setReceiveModal(true)}
            editable={false}
            placeholder={"0.00"}
          />
          {providerOffer.length > 0 && !getOfferStatus && (
            <View style={styles.receiveView}>
              <Text
                style={[
                  { color: ThemeManager.colors.blackWhiteText },
                  styles.payText,
                ]}
              >
                {providerOffer && providerOffer?.length > 1
                  ? LanguageManager.swapText.providers
                  : LanguageManager.swapText.provider}
              </Text>
              {providerOffer?.map((item, index) => {
                return (
                  <ProviderOfferCard
                    item={item}
                    onPress={() => setSelectedOffer(item)}
                    selected={selectedOffer?.providerCode == item?.providerCode}
                    onOfferPressed={onPressContinue}
                  />
                );
              })}
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      <Button
        customStyle={styles.buttonStyle}
        buttontext={
          "Buy"
        }
        onPress={
          () =>
            // getOfferStatus ?
            onPressGetOffer()
          // : onPressContinue()
        }
      />

      <ModalList
        openModel={countryModal}
        title={LanguageManager.merchantCard.chooseCurrency}
        isResetSearchOnBack
        handleBack={() => {
          setCountryModal(false);
        }}
        list={countryData}
        onPress={(item) => {
          setSelectedCountry(item);
          setCountryModal(false);
        }}
      />
      <ModalList
        openModel={payModal}
        isResetSearchOnBack
        title={LanguageManager.merchantCard.chooseCurrency}
        handleBack={() => setPayModal(false)}
        list={selectedTabData == "sell" ? initialCryptos : initialCurrencies}
        onPress={(item) => {
          setSelectedCurrencies(item);
          setPayModal(false);
        }}
      />
      <ModalList
        openModel={receiveModal}
        isResetSearchOnBack
        title={LanguageManager.merchantCard.chooseCurrency}
        handleBack={() => setReceiveModal(false)}
        list={selectedTabData == "sell" ? initialCurrencies : initialCryptos}
        onPress={(item) => {
          setSelectedCrypto(item);
          setReceiveModal(false);
        }}
      />
      <LoaderView isLoading={isLoading} />
      {showAlert && (
        <AppAlert
          alertTxt={alertText}
          hideAlertDialog={() => {
            setShowAlert(false);
          }}
        />
      )}
    </ImageBackground>
  );
};

export default React.memo(BuySellCoin);
