import { View, Text, Modal, StyleSheet, ImageBackground, Image } from 'react-native'
import React from 'react'
import { LanguageManager } from '../../../../../LanguageManager'
import { HeaderMain } from '../../../common'
import { ThemeManager } from '../../../../../ThemeManager'
import { BlurView } from '@react-native-community/blur'
import images from '../../../../theme/Images'
import QRCodeScanner from 'react-native-qrcode-scanner'

const QrScanner = ({ isVisible, onClose, onRead }) => {
    return (
        <Modal transparent={true} visible={isVisible} onRequestClose={onClose}>
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, }}>
                <HeaderMain
                    backCallBack={onClose}
                    BackButtonText={LanguageManager.walletConnection.scanQR} />
                <View style={{ flex: 1, alignItems: 'center', marginTop: "50%" }}>

                    <View style={{ width: 270, height: 270, }}>
                        <QRCodeScanner
                            cameraStyle={{ width: 250, height: 250, alignSelf: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, }}
                            onRead={onRead}
                        />
                        <Image source={images.icQrBorder} style={[StyleSheet.absoluteFill, { height: 270, width: 270 }]} />
                    </View>
                </View>

            </View>

        </Modal>
    )
}

export default QrScanner