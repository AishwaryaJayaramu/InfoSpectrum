import * as mainActions from '../Actions/actionConstants'


function URLReducer(state ="", action)
{
    

    switch (action.type) {
        case mainActions.SET_URL:
            return action.value;
        break;
    
        default:
            return state;
            break;
    }
}

export default URLReducer;