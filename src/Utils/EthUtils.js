import { HDNode } from "ethers/lib/utils";
import { mnemonicToSeed } from "bip39";
import * as Constants from "../Constants";
import { exponentialToDecimal, getData, saveData } from "./MethodsUtils";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import Web3 from "web3";
import { Chain } from "@ethereumjs/common";
import Common from "@ethereumjs/common";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import idaAbi from "../idaAbi.json";
import { ethers } from "ethers";
import Singleton from "../Singleton";
import {
  addSignatureToTransaction,
  EVM_DERIVATION,
  Ethmarshal,
  signTransaction,
  unmarshalSignature,
} from "../TangemUtils";
const testnetUrlEth = Singleton.getInstance().ETH_RPC_URL; //Constants.network == 'testnet' ? Constants.ETH_TESTNET_URL : Constants.ETH_MAINNET_URL
const provider = new Web3.providers.HttpProvider(testnetUrlEth);
const web3Eth = new Web3(provider);

/************************************** Get Eth Balance *****************************************/
export const getEthBal = async (walletAddress) => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(Singleton.getInstance().ETH_RPC_URL)
  );
  const balance = await web3.eth.getBalance(walletAddress); //Will give value in wei.
  console.log("chk eth balance::::::", balance / 10 ** 18);
  return balance / 10 ** 18;
};

