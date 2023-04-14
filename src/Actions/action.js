 
export const setPlace = place =>
{
    return {
        type:'SET_THE_PLACE',
        value:place
    };
};


export const setCompany = company =>
{
    return {
        type:'SET_THE_COMPANY',
        value:company
    };
};

export const setUrl =url =>
{
    return {
        type:'SET_THE_URL',
        value:url
    };
};

export const setTitle =title =>
{
    return {
        type:'SET_THE_TITLE',
        value:title
    };
};


export const setDescription = description =>
{
    return {
        type:'SET_THE_DESCRIPTION',
        value:description
    };
};


export const clearTweets = company =>
{
    return {
        type:'CLEAR_FETCHED_TWEETS',
        value:company
    };
};