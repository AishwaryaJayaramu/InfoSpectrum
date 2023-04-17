import * as mainActions from '../Actions/actionConstants'

function TweetReducer(state = 0, action)
{
    
    switch (action.type) {
        case mainActions.CLEAR_FETCHED_TWEETS:
            state = Object.assign([])
            break;
        case mainActions.TWEET_DATA_STREAM:
            let newList
            if(state==0)
                {console.log(action.value)
                console.log(typeof action.value)
                newList = [JSON.parse(action.value)]
                console.log(typeof newList)}
                
            else
                {newList = [JSON.parse(action.value)].concat(state.slice(0, 15));}
            return newList
            break
        default:
            return state;
            break;
    }
}

export default TweetReducer;