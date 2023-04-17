import CompanyReducer from './companyReducer';
import PlaceReducer from './placeReducer';
import URLReducer from './urlReducer';
import {combineReducers} from 'redux';
import TitleReducer from './titleReducer';
import TweetReducer from './tweetReducer'
import DescriptionReducer from './descriptionReducer';
import AnalysisReducer from './analysisReducer'

const rootReducer = combineReducers({
    company:CompanyReducer,
    title:TitleReducer,
    url:URLReducer,
    description:DescriptionReducer,
    Place:PlaceReducer,
    TweetReducer,
    AnalysisReducer

});

export default rootReducer;