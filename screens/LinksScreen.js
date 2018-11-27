import React from 'react';
import app from '../styles/container.js';
import axios from 'react-native-axios';
import { AlertIOS, ScrollView, StyleSheet, View, Text, Image, TouchableHighlight, TouchableOpacity, Button, ImageBackground, Animated } from 'react-native';
const {ipv4} = require('../config.json');
import { Badge, TouchableNative, Icon } from 'react-native-elements';
import moment from 'moment';
import Info from '../screens/Info.js';



function DistanceColor(props) {
  let distance = props.distance
  let closestDistance = 50;
  let middleDistance = 100;

  function isClose(distance) {
    if(distance <= closestDistance) {
      return
      <Icon
      name='location-on'
      color="red"
      containerStyle={styles.locationIcon}
      size= {40}
      />
    }
  }

  function middleClose(distance) {
    if (distance <= middleDistance && distance > closestDistance) {
      return <Icon
              name='location-on'
              color="blue"
              containerStyle={styles.locationIcon}
              size= {40}
            />
    }
  }

  function endingClass(distance) {
    if(distance > middleDistance) {
      return <Icon
              name='location-on'
              color="green"
              containerStyle={styles.locationIcon}
              size= {40}
            />
    }
  }
  return (
    <View style = {{overflow:'hidden'}}>
      {isClose(distance)}
      {middleClose(distance)}
      {endingClass(distance)}
    </View>

  )
}

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnections: true,
    }
  }

  _handleMe = (event) => {
    this.setState((prevState) => {
      console.log("We are here");
      return {
        isConnections: prevState.isConnections
      }
    });
  }


  render() {
    return (
      <View style={styles.header}>
        <Icon
        type='ionicon'
        name='ios-arrow-back'
        size= {30}
        color= 'pink'
        onPress={()=> this.props.Nav.navigate('Profile')}
        />
        <Text style={styles.headerText}> Connections </Text>
        <Icon
        type='ionicon'
        name='ios-information-circle-outline'
        size= {35}
        color= 'pink'
        onPress={() => this.props.Nav.navigate('Info')}
        />
      </View>
    )
  }
}

