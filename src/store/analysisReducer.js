import * as mainActions from '../Actions/actionConstants'

function AnalysisReducer(state = 0, action)
{
    
    switch (action.type) {
        case mainActions.ANALYSIS_DATA_STREAM:
            let jsonformat = JSON.parse(action.value)
            state = jsonformat
            return state
            break;
        default:
            return state;
            break;
    }
}

export default AnalysisReducer;