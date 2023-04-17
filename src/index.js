// Run: 
// NODE_OPTIONS=--openssl-legacy-provider npm start

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Search from './Search';
import Results from './Results';
import reportWebVitals from './reportWebVitals';
import {createStore} from 'redux';
import rootReducer from './store/combineReducer'
import {Provider} from 'react-redux';



const store = createStore(rootReducer,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

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
    <Provider store ={store}>
      <App />
    </Provider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();