function CardOpen(props) {
  let nuggets = props.person.nuggets;
    return (
        <View style={styles.nuggets}>
          { nuggets.map((nugget, i) => (
          <View style={styles.nuggetContainer} key={i}>
            <Text style={styles.question}>{nugget.question}</Text>
            <Text style={styles.answer}>{nugget.answer}</Text>
          </View>
            )) }
          <View style={styles.delete}>
            <Icon
            type='font-awesome'
            name='user-times'
            onPress={() => {
                AlertIOS.prompt(
                  'Remove Connection',
                  `Are you sure you want to remove ${props.person.first_name} as a connection?`,
                  [
                    {text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel'},
                    {text: 'Yes', onPress: () => props.deleteConnection(props.person.connection_id)},
                  ],
                    { cancelable: false }
                  )
                //
              }}
            color='pink'
            backgroundColor='#474747'
            size={30}
            />
          </View>

        </View>
    )
}

class Card extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      open: false,
      // near: false,
    }
  }

  _onPress = (event) => {
    this.setState((prevState) => {
      return {
        open: !prevState.open
      }
    });
  }
  _onLongPress = (event) => {
    console.log(this.props.getConnections());
    this.props.navigation.navigate('Track',
    { user: this.props.user,
      navigation: this.props.navigation,
      getConnections: this.props.getConnections,
      getProfile: this.props.getProfile
    });
  }
  render() {
    const { user = {} } = this.props;
    const { first_name, profile_picture, number_of_friends} = user;
    let friendsTotal = number_of_friends;
    console.log("Friends", friendsTotal);
    let connectedAt = user.connected_at;
    let expiryAt = (moment(connectedAt).add(7,'days').format('YYYYMMDD'));
    let daysRemaining = moment(expiryAt).fromNow();
    return (
      <TouchableOpacity underLayColor="white" onPress={this._onPress} onLongPress={this._onLongPress}>
        <View style={styles.cardClosed, this.state.open ? styles.cardOpen : null}>
        <View style={styles.cardFlow}>
          <Image style={styles.connectionImage} source={{uri: profile_picture}}/>
          <Text style={styles.name}> {first_name} </Text>

          <Text>friends:{friendsTotal}</Text>
          <DistanceColor distance={this.props.distance(this.props.screenProps.connectedFriendsDistances, user.id)}/>
          <Text>Distance: {this.props.distance(this.props.screenProps.connectedFriendsDistances, user.id)}</Text>

        </View>
            {
            this.state.open ? <CardOpen deleteConnection={this.props.deleteConnection} person={ user } /> : null
            }
            <Text style={styles.expiry}> Expiring {daysRemaining} </Text>
        </View>
      </TouchableOpacity>
    )
  }
}
//---------------------------------------------------------------------------------------------------------------------------------//
export default class LinksScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props)
    this.state = {
      userConnections: [],
      currentUserId: this.props.screenProps.currentUserId,
      // deleted: false,
      isNear: false,
    }
    this.deleteConnection = this.deleteConnection.bind(this);
    this.distanceFromSource = this.distanceFromSource.bind(this);
    this.getConnections = this.getConnections.bind(this)
  }

  componentDidMount() {
    axios.get(`${ipv4}/user/${this.props.screenProps.currentUserId}/connections`)
    .then((res) => {
      this.setState({ userConnections: res.data , currentUserId: this.props.screenProps.currentUserId})
    })
    .catch(err => console.warn(err))
  }

  deleteConnection(conn_id) {
    axios({
      method: 'post',
      url: `${ipv4}/connections/${conn_id}/delete`,
      data: {
        userId: this.state.currentUserId,
        currentConnectionId: conn_id,
      }
    })
      .then((res) => {
        this.setState({userConnections: res.data});
      })
      .catch((err) => console.warn(err))
  }

  getConnections() {
    console.log("FUNCTION WAS CALLED")
    axios.get(`${ipv4}/user/${this.props.screenProps.currentUserId}/connections`)
    .then((res) => {
      console.log("GET CONNECTIONS WAS SUCCESSFUL");
      this.setState({ userConnections: res.data , currentUserId: this.props.screenProps.currentUserId})
    })
    .catch(err => console.warn(err))
  }

  distanceFromSource(arr, userId){
    let distance = 0;
    if(arr[0]) {
      arr.forEach((item) => {
        if(item.userId == userId) {
          distance = item.distance;
        }
      })
      return distance
    } else {
      return null;
    }
  }

  // Need function with websocket data to update state of isNear above.
  render() {
    const { userConnections } = this.state;
    const { connectedFriendsDistances} = this.props.screenProps
    // Builds out a card for each connection
    return (

      <ImageBackground
      source={require('../assets/images/background.png')}
      style={[ {width: '100%', height: '100%'}, app.linksContainer ]}
      >
        <Header Nav={ this.props.navigation }/>
        <ScrollView
        showsHorizontalScrollIndicator={false}>
          { userConnections.map(
            (user, index) => <Card
            isNear={index % 2 === 0 /* Every other user for debug reasons */}
            deleteConnection={this.deleteConnection}
            getConnections={this.getConnections}
            user={ user }
            key={ user.id }
            distance={ this.distanceFromSource }
            getProfile={this.props.screenProps.getProfile}
            {...this.props}
            />
          )}
        </ScrollView>
      </ImageBackground>
    );
  }
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 15,
    paddingLeft: 15,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
  },
  headerText: {
    fontSize: 25,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#474747'
  },
  cardFlow: {
    flexDirection:'row',
  },
  cardClosed: {
    height: 100,
    width: 'auto',

  },
  cardOpen: {
    height: 'auto',

  },
  near: {
    // borderColor: 'gold',
    // borderWidth: 5,
    // borderStyle: 'solid',
  },
  connectionImage: {
    height: 98,
    width: 100,
    alignItems: 'center',
  },
  name: {
    lineHeight: 90,
    fontSize: 27,
    color: '#474747',
  },
  expiry: {
    marginTop: -20,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'right',
    margin: 10,
    color: '#474747',
  },
  nuggets: {
    flexDirection: 'column',
    textAlign: 'left',
    width: 'auto',
    margin: 10,
  },
  nuggetContainer: {
    borderRadius: 10,
    borderColor: '#474747',
    borderWidth: 1,
    marginTop: 10,
    margin: 5,
    padding: 5,
  },
  question: {
    color: '#474747',
    marginBottom: 5,
  },
  answer: {
    color: 'black',
    fontWeight: 'bold',
  },
  delete: {
    width: 35,
    height: 35,
    alignSelf: 'center',
  }
});
