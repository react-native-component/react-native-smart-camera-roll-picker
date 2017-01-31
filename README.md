# react-native-smart-camera-roll-picker

[![npm](https://img.shields.io/npm/v/react-native-smart-camera-roll-picker.svg)](https://www.npmjs.com/package/react-native-smart-camera-roll-picker)
[![npm](https://img.shields.io/npm/dm/react-native-smart-camera-roll-picker.svg)](https://www.npmjs.com/package/react-native-smart-camera-roll-picker)
[![npm](https://img.shields.io/npm/dt/react-native-smart-camera-roll-picker.svg)](https://www.npmjs.com/package/react-native-smart-camera-roll-picker)
[![npm](https://img.shields.io/npm/l/react-native-smart-camera-roll-picker.svg)](https://github.com/react-native-component/react-native-smart-camera-roll-picker/blob/master/LICENSE)

A smart react native component providing images selection from camera roll

## Installation

```
npm install react-native-smart-camera-roll-picker --save
```

## Usage

```js

import React, {
    Component,
} from 'react'
import {
    View,
    Text,
    StyleSheet,
    Platform,
    CameraRoll,
    Dimensions,
} from 'react-native'

import CameraRollPicker from 'react-native-smart-camera-roll-picker'

export default class CameraRollPickerDemo extends Component {

    // 构造
    constructor(props) {
        super(props);

    }

    //Using ListView
    render() {
        return (
            <View style={{marginTop: Platform.OS == 'ios' ? 64 : 56, flex: 1,}}>
                <CameraRollPicker
                    style={{flex: 1,}}
                    onSelect={this._getSelectedImages}/>
            </View>

        )

    }

    _getSelectedImages = (selectedImages, currentImage) => {
        console.log(`selectedImages = `, selectedImages)
    }

}
```

## Props

- `fetchSize`: How many images will be fetched each page. (Default: 90)
- `onSelect` : Callback function when images was selected. (is required!). Return a selected image array and current selected image.
- `onEndReachedThreshold` : "How early to start loading more rows , in pixels." (Default: 0)
- `initialListSize` : Specifies how many rows we want to render on our first render pass. (Default: 30)
- `pageSize` : After the initial render where 'initialListSize' is used, ListView looks at the pageSize to determine how many rows to render per frame. (Default: 30)
- `groupTypes` : The group where the photos will be fetched, one of 'Album', 'All', 'Event', 'Faces', 'Library', 'PhotoStream' and 'SavedPhotos'. (Default: SavedPhotos)
- `assetType` : The asset type, one of 'Photos', 'Videos' or 'All'. (Default: Photos)
- `selected` : Already be selected images array. (Default: [])
- `maximum` : Maximum number of selected images. (Default: 8)
- `columnCount` : Number of images per row. (Default: 3)
- `rowWidth` : Width of camer roll picker container. (Default: device width)
- `selectedMarker` : Custom selected image marker component. (Default: circle-check.png).