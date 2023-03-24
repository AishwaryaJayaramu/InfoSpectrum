import { useNavigate } from 'react-router-dom';
import React from 'react';
import './Search.css';

function Results() {
  const navigate = useNavigate(); // Add useNavigate hook

  function handleButtonClick() {
    navigate('/search'); // Navigate to Search component
  }

  return (
    <div className="container-main">
      <h2>Other Page</h2>
      <button className="res_button" onClick={handleButtonClick}>Go back to Search</button>
    </div>
  );
}

export default Results;