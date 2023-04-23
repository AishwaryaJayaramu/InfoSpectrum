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

    if (!data || data.length === 0) {
      return <div>No Layoffs</div>;
    }

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.data.slice(indexOfFirstRow, indexOfLastRow);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(data.data.length / rowsPerPage); i++) {
      pageNumbers.push(i);
    }

    const theadData = Object.keys(currentRows[0]);

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
            {currentRows.map((row, index) => {
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
        <div className="pagination">
          {pageNumbers.map((number) => {
            return (
              <button
                key={number}
                id={number}
                onClick={this.handleClick}
                className={currentPage === number ? 'active' : null}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Layoffs;
