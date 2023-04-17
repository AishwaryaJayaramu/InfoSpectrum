import * as mainActions from '../Actions/actionConstants'


function PlaceReducer(state ="", action)
{
    

    switch (action.type) {
        case mainActions.SET_PLACE:
            return action.value;
        break;
    
        default:
            return state;
            break;
    }
}

export default PlaceReducer;