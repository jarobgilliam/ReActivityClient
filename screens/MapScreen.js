import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Exponent from 'exponent';
import MapView from 'react-native-maps';
import EventMarkerCallout from '../components/EventMarkerCallout';
import { store } from '../lib/reduxStore';
import { FontAwesome } from '@exponent/vector-icons';
var {height, width} = Dimensions.get('window');

export default class MapScreen extends React.Component {
  static route = {
    navigationBar: {
      visible: false,
      title: 'Map',
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: store.getState().locationDetails.lat,
        longitude: store.getState().locationDetails.lon,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      events: store.getState().nearbyEvents
    }
  }

  componentDidMount() {
    var context = this;
    async function getLocationAsync() {
      const { Location, Permissions } = Exponent;
      const { status }  = await Permissions.askAsync(Permissions.LOCATION);

      console.log('STATUS IS:', status)

      if (status === 'granted') {
        navigator.geolocation.getCurrentPosition((position) => {
          console.log('location permission is granted.');
          var initialPosition = position;
          context.setState({initialPosition});
        },
        (error) => alert(JSON.stringify(error))
        );
        context.watchID = navigator.geolocation.watchPosition((position) => {
          // console.log('watching device location now');
          var currentPosition = position.coords;
          var locs = [];
          var latDelta = 0;
          var lonDelta = 0;
          var userLat = currentPosition.latitude;
          var userLon = currentPosition.longitude;
          for (let i = 0; i < context.state.events.length; i++) {
            var eventCoords = context.state.events[i].locDetailsView
            if (Math.abs(userLat - eventCoords.latitude) * 2.2 > latDelta) {
              latDelta = Math.abs(userLat - eventCoords.latitude) * 2.2
            }
            if (Math.abs(userLon - eventCoords.longitude) * 2.2 > lonDelta) {
              lonDelta = Math.abs(userLon - eventCoords.longitude) * 2.2
            }
          }
          currentPosition.latitudeDelta = latDelta;
          currentPosition.longitudeDelta = lonDelta;
          context.setState({region: currentPosition});
        });
      } else {
        throw new Error('Location permission not granted');
      }
      currentPosition.latitudeDelta = latDelta;
      currentPosition.longitudeDelta = lonDelta;
      context.setState({region: currentPosition});
    };
    getLocationAsync();
  }

  render() {
    return (
      <MapView
        style={{flex: 1}}
        showsUserLocation={true}
        region={this.state.region}
      >
      {this.state.events.map(eventMarker => (
        <MapView.Marker
          coordinate={{longitude: eventMarker.locDetailsView.longitude, latitude: eventMarker.locDetailsView.latitude}}
          title={eventMarker.title}
          description={eventMarker.description}
          key={eventMarker.id}
        >
          <MapView.Callout
            style={{width: width * .75}}
            tooltip={false}
          >
            <EventMarkerCallout event={eventMarker}/>
          </MapView.Callout>
        </MapView.Marker>
      ))}
      </MapView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
});
