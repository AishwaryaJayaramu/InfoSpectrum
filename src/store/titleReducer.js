import * as mainActions from '../Actions/actionConstants'


function TitleReducer(state ="", action)
{
    

    switch (action.type) {
        case mainActions.SET_TITLE:
            return action.value;
        break;
    
        default:
            return state;
            break;
    }
}

export default TitleReducer;