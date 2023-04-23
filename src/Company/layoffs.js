import React from 'react';
import './citydetails.css';

class Layoffs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 1,
      rowsPerPage: 10,
    };
  }

  handleClick = (event) => {
    this.setState({
      currentPage: Number(event.target.id),
    });
  };

  render() {
    const { data } = this.props;
    const { currentPage, rowsPerPage } = this.state;

    if (!data.data || data.data.length === 0) {
      return <div>{"No Upcoming Layoffs. You are good :)"}</div>;
    }

    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedData = data.data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.data.length / 10);

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

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data.data.length / rowsPerPage); i++) {
      pageNumbers.push(i);
    }

    const theadData = Object.keys(paginatedData[0]);

    return (
      <div>
       
        <table>
          <thead>
            <tr>
              {theadData.map((heading) => {
                return <th key={heading}>{heading}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              return (
                <tr key={index}>
                  {theadData.map((key, index) => {
                    return <td key={index}>{row[key]}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination-container">
          <div className="pagination">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() => this.setState({ currentPage: currentPage - 1 })}
            >
              Prev
            </button>
            {paginationButtons}
            <button
              className="pagination-button"
              disabled={endIndex >= data.data.length}
              onClick={() => this.setState({ currentPage: currentPage + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Layoffs;
