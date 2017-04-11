import React, { Component } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

class Ball extends Component {
    componentWillMount() {
        //this is the starting x and y position (even though there's no x and y keys).
        // we can inspect this object to know where the object is
        this.position = new Animated.ValueXY(0, 0);
        //the line below says where we want the animation to end up
        Animated.spring(this.position, {
            toValue: { x: 200, y: 500 }
        }).start();
    }
    //The Animated component will wrap the thing we want to move
    render() {
        return (
            <Animated.View style={this.position.getLayout()}>
                <View style={styles.ball} />
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    ball: {
        height: 60,
        width: 60, 
        borderRadius: 30,
        borderWidth: 30,
        borderColor: 'black'
    }
});

export default Ball;
