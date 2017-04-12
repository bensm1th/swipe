import React, { Component } from 'react';
import { 
    View, 
    Animated, 
    PanResponder, 
    Dimensions, 
    StyleSheet,
    LayoutAnimation,
    UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {

    static defaultProps = {
        onSwipeLeft: () => {},
        onSwipeRight: () => {}
    }

    constructor(props) {
        super(props);
        const position = new Animated.ValueXY();

        const panResponder = PanResponder.create({
            //executed anytime a user taps on the screen
            //if we return 'true', then we want this pan responder to be
            //responsible for handling a gesture on this component. Otherwise, false
            //we could do some control flow here to decide based on conditions
            onStartShouldSetPanResponder: () => true,
            //called anytime the user begins to drag the component across the screen
            //this will be called many, many, times
            //first arg is 'event', 
            //second one is gesture, tells us what the user is doing with his/her finger, this is the one we care about
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy})
            },
            //called when user lets go of screen
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe('left');
                } else {
                    this.resetPosition();
                }
            }
        });
        this.state = { panResponder, position, index: 0 };
        //we could assign the panResponder to our state object, but we don't ever call set state on item
        //so, we don't have to assign it to state
        //we could do: this.panResponder = panResponder
    }

    componentWillReceiveProps(nextProps) {
        //called when component is about to be rerendered with a new set of props;
        //if the new props aren't equal to the current props, reset the index to zero, 
        // that way it will render first card instead of the last one, which was the previous index
        //because we had gone all the way through the cardstack
        if (nextProps.data !== this.props.data) {
            this.setState({ index: 0 });
        }
    }

    componentWillUpdate() {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring();
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: { x: 0, y: 0 }
        }).start();
    }

    forceSwipe(direction) {
        //this is just like spring, but it's smoother
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        Animated.timing(this.state.position, {
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DURATION
        }).start(() => {
            this.onSwipeComplete(direction);
        });
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props;
        const item = data[this.state.index];
        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue({ x: 0, y: 0 });
        this.setState({ index: this.state.index + 1 });
    }

    //helper method for rotating a card:
    //to rotate by a fixed amount, we can return another property on our style object called the transform property
    getCardStyle() {
        const { position } = this.state;
        //to reference just the horizontal, or x axis, just put 'position.x'
        //this is an interpolation between the distance a card has been dragged on the screen, and it's rotation
        //we are relating the top scale to the bottom scale, using something like percents
        //so -500 is equal to -120, and so forth
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
            outputRange: ['-120deg', '0deg', '120deg']
        });
        return {
            ...position.getLayout(),
            transform: [{ rotate  }]
        };
    }

    renderCards = () => {
        if (this.state.index >= this.props.data.length) {
            return this.props.renderNoMoreCards();
        }
        return this.props.data.map((item, i) => {
            if (i < this.state.index) { return null; }
            if (i === this.state.index) {
                return (
                <Animated.View
                    key={item.id}
                    style={[this.getCardStyle(), styles.cardStyle]}
                    {...this.state.panResponder.panHandlers}
                >
                    {this.props.renderCard(item)}
                </Animated.View>
                );
            } 
            return (
                <Animated.View 
                    style={[styles.cardStyle, { top: 5 * (i - this.state.index) }]} 
                    key={item.id}
                >
                    {this.props.renderCard(item)}
                </Animated.View>
                );
        }).reverse();
    }

    render() {
        return (
            <View>
                {this.renderCards()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
});

export default Deck;