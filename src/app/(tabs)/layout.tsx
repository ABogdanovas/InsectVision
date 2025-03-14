import {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {useActiveRoute, useLinkTo} from '../../../charon';
import {AssistantFAB, BottomBar, Tab} from '../../components';

export default function TabsLayout({children}: PropsWithChildren<{}>) {
  const linkTo = useLinkTo();
  const activeRoute = useActiveRoute();

  const currentTab = activeRoute ? activeRoute.split('/') : ['home'];

  return (
    <View style={{height: '100%', width: '100%'}}>
      <View style={{flex: 1}}>
        {children}
        <AssistantFAB
          isVisible={!currentTab.find(value => value === 'settings')}
          onPress={() => {
            linkTo('/assistant');
          }}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
        />
      </View>
      <BottomBar>
        <Tab
          isFocused={Boolean(currentTab.find(value => value === 'home'))}
          icon="home"
          onPress={() => linkTo('/home')}
          label={'home'}
        />
        <Tab
          isFocused={Boolean(currentTab.find(value => value === 'scanner'))}
          icon="camera"
          onPress={() => linkTo('/insectCamera')}
          label={'scanner'}
        />
        <Tab
          isFocused={Boolean(currentTab.find(value => value === 'history'))}
          icon="meditation"
          onPress={() => linkTo('/history')}
          label={'history'}
        />
        <Tab
          isFocused={Boolean(currentTab.find(value => value === 'settings'))}
          icon="hammer-wrench"
          onPress={() => linkTo('/settings')}
          label={'settings'}
        />
      </BottomBar>
    </View>
  );
}
