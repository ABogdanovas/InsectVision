import {Card, IconButton} from 'react-native-paper';
import {Loading, Stack} from '../../../components';
import {ScrollView, StyleSheet, View} from 'react-native';
import {InsectCard} from './InsectCard';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const HEADER_MAX_HEIGHT = 300;

export default function InsectLoadingPage() {
  const {goBack} = useNavigation();

  const {top} = useSafeAreaInsets();

  return (
    <Stack>
      <ScrollView contentContainerStyle={{gap: 12, paddingBottom: 16}}>
        <Loading
          style={{
            height: HEADER_MAX_HEIGHT,
            width: '100%',

            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        />
        <View
          style={{
            gap: 12,
            paddingHorizontal: 16,
          }}>
          <Loading style={styles.title} />
          <Loading style={{width: 80, height: 32, borderRadius: 8}} />
          <InsectCard title="Description">
            <Loading style={styles.content} />
          </InsectCard>
          <InsectCard title="Danger">
            <Loading style={styles.content} />
          </InsectCard>
          <Card>
            <Card.Title title="Locations" />
            <Card.Content>
              <Loading style={{width: 120, height: 19, borderRadius: 12}} />
            </Card.Content>
            <Loading
              style={{
                marginTop: 8,
                height: 400,
                borderTopStartRadius: 16,
                borderTopEndRadius: 16,
                borderBottomStartRadius: 12,
                borderBottomEndRadius: 12,
              }}
            />
          </Card>
          <InsectCard title="Habitat">
            <Loading style={styles.content} />
          </InsectCard>
        </View>
      </ScrollView>
      <IconButton
        onPress={goBack}
        mode="contained"
        style={{
          position: 'absolute',
          top: top,
          left: 16,
          zIndex: 10,
        }}
        icon="arrow-left"
      />
    </Stack>
  );
}

const MAX_CONTENT_HEIGHT = 240;
const MIN_CONTENT_HEIGHT = 120;

const MAX_TITLE_WIDTH = 240;
const MIN_TITLE_WIDTH = 180;

const styles = StyleSheet.create({
  content: {
    height: Math.floor(
      Math.random() * (MAX_CONTENT_HEIGHT - MIN_CONTENT_HEIGHT + 1) +
        MIN_CONTENT_HEIGHT,
    ),
    borderRadius: 12,
    width: '100%',
  },
  title: {
    width: Math.floor(
      Math.random() * (MAX_TITLE_WIDTH - MIN_TITLE_WIDTH + 1) + MIN_TITLE_WIDTH,
    ),
    height: 44,
    borderRadius: 8,
  },
});
