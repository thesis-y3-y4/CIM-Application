import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import NavigationBar from './components/NavigationBar';
import styles from './styles';
import {fetchData} from './api/api';
import {getToken} from './api/tokenStorage';
import {Agenda} from 'react-native-calendars';
import {Avatar, Card} from 'react-native-paper';
import moment from 'moment';

function CalendarScreen(props) {
  const navigation = useNavigation();
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  async function getData() {
    try {
      const token = await getToken();
      const response = await fetchData('/events', token);

      const events = response.data.events;
      setDisplayedEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const timeToString = time => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const Schedule = () => {
    const [items, setItems] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const loadItems = () => {
      setIsLoading(true);
      setTimeout(() => {
        const newItems = {};
        displayedEvents.forEach(event => {
          const eventStartTime = new Date(event.start).getTime();
          const eventEndTime = new Date(event.end).getTime();

          const startDate = timeToString(eventStartTime);
          if (!newItems[startDate]) {
            newItems[startDate] = [];
          }
          newItems[startDate].push({
            title: event.title,
            start: event.start,
            end: event.end,
            location: event.location,
            eventType: event.eventType,
            height: Math.max(50, Math.floor(Math.random() * 150)),
          });

          const endDate = timeToString(eventEndTime);
          if (!newItems[endDate]) {
            newItems[endDate] = [];
          }
          newItems[endDate].push({
            title: event.title,
            start: event.start,
            end: event.end,
            location: event.location,
            eventType: event.eventType,
            height: Math.max(50, Math.floor(Math.random() * 150)),
          });
        });

        const currentDay = timeToString(new Date());
        if (!newItems[currentDay]) {
          newItems[currentDay] = [
            {
              title: 'No events today  💚',
              start: new Date().toISOString(),
              end: new Date().toISOString(),
              height: Math.max(50, Math.floor(Math.random() * 150)),
            },
          ];
        }

        const currentDate = new Date();
        const minDate = new Date();
        minDate.setDate(currentDate.getDate() - 30);
        const maxDate = new Date();
        maxDate.setDate(currentDate.getDate() + 30);

        for (
          let date = minDate;
          date <= maxDate;
          date.setDate(date.getDate() + 1)
        ) {
          const dateString = timeToString(date.getTime());
          if (!newItems[dateString]) {
            newItems[dateString] = [];
          }
        }
        setItems(newItems);
        setIsLoading(false);
      }, 1000);
    };

    const renderEmpty = () => {
      if (Object.keys(items).length === 0) {
        return (
          <View style={{height: 50, flex: 1, paddingTop: 40, paddingLeft: 10}}>
            <ActivityIndicator size="large" color="gray" />
          </View>
        );
      } else {
        return (
          <View
            style={{
              height: 50,
              flex: 1,
              paddingTop: 40,
              paddingLeft: 10,
              borderBottomColor: '#d3d3d3',
              borderBottomWidth: 1,
            }}
          />
        );
      }
    };

    const renderItem = item => {
      let avatarUri;
      switch (item.eventType) {
        case 'structural':
        case 'institutional':
          avatarUri = 'https://cscqcph.com/images/cscqcph.png';
          break;
        case 'organizational':
          avatarUri = 'https://cscqcph.com/images/cscqcph.png';
          break;
        case 'specialized':
          avatarUri =
            'https://pbs.twimg.com/profile_images/1563209642/wildcat_400x400.jpg';
          break;
        default:
          avatarUri = 'https://cscqcph.com/images/cscqcph.png';
      }

      return (
        <TouchableOpacity
          style={{marginRight: 10, marginTop: 17}}
          onPress={() => {
            setSelectedEvent(item);
            setModalVisible(true);
          }}>
          <Card>
            <Card.Content>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <Avatar.Image
                  source={{uri: avatarUri}}
                  size={60}
                  style={{position: 'absolute', top: 10, right: 5}}
                />
                <View
                  style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <Text style={[styles.details, {fontSize: 15, paddingTop: 5}]}>
                    {moment(item.start).format('h:mm A')} -{' '}
                    {moment(item.end).format('h:mm A')}
                  </Text>
                  <Text style={[styles.details, {paddingTop: 7}]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.details, {color: 'grey'}]}>
                    {item.location}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
    };

    return (
      <View style={{flex: 1}}>
        <Agenda
          items={items}
          loadItemsForMonth={loadItems}
          selected={new Date()}
          renderItem={renderItem}
          rowHasChanged={(r1, r2) => r1.text !== r2.text}
        />

        {/* Modal for Event Details */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalCalendarContainer}>
            <View style={styles.modalCalendarContent}>
              {selectedEvent && (
                <>
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.modalText}>
                    Date: {moment(selectedEvent.start).format('MMMM D, YYYY')}
                  </Text>
                  <Text style={styles.modalText}>
                    Time: {moment(selectedEvent.start).format('h:mm A')} -{' '}
                    {moment(selectedEvent.end).format('h:mm A')}
                  </Text>
                  <Text style={styles.modalText}>
                    Location: {selectedEvent.location}
                  </Text>
                </>
              )}
              <Button title="Close" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <NavigationBar navigation={navigation} />
      <Schedule />
    </View>
  );
}

export default CalendarScreen;
