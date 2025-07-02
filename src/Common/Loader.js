import React,{memo} from "react"
import {View,ActivityIndicator} from "react-native"
import * as constant from "../Utils/Constants"

function Loader() {
    return (
        <View
        style={{
          height: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={constant.primaryColor} />
      </View>
    )
}

export default memo(Loader);