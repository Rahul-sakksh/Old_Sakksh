import React from 'react';
import Pdf from 'react-native-pdf';
import {View, StyleSheet, ActivityIndicator,Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavigationBar from './NavigationBar';
import * as constant from '../Utils/Constants';


function PdfViewer({route, navigation}) {
  const styles = StyleSheet.create({
    container: {
      paddingTop: 20,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff'
    },
    pdf: {
        width: '100%',
        height: '100%',
    },
  });

  const source = {uri: route.params.base64};
console.log('source',source);

  return (
    <SafeAreaView style={{backgroundColor: constant.primaryColor}}
    edges={['top']}>
    <View style={styles.container}>
        <NavigationBar
            title={'Report'}
            showBackButton={true}
            hideRightButtons={true}
            onPressBack={() => navigation.goBack()}
          />
      <Pdf
        trustAllCerts={false}
        source={source}
        renderActivityIndicator={() => (
          <View style={{position:"absolute", top: 220, justifyContent:"center", alignSelf: "center", zIndex: 99, backgroundColor: "#fff", borderRadius: 10, elevation: 5, padding: 25}}>
                       <ActivityIndicator size="large" color={constant.primaryColor} />
                      <Text
                          style={{
                            color: '#000',
                            fontSize: 18,
                            marginTop: 10,
                            fontWeight: '700',
                            textAlign: 'center',
                          }}>Loading PDF... </Text>
                  </View>
        )}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
        }}
        onError={error => {
          console.log(error);
        }}
        onPressLink={uri => {
          console.log(`Link pressed: ${uri}`);
        }}
        style={styles.pdf}
      />
    </View>
    </SafeAreaView>
  );
}

export default PdfViewer;
