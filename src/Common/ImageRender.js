import React, {useState} from 'react';
import {View, Image, ActivityIndicator} from 'react-native';

function ImageRender({image}) {
  const [loading, setLoading] = useState(false);

  function onLoading(value, label) {
    setLoading(value);
  }

  return (
    <View>
      {loading && (
        <View
          style={{
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            zIndex: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}>
          <ActivityIndicator color={'#000'} />
        </View>
      )}

      {
        <Image
          source={{uri: image}}
          style={{width: 60, height: 60, marginRight: 10}}
          onLoadStart={() => onLoading(true, 'onLoadStart')}
          onLoadEnd={() => onLoading(true, 'onLoadEnd')}
        />
      }
    </View>
  );
}

export default ImageRender;