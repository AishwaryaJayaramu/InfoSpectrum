import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react'; // Import useState
import { FaSearch } from 'react-icons/fa';
import './Search.css';

function Search(props) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate(); // Add useNavigate hook

  function handleSubmit(event) {
    event.preventDefault();
    console.log('Submitting query: ' + query);
    navigate('/results', { state: { query } });
 // Navigate to OtherPage component
  }

  function handleQueryChange(event) {
    setQuery(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.keyCode === 13) {
      handleSubmit(event);
    }
  }

  return (
    <div className='body-container'>
      <div className="container-main-search">
          <div className="title">
              <h1>InfoSpectrum</h1>
          </div>
          <script defer src="https://use.fontawesome.com/releases/v5.0.6/js/all.js"></script>
          <div className="search-box">
              <input
                className="search-input"
                type="text"
                name=""
                placeholder="Meta"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
              />
              <button className="search-btn">
                <FaSearch />
              </button>     
          </div>
      </div>
    </div>
  );
}

export default Search;