/************************************** Generate ETH Wallet ************************************/
export const generateEthWallet = async (mnemonics) => {
  const seed = await mnemonicToSeed(mnemonics);
  const hdNode = HDNode._fromSeed(seed);
  const wallet = hdNode.derivePath(`m/44'/60'/0'/0/0`);
  // console.log('chk eth address::::', wallet)
  return wallet;
};
/************************************** Generate ETH Wallet ************************************/
export const convertPrivateKeyToAddress = (privateKey) => {
  try {
    const privateKeyToAddress = require("ethereum-private-key-to-address");
    const address = privateKeyToAddress(privateKey);
    // console.log('eth address from pvt key::::', address);
    saveData(address + "_pk", privateKey);
    return { eth_address: address, privateKey: privateKey };
  } catch (e) {
    console.log("exception", e);
  }
};
//************************************** validate ETH Address ************************************/
export const validateEthAddress = (text) => {
  const reg = Constants.ETH_REGEX;
  if (reg.test(text) === false) {
    console.log("Eth Address is Not Correct");
    return false;
  } else {
    console.log("Eth Address is Correct");
    return true;
  }
};
/************************************** Get ETH Fee *****************************************/
export const getTotalGasFee = async () => {
  // const web3 = createAlchemyWeb3(testnetUrlEth);
  try {
    console.log(
      "Singleton.getInstance().ETH_RPC_URL:::::",
      Singleton.getInstance().ETH_RPC_URL
    );
    const web3Eth = new Web3(Singleton.getInstance().ETH_RPC_URL);
    const totalgasPrice = await web3Eth.eth.getGasPrice();
    console.log("chk totalgasPrice::::::", totalgasPrice);
    return totalgasPrice || 0;
  } catch (error) {
    console.log("chk errrr getTotalGasFee:::::", error);
  }
};
/************************************** Get ETH Fee *****************************************/
export const getNonce = async () => {
  try {
    const web3 = createAlchemyWeb3(Singleton.getInstance().ETH_RPC_URL);
    const nonce = await web3.eth.getTransactionCount(
      Singleton.getInstance().defaultEthAddress,
      "latest"
    );
    console.log("chk nonce::::::", nonce);
    return nonce;
  } catch (error) {
    console.log("chk nonce err::::::", error);
  }
};
/************************************** Generate erc20 data encode *****************************************/
export const EthDataEncode = async (tokenAdrs, toAdrs, amountSent) => {
  try {
    console.log("----------------------- tokenAdrs ", tokenAdrs);
    console.log("----------------------- toAdrs ", toAdrs);
    console.log("----------------------- amountSent ", amountSent.toString());
    const web3 = createAlchemyWeb3(Singleton.getInstance().ETH_RPC_URL);
    var contract = new web3.eth.Contract(idaAbi, tokenAdrs);
    let dataEncoded = await contract.methods
      .transfer(toAdrs, exponentialToDecimal(amountSent).toString())
      .encodeABI();
    console.log("----------------------- dataEncoded ", dataEncoded);
    return dataEncoded;
  } catch (error) {
    console.log("----------------------- dataEncoded error ", error);
  }
};
/************************************** Generate ETH signed raw ************************************/
export const createEthRaw = async (
  my_address,
  to_address,
  pvt_key,
  amount,
  fromCrossChain = false
) => {
  let multiWallet = await getData(Constants.MULTI_WALLET_LIST);
  let multiWalletData = JSON.parse(multiWallet);
  let currentWallet = multiWalletData.filter(
    (el) => el?.defaultWallet == true
  )[0];
  console.log("---------currentWallet", currentWallet);

  try {
    const web3Eth = new Web3(Singleton.getInstance().ETH_RPC_URL);
    const web3 = createAlchemyWeb3(Singleton.getInstance().ETH_RPC_URL);
    const amountToSend = web3.utils.toWei(amount.toString(), "ether");
    const amountNew = web3.utils.toHex(amountToSend);
    const priorityOrTip = await web3.eth.getMaxPriorityFeePerGas();
    const nonce = await web3.eth.getTransactionCount(my_address, "latest");
    const totalgasPrice = await web3Eth.eth.getGasPrice();
    const defaultgaslimit = 23000;

    let txData;
    fromCrossChain
      ? (txData = {
        // data: '',
        gasLimit: web3.utils.toHex(defaultgaslimit),
        maxPriorityFeePerGas: priorityOrTip,
        maxFeePerGas: web3.utils.toHex(totalgasPrice),
        nonce: nonce,
        to: to_address,
        value: web3.utils.toHex(amountNew),
        chainId: Constants.network == "testnet" ? "0x05" : "0x01",
        accessList: [],
        type: 2,
      })
      : (txData = {
        data: "",
        gasLimit: web3.utils.toHex(defaultgaslimit),
        maxPriorityFeePerGas: priorityOrTip,
        maxFeePerGas: web3.utils.toHex(totalgasPrice),
        nonce: nonce,
        to: to_address,
        value: web3.utils.toHex(amountNew),
        chainId: Constants.network == "testnet" ? "0x05" : "0x01",
        accessList: [],
        type: 2,
      });
    let walletPublicKey = currentWallet?.login_data?.walletPublicKey;
    let ethPublicKey = currentWallet?.login_data?.ethPublicKey
    if (!currentWallet?.login_data?.isTangem) {
      const common = new Common({
        chain: Constants.network == "testnet" ? "goerli" : "mainnet",
        hardfork: "london",
      });
      const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });
      const privateKey = pvt_key.includes("0x")
        ? Buffer.from(pvt_key.substring(2), "hex")
        : Buffer.from(pvt_key, "hex");
      const signedTx = await tx.sign(privateKey);
      const serializedTx = signedTx.serialize();
      return { txn_hash: serializedTx.toString("hex"), nonce: nonce };
    } else {
      let serializedTxn = ethers.utils.serializeTransaction(txData);
      let hash = ethers.utils.keccak256(serializedTxn);

      let res = await signTransaction(
        hash,
        walletPublicKey,
        EVM_DERIVATION,
        currentWallet?.login_data?.card?.cardId
      );
      let result = JSON.parse(res);
      //  let signedTxn = addSignatureToTransaction(txData, result.signature, hash, my_address)
      //  return { txn_hash: signedTxn, nonce: nonce };
      // resolve(signedTxn)
      let unmarshalSig = await unmarshalSignature(
        result.signature,
        hash,
        currentWallet?.login_data?.ethPublicKey,
        (35 + 1 * 2)
      );
      let serializedSignedTxn = ethers.utils.serializeTransaction(
        txData,
        "0x" + unmarshalSig
      );
      let decodedTxn = ethers.utils.parseTransaction(serializedSignedTxn);
      console.log("unmarshalSig-----", decodedTxn?.from)
      if (Singleton.getInstance().defaultEthAddress.toLowerCase() != decodedTxn?.from.toLowerCase()) {
        unmarshalSig = await unmarshalSignature(result.signature, hash, currentWallet?.login_data?.ethPublicKey, 1 + (35 + 1 * 2))
        serializedSignedTxn = ethers.utils.serializeTransaction(txData, "0x" + unmarshalSig)
        decodedTxn = ethers.utils.parseTransaction(serializedSignedTxn);
        console.log("decodedTxn-----", decodedTxn?.from)
      }
      console.log("RAW-----", serializedSignedTxn);
      return { txn_hash: serializedSignedTxn.slice(2), nonce: nonce };
    }
    // }
  } catch (error) {
    console.log("error:::::::::::::::", error);
  }
};
/************************************** Generate ERC-20 signed raw ************************************/
export const CreateEthTokenRaw = async (
  my_address,
  to_address,
  pvt_key,
  gasLimit,
  data
) => {
  let multiWallet = await getData(Constants.MULTI_WALLET_LIST);
  let multiWalletData = JSON.parse(multiWallet);
  let currentWallet = multiWalletData.filter(
    (el) => el?.defaultWallet == true
  )[0];
  console.log("---------currentWallet", currentWallet);
  const web3Eth = new Web3(Singleton.getInstance().ETH_RPC_URL);
  const web3 = createAlchemyWeb3(Singleton.getInstance().ETH_RPC_URL);
  const priorityOrTip = await web3.eth.getMaxPriorityFeePerGas();
  const nonce = await web3.eth.getTransactionCount(my_address, "latest");
  const totalgasPrice = await web3Eth.eth.getGasPrice();
  const defaultgaslimit = gasLimit;
  const txData = {
    data: data,
    gasLimit: web3.utils.toHex(defaultgaslimit),
    maxPriorityFeePerGas: priorityOrTip,
    maxFeePerGas: web3.utils.toHex(totalgasPrice),
    nonce: nonce,
    to: to_address,
    value: "0x0",
    chainId: Constants.network == "testnet" ? "0x05" : "0x01",
    accessList: [],
    type: 2,
  };
  if (!currentWallet?.login_data?.isTangem) {
    const common = new Common({
      chain: Constants.network == "testnet" ? "goerli" : "mainnet",
      hardfork: "london",
    });
    const tx = FeeMarketEIP1559Transaction.fromTxData(txData, { common });
    const privateKey = pvt_key.includes("0x")
      ? Buffer.from(pvt_key.substring(2), "hex")
      : Buffer.from(pvt_key, "hex");
    const signedTx = tx.sign(privateKey);
    const serializedTx = signedTx.serialize();
    return { txn_hash: serializedTx.toString("hex"), nonce: nonce };
  } else {
    console.log("txData=-=-==", txData);
    let serializedTxn = ethers.utils.serializeTransaction(txData);
    let hash = ethers.utils.keccak256(serializedTxn);
    let walletPublicKey = currentWallet?.login_data?.walletPublicKey;
    let res = await signTransaction(
      hash,
      walletPublicKey,
      EVM_DERIVATION,
      currentWallet?.login_data?.card?.cardId
    );
    let result = JSON.parse(res);
    let unmarshalSig = await unmarshalSignature(
      result.signature,
      hash,
      currentWallet?.login_data?.ethPublicKey
    );
    let serializedSignedTxn = ethers.utils.serializeTransaction(
      txData,
      "0x" + unmarshalSig,
      (35 + 1 * 2)
    );

    let decodedTxn = ethers.utils.parseTransaction(serializedSignedTxn);
    console.log("unmarshalSig-----", decodedTxn?.from, Singleton.getInstance().defaultEthAddress.toLowerCase())
    if (Singleton.getInstance().defaultEthAddress.toLowerCase() != decodedTxn?.from.toLowerCase()) {
      unmarshalSig = await unmarshalSignature(result.signature, hash, currentWallet?.login_data?.ethPublicKey, 1 + (35 + 1 * 2))
      serializedSignedTxn = ethers.utils.serializeTransaction(txData, "0x" + unmarshalSig)
      decodedTxn = ethers.utils.parseTransaction(serializedSignedTxn);
      console.log("decodedTxn-----", decodedTxn?.from)
    }

    return { txn_hash: serializedSignedTxn.slice(2), nonce: nonce };
  }
};

export function isValidEthereumPrivateKey(privateKey) {
  // Check if it’s a 64-character hexadecimal string
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}
