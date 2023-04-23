import React from 'react';
import './citydetails.css';

class CityDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
    };
  }

  render() {
    const { tbodyData } = this.props;
    const { currentPage } = this.state;

    if (!tbodyData || tbodyData.length === 0) {
      return <div>No cities found</div>;
    } else if (tbodyData.error) {
      return <div>{tbodyData.error}</div>;
    }

    const theadData = Object.keys(tbodyData[0]);
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedData = tbodyData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(tbodyData.length / 10);

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

    return (
      <div>
        <table>
          <thead>
            <tr>
              {theadData.map((heading) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                {theadData.map((key, index) => (
                  <td key={index}>{row[key]}</td>
                ))}
              </tr>
            ))}
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
              disabled={endIndex >= tbodyData.length}
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

export default CityDetails;
