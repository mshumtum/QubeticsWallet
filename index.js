/**
 * @format
 */

import {AppRegistry, LogBox, Text, TextInput} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import './shim';
import {Fonts, colors} from './src/theme';
import {setCustomText} from 'react-native-global-props';

Text.defaultProps = {
  ...(Text.defaultProps || {}),
  allowFontScaling: false,
};
TextInput.defaultProps = {
  ...(TextInput.defaultProps || {}),
  allowFontScaling: false,
};
const customTextProps = {
  style: {
    fontFamily: Fonts.regular,
    color: colors.black,
  },
};
setCustomText(customTextProps);
LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => App);
