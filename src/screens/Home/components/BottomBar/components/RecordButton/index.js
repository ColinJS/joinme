import React from 'react';
import {TouchableWithoutFeedback, Animated, StyleSheet, View} from 'react-native';
import { Svg } from 'expo';

const AnimatedPath = Animated.createAnimatedComponent(Svg.Path);
const PRESSIN_DELAY = 200

export default class RecordButton extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            display : true,
            progress: new Animated.Value(0),
        }
        this.stopping = false
    }

    componentWillMount(){

        let R = this.props.radius;
        let strokeWidth = 7
        let dRange = [];
        let iRange = [];
        let steps = 359;

        for (var i = 0; i<steps; i++){
            dRange.push(this.describeArc(R+strokeWidth+2/2, R+strokeWidth+2/2, R, 0, i));
            iRange.push(i/(steps-1));
        }


        var _d = this.state.progress.interpolate({
            inputRange: iRange,
            outputRange: dRange
        })

        this.animationData = {
            R: R,
            strokeWidth: strokeWidth,
            _d: _d,
        }
    }

    describeArc = (x, y, radius, startAngle, endAngle)=>{

        var start = this.polarToCartesian(x, y, radius, endAngle);
        var end = this.polarToCartesian(x, y, radius, startAngle);

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");

        return d;
    }

    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    startAnimation = async ()=>{
        
        this.Animation = Animated.timing(this.state.progress,{
            toValue:1,
            duration:this.props.duration,

        })
        
        this.props.onPressIn().then(res => {
            if(res){
                this.Animation.start(()=>{this.stopAnimation(false)})
            }
        })

    }


    stopAnimation = (abort=true) => {
        if(!this.stopping){
            this.stopping = true
            abort && this.Animation.stop()
            Animated.timing(this.state.progress,{
                toValue: 0,
                duration:0,
            }).start()
            this.props.onPressOut()
            this.stopping = false
        }
    }

    toggleButton = () => {
        this.setState({
            display:  !this.state.display
        })
    }


    _HandlePressIn = async ()=>{
        this.timerTimeStamp = Date.now()
        this.timer = setTimeout(()=>{
            this.startAnimation()
        }, PRESSIN_DELAY)
    }


    _HandlePressOut = async ()=>{
        let timeStamp = Date.now()
        if(timeStamp - this.timerTimeStamp <= PRESSIN_DELAY){
            clearTimeout(this.timer)
            this.props.onJustPress()
        }else{
            this.stopAnimation()
        }
    }


    render() {
        const { R, _d, strokeWidth } = this.animationData

        return (
            <View style={this.props.style}>
                {this.state.display && <TouchableWithoutFeedback style={styles.touchableStyle} onPress={this.props.onPress} onPressIn={this._HandlePressIn} onPressOut={this._HandlePressOut}>
                    <Svg 
                        style={styles.svgStyle}
                        height={R*2+13}
                        width={R*2+13}
                    >
                        <Svg.Circle
                            cx={R+strokeWidth+2/2}
                            cy={R+strokeWidth+2/2}
                            r={R}
                            stroke="grey"
                            strokeWidth={strokeWidth+1}
                            fill="none"
                        />
                        <Svg.Circle
                            cx={R+strokeWidth+2/2}
                            cy={R+strokeWidth+2/2}
                            r={R}
                            stroke="white"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        <AnimatedPath
                            d={_d}
                            stroke="red" 
                            strokeWidth={strokeWidth} 
                            fill="none"
                        />

                    </Svg>
                </TouchableWithoutFeedback>}
            </View>
        );
    }
    }

    const styles = StyleSheet.create({
        svgStyle:{
            flex:1,
        },
        touchableStyle: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }
    });