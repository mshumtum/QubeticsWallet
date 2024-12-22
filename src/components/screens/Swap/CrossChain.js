import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
  ImageBackground,
  Keyboard,
  Modal,
} from "react-native";
import {
  SelectCurrency,
  Button,
  AppAlert,
  ConfirmSwapCrosschain,
  SelectCurrencyNew,
} from "../../common";
import {
  CreateEthTokenRaw,
  EthDataEncode,
  createEthRaw,
} from "../../../Utils/EthUtils";
import {
  getSwftCoins,
  getSwapCoinInfo,
  coinDetail,
  accountExchange,
  requestGasEstimation,
  requestSendCoin,
  requestNonce,
  requestBTCgasprice,
  requestUnspent,
  requestLtcUnspent,
  getFiatValue,
  getFeeLimit,
  getCoinListChangelly,
  getCoinMinAmnt,
  createChangellyTransaction,
  getSwapPriceDiff,
} from "../../../Redux/Actions";
import {
  currencyFormat,
  exponentialToDecimal,
  getData,
  getData as getDataFromStorage,
  getEncryptedData,
  toFixedExp,
} from "../../../Utils/MethodsUtils";
import { Images, Fonts, Colors } from "../../../theme";
import { ThemeManager } from "../../../../ThemeManager";
import Singleton from "../../../Singleton";
import * as constants from "../../../Constants";
import { useDispatch } from "react-redux";
import { LoaderView } from "../../common/LoaderView";
import Web3 from "web3";
import { Actions } from "react-native-router-flux";
import {
  bnbDataEncode,
  getBnbRaw,
  sendTokenBNB,
} from "../../../Utils/BscUtils";
import { getMaticRaw, getMaticTokenRaw } from "../../../Utils/MaticUtils";
import * as Constants from "../../../Constants";
import { EventRegister } from "react-native-event-listeners";
import Tooltip from "rn-tooltip";
import { createTrxRaw, createTrxTangemRaw, createTrxTokenRaw, createTrxTokenTangemRaw } from "../../../Utils/TronUtils";
import { LanguageManager } from "../../../../LanguageManager";
import { dimen, getDimensionPercentage, heightDimen, roundToDecimal } from "../../../Utils";
import FastImage from "react-native-fast-image";
import { ChangellyCoinList } from "../../common/ChangellyCoinList";
import { sleep } from "@celo/base";
import EnterPinForTransaction from "../EnterPinForTransaction/EnterPinForTransaction";
import { sendBtcTangem } from "../../../Utils/BtcUtils";
import PriceImpactModal from "../../common/PriceImpactModal";
import LinearGradient from "react-native-linear-gradient";

