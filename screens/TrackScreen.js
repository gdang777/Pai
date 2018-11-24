import React from 'react';
import { Text, StyleSheet, View, Image, TouchableOpacity, Button, Animated} from 'react-native';
import QRCode from 'react-native-qrcode';
import { BarCodeScanner, Permissions } from 'expo';


 class Barcode extends React.Component {
  state = {
    hasCameraPermission: null,
    type: BarCodeScanner.Constants.Type.back,
  };

  async componentDidMount() {
    let { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState ({ hasCameraPermission: (status === 'granted')});
  }

  handleBarCodeScanned = ({ type, data }) => {
    alert("Bar code scanned");
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return <Text> Requesting permission to use Camera </Text>;
    }
    if (hasCameraPermission === false) {
      return <Text> No access to camera</Text>;
    }
    return (
      <View style={{  width: 300, height: 300}}>
        <BarCodeScanner
          onBarCodeScanned={data => alert("You are friends now")}
          barCodeTypes={[
            BarCodeScanner.Constants.BarCodeType.qr,
            BarCodeScanner.Constants.BarCodeType.pdf417,
          ]}
          type={this.state.type}
          style={{ ...StyleSheet.absoluteFillObject }}
        />
        <TouchableOpacity
          style={{
            flex: 0.5,
            alignSelf: 'flex-end',
            alignItems: 'center',
          }}
          onPress={() => this.setState({ type:
            this.state.type === BarCodeScanner.Constants.Type.back
              ? BarCodeScanner.Constants.Type.front
              : BarCodeScanner.Constants.Type.back,
          })}
        >
          <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
        </TouchableOpacity>
      </View>
    );
  }

}

function ProfileImage(props) {
  return (
    <View>
      <Image style={styles.trackImage} source={{uri: props.Image}} />
    </View>
  )
}


class QrCode extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      isBarCode: true,
    }
  }

  _onPress = (event) => {
    console.log("Scan pressed");
    this.setState((prevState) => {
      return {
        isBarCode: !prevState.isBarCode
      }
    });
  }

  render() {
    if(this.state.isBarCode) {
    return (
    <View>
      <QRCode
          value="somestring"
          size={200}
          bgColor='purple'
          fgColor='white'/>
          <TouchableOpacity style={styles.captureBtn} onPress={this.takePicture}>
            <Button
            onPress={this._onPress}
            title='Scan'
            />
          </TouchableOpacity>
          </View>
      )
    }
    return (
      <View>
        <Barcode/>
      </View>
    )
  }
}

export default class TrackScreen extends React.Component {
  static navigationOptions = {
    // Here we can change the title at the top of the page
    title: 'Distance Between',
  };

  constructor(props) {
    super(props);
    this.state = {
      user: {
        name: 'nonsense',
        isImage: true,

        // more here... except it all comes from props anyway

      },
    };
    console.log("===========", props.screenProps.distance);
  }




  _handleOnPress = (event) => {
    this.setState((prevState) => {
      return {
        isImage: !prevState.isImage
      }
    });
  }

  componentWillMount() {
    this.animatedValue = new Animated.Value(0);
  }

  componentDidMount() {
    // const distance = this.props.screenProps.distance;
    const distance = 1000


    Animated.timing(this.animatedValue,  {
      toValue: distance,

    }).start();
  }

  render() {
    const interpolateColor = this.animatedValue.interpolate({
      inputRange: [0, 1000],
      outputRange: ['rgb(0, 97, 255)', 'rgb(255, 0, 0)']
    })

    const animatedStyle = {
      backgroundColor: interpolateColor
    }

    return (
      <Animated.View style={[styles.page, animatedStyle]}>
      <TouchableOpacity onPress={this._handleOnPress}>
      {
        this.state.isImage ? <QrCode/> : <ProfileImage style={styles.trackImage} Image={this.props.navigation.state.params.user.profile_picture}/>

      }
      </TouchableOpacity>
       <Text>
          { this.props.navigation.state.params.user.first_name }
       </Text>
     </Animated.View>
    );
  }
}

const styles = StyleSheet.create({

  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackImage: {
    margin: 9,
    height: 130,
    width: 130,
    borderRadius: 10,
  },
  iconCamera: {

  },
  captureBtn: {
    backgroundColor: 'grey'
  }
});
