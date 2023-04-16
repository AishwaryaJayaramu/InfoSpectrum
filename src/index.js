// Run: 
// NODE_OPTIONS=--openssl-legacy-provider npm start

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import './index.css';
import Search from './Search';
import Results from './Results';
import reportWebVitals from './reportWebVitals';
import AnalysisReducer from './reducer';

const store = configureStore({
  reducer: AnalysisReducer,
  middleware: [/* add middleware here */],
  devTools: process.env.NODE_ENV !== 'production',
});

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
  <Provider store={store}>
    <React.StrictMode>
      <Router>
        <App />
      </Router>
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();