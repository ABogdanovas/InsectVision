import React from 'react';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {Router} from './charon';
import {MMKV} from 'react-native-mmkv';

const context = require.context(
  './src/app',
  true,
  // Ignore root `./+html.js` and API route files `./generate+api.tsx`.
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)))\.[tj]sx?$).*\.[tj]sx?$/,
);

export const globalStorage = new MMKV({id: 'globalStorage'});

export default function App() {
  return (
    <Router
      context={context}
      linking={{
        prefixes: ['InsectVision://'],
      }}
    />
  );
}

AppRegistry.registerComponent(appName, () => App);
