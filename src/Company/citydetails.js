import React from 'react';


function cityDetails(posts){
    return(
    <div className="city-table">
    {posts.map((post) => {
       return (
          <div className="cities">
             <p className="city">{post['city']}</p>
          </div>
       );
    })}
 </div>
    );
}

export default cityDetails;