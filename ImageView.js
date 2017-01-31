
import React, {Component} from 'react'
import {
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native'

export default class ImageItem extends Component {

    static defaultProps = {
        item: {},
        selected: false,
    }

    static propTypes = {
        item: React.PropTypes.object.isRequired,
        selected: React.PropTypes.bool.isRequired,
        selectedMarker: React.PropTypes.element,
        columnWidth: React.PropTypes.number.isRequired,
        onClick: React.PropTypes.func,
    }

    render() {
        let {item, selected, selectedMarker, columnWidth } = this.props
        let marker = selectedMarker ? selectedMarker :
            <Image
                style={[styles.marker, {width: 25, height: 25}]}
                source={require('./circle-check.png')}
            />

        let image = item.node.image

        return (
            <TouchableOpacity
                onPress={this._handleClick.bind(this, image)}>
                <Image
                    source={{uri: image.uri}}
                    style={{height: columnWidth, width: columnWidth}} >
                    { (selected) ? marker : null }
                </Image>
            </TouchableOpacity>
        )
    }

    _handleClick(item) {
        this.props.onClick(item)
    }
}

const styles = StyleSheet.create({
    marker: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'transparent',
    },
})


