import React from "react";
import {
  Card,
  CardSubtitle,
  CardText,
  CardBody,
} from "reactstrap";

class Reviews extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        currentPage: 1,
        };
    }

  render (){
    const { tbodyData } = this.props;
    const { currentPage } = this.state;
    if (!tbodyData || tbodyData.length === 0) {
        return <div>No Reviews Found</div>;
      } else if (tbodyData.error) {
        return <div>{tbodyData.error}</div>;
      }
  
      const theadData = Object.keys(tbodyData[0]);
      const startIndex = (currentPage - 1) * 1;
      const endIndex = startIndex + 1;
      const paginatedData = tbodyData.slice(startIndex, endIndex);
      const totalPages = Math.ceil(tbodyData.length / 1);
      const paginationButtons = [];
      for (let i = 1; i <= totalPages; i++) {
        paginationButtons.push(
          <button
            key={i}
            className={`pagination-button ${
              i === currentPage ? "active" : ""
            }`}
            onClick={() => this.setState({ currentPage: i })}
          >
            {i}
          </button>
        );
      }
    return(
        <div>
    <Card style={{ width: '600px' }}>
      <CardBody >
            {paginatedData.map((row) => {
              return <div>
            <div className="reviews-top">
            <CardSubtitle tag="h6">
            {row['author_info']}
            </CardSubtitle>
              <CardText tag="h4">{row['title']} </CardText>
              <CardText tag="h5">Rating: {row['rating']} </CardText>
              </div>
              <div>
              <CardText><b>Pros</b>: {row['pros']} </CardText>
              <CardText><b>Cons</b>: {row['cons']} </CardText>
              </div>
              </div>
            //   </div>
            })} 
      </CardBody>
    </Card>
     <div className="pagination-container">
     <div className="pagination">
       <button
         className="pagination-button"
         disabled={currentPage === 1}
         onClick={() => this.setState({ currentPage: currentPage - 1 })}
       >
        &lt; Prev 
       </button>
       {/* {paginationButtons} */}
       <button
         className="pagination-button"
         disabled={endIndex >= tbodyData.length}
         onClick={() => this.setState({ currentPage: currentPage + 1 })}
       >
         Next &gt;
       </button>
     </div>
   </div>
   </div>
    );
  }

}

export default Reviews;

