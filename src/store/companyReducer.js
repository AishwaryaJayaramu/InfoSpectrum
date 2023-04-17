import * as MainActions from '../Actions/actionConstants'


function CompanyReducer(state = "", action)
{
    
    switch (action.type) {
        case MainActions.SET_COMPANY:
            return action.value
            break;
            
    
        default:
            return state;
            break;
    }
}

export default CompanyReducer;