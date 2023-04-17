import * as MainActions from '../Actions/actionConstants'


function DescriptionReducer(state = "", action)
{
    
    
    switch (action.type) {
        case MainActions.SET_DESCRIPTION:
            return action.value
            break;
            
    
        default:
            return state;
            break;
    }
}

export default DescriptionReducer;