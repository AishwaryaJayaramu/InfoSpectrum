import React from 'react';
import socketIOClient from "socket.io-client";
import { Tweet } from 'react-tweet';
import {TransitionGroup} from 'react-transition-group';
import './company.css';
import * as mainActions from '../Actions/actionConstants';
import {Loader,Icon,Header} from "semantic-ui-react"
import { connect } from "react-redux";
import {FaTwitter} from "react-icons/fa"
class TweetList extends React.Component{

    constructor(props)
    {
        super(props);
        }
    

    componentDidMount()
    {
        const url = "http://127.0.0.1:5001/company_tweets"
        this.socket = socketIOClient(url);

        this.socket.on('connect', () => {
            console.log("Socket Connected");
        });
        
        this.socket.on("tweet", data=>{ 
            console.log(data);
            console.log(typeof data);
            this.props.twitterDataArrived(data);})
        
        
        const message =this.props.company
        this.socket.emit("start",message)

        this.socket.on("disconnect", () =>
            {
                this.socket.off("tweet")
                this.socket.removeAllListeners("tweet");
                console.log("Socket Disconnected from Server");
            })

    }

    componentDidUnmount()
    {

        this.socket.off("tweet");
        
        this.socket.removeAllListeners("tweet");
        this.socket.emit("disconnect");
        console.log("Socket Disconnected from Client"); 

        
    }
 
    render()
    {   
        let items = this.props.items
        let loading = <Loader active inline="centered" size='medium'>Fetching Live Tweets</Loader>
        if(items==0)
            return(<div className="tweets-body"><div className="tweets-heading">
            <center><FaTwitter size="40px" color="#00acee" />
            <Header.Content>Live Tweets</Header.Content></center>
        </div>{loading}</div>)
         
            let itemCards = <div className="tweets"><TransitionGroup
            transitionName="example"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
          {items.map((x, i) =>
                <Tweet key={i} data={x} />
            )}
             </TransitionGroup></div>

            /* let loading=<div>Loading</div>
            return(<div>{ this.state.Tweets.length>0 ? itemsCards:loading}</div>)*/
            return(<div className="tweets-body"><div className="tweets-heading">
            <center><FaTwitter size="40px" color="#00acee" />
            <Header.Content>Live Tweets</Header.Content></center>
        </div>
        {itemCards}</div>)
    }
}

const mapStateToProps = (state, ownProps) =>
{
    return{
        items:state.TweetReducer
    }
}

const mapDispatchToProps = dispatch => {
    return {
        twitterDataArrived: (data) => {
            dispatch({
                type: mainActions.TWEET_DATA_STREAM,
                value: data
            })
        }
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(TweetList);