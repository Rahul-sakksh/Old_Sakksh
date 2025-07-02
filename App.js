import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Authentication from './src/navs/Authentication';

const App = () => {
  return (
    <>
      <SafeAreaProvider>
        <Authentication />
      </SafeAreaProvider>
    </>
  );
};


export default App;
