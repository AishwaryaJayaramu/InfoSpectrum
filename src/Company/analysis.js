import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import socketIOClient from "socket.io-client";
import { connect } from "react-redux";
import * as mainActions from '../Actions/actionConstants';
import {Loader} from "semantic-ui-react"

class SentimentalAnalysis extends React.Component
{
    constructor(props)
    {
        super(props)
    }

    componentDidMount()
    {
        const url = "http://127.0.0.1:5001/sentiments"
        this.socket = socketIOClient(url);

        this.socket.on('connect', () => {
            console.log("Socket Connected");
        });
        
        this.socket.on("sentiment", data=>{ 
            console.log(data);
            this.props.AnalysisDataArrived(data);
            })
        
        
        const message =this.props.company
        this.socket.emit("start",message)

        this.socket.on("disconnect", () =>
            {
                this.socket.off("sentiment")
                this.socket.removeAllListeners("sentiment");
                console.log("Socket Disconnected from Server");
            })
    }

    componentDidUnmount()
    {

        
        this.socket.off("sentiment");
        
        this.socket.removeAllListeners("sentiment");
        this.socket.emit("disconnect");
        console.log("Socket Disconnected from Client"); 

        
    }

    render(){


        if(this.props.pie==0)
            return(<div><Loader active inline="centered" size='medium'>Fetching Information</Loader></div>)

        return(
        <div>
            <center><div className="total-tweet">Total Tweets:{this.props.pie.total_processed}</div></center>
        <div style={{ maxWidth: "800px", margin: "0 auto", height: "160px" }}>
            <ResponsivePie
        data={this.props.pie.data}
        margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors = {{ scheme: 'paired' }}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
        enableRadialLabels={false}
        radialLabelsSkipAngle={10}
        radialLabelsTextXOffset={6}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={0}
        radialLabelsLinkDiagonalLength={12}
        radialLabelsLinkHorizontalLength={12}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{ from: 'color' }}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        legends={[
            {
                anchor: 'left',
                direction: 'column',
                translateY: 0,
                itemWidth: 100,
                itemHeight: 30,
                itemTextColor: '#999',
                symbolSize: 18,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
        
        
    /><center><h4>Sentimental Analysis</h4></center>
        </div></div>)
    }
}


const mapStateToProps = (state, ownProps) =>
{
    return{
        pie:state.AnalysisReducer
    }
}

const mapDispatchToProps = dispatch => {
    return {
        AnalysisDataArrived: (data) => {
            dispatch({
                type: mainActions.ANALYSIS_DATA_STREAM,
                value: data
            })
        }
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(SentimentalAnalysis);