const CrossChain = ({
  themeSelected,
  navigation,
  isVisible,
  firstCoinSelectedData,
  ...props
}) => {
  const { detailTrx, alertMessages, swapText, browser } = LanguageManager;
  const tabData = [
    { title: "25%", key: "1", selected: false },
    { title: "50%", key: "2", selected: false },
    { title: "75%", key: "3", selected: false },
    { title: "100%", key: "4", selected: false },
  ];
  const listData = [
    { title: "All", key: "1", selected: false, mainNetwork: "All" },
    {
      title: "BTC",
      key: "2",
      selected: false,
      mainNetwork: "BTC",
      coinFamily: 3,
    },
    {
      title: "ETH",
      key: "3",
      selected: false,
      mainNetwork: "ETH",
      coinFamily: 2,
    },
    {
      title: "BNB",
      key: "4",
      selected: false,
      mainNetwork: "BSC",
      coinFamily: 1,
    },
    { title: "MATIC", key: "5", selected: false, mainNetwork: "POLYGON", coinFamily: 4 },
    { title: 'Solana', key: '6', selected: false, mainNetwork: "Solana", coinFamily: 5 },
    {
      title: "TRON",
      key: "7",
      selected: false,
      mainNetwork: "TRX",
      coinFamily: 6,
    },
  ];
  const testnetUrlEth = Singleton.getInstance().ETH_RPC_URL; // Constants.network == 'testnet' ? Constants.ETH_TESTNET_URL : Constants.ETH_MAINNET_URL;
  const provider = new Web3.providers.HttpProvider(testnetUrlEth);
  const web3Eth = new Web3(provider);
  const gasFeeMultiplier = 0.000000000000000001;

  // BTC
  const bitcore = require('bitcore-lib');
  let inputCount = 0;
  let outputCount = 2;
  let inputs = [];
  let totalAmountAvailable = 0;
  let transactionSize = 0;
  let btcTosatoshi = 100000000;
  let btcTosatoshiMultiplier = 0.00000001;

  const dispatch = useDispatch();
  const tooltipRef = useRef(null);
  const scrollRef = useRef(null);

  const [firstCoinSelected, setFirstCoinSelected] = useState(null);
  // selected first coin wallet
  const firstItemWallet = useMemo(() => {
    if (firstCoinSelected) {
      return {
        ...firstCoinSelected.wallet_data,
        is_token: firstCoinSelected.is_token,
      };
    }
    return {};
  }, [firstCoinSelected]);
  // from selected coin or token wallet data
  const itemWallet = useMemo(() => {
    return {
      ...firstItemWallet,
      ...firstCoinSelected,
    };
  }, [firstItemWallet, firstCoinSelected]);
  const [coinInfoSwap, setCoinInfoSwap] = useState({});
  const [fromAmt, setFromAmt] = useState("");
  const [firstCoinList, setFirstCoinList] = useState([]);
  const [firstCoinFilteredList, setFirstCoinFilteredList] = useState([]);

  const [secondCoinSelected, setSecondCoinSelected] = useState(null);
  const seconditemWallet = useMemo(() => {
    if (secondCoinSelected) {
      return {
        ...secondCoinSelected.wallet_data,
        is_token: secondCoinSelected.is_token,
      };
    }
    return {};
  }, [secondCoinSelected]);
  const [toAmt, setToAmt] = useState("");
  const [secondCoinList, setSecondCoinList] = useState([]);
  const [secondCoinFilteredList, setSecondCoinFilteredList] = useState([]);

  const [isRelayerFeeGreater, setIsRelayerFeeGreater] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showtooltip, setShowtooltip] = useState(true);
  const [serviceFee, setServiceFee] = useState("3");
  const [buttonTxt, setButtonTxt] = useState("Swap");

  const [firstModal, setFirstModal] = useState(false);
  const [secondModal, setSecondModal] = useState(false);
  const [search, setSearch] = useState("");
  const [fromSearch, setFromSearch] = useState(false);
  const [selectedListIndex, setSelectedListIndex] = useState(0);
  const [ConfirmTxnModal, showConfirmTxnModal] = useState(false);
  const [AlertDialogNew, showAlertDialogNew] = useState(false);
  const [alertTxt, setAlertTxt] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [selectedBlockchain, setSelectedBlockchain] = useState(null); // null denotes ALL option

  const [gasEstimate, setGasEstimate] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [crossSwapData, setCrossSwapData] = useState("");
  const [sendCoinPayload, setSendCoinPayload] = useState(null);
  const [fromToAmtDiff, setFromToAmtDiff] = useState(0);
  const [pairModalAlert, setPairModalAlert] = useState(false);
  const [priceImpactState, setPriceImpactState] = useState(true);

  const platformAddress = useMemo(
    () => sendCoinPayload?.to, // payinAddress from changelly
    [sendCoinPayload]
  );

  // BTC
  const [SliderValue, setSliderValue] = useState("");
  const [txnSize, setTxnSize] = useState(0);
  const [totalAvlAmnt, setTotalAvlAmnt] = useState(0);
  const [input, setInput] = useState([]);

  // TRON
  const [txnRaw, setTxnRaw] = useState("");
  const [feeLimit, setFeeLimit] = useState("40000000");

  const [showPinModal, setShowPinModal] = useState(false)
  const [isPrivateKeyWallet, setPrivateKeyWallet] = useState(false)


  useEffect(() => {
    getDataWallet();
    getFromToAmtDiff()
    navigation.addListener("didFocus", () => {
      setShowtooltip(true);
      getDataWallet();
    });

    navigation.addListener("didBlur", () => {
      _scrollToTop();
      setShowtooltip(false);
      resetAllStates();
    });

    // this event is handled when user moves the app to background
    EventRegister.addEventListener(Constants.DOWN_MODAL, () => {
      setShowtooltip(false);
      setFirstModal(false);
      setSecondModal(false);
      setTimeout(() => {
        setShowtooltip(true)
      }, 100);

    });

  }, []);

  const getFromToAmtDiff = () => {
    dispatch(getSwapPriceDiff())
      .then(async (res) => {
        console.log("res===>>>>>", res);
        setFromToAmtDiff(res?.value);
      })
      .catch((err) => {
        console.log("getFromToAmtDiff_Err===>>>>>", err);
        setLoading(false);
      });
  };

  const getCoinsApiData = async () => {
    const tempKeys = await getDataFromStorage(Constants.ADDRESS_LIST);
    console.log("tempKeys -----", tempKeys, typeof tempKeys);
    const addressListKeys =
      typeof tempKeys == "string" ? JSON.parse(tempKeys) : tempKeys;
    console.log(
      "addressListKeys -----",
      addressListKeys,
      typeof addressListKeys
    );
    const apiData = {
      fiatType: Singleton.getInstance().CurrencySelected,
      addressListKeys: addressListKeys,
    };
    // console.log("getData apiData ----", apiData);
    return apiData;
  };

  /******************************************************************************************/
  const fetchFeeLimit = () => {
    dispatch(getFeeLimit({}))
      .then((res) => {
        const val = res ? res * 10 ** 6 : "40000000";
        setFeeLimit(val);
        console.log("chk getFeeLimit:::::", res);
      })
      .catch((err) => {
        //console.log('chk err getFeeLimit:::::', err);
      });
  };

  const getDataWallet = async () => {
    try {
      setLoading(true);
      setFirstCoinSelected(null);
      setSecondCoinSelected(null);
      fetchFeeLimit();
      const apiData = await getCoinsApiData();
      // console.log("getData apiData ----", apiData);
      const res = await getCoinListChangelly(apiData);
      // console.log("getData res ----", res);
      const listWithBalance = res?.filter(
        (val) => val?.wallet_data && Object.keys(val?.wallet_data)?.length > 0
      );
      const tempFirstCoin = listWithBalance[0];
      setFirstCoinList(listWithBalance);
      setFirstCoinSelected(listWithBalance[0]);
      setFirstCoinFilteredList(listWithBalance);

      getData(Constants.MULTI_WALLET_LIST)
        .then(list => {
          let currentWallet = JSON.parse(list)

          currentWallet = currentWallet.find(res => res?.defaultWallet)
          if (currentWallet?.isPrivateKey) {
            setPrivateKeyWallet(true)
          }
        })

      // add delay
      await sleep(600);
      await getPairCoin({ tempFirstCoin });
      // get pair
      // get min amount
    } catch (error) {
      console.log("getData error ----", error);
      setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  // this will work both ways, when getting the pair of the first selected coin
  // as well as when getting the pair of the second selected coin
  const getPairCoin = async (data) => {
    try {
      let { tempFirstCoin, tempSecondCoin } = data;
      console.log("getPairCoin tempFirstCoin ------", tempFirstCoin);
      console.log("getPairCoin tempSecondCoin ------", secondCoinSelected);
      const commonApiData = await getCoinsApiData();
      const apiData = {
        ...commonApiData,
        getPairsFor: tempFirstCoin
          ? tempFirstCoin?.coins_changelly_rel?.ticker
          : tempSecondCoin?.coins_changelly_rel?.ticker,
      };
      console.log("getPairCoin apiData ------", apiData);
      const res = await getCoinListChangelly(apiData);
      // console.log("getPairCoin res ----", res);

      // this will handle the case of both first and second coin
      // since either we will get pair for the first coin or the second coin
      await getExchangeVals({
        tempFirstCoin: tempFirstCoin ?? res[0],
        tempSecondCoin: tempSecondCoin ?? res[0],
        isInitialCall: true,
      });

      // console.log('getPairCoin res0 -- ', res[0])
      // this will handle case of getting pair for either first coin or second coin
      if (tempFirstCoin) {
        tempSecondCoin = res[0];
        console.log('getPairCoin tempSecondCoin -- ', res)
        setSecondCoinList(res);
        setSecondCoinFilteredList(res);
        setSecondCoinSelected(tempSecondCoin);
      } else if (tempSecondCoin) {
        tempFirstCoin = res[0];
        setFirstCoinList(res);
        setFirstCoinFilteredList(res);
        setFirstCoinSelected(tempFirstCoin);
      }
    } catch (error) {
      console.log("getPairCoin error -----", error);
      setLoading(false);
    }
  };

  const resetAllStates = (isResetSwapInfo = true) => {
    console.log("resetAllStates ------");
    Keyboard.dismiss();
    setFromAmt("");
    setToAmt("");
    setButtonTxt("Swap");
    setSelectedIndex(null);
    if (isResetSwapInfo) {
      setCoinInfoSwap({});
    }
  };

  /******************************************************************************************/
  const _scrollToTop = () => {
    if (scrollRef !== null) {
      if (scrollRef.current !== null) {
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      }
    }
  };

  const openFirstCoinList = () => {
    setFirstModal(true);
  };

  const onFirstListItemSelected = async (item, index) => {
    console.log("onFirstListItemSelected -----", item);
    console.log(
      "onFirstListItemSelected firstCoinSelected-----",
      firstCoinSelected
    );
    console.log(
      "onFirstListItemSelected secondCoinSelected-----",
      secondCoinSelected
    );
    setFirstModal(false);
    // setSecondCoinSelected(false);
    // reset the input states
    resetAllStates(false);

    if (secondCoinSelected.coin_id == item.coin_id) {
      onError(
        `You cannot swap ${secondCoinSelected?.coin_symbol.toUpperCase()} to ${secondCoinSelected?.coin_symbol.toUpperCase()} across chains. Please select a different token.`
      );
      return;
    }

    if (firstCoinSelected.coin_id != item.coin_id) {
      setLoading(true);
      getPairCoin({ tempFirstCoin: item });
      // onPressCoin
      const oldFirst = { ...firstCoinSelected };
      setFirstCoinSelected(item);
      onSearch("");
      // in case of trob the tab is out of the screen when list is opened again 
      // and user is unable to understand why not all coins/tokens are not present in listing
      setSelectedBlockchain(null);
      setSelectedListIndex(0);
      // await getPairCoin({
      //   tempFirstCoin: item
      // });
      await getExchangeVals({
        tempFirstCoin: item,
        oldFirst,
        tempSecondCoin: secondCoinSelected,
        isInitialCall: true,
      });
    }
  };

  const onError = (err) => {
    if (err == "Please check your network connection") {
      setAlertTxt(alertMessages.pleaseCheckYourNetworkConnection);
      showAlert ? showAlertDialogNew(true) : showAlertDialogNew(false);
    }
    const errorMsg =
      typeof err == "string" ? err : err?.message || err?.data?.message;
    showAlertDialogNew(true);
    setAlertTxt(errorMsg);
  };

  const onSearch = (txt) => {
    setFromSearch(true);
    setSearch(txt);
    let Arr = [...firstCoinList];

    if (selectedBlockchain) {
      Arr = Arr.filter(
        (item1) =>
          item1.coins_changelly_rel.coinFamily == selectedBlockchain.coinFamily
      );
    }

    if (txt?.trim()?.length == 0) {
      setFirstCoinFilteredList([...Arr]);
      return;
    }

    // console.log("Arr:::::::", Arr);
    const a = Arr.filter(
      (res) =>
        res?.coin_name.toLowerCase().includes(txt?.trim()?.toLowerCase()) ||
        res?.coin_symbol.toLowerCase().includes(txt?.trim()?.toLowerCase())
    );
    setFirstCoinFilteredList(a);
  };

  /****************************** onSearchSecond ****************************** */
  const onSearchSecond = (txt) => {
    setFromSearch(true);
    setSearch(txt);
    let Arr = [...secondCoinList];
    console.log(Arr, 'ArrArrArrArr');

    if (selectedBlockchain) {
      Arr = Arr.filter(
        (item1) =>
          item1.coins_changelly_rel.coinFamily == selectedBlockchain.coinFamily
      );
    }

    if (txt?.trim()?.length == 0) {
      setSecondCoinFilteredList([...Arr]);
      return;
    }

    const a = Arr.filter(
      (res) =>
        res?.coin_name.toLowerCase().includes(txt?.trim()?.toLowerCase()) ||
        res?.coin_symbol.toLowerCase().includes(txt?.trim()?.toLowerCase())
    );
    console.log("onSearchSecond filtered -----", a);
    setSecondCoinFilteredList(a);
  };

  /****************************** update First List ****************************** */
  const filterFirstList = (item, index) => () => {
    setSearch("");
    const arr = [...firstCoinList];
    if (item.mainNetwork?.toLowerCase() == "all") {
      setSelectedBlockchain(null);
      setFirstCoinFilteredList(arr);
    } else {
      setSelectedBlockchain(item);
      const newArr = arr.filter(
        (item1) => item1.coins_changelly_rel.coinFamily == item.coinFamily
      );
      console.log(newArr, "chk item:::::::", item);
      setFirstCoinFilteredList(newArr);
    }
    return setSelectedListIndex(index);
  };

  const changeTimer = useRef(null);
  const onChangeNo = (val) => {
    setFromAmt(val);
    // clearing the selected options
    setSelectedIndex(null);

    if (val.length == 0) {
      // reset values
      return;
    }

    if (changeTimer.current) {
      clearTimeout(changeTimer.current);
      changeTimer.current = null;
    }

    changeTimer.current = setTimeout(() => {
      Keyboard.dismiss();
      setLoading(true);
      setFromAmt(val);
      getExchangeVals({
        fromAmt: val,
      });
    }, 1000);
  };

  const getExchangeVals = async (data) => {
    setToAmt("");
    const tempFirstCoin = data?.tempFirstCoin ?? firstCoinSelected;
    // console.log(
    //   "getExchangeVals tempFirstCoin ------",
    //   tempFirstCoin?.coins_changelly_rel?.coin_id,
    //   JSON.stringify(tempFirstCoin)
    // );
    const tempSecondCoin = data?.tempSecondCoin ?? secondCoinSelected;
    try {
      const payload = {
        from: tempFirstCoin?.coins_changelly_rel?.ticker,
        to: tempSecondCoin?.coins_changelly_rel?.ticker,
        amountFrom: data?.fromAmt ?? "0.1",
        fiatType: Singleton.getInstance().CurrencySelected,
        coinIds: [
          tempFirstCoin?.coins_changelly_rel?.coin_id,
          tempSecondCoin?.coins_changelly_rel?.coin_id,
        ],
        fromCryptoSymbol: tempFirstCoin?.coin_symbol?.toUpperCase(),
      };
      console.log("getPairCoin payload ----", payload);

      const res1 = await getCoinMinAmnt(payload);
      console.log("getPairCoin res1 ----", JSON.stringify(res1));
      const result = res1?.data?.result?.[0];

      let tempCoinInfo = coinInfoSwap;
      if (result) {
        setServiceFee(res1?.clientCommission);
        tempCoinInfo = setLimitsAndFees(result);
      }

      // this will avoid setting the toAmount when we select either a new second coin or first coin from the listing
      if (data?.fromAmt) {
        const convertedAmount = (result?.amountTo * 0.99) - result?.networkFee;
        setToAmt(convertedAmount);
      }

      if (res1 && result && tempFirstCoin && tempSecondCoin) {
        setCoinsFiatValue({
          res1,
          tempFirstCoin,
          tempSecondCoin,
        });

        // let instantRate = tempCoinInfo?.instantRate;
        // let receiveCoinFee = tempCoinInfo?.receiveCoinFee;
        // let convertedAmount = data?.fromAmt * instantRate;
        // convertedAmount = (convertedAmount * 99.7) / 100;
        // convertedAmount = convertedAmount - receiveCoinFee;
        // convertedAmount =
        //   convertedAmount <= 0 ? "---" : toFixedExp(convertedAmount, 6);
        // enteredAmount > 0
        //   ? convertedAmount <= 0 || convertedAmount == "---"
        //     ? setShowErr(true)
        //     : setShowErr(false)
        //   : setShowErr(false);
        // setToAmt(convertedAmount);
      }
    } catch (error) {
      console.log("getExchangeVals error ---", JSON.stringify(error));

      const changellyErrorMsg = error?.data?.error?.message;
      const isInvalidPair = changellyErrorMsg && changellyErrorMsg?.toLowerCase?.()?.includes('invalid pair');
      const isLessMinAmt = changellyErrorMsg && changellyErrorMsg?.toLowerCase?.()?.includes('minimal amount');
      // this handles the case when the new coin selected either first or second, does not make a valid pair with the other coin
      if (data?.oldFirst && isInvalidPair) {
        setFirstCoinSelected({ ...data?.oldFirst });
      }
      if (data?.oldSecond && isInvalidPair) {
        setSecondCoinSelected({ ...data?.oldSecond });
      }

      console.log("error tempFirstCoin ======", tempFirstCoin);
      console.log("error tempSecondCoin ======", tempSecondCoin);
      // changelly returns this error code when the min amount sent is less than required min amount to get the info
      if (isLessMinAmt) {
        if (tempFirstCoin) setFirstCoinSelected({ ...tempFirstCoin });
        if (tempSecondCoin) setSecondCoinSelected({ ...tempSecondCoin });
        // get second list in case of togglepress

        // this is changelly api returning limits and fees values
        const changellyLimits = error?.data?.error?.data?.limits;
        console.log(
          "getExchangeVals changellyLimits ---",
          changellyLimits,
          data?.isInitialCall
        );

        const result = {
          min: changellyLimits?.min?.from,
          max: changellyLimits?.max?.from,
        };
        setLimitsAndFees(result);

        if (data?.isTogglePress) return null;
      }

      console.log('onError popup =======', !data?.isInitialCall, (data?.isTogglePress && !isLessMinAmt))
      if (!data?.isInitialCall || (data?.isTogglePress && !isLessMinAmt)) {
        onError(error?.data?.error);
      }

      return {
        error: error
      }
    } finally {
      setLoading(false);
    }
  };

  const setLimitsAndFees = (result) => {
    const tempCoinInfo = {
      depositMin: result?.min,
      depositMax: result?.max,
      receiveCoinFee: result?.networkFee,
      instantRate: result?.rate,
    };
    console.log("result resultresultresult", tempCoinInfo);
    setCoinInfoSwap(tempCoinInfo);

    return tempCoinInfo;
  };

  // this gets the latest market price (fiat price) of the selected coins/tokens
  const setCoinsFiatValue = (data) => {
    const { res1, tempFirstCoin, tempSecondCoin } = data;
    console.log("setCoinsFiatValue data ------");
    let tempFiatFirstIndex = null;
    let tempFiatSecondIndex = null;
    res1?.coinPriceFiatData?.forEach((val, i) => {
      if (val.coin_id == tempFirstCoin?.coin_id) {
        tempFiatFirstIndex = i;
      } else if (val.coin_id == tempSecondCoin?.coin_id) {
        tempFiatSecondIndex = i;
      }
    });

    const tempFirst = {
      ...tempFirstCoin,
      ...(tempFiatFirstIndex > -1 && {
        fiat_price_data:
          res1?.coinPriceFiatData[tempFiatFirstIndex]?.fiat_price_data,
      }),
    };
    console.log("setCoinsFiatValue tempFirst ------", tempFirst);
    const tempSecond = {
      ...tempSecondCoin,
      ...(tempFiatSecondIndex > -1 && {
        fiat_price_data:
          res1?.coinPriceFiatData[tempFiatSecondIndex]?.fiat_price_data,
      }),
    };
    console.log("setCoinsFiatValue tempSecond ------", tempSecond);
    // append this inside firstCoinSelected and secondCoinSelected

    setFirstCoinSelected(tempFirst);
    setSecondCoinSelected(tempSecond);
  };

  const onPressToggle = async () => {
    try {
      setLoading(true);
      resetAllStates();
      const tempFirst = {
        ...secondCoinSelected,
      };
      const tempSecond = {
        ...firstCoinSelected,
      };

      const error = await getExchangeVals({
        tempFirstCoin: tempFirst,
        tempSecondCoin: tempSecond,
        oldFirst: { ...firstCoinSelected },
        oldSecond: { ...secondCoinSelected },
        isTogglePress: true,
      });

      console.log("onPressToggle error ======", error);

      if (error) {
        // do not fetch second list
        console.log("onPressToggle do not fetch second list");
        return;
      }
      setLoading(true);
      const commonApiData = await getCoinsApiData();
      const apiData = {
        ...commonApiData,
        getPairsFor: tempFirst?.coins_changelly_rel?.ticker,
      };
      console.log("getPairCoin apiData ------", apiData);
      const res = await getCoinListChangelly(apiData);
      console.log("getPairCoin res ----", res);
      setSecondCoinList(res);
      setSecondCoinFilteredList(res);
      // this is handled to avoid any edge cases that may occur if this is not reset
      setSelectedBlockchain(null);
      setSelectedListIndex(0);
    } catch (error) {
      console.log("onPressToggle onPressToggle ======",);
    } finally {
      setLoading(false);
    }
  };

  const onSecondCoinPress = () => {
    setSecondModal(true);
  };

  const onSecondListItemSelected = async (item, index) => {
    console.log("onSecondListItemSelected -----", item);
    console.log(
      "onSecondListItemSelected firstCoinSelected-----",
      secondCoinSelected
    );
    setSecondModal(false);
    // setFirstCoinSelected(false);
    // reset the input states
    resetAllStates(false);
    if (secondCoinSelected.coin_id != item.coin_id) {
      setLoading(true);
      // onPressCoin
      const oldSecond = secondCoinSelected;
      setSecondCoinSelected(item);
      onSearchSecond("")
      // in case of trob the tab is out of the screen when list is opened again 
      // and user is unable to understand why not all coins/tokens are not present in listing
      setSelectedBlockchain(null);
      setSelectedListIndex(0);
      await getExchangeVals({
        tempFirstCoin: firstCoinSelected,
        oldSecond,
        tempSecondCoin: item,
        isInitialCall: true,
      });
      // await getPairCoin({
      //   tempSecondCoin: item,
      // });
    }
  };

  /****************************** update second List ****************************** */
  const filterSecondList = (item, index) => () => {
    setSearch("");
    const arr = [...secondCoinList];
    if (item.mainNetwork?.toLowerCase() == "all") {
      setSelectedBlockchain(null);
      setSecondCoinFilteredList(arr);
    } else {
      setSelectedBlockchain(item);
      const newArr = arr.filter(
        (item1) => item1.coins_changelly_rel.coinFamily == item.coinFamily
      );
      console.log(newArr, "chk item:::::::", item);
      setSecondCoinFilteredList(newArr);
    }
    return setSelectedListIndex(index);
  };

  const onPressSlider = (item, index) => () => {
    setSelectedIndex(index);
    // const itemWallet = {
    //   ...firstCoinSelected.wallet_data,
    //   is_token: firstCoinSelected.is_token,
    // };

    console.log("itemWallet -----", itemWallet);
    var percentVal = 0;
    if (item.key == 1) {
      percentVal = 0.25 * itemWallet.balance;
    } else if (item.key == 2) {
      percentVal = 0.5 * itemWallet.balance;
    } else if (item.key == 3) {
      percentVal = 0.75 * itemWallet.balance;
    } else if (item.key == 4) {
      console.log("chkitemWallet::::::", itemWallet);
      if (itemWallet.is_token != 0) {
        percentVal = itemWallet.balance;
      } else {
        if (itemWallet.balance > 0) {
          const newBal =
            parseFloat(itemWallet.balance) -
            parseFloat(itemWallet.balance * 0.1);
          percentVal = newBal > 0 ? toFixedExp(newBal, 8).toString() : "0.00";
        } else {
          percentVal = "0.00";
        }
      }
    }
    if (
      parseFloat(toFixedExp(percentVal, 8)) >
      parseFloat(toFixedExp(itemWallet.balance, 8))
    ) {
      setButtonTxt(alertMessages.insufficientBalance);
    } else {
      setButtonTxt(swapText.swap);
    }
    const finalFromAmt = toFixedExp(percentVal, 8);
    setFromAmt(finalFromAmt);
    Keyboard.dismiss();
    getExchangeVals({
      fromAmt: finalFromAmt,
    });
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
    return address;
  };

  /******************************************************************************************/
  const getAddressSecond = (coinCode) => {
    console.log("chk destination addressss::::::coinCode", coinCode);
    const address =
      coinCode == 6
        ? Singleton.getInstance().defaultTrxAddress
        : coinCode == 3
          ? Singleton.getInstance().defaultBtcAddress
          : coinCode == 5
            ? Singleton.getInstance().defaultLtcAddress
            : Singleton.getInstance().defaultEthAddress;
    return address;
  };

  const onSwapClicked = (hideModal) => {
    console.log("chk itemWallet.balance::::::", firstItemWallet.balance);



    if (fromAmt?.length == 0 || fromAmt == 0) {
      showAlertDialogNew(true);
      setAlertTxt(alertMessages.pleaseEnterAmount);
      return;
    }
    // if (!firstItemWallet.balance || parseFloat(firstItemWallet.balance) <= 0) {
    //   showAlertDialogNew(true);
    //   setAlertTxt(alertMessages.insufficientBalance);
    //   setButtonTxt(alertMessages.insufficientBalance);
    //   return;
    // }
    // if (parseFloat(fromAmt) > parseFloat(firstItemWallet.balance)) {
    //   showAlertDialogNew(true);
    //   setAlertTxt(alertMessages.insufficientBalance);
    //   setButtonTxt(alertMessages.insufficientBalance);
    //   return;
    // }
    if (parseFloat(fromAmt) < parseFloat(coinInfoSwap.depositMin)) {
      showAlertDialogNew(true);
      setAlertTxt(alertMessages.minimumSwapAmount + roundToDecimal(coinInfoSwap.depositMin));
      return;
    }
    if (parseFloat(fromAmt) > parseFloat(coinInfoSwap.depositMax)) {
      showAlertDialogNew(true);
      setAlertTxt(alertMessages.maximumSwapAmount + roundToDecimal(coinInfoSwap.depositMax));
      return;
    }
    if (toAmt?.length == 0 || toAmt == 0) {
      showAlertDialogNew(true);
      setAlertTxt(alertMessages.cannotProceed);
      return;
    }

    const fromAmount =
      firstCoinSelected?.fiat_price_data?.value != undefined &&
      currencyFormat(
        firstCoinSelected?.fiat_price_data?.value * fromAmt,
        Constants.FIAT_DECIMALS
      );
    const receivedAmount =
      secondCoinSelected?.fiat_price_data?.value != undefined &&
      currencyFormat(
        secondCoinSelected?.fiat_price_data?.value * toAmt,
        Constants.FIAT_DECIMALS
      );
    const percVal = (parseFloat(receivedAmount) / parseFloat(fromAmount)) * 100;
    const diffVal = parseFloat(fromToAmtDiff) > 0 ? fromToAmtDiff : 0;
    if (
      parseFloat(percVal || 0) < parseFloat(diffVal) &&
      (!!hideModal ? false : priceImpactState)
    ) {
      setPairModalAlert(true);
      setLoading(false);
      return;
    }
    const data = {
      firstCoin: firstCoinSelected,
      depositAmt: fromAmt,
      receiveAmt: toAmt,
      userGets: toAmt,
      depositCoin: firstCoinSelected.coin_symbol,
      receiveCoin: secondCoinSelected.coin_symbol,
      refundAddress: getAddress(firstCoinSelected.coin_family),
      destinationAddr: getAddressSecond(
        secondCoinSelected.coin_family
      ),
    };
    console.log("data===> ", data);
    setLoading(true);
    createSwapOrder(data);
  };

  const createSwapOrder = async (data) => {
    try {
      const apiData = {
        from: firstCoinSelected?.coins_changelly_rel?.ticker,
        to: secondCoinSelected?.coins_changelly_rel?.ticker,
        amountFrom: fromAmt,
        fromAddress: data?.refundAddress,
        toAddress: data?.destinationAddr,
      };
      console.log("createSwapOrder apiData --------", apiData);
      const transactionRes = await createChangellyTransaction(apiData);
      console.log("createSwapOrder transactionRes --------", transactionRes);
      const result = transactionRes?.data?.result;
      if (!result) {
        setLoading(false);
        // show error
        return;
      }

      const payload = {
        order_id: result?.id,
        to: result?.payinAddress,
        amount: "0.000001",//result?.amountExpectedFrom,
        gas_price: result?.networkFee,
        swap_fee: result?.order_id,
      };

      const walletData = {
        ...firstItemWallet,
        ...firstCoinSelected,
      };
      console.log("walletData -----", walletData);

      setCrossSwapData(data);
      setSendCoinPayload(payload);

      if (walletData.coin_family == 2) {
        setTimeout(() => {
          walletData.coin_symbol.toLowerCase() != "eth"
            ? getGasLimit(walletData)
            : getTotalFee();
        }, 200);
      }
      /******************************************************************************************/
      if (walletData.coin_family == 1) {
        setTimeout(() => {
          generateFeesAndNonceBnb(walletData);
        }, 200);
      }
      /******************************************************************************************/
      if (walletData.coin_family == 3) {
        setTimeout(() => {
          getbtcFeesAndUnspentTransaction(walletData);
        }, 200);
      }
      /******************************************************************************************/
      if (walletData.coin_family == 6) {
        setTimeout(() => {
          setShowPinModal(true)
        }, 200);
      }
    } catch (error) {
      setLoading(false);
      console.log("createSwapOrder error =======", error);
      onError(error?.data?.error || error)
    }
  };

  ///*****************************ETH GAS ESTIMATION AND PRICE*************************************////
  const getGasLimit = (walletData) => {
    let gasEstimationReq = {
      from: Singleton.getInstance().defaultEthAddress,
      to: Singleton.getInstance().defaultEthAddress,
      amount: "",
    };
    getDataFromStorage(Constants.ACCESS_TOKEN).then((token) => {
      dispatch(
        requestGasEstimation({
          url: `ethereum/${walletData.is_token == 0
            ? walletData.coin_symbol
            : walletData.token_address
            }/gas_estimation`,
          coinSymbol: walletData.coin_symbol,
          gasEstimationReq,
          token,
        })
      )
        .then((res1) => {
          console.log("chk gasEstimate res:::::", res1);
          getTotalFee(res1.gas_estimate);
        })
        .catch((e) => {
          setLoading(false);
          showAlertDialogNew(true);
          setAlertTxt(e);
        });
    });
  };

  /******************************************************************************************/
  const getTotalFee = (gasLimit = 23000) => {
    setLoading(true);
    setTimeout(async () => {
      const Totalfee = await getTotalGasFee();
      const value = exponentialToDecimal(
        Totalfee * gasFeeMultiplier * gasLimit
      );
      console.log(" value:::::", value);
      const fee =
        Constants.network == "testnet"
          ? parseFloat(value).toFixed(8)
          : parseFloat(value).toFixed(8);
      setGasEstimate(gasLimit);
      setGasPrice(Totalfee);
      setTotalFee(fee);
      console.log("curr scene:::::", Actions.currentScene);
      (Actions.currentScene == "_Swap" || Actions.currentScene == "Swap") &&
        showConfirmTxnModal(true);
      setLoading(false);
    }, 100);
  };

  /************************************** Get ETH Fee *****************************************/
  const getTotalGasFee = async () => {
    const totalgasPrice = await web3Eth.eth.getGasPrice();
    console.log("chk totalgasPrice::::::", totalgasPrice);
    return totalgasPrice;
  };

  ///*****************************BNB GAS ESTIMATION AND PRICE*************************************////
  const generateFeesAndNonceBnb = (walletData) => {
    let gasEstimationReq = {
      from: Singleton.getInstance().defaultBnbAddress,
      to: Singleton.getInstance().defaultBnbAddress,
      amount: "",
    };
    let nonceReq = { amount: "" };
    getDataFromStorage(Constants.ACCESS_TOKEN).then((token) => {
      dispatch(
        requestGasEstimation({
          url: `binancesmartchain/${walletData.is_token == 0
            ? walletData.coin_symbol
            : walletData.token_address
            }/gas_estimation`,
          coinSymbol: walletData.coin_symbol,
          gasEstimationReq,
          token,
        })
      )
        .then((res1) => {
          console.log("chk gasEstimate res:::::", res1);
          if (res1.status) {
            const mediumGasPrice =
              Constants.network == "testnet"
                ? 10 * 10 ** 9
                : parseFloat(res1.resultList.propose_gas_price) * 10 ** 9;
            const feeIs = toFixedExp(
              mediumGasPrice * res1.gas_estimate * gasFeeMultiplier,
              8
            );
            //  ---------------------------------------------- nonce APi -------------------------------------------------------
            dispatch(
              requestNonce({
                url: `binancesmartchain/${walletData.is_token == 0
                  ? walletData.coin_symbol
                  : walletData.token_address
                  }/nonce`,
                coinSymbol: walletData.coin_symbol,
                nonceReq,
                token,
              })
            )
              .then((res2) => {
                setGasEstimate(res1.gas_estimate);
                setTotalFee(feeIs);
                setGasPrice(mediumGasPrice);
                setNonce(res2.data.nonce);
                (Actions.currentScene == "_Swap" ||
                  Actions.currentScene == "Swap") &&
                  showConfirmTxnModal(true);
                setLoading(false);
              })
              .catch((e) => {
                setLoading(false);
                showAlertDialogNew(true);
                setAlertTxt(e);
              });
          } else {
            setLoading(false);
            showAlertDialogNew(true);
            setAlertTxt(res1.message);
            return;
          }
        })
        .catch((e) => {
          setLoading(false);
          showAlertDialogNew(true);
          setAlertTxt(e);
        });
    });
  };

  //*****************************BITCOIN GAS ESTIMATION AND PRICE*************************************//
  const getbtcFeesAndUnspentTransaction = (walletData) => {
    inputCount = 0;
    inputs = [];
    /******************************get btc fees****************************** */
    dispatch(requestBTCgasprice())
      .then((gasRes) => {
        console.log("chk btc gas price res::::", gasRes);
        if (gasRes.regular) {
          setSliderValue(gasRes.priority);
        } else {
          setSliderValue(50);
        }
        /******************************get unspent transaction****************************** */
        getDataFromStorage(Constants.ACCESS_TOKEN).then((token) => {
          dispatch(
            requestUnspent(
              Singleton.getInstance().defaultBtcAddress,
              token,
              walletData.coin_symbol
            )
          )
            .then((res) => {
              console.log("-----res");
              totalAmountAvailable = 0;
              res.data.forEach(async (element) => {
                let utxo = {};
                utxo.satoshis = Math.floor(Number(element.satoshis));
                utxo.script = element.scriptPubKey;
                utxo.address = element.address;
                utxo.txId = element.txid;
                utxo.outputIndex = element.vout;
                totalAmountAvailable += utxo.satoshis;
                inputCount += 1;
                inputs.push(utxo);
              });
              console.log("------input", JSON.stringify(inputs));
              console.log("------inputCount", inputCount);
              console.log("------outputCount", outputCount);
              transactionSize =
                inputCount * 146 + outputCount * 34 + 10 - inputCount;

              setTotalFee(
                transactionSize * gasRes.priority * btcTosatoshiMultiplier
              );
              setTxnSize(transactionSize);
              setTotalAvlAmnt(totalAmountAvailable);
              setInput(inputs);
              (Actions.currentScene == "_Swap" ||
                Actions.currentScene == "Swap") &&
                showConfirmTxnModal(true);
              setLoading(false);
            })
            .catch((e) => {
              console.log("-----e btc", e);
              setLoading(false);
            });
        });
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  //*****************************getTronFee*************************************//
  const getTronFee = async (data) => {
    const { raw, platformAddress } = data;
    const gasEstimationReq = { tx_raw: raw?.txID, to_address: platformAddress };
    // const itemWallet = {
    //   ...firstItemWallet,
    //   ...firstCoinSelected,
    // };
    const { is_token, token_address, coin_symbol } = itemWallet;
    setLoading(true);
    setTimeout(async () => {
      getDataFromStorage(Constants.ACCESS_TOKEN).then((token) => {
        dispatch(
          requestGasEstimation({
            url: `tron/${is_token == 0 ? coin_symbol?.toLowerCase() : token_address
              }/gas_estimation`,
            gasEstimationReq,
            token,
          })
        )
          .then((res) => {
            console.log("chk gasEstimate res:::::", res);
            setTotalFee(res?.data?.total);
            (Actions.currentScene == "_Swap" ||
              Actions.currentScene == "Swap") &&
              showConfirmTxnModal(true);
            setLoading(false);
            setTxnRaw(raw);
          })
          .catch((e) => {
            setLoading(false);
            showAlertDialogNew(true);
            setAlertTxt(e);
          });
      });
    }, 100);
  };

  /**************************************************** generate Tron Raw ****************************************************/
  const SendTron = (address, pin) => {
    setLoading(true);
    setTimeout(async () => {
      try {

        let multiWallet = await getData(Constants.MULTI_WALLET_LIST)
        console.log("multiWallet>>>", multiWallet);

        let multiWalletData = JSON.parse(multiWallet)
        let currentWallet = multiWalletData.filter(el => el?.defaultWallet == true)[0]
        console.log("currentWallet>>>", currentWallet);

        if (!currentWallet?.login_data?.isTangem) {
          const privateKey = await getEncryptedData(`${Singleton.getInstance().defaultTrxAddress}_pk`, pin);
          createTrxRaw(
            Singleton.getInstance().defaultTrxAddress,
            address,
            exponentialToDecimal(fromAmt),
            privateKey
          )
            .then((trxSignedRaw) => {
              setTxnRaw(trxSignedRaw);
              getTronFee({ raw: trxSignedRaw, platformAddress: address });
            })
            .catch((err) => {
              console.log("chk signed raw err::::::::::::trx", err);
              setLoading(false);
            });
        } else {
          console.log("IS_TANGEM>>>>>>>", Singleton.getInstance().defaultTrxAddress, address, exponentialToDecimal(fromAmt));

          createTrxTangemRaw(
            Singleton.getInstance().defaultTrxAddress,
            address,
            exponentialToDecimal(fromAmt),
          )
            .then((trxSignedRaw) => {
              setTxnRaw(trxSignedRaw);
              getTronFee({ raw: trxSignedRaw, platformAddress: address });
            })
            .catch((err) => {
              console.log("chk signed raw err::::::::::::", err);
              setLoading(false);
            });
        }

      } catch (error) {
        console.log("chk signed raw error::::::::::::", error);
        setLoading(false);
      }
    }, 200);
  };

  /**************************************************** generate Trx Token Raw ****************************************************/
  const SendTRC20 = (address, pin) => {
    setLoading(true);
    setTimeout(async () => {
      // const itemWallet = {
      //   ...firstItemWallet,
      //   ...firstCoinSelected,
      // };
      const { decimals, token_address } = itemWallet;


      let multiWallet = await getData(Constants.MULTI_WALLET_LIST)
      let multiWalletData = JSON.parse(multiWallet)
      let currentWallet = multiWalletData.filter(el => el?.defaultWallet == true)[0]
      if (!currentWallet?.login_data?.isTangem) {
        const privateKey = await getEncryptedData(`${Singleton.getInstance().defaultTrxAddress}_pk`, pin);
        createTrxTokenRaw(
          Singleton.getInstance().defaultTrxAddress,
          address,
          exponentialToDecimal(fromAmt * decimals),
          token_address,
          privateKey,
          feeLimit
        )
          .then((tokenRaw) => {
            setTxnRaw(tokenRaw);
            getTronFee({ raw: tokenRaw, platformAddress: address });
          })
          .catch((err) => {
            console.log("chk signed raw err::::::::::::trx20", err);
            setLoading(false);
          });
      } else {
        createTrxTokenTangemRaw(
          Singleton.getInstance().defaultTrxAddress,
          address,
          exponentialToDecimal(fromAmt * decimals),
          token_address,
          feeLimit
        )
          .then((tokenRaw) => {
            setTxnRaw(tokenRaw);
            getTronFee({ raw: tokenRaw, platformAddress: address });
          })
          .catch((err) => {
            console.log("chk signed raw err::::::::::::", err);
            setLoading(false)
          });
      }
    }, 200);
  };

  /**************************************************** sendSerializedTxnTron ****************************************************/
  const sendSerializedTxnTron = (tx_raw) => {
    setLoading(true);
    const { is_token, token_address, coin_symbol, coin_id } = itemWallet;
    setTimeout(() => {
      const sendCoinReq = {
        nonce: 0,
        tx_raw: tx_raw,
        from: Singleton.getInstance().defaultTrxAddress,
        to: platformAddress,
        amount: fromAmt,
        gas_estimate: "",
        gas_price: "",
        tx_type: "cross_chain",
        coin_id: coin_id,
        order_id: sendCoinPayload?.order_id, // additional params
        swap_fee: sendCoinPayload?.swap_fee, // additional params
      };
      console.log("sendCoinReq::::", sendCoinReq);
      dispatch(
        requestSendCoin({
          url: `tron/${is_token == 0 ? coin_symbol?.toLowerCase() : token_address
            }/send`,
          coinSymbol: coin_symbol,
          sendCoinReq,
        })
      )
        .then((res) => {
          Actions.pop();
          console.log('TransactionHistory =====> ', JSON.stringify({ selectedCoin: itemWallet }))
          Actions.currentScene != "TransactionHistory" &&
            Actions.TransactionHistory({
              selectedCoin: {
                ...itemWallet,
                currentPriceInMarket: itemWallet?.fiat_price_data?.value,
                price_change_percentage_24h: itemWallet?.fiat_price_data?.price_change_percentage_24h,
              },
            });
          setLoading(false);
        })
        .catch((e) => {
          setTxnRaw("")
          setLoading(false);
          showAlertDialogNew(true);
          setAlertTxt(e);
        });
    }, 100);
  };

  /******************************BTC send api call****************************** */
  const sendSerializedTxnBTC = (
    nonce,
    tx_raw,
    myAddress,
    toAddress,
    amount,
    gasEstimate,
    gas_gwei_price,
    coin_symbol,
    userToken
  ) => {
    const sendCoinReq = {
      nonce: nonce,
      tx_raw: `${tx_raw}`,
      from: myAddress,
      to: toAddress,
      amount: amount,
      gas_estimate: gasEstimate,
      eth_gas_price: gas_gwei_price,
      tx_type: "cross_chain",
      order_id: sendCoinPayload?.order_id, // additional params
      swap_fee: sendCoinPayload?.swap_fee, // additional params
    };
    console.log("sendCoinReq:::::>>>>>", sendCoinReq);
    dispatch(
      requestSendCoin({
        url: `bitcoin/${coin_symbol}/send`,
        coinSymbol: coin_symbol,
        sendCoinReq,
        token: userToken,
      })
    )
      .then((res) => {
        setLoading(false);
        Actions.pop();
        console.log('TransactionHistory 2222=====> ', JSON.stringify({ selectedCoin: itemWallet }))
        Actions.TransactionHistory({
          selectedCoin: {
            ...itemWallet,
            currentPriceInMarket: itemWallet?.fiat_price_data?.value,
            price_change_percentage_24h: itemWallet?.fiat_price_data?.price_change_percentage_24h,
          },
        });
      })
      .catch((e) => {
        setLoading(false);
        showAlertDialogNew(true);
        setAlertTxt(e || alertMessages.failedtoInitiateTransaction);
      });
  };

  /******************************BTC RAW GENERATION****************************** */
  const sendBtc = async (pin) => {
    let privateKey = ""
    try {
      privateKey = await getEncryptedData(`${Singleton.getInstance().defaultBtcAddress}_pk`, pin);
    } catch (error) {
      console.log("ERROR>>", error);
    }
    let fee = txnSize * SliderValue;
    console.log("----fee", fee);
    console.log(txnSize, "----transactionSize", transactionSize);
    console.log("----SliderValue", SliderValue);
    console.log(totalAvlAmnt, "----totalAmountAvailable", totalAmountAvailable);
    console.log("----eee", Math.round(fromAmt * btcTosatoshi));
    if (totalAvlAmnt - Math.round(fromAmt * btcTosatoshi) - fee < 0) {
      setLoading(false);
      showAlertDialogNew(true);
      setAlertTxt(alertMessages.balancetooLowforThisTransaction);
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      let serializedTransaction;
      try {
        let multiWallet = await getData(Constants.MULTI_WALLET_LIST)
        let multiWalletData = JSON.parse(multiWallet)
        let currentWallet = multiWalletData.filter(el => el?.defaultWallet == true)[0]
        if (!currentWallet?.login_data?.isTangem) {
          const transaction = new bitcore.Transaction();
          transaction.from(input);
          transaction.to(platformAddress, Math.round(fromAmt * btcTosatoshi));
          transaction.change(Singleton.getInstance().defaultBtcAddress);
          transaction.fee(fee);
          transaction.sign(privateKey);
          serializedTransaction = transaction.serialize();
        } else {
          const amountTemp = Math.round(parseFloat(fromAmt) * btcTosatoshi)
          console.log('--------------currentWallet', currentWallet,
            "inputs>>>>", inputs,
            "inputs>>>>", fee,
            "amountTemp>>>>", amountTemp,
            "platformAddress>>>>>>", platformAddress,
            "defaultBtcAddress>>>>", Singleton.getInstance().defaultBtcAddress)
          serializedTransaction = await sendBtcTangem(currentWallet, inputs, fee, amountTemp, platformAddress, Singleton.getInstance().defaultBtcAddress)

        }
      } catch (e) {
        console.log(e);
        setLoading(false);
        showAlertDialogNew(true);
        setAlertTxt(alertMessages.failedtoInitiateTransaction);
        return;
      }
      getDataFromStorage(Constants.ACCESS_TOKEN)
        .then((token) => {
          sendSerializedTxnBTC(
            0,
            serializedTransaction,
            Singleton.getInstance().defaultBtcAddress,
            platformAddress,
            fromAmt,
            gasEstimate,
            gasPrice,
            itemWallet.coin_symbol,
            token
          );
        })
        .catch((err) => {
          setLoading(false);
          showAlertDialogNew(true);
          setAlertTxt(alertMessages.failedtoInitiateTransaction);
        });
    }, 200);
  };

  /**************************************************** send  BNB APi  ****************************************************/
  const sendSerializedTxnBNB = (tx_raw) => {
    let sendCoinReq = {
      nonce: nonce,
      tx_raw: tx_raw,
      from: Singleton.getInstance().defaultBnbAddress,
      to: platformAddress,
      amount: fromAmt,
      gas_estimate: gasEstimate,
      gas_price: gasPrice,
      tx_type: "cross_chain",
      order_id: sendCoinPayload?.order_id, // additional params
      swap_fee: sendCoinPayload?.swap_fee, // additional params
    };
    console.log("sendCoinReq::::", sendCoinReq);
    dispatch(
      requestSendCoin({
        url: `binancesmartchain/${itemWallet.is_token == 0
          ? itemWallet.coin_symbol
          : itemWallet.token_address
          }/send`,
        coinSymbol: itemWallet.coin_symbol,
        sendCoinReq,
      })
    )
      .then((res) => {
        setLoading(false);
        Actions.pop();
        console.log('TransactionHistory 3333=====> ', JSON.stringify({ selectedCoin: itemWallet }))
        Actions.currentScene != "TransactionHistory" &&
          Actions.TransactionHistory({
            selectedCoin: {
              ...itemWallet,
              currentPriceInMarket: itemWallet?.fiat_price_data?.value,
              price_change_percentage_24h: itemWallet?.fiat_price_data?.price_change_percentage_24h,
            }
          });
      })
      .catch((e) => {
        setLoading(false);
        showAlertDialogNew(true);
        setAlertTxt(e);
      });
  };

  /********************************************** generate Bnb Raw ****************************************************/
  const SendBnb = (pin) => {
    setLoading(true);
    setTimeout(async () => {
      let privateKey = ""
      try {
        privateKey = await getEncryptedData(`${Singleton.getInstance().defaultBnbAddress}_pk`, pin);
      } catch (error) {
        console.log("ERROR>>", error);
      }

      const chainId = Constants.network == "testnet" ? 97 : 56;
      getBnbRaw(
        fromAmt,
        platformAddress,
        nonce,
        gasPrice,
        gasEstimate,
        chainId,
        privateKey
      )
        .then((txn_raw) => {
          sendSerializedTxnBNB(txn_raw);
        })
        .catch((err) => {
          setLoading(false);
          showAlertDialogNew(true);
          setAlertTxt(err);
        });
    }, 200);
  };

  /********************************************** generate Bnb Token Raw  ****************************************************/
  const SendBep20 = (pin) => {
    setLoading(true);
    setTimeout(async () => {
      let privateKey = ""
      try {
        privateKey = await getEncryptedData(`${Singleton.getInstance().defaultBnbAddress}_pk`, pin);
      } catch (error) {
        console.log("ERROR>>", error);
      }
      const chainID = Constants.network == "testnet" ? 97 : 56;
      const BigNumber = require("bignumber.js")
      let a = new BigNumber(fromAmt);
      let b = new BigNumber(itemWallet.decimals);
      const amountToSend = a.multipliedBy(b).toString();
      bnbDataEncode(itemWallet.token_address, platformAddress, amountToSend)
        .then((encodedData) => {
          console.log("chk bep encoded Data::::::", encodedData);
          sendTokenBNB(
            itemWallet.token_address,
            encodedData,
            nonce,
            gasPrice,
            gasEstimate,
            chainID,
            privateKey
          )
            .then((signedRaw) => {
              console.log("chk bep signedRaw::::::", signedRaw);
              sendSerializedTxnBNB(signedRaw);
            })
            .catch((err) => {
              setLoading(false);
              showAlertDialogNew(true);
              setAlertTxt(err.message);
            });
        })
        .catch((err) => {
          setLoading(false);
          showAlertDialogNew(true);
          setAlertTxt(err.message);
        });
    }, 200);
  };

  /******************************************** Send ETH **********************************************/
  const sendSerializedTxn = (tx_raw, nonce) => {
    let sendCoinReq = {
      nonce: nonce,
      tx_raw: tx_raw,
      from: Singleton.getInstance().defaultEthAddress,
      to: platformAddress,
      amount: fromAmt,
      gas_estimate: gasEstimate,
      gas_price: gasPrice,
      tx_type: "cross_chain",
      order_id: sendCoinPayload?.order_id, // additional params
      swap_fee: sendCoinPayload?.swap_fee, // additional params
    };
    console.log("sendCoinReq::::", sendCoinReq);
    dispatch(
      requestSendCoin({
        url: `ethereum/${itemWallet.is_token == 0
          ? itemWallet.coin_symbol
          : itemWallet.token_address
          }/send`,
        coinSymbol: itemWallet.coin_symbol,
        sendCoinReq,
      })
    )
      .then((res) => {
        setLoading(false);
        Actions.pop();
        console.log('TransactionHistory 44444=====> ', JSON.stringify({ selectedCoin: itemWallet }))
        Actions.currentScene != "TransactionHistory" &&
          Actions.TransactionHistory({
            selectedCoin: {
              ...itemWallet,
              currentPriceInMarket: itemWallet?.fiat_price_data?.value,
              price_change_percentage_24h: itemWallet?.fiat_price_data?.price_change_percentage_24h,
            },
          });
      })
      .catch((e) => {
        setLoading(false);
        showAlertDialogNew(true);
        setAlertTxt(e);
      });
  };

  /************************************** create RAW for eth family *****************************************/
  const SendEth = (pin) => {
    setLoading(true);
    setTimeout(async () => {
      let privateKey = ""
      try {
        privateKey = await getEncryptedData(`${Singleton.getInstance().defaultEthAddress}_pk`, pin);
      } catch (error) {
        console.log("ERROR>>", error);
      }
      createEthRaw(
        Singleton.getInstance().defaultEthAddress,
        platformAddress,
        privateKey,
        fromAmt,
        true
      )
        .then((ethSignedRaw) => {
          console.log("ethSignedRaw:::::: ", ethSignedRaw);
          sendSerializedTxn(ethSignedRaw.txn_hash, ethSignedRaw.nonce);
        })
        .catch((err) => {
          console.log("chk signed raw err::::::::::::", err);
          setLoading(false);
        });
    }, 200);
  };

  /****************************************** generate Eth Token Raw ************************************************************/
  const SendERC20 = (pin) => {
    setLoading(true);
    setTimeout(async () => {
      let privateKey = ""
      try {
        privateKey = await getEncryptedData(`${Singleton.getInstance().defaultEthAddress}_pk`, pin);
      } catch (error) {
        console.log("ERROR>>", error);
      }
      console.log(
        fromAmt,
        "chk coinwalletData.decimals::::::",
        itemWallet.decimals
      );
      const BigNumber = require("bignumber.js");
      let a = new BigNumber(fromAmt);
      let b = new BigNumber(itemWallet.decimals);
      const amountToSend = a.multipliedBy(b).toString();
      EthDataEncode(itemWallet.token_address, platformAddress, amountToSend)
        .then((encodedData) => {
          console.log("chk encodedData::::", encodedData);
          CreateEthTokenRaw(
            Singleton.getInstance().defaultEthAddress,
            itemWallet.token_address,
            privateKey,
            gasEstimate,
            encodedData
          )
            .then((tokenRaw) => {
              sendSerializedTxn(tokenRaw.txn_hash, tokenRaw.nonce);
            })
            .catch((err) => {
              console.log("chk signed raw err::::::::::::", err);
              setLoading(false);
            });
        })
        .catch((err) => {
          setLoading(false);
        });
    }, 200);
  };

  const onSwapConfirmed = (pin) => {
    // const itemWallet = {
    //   ...firstItemWallet,
    //   ...firstCoinSelected,
    // };
    console.log('onSwapConfirmed =====',
      JSON.stringify(itemWallet),
      platformAddress,
      fromAmt,
      toAmt,
      sendCoinPayload ? JSON.stringify(sendCoinPayload) : sendCoinPayload
    )
    showConfirmTxnModal(false);
    // if (
    //   itemWallet.is_token == 0 &&
    //   parseFloat(fromAmt) + parseFloat(totalFee) >
    //   parseFloat(itemWallet.balance)
    // ) {
    //   console.log("check here::::::::");
    //   showAlertDialogNew(true);
    //   setAlertTxt(alertMessages.insufficientBalance);
    //   return;
    // }
    if (itemWallet.coin_family == 2 && itemWallet.is_token == 0) {
      console.log("------------call ETH-------------");
      SendEth(pin);
    }
    if (itemWallet.coin_family == 2 && itemWallet.is_token == 1) {
      console.log("------------call ETH token-------------");
      SendERC20(pin);
    }
    if (itemWallet.coin_family == 1 && itemWallet.is_token == 0) {
      console.log("------------call BNB-------------");
      SendBnb(pin);
    }
    if (itemWallet.coin_family == 1 && itemWallet.is_token == 1) {
      console.log("------------call BNB token-------------");
      SendBep20(pin);
    }
    if (itemWallet.coin_family == 3) {
      console.log("------------call BTC-------------");
      sendBtc(pin);
    }
    if (itemWallet.coin_family == 6) {
      console.log("------------call TRON-------------");
      sendSerializedTxnTron(txnRaw, pin);
    }
  };

  if (!isVisible) {
    return <View />;
  }

  // console.log("crosschain.js states coinInfoSwap----", coinInfoSwap);
  /******************************************************************************************/
  return (
    <View style={[styles.ViewStyle1]}>
      <ScrollView
        ref={scrollRef}
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ paddingVertical: 15, paddingHorizontal: 5 }}>
          <SelectCurrencyNew
            showRange={true}
            maxLength={15}
            item={firstCoinSelected}
            tokenOneAmount={fromAmt}
            themeSelected={themeSelected}
            currency={
              firstCoinSelected
                ? firstCoinSelected?.coin_symbol?.toUpperCase()
                : ""
            }
            label=""
            placeholder="0.0000"
            custStyle={{ textAlign: "right" }}
            coinImage={firstCoinSelected?.coins_changelly_rel?.image} //{Constants.BSC_Img}
            balance={`${firstItemWallet?.balance
              ? toFixedExp(firstItemWallet?.balance, 6)
              : "0.00"
              } ${firstCoinSelected
                ? firstCoinSelected?.coin_symbol?.toUpperCase()
                : ""
              }`}
            min={
              coinInfoSwap ? roundToDecimal(coinInfoSwap?.depositMin) : "0.00"
            }
            max={
              coinInfoSwap ? roundToDecimal(coinInfoSwap?.depositMax) : "0.00"
            }
            onPressCoin={() => {
              openFirstCoinList();
            }}
            value={fromAmt}
            onChangeNumber={(value) => {
              const onlyNumberRegex = /^\d*\.?\d*$/;
              if (onlyNumberRegex.test(value)) {
                onChangeNo(value);
              }
            }}
          />

          <View style={{ marginTop: heightDimen(20) }}>
            <TouchableOpacity
              onPress={onPressToggle}
              style={[
              ]}
            >
              <Image
                source={ThemeManager.ImageIcons.toggle}
                style={{ alignSelf: "center" }}
              />
            </TouchableOpacity>
            <SelectCurrencyNew
              inputandselectStyle={{ marginTop: heightDimen(16) }}
              item={secondCoinSelected}
              tokenOneAmount={roundToDecimal(toAmt, 10)}
              styleImg={{ height: 28, width: 28 }}
              themeSelected={themeSelected}
              currency={
                secondCoinSelected
                  ? secondCoinSelected.coin_symbol?.toUpperCase()
                  : ""
              }
              coinImage={secondCoinSelected?.coinImageUrl}
              balance={`${seconditemWallet?.balance
                ? toFixedExp(seconditemWallet?.balance, 6)
                : "0.00"
                } ${secondCoinSelected
                  ? secondCoinSelected?.coin_symbol?.toUpperCase()
                  : ""
                }`}
              label={browser.to}
              placeholder="---"
              editable={false}
              onPressCoin={onSecondCoinPress}
              value={toAmt == "" ? toAmt : roundToDecimal(toAmt, 10).toString()}
            />


          </View>
          <View style={styles.sliderView}>
            {tabData.map((item, index) => (
              <TouchableOpacity
                key={index + ""}
                style={[styles.tabsView]}
                onPress={onPressSlider(item, index)}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={
                    selectedIndex == index ? ["#73C9E2", "#6C8DC5", "#6456B2", "#6145EA"] : [ThemeManager.colors.mnemonicsBg, ThemeManager.colors.mnemonicsBg]
                  }

                  style={styles.tabsView}
                >

                  <Text
                    allowFontScaling={false}
                    style={{
                      color:
                        selectedIndex == index
                          ? ThemeManager.colors.Mainbg
                          : ThemeManager.colors.TextColor,
                      fontSize: 16,
                      fontFamily: Fonts.dmMedium,
                    }}
                  >
                    {item.title}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          {isRelayerFeeGreater && (
            <Text
              allowFontScaling={false}
              style={[
                styles.textStyle1,
                { color: Colors.lossColor, width: "100%" },
              ]}
            >
              {swapText.convertedAmountIsLesserThanRelayerFee}
            </Text>
          )}
        </View>

        {coinInfoSwap && coinInfoSwap?.instantRate && (
          <View
            style={[styles.ViewStyle2, { backgroundColor: ThemeManager.colors.mnemonicsBg }]}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.textStyle,
                {
                  color: ThemeManager.colors.greenWhite,
                  borderBottomColor: ThemeManager.colors.underLineColor,
                },
              ]}
            >
              {detailTrx.transactionDetails}
            </Text>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.textStyle1,
                  { color: ThemeManager.colors.lightGrayTextColor },
                ]}
              >
                {swapText.estimatedRate}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  styles.textStyle1,
                  {
                    width: "60%",
                    textAlign: "right",
                    color: ThemeManager.colors.TextColor,
                  },
                ]}
              >
                1 {firstCoinSelected?.coin_symbol?.toUpperCase()} ≈{" "}
                {toFixedExp(coinInfoSwap?.instantRate, 6)}{" "}
                {secondCoinSelected?.coin_symbol?.toUpperCase()}
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    {
                      fontSize: 14,
                      fontFamily: Fonts.dmRegular,
                      color: ThemeManager.colors.lightGrayTextColor,
                    },
                  ]}
                >
                  {swapText.serviceFee}
                </Text>
                {showtooltip ? (
                  <Tooltip
                    ref={tooltipRef}
                    overlayColor={"#00000077"}
                    backgroundColor={ThemeManager.colors.contactBg}
                    width={250}
                    height={65}
                    popover={
                      <Text
                        allowFontScaling={false}
                        style={{
                          fontSize: 14,
                          fontFamily: Fonts.dmRegular,
                          color: ThemeManager.colors.lightText,
                        }}
                      >
                        {swapText.swapFeeTokenTransferFee}
                      </Text>
                    }
                  >
                    <View style={{ padding: 8 }}>
                      <Image
                        style={{
                          resizeMode: "contain",
                          height: 12,
                          width: 12,
                          tintColor: ThemeManager.colors.colorVariationBorder,
                        }}
                        source={Images.info}
                      />
                    </View>
                  </Tooltip>
                ) : (
                  <View style={{ padding: 8 }}>
                    <Image
                      style={{
                        resizeMode: "contain",
                        height: 12,
                        width: 12,
                        tintColor: ThemeManager.colors.colorVariationBorder,
                      }}
                      source={Images.info}
                    />
                  </View>
                )}
              </View>

              <Text
                allowFontScaling={false}
                style={[
                  styles.textStyle1,
                  {
                    width: "55%",
                    textAlign: "right",
                    color: ThemeManager.colors.TextColor,
                  },
                ]}
              >
                {serviceFee} %
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.textStyle1,
                  {
                    width: "40%",
                    color: ThemeManager.colors.lightGrayTextColor,
                  },
                ]}
              >
                {swapText.relayerServiceFee}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  styles.textStyle1,
                  {
                    width: "55%",
                    textAlign: "right",
                    color: ThemeManager.colors.TextColor,
                  },
                ]}
              >
                {toFixedExp(coinInfoSwap?.receiveCoinFee, 6)}{" "}
                {secondCoinSelected?.coin_symbol?.toUpperCase()}
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                allowFontScaling={false}
                style={[
                  styles.textStyle1,
                  { color: ThemeManager.colors.lightGrayTextColor },
                ]}
              >
                {swapText.youWillReceive}
              </Text>
              <Text
                allowFontScaling={false}
                style={[
                  styles.textStyle1,
                  {
                    width: "60%",
                    textAlign: "right",
                    color: ThemeManager.colors.TextColor,
                  },
                ]}
              >
                {toAmt ? toAmt : "0"}{" "}
                {secondCoinSelected?.coin_symbol?.toUpperCase()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.ViewStyle}>
        <Button
          // disabled={
          //   buttonTxt.toLowerCase() == alertMessages.insufficientBalance
          //     ? true
          //     : false
          // }
          buttontext={buttonTxt}
          themeSelected={themeSelected}
          onPress={onSwapClicked}
        />
      </View>

      {/* ***********************FIRST MODAL FOR SELECTION OF COIN******************************* */}
      <ChangellyCoinList
        noStyle={{ marginTop: Dimensions.get("screen").height / 3.5 }}
        fromSearch={true}
        fromCrossChain={true}
        title={swapText.chain}
        showSearch={true}
        openModel={firstModal}
        handleBack={() => {
          setFirstModal(false);
          onSearch("");
          setSelectedBlockchain(null);
          setSelectedListIndex(0);
        }}
        list={
          search.length == 0 && selectedListIndex == 0
            ? firstCoinList
            : firstCoinFilteredList
        }
        onPress={onFirstListItemSelected}
        pressClear={() => onSearch("")}
        onChangeNumber={(text) => onSearch(text?.trimStart())}
        onSubmitEditing={(text) => onSearch(text?.trimStart())}
        search={search}
      >
        <View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={{ marginHorizontal: 15 }}
          >
            {listData.map((item, index) => (
              <>
                <TouchableOpacity
                  key={index + ""}
                  style={[
                    styles.tabsViewNew,
                    {
                      // height: 50,
                      marginRight: 18,
                    },
                  ]}
                  onPress={filterFirstList(item, index)}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={
                      selectedListIndex == index ? ["#73C9E2", "#6C8DC5", "#6456B2", "#6145EA"] : [ThemeManager.colors.mnemonicsBg, ThemeManager.colors.mnemonicsBg]
                    }
                    style={styles.tabViewNew1}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        color:
                          selectedListIndex == index
                            ? ThemeManager.colors.Mainbg
                            : ThemeManager.colors.lightGrayTextColor,
                        fontSize: 16,
                        fontFamily: Fonts.dmMedium,
                      }}
                    >
                      {item.title}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ))}
          </ScrollView>
        </View>
      </ChangellyCoinList>


      {/* ***********************SECOND MODAL FOR SELECTION OF TOKEN******************************* */}
      <ChangellyCoinList
        noStyle={{ marginTop: Dimensions.get("screen").height / 3.5 }}
        title={swapText.chain}
        fromCrossChain={true}
        fromSearch={true}
        showSearch={true}
        openModel={secondModal}
        handleBack={() => {
          setSecondModal(false);
          onSearchSecond("");
          setSelectedBlockchain(null);
          setSelectedListIndex(0);
        }}
        list={
          search.length == 0 && selectedListIndex == 0
            ? secondCoinList
            : secondCoinFilteredList
        }
        onPress={onSecondListItemSelected}
        pressClear={() => onSearchSecond("")}
        onChangeNumber={(text) => onSearchSecond(text?.trimStart())}
        onSubmitEditing={(text) => onSearchSecond(text?.trimStart())}
        search={search}
      >
        <View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={{ marginTop: 20, marginHorizontal: 15 }}
          >
            {listData.map((item, index) => (
              <>
                <TouchableOpacity
                  key={index + ""}
                  style={[
                    styles.tabsViewNew,
                    {
                      // height: 50,
                      marginRight: 8,
                    },
                  ]}
                  onPress={filterSecondList(item, index)}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={selectedListIndex == index ? ["#73C9E2", "#6C8DC5", "#6456B2", "#6145EA"] : [ThemeManager.colors.mnemonicsBg, ThemeManager.colors.mnemonicsBg]}
                    style={styles.tabViewNew1}
                  >
                    <Text
                      allowFontScaling={false}
                      style={{
                        color:
                          selectedListIndex == index
                            ? ThemeManager.colors.Mainbg
                            : ThemeManager.colors.lightGrayTextColor,
                        fontSize: 16,
                        fontFamily: Fonts.dmMedium,
                      }}
                    >
                      {item.title}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ))}
          </ScrollView>
        </View>
      </ChangellyCoinList>

      {ConfirmTxnModal && (
        <ConfirmSwapCrosschain
          AlertDialogNew={AlertDialogNew}
          alertTxt={alertTxt}
          hideAlertDialog={() => {
            showAlertDialogNew(false);
          }}
          isLoading={isLoading}
          from={firstCoinSelected}
          to={secondCoinSelected}
          itemWallet={itemWallet}
          seconditemWallet={{
            ...seconditemWallet,
            ...secondCoinSelected,
          }}
          sendAmount={fromAmt}
          getAmount={toAmt} // check number conversion if get any error
          swapData={crossSwapData}
          totalFee={totalFee ? toFixedExp(totalFee, 8) : 0.0}
          handleBack={() => {
            showConfirmTxnModal(false);
            setLoading(false);
          }}
          showConfirmTxnModal={ConfirmTxnModal}
          onPress={() => {
            showConfirmTxnModal(false);
            setTimeout(() => {
              setShowPinModal(true);
            }, 200);
          }}
          nativePrice={toFixedExp(
            parseFloat(totalFee ? toFixedExp(totalFee, 8) : 0.0) *
            parseFloat(
              firstCoinSelected?.native_coins_data?.fiat_price_data?.value
            ),
            2
          )}
        // onPress={onSwapConfirmed}
        />
      )}

      {AlertDialogNew && (
        <AppAlert
          alertTxt={alertTxt}
          hideAlertDialog={() => {
            showAlertDialogNew(false);
          }}
        />
      )}
      <LoaderView isSwap={true} isLoading={isLoading} />
      <PriceImpactModal
        visible={pairModalAlert}
        onPress={async () => {
          await setPriceImpactState(false);
          await setPairModalAlert(false);
          if (!isLoading) {
            onSwapClicked(true);
          }
        }}
        onRequestClose={() => {
          setPairModalAlert(false);
        }}
      />
      {/* --------------------------------Modal for Pin----------------------------------- */}
      <Modal
        statusBarTranslucent
        animationType="slide"
        transparent={true}
        visible={showPinModal}
        onRequestClose={() => {
          setShowPinModal(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <EnterPinForTransaction
            onBackClick={() => {
              setShowPinModal(false);
            }}
            closeEnterPin={async (pin) => {
              setShowPinModal(false);

              console.log(
                "dse>>>",
                firstCoinSelected?.coin_family == 6,
                txnRaw == ""
              );

              if (firstCoinSelected.coin_family == 6 && txnRaw == "") {
                firstCoinSelected?.is_token == 0
                  ? SendTron(platformAddress, pin)
                  : SendTRC20(platformAddress, pin);
              } else {
                onSwapConfirmed(pin);
              }
            }}
            checkBiometric={true}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  imgStyle1: {
    alignSelf: "center",
    height: 39,
    width: 39,
  },
  ViewStyle2: {
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginTop: 10,
  },
  cardBgImg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  textStyle: {
    fontSize: 16,
    fontFamily: Fonts.dmMedium,
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  textStyle1: {
    fontSize: 14,
    fontFamily: Fonts.dmRegular,
    marginTop: 10,
    width: "35%",
  },
  imgStyle: {
    height: 33,
    width: 33,
    borderRadius: 70,
    backgroundColor: "white",
  },
  absolute: {
    zIndex: 16,
    position: "absolute",
    elevation: 3,
    borderWidth: 2,
    borderRadius: 39,
    zIndex: 1,
    top: 130,
    alignSelf: "center",
  },
  ViewStyle1: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  ViewStyle: {
    justifyContent: "flex-end",
    marginTop: dimen(10),
    marginBottom: dimen(10),
  },
  btnStyle: {
    paddingHorizontal: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  tokenItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 6,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  centeredView2: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    minHeight: "10%",
  },
  tokenImage_stylee: {
    alignSelf: "center",
    width: 35,
    height: 35,
    marginRight: 15,
    borderRadius: 25,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  tokenAbr_stylee: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.whiteText,
  },
  tokenAbr_style: {
    fontFamily: Fonts.dmRegular,
    fontSize: 14,
    color: ThemeManager.colors.whiteText,
  },
  txtTitle: {
    fontSize: 14,
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.lightWhiteText,
    marginTop: 5,
    marginBottom: 10,
  },

  txtView: {
    fontSize: 12,
    fontFamily: Fonts.dmRegular,
    color: ThemeManager.colors.whiteText,
    alignSelf: "center",
    textAlign: "center",
  },
  sliderView: {
    marginTop: heightDimen(18),
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tabsView: {
    justifyContent: "space-between",
    borderWidth: 1,
    width: Dimensions.get("screen").width / 4.8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabsViewNew: {
    // justifyContent: "space-between",
    // paddingHorizontal: 35,
    paddingVertical: 10,
    width: 80,
    borderRadius: 14,
  },
  tabViewNew1: {
    borderRadius: 14,
    height: 40,
    alignItems: "center",
    justifyContent: "center",

  },
  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    padding: Platform.OS == "ios" ? 15 : 0,
    borderWidth: 1,
    borderColor: ThemeManager.colors.lightWhiteText,
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  np_active_wallet_text: {
    textAlign: "center",
    letterSpacing: 0,
    color: ThemeManager.colors.whiteText,
    fontSize: 12,
    fontFamily: Fonts.dmMedium,
  },
  ViewStyle4: {
    flex: 1,
    backgroundColor: ThemeManager.colors.lightBlack,
    marginBottom: 0,
  },
});
export default memo(CrossChain);
