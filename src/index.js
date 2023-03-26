// Run: 
// NODE_OPTIONS=--openssl-legacy-provider npm start

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Search from './Search';
import Results from './Results';
import reportWebVitals from './reportWebVitals';

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Search />} />
        <Route exact path="/search" element={<Search />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();