/*
 * A smart react native component providing images selection from camera roll for android and ios, written in JS
 * https://github.com/react-native-component/react-native-smart-camera-roll-picker/
 * Released under the MIT license
 * Copyright (c) 2017 react-native-component <moonsunfall@aliyun.com>
 */

import React, {Component} from 'react'
import {
    CameraRoll,
    Platform,
    StyleSheet,
    View,
    Text,
    ListView,
    ActivityIndicator,
    Dimensions,
} from 'react-native'
import ImageView from './ImageView'
import PullToRefreshListView from 'react-native-smart-pull-to-refresh-listview'

const {width: deviceWidth} = Dimensions.get('window')

export default class CameraRollPicker extends Component {

    static defaultProps = {
        onEndReachedThreshold: 0,
        fetchSize: 90,
        initialListSize: 30,
        pageSize: 30,
        groupTypes: 'SavedPhotos',
        maximum: 8,
        columnCount: 3,
        assetType: 'Photos',
        selected: [],
        onSelect: (selectedImages, currentImage) => {

        },
    }

    static propTypes = {
        rowWidth: React.PropTypes.number,
        initialListSize: React.PropTypes.number,
        pageSize: React.PropTypes.number,
        groupTypes: React.PropTypes.oneOf([
            'Album',
            'All',
            'Event',
            'Faces',
            'Library',
            'PhotoStream',
            'SavedPhotos',
        ]),
        maximum: React.PropTypes.number,
        assetType: React.PropTypes.oneOf([
            'Photos',
            'Videos',
            'All',
        ]),
        columnCount: React.PropTypes.number,
        rowWidth: React.PropTypes.number,
        onSelect: React.PropTypes.func,
        selected: React.PropTypes.array,
        selectedMarker: React.PropTypes.element,
    }

    constructor(props) {
        super(props)

        let {rowWidth, columnCount, selected} = props

        this.state = {
            images: [],
            selected,
            lastCursor: null,
            loadingMore: false,
            noMore: false,
            dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
        }

        this._columnWidth = (rowWidth || deviceWidth) / columnCount
    }

    componentDidMount () {
        this._pullToRefreshListView.beginRefresh(true)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            selected: nextProps.selected,
        })
    }

    async _fetch() {
        let _this = this
        let {groupTypes, assetType, fetchSize: first} = _this.props
        let {lastCursor, noMore} = _this.state

        let fetchParams = {
            first,
            groupTypes,
            assetType,
        }

        if (Platform.OS === "android") {
            // not supported in android
            delete fetchParams.groupTypes
        }

        if (lastCursor) {
            fetchParams.after = lastCursor
        }

        try {
            let photos = await CameraRoll.getPhotos(fetchParams)
            _this._appendImages(photos)
        }
        catch(e) {
            console.log(e)
        }
        finally {
            if(!lastCursor) {
                _this._pullToRefreshListView.endRefresh(true)
            }
            else {
                _this._pullToRefreshListView.endLoadMore(noMore)
            }
        }
    }

    _appendImages(data) {
        let {columnCount} = this.props
        let {images, dataSource} = this.state
        let {edges: assets, page_info} = data
        let {has_next_page, end_cursor} = page_info
        let newState = {}

        if (!has_next_page) {
            newState.noMore = true
        }

        if (assets.length > 0) {
            newState.lastCursor = end_cursor
            newState.images = images.concat(assets)
            newState.dataSource = dataSource.cloneWithRows(
                this._generateRow(newState.images, columnCount)
            )
        }

        this.setState(newState)
    }

    render() {
        let {dataSource} = this.state
        let {
            initialListSize,
            pageSize,
            onEndReachedThreshold,
        } = this.props

        return (
            <PullToRefreshListView
                ref={ (component) => this._pullToRefreshListView = component }
                viewType={PullToRefreshListView.constants.viewType.listView}
                contentContainerStyle={{backgroundColor: 'transparent', }}
                initialListSize={initialListSize}
                enableEmptySections={true}
                dataSource={dataSource}
                pageSize={pageSize}
                renderRow={this._renderRow}
                listItemProps={{ style: {overflow: 'hidden', height: this._columnWidth,}, }}
                enabledPullDown={false}
                renderFooter={this._renderFooter}
                onRefresh={this._onRefresh}
                onLoadMore={this._onLoadMore}
                autoLoadMore={true}
                onEndReachedThreshold={onEndReachedThreshold}/>
        )
    }

    _renderImage(item, index) {
        let {selected} = this.state
        let {
            selectedMarker,
        } = this.props

        let uri = item.node.image.uri
        let isSelected = (this._arrayObjectIndexOf(selected, 'uri', uri) >= 0) ? true : false

        return (
            <ImageView
                key={uri}
                item={item}
                selected={isSelected}
                selectedMarker={selectedMarker}
                columnWidth={this._columnWidth}
                onClick={this._selectImage.bind(this)}
            />
        )
    }

    _renderRow = (rowData, sectionID, rowID) => {
        let items = rowData.map((item, index) => {
            if (item === null) {
                return null
            }
            return (
                this._renderImage(item, index)
            )
        })

        return (
            <View style={styles.row}>
                {items}
            </View>
        )
    }

    _selectImage(image) {
        let {maximum, columnCount, onSelect} = this.props

        let selected = this.state.selected,
            index = this._arrayObjectIndexOf(selected, 'uri', image.uri)

        if (index >= 0) {
            selected.splice(index, 1)
        } else {
            if (selected.length < maximum) {
                selected.push(image)
            }
        }

        this.setState({
            selected: selected,
            dataSource: this.state.dataSource.cloneWithRows(
                this._generateRow(this.state.images, columnCount)
            ),
        })

        onSelect(this.state.selected, image)
    }

    _generateRow(data, n) {
        let result = [],
            temp = []

        for (let i = 0; i < data.length; ++i) {
            if (i > 0 && i % n === 0) {
                result.push(temp)
                temp = []
            }
            temp.push(data[i])
        }

        if (temp.length > 0) {
            while (temp.length !== n) {
                temp.push(null)
            }
            result.push(temp)
        }

        return result
    }

    _arrayObjectIndexOf(array, property, value) {
        return array.map((o) => { return o[property] }).indexOf(value)
    }

    _renderFooter = (viewState) => {
        let {pullState, } = viewState
        let {load_more_none, loading_more, loaded_all, } = PullToRefreshListView.constants.viewState
       switch(pullState) {
            case load_more_none:
            case loading_more:
                return (
                    <View style={{height: 30, justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator
                            animating={true}
                            color={'#aaa'}
                            size={'small'}/>
                    </View>
                )
            case loaded_all:
                return null
        }
    }

    _onRefresh = () => {
        this._fetch()
    }

    _onLoadMore = () => {
        this._fetch()
    }
}

const styles = StyleSheet.create({
    wrapper:{
        flex: 1,
    },
    row:{
        flexDirection: 'row',
        flex: 1,
    },
    marker: {
        position: 'absolute',
        top: 5,
        backgroundColor: 'transparent',
    },
})

