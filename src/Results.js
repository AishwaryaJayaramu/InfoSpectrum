import React, {useState, useEffect, useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { FaCaretLeft } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import moment from 'moment';
import { PieChart } from 'react-minimal-pie-chart';

import Layoffs from './Company/layoffs.js';
import CityDetails from './Company/citydetails';
import Reviews from './Company/reviews.js';
import './Results.css';



function Results(props) {
 // const query = location.state.query;
  const navigate = useNavigate();

  const location = useLocation();
  if (location.state == null || location.state.query == null){
    return (
      <div>
        <h2>Error.</h2>
        <p>There is no query to display.</p>
        <button onClick={() => {navigate('/search'); window.location.reload()}}>Go to Search</button>
      </div>
    );
  }
  const query = location.state.query;
  //const endpoint_1 = `http://localhost:8000/place/image/${query}`;
  //const [data, setData] = useState(null);
  //const [error_1, setError] = useState(null);
  //fetch(endpoint_1)
  //      .then(response => response.json())
  //      .then(data => setData(data))
  //      .catch(error => setError(error));
  const stocksRef = React.useRef(null);
  return (
      <div>
        {/* Search bar at the top */}
        <div style={{backgroundColor: "#5772ba", borderColor: "#0ebaa6", height:'50px', width: '100%', display: "flex"}} className="search-bar">
                <button style={{backgroundColor: "#FFFFFF", borderRadius: '50%', borderColor: "#0ebaa6", height:'50px', width: '50px'}} onClick={() => {navigate('/search'); window.location.reload()}}>
                  <FaCaretLeft />
                </button>
                <div style={{marginLeft: "auto",top: '0', height: '50px'}} className="title">
  <h3 style={{height: '50px', margin: '0', marginRight: '10px', color: 'black'}}>InfoSpectrum</h3>

                </div>
        </div>

        {/* Picture below search bar */}
        {/* As of writing API isn't working so random picture is served instead */}



        {/* Cards */}
        <div className="card-container">
          <Card query={query} card_type="1"/>
          <Card query={query} card_type="2"/>
          <Card query={query} card_type="3"/>
          <Card query={query} card_type="4"/>
          <Stocks query={query} card_type="5"/>
          <Card query={query} card_type="6"/>
          <Card query={query} card_type="7"/>
          <Card query={query} card_type="8"/>
        </div>
      </div>
  );
}

function Stocks(props) {
  console.log(props)
  const [data, setData] = useState(null);
  const stocksRef = React.useRef(null);
  useEffect(() => {
      const endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/history/${props.query}`;
      const fetchData = async () => {
          const response = await fetch(endpoint);
          setData(await response.json());
      } 
  
      fetchData();
  }, [props.query]);

  const data_pristine = data
  const formatXAxisTick = (tickItem) => {
      return moment(tickItem).format('D MMM');
  }
  const [selectedArea, setSelectedArea] = useState({});
  const [domain, setDomain] = useState(data ? [0, data.length - 1] : [0, 0]);
  
  const handleAreaSelect = (e) => {
      if (typeof(e.e) !== 'undefined') {
          setDomain([e.e.dataIndex1, e.e.dataIndex2]);
          setData(data_pristine.slice(Math.min( e.e.dataIndex1, e.e.dataIndex2),Math.max( e.e.dataIndex1, e.e.dataIndex2)));
          setSelectedArea({});
      } else {
          setSelectedArea({});
      }
  };
  const resetAreaSelect = () => {
      setData(data_pristine);
      setSelectedArea({});
  }

  if (data) {
    return (
      <div className="card other-cards" style={{width: '90%',height: '500px'}} key={data}>
        <h2 style={{ textAlign: 'center' }}>Stock Price</h2>

        {data ? (
          <ResponsiveContainer width="95%" height="85%" key={typeof(data)}>
            <LineChart width={1000} height={300} data={data} onMouseDown={(e) => {if (e) setSelectedArea({ x1: e.activeLabel }); console.log('onMouseDown')}} onMouseMove={(e) => {if (e) selectedArea.x1 && setSelectedArea({ ...selectedArea, x2: e.activeLabel })}} onMouseUp={(e) => {
              const dataIndex1 = data.findIndex((d) => d.date === selectedArea.x1);
              const dataIndex2 = data.findIndex((d) => d.date === selectedArea.x2);
              handleAreaSelect({e: {dataIndex1, dataIndex2}})}}>
              <XAxis dataKey="date" stroke="#000" tickFormatter={formatXAxisTick} domain={[domain[0], domain[1]]} />
              <YAxis stroke="#000" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dot={false} dataKey="Price" stroke="#5772ba" strokeWidth={6}/>
              {selectedArea.x1 && selectedArea.x2 && (
                <ReferenceArea
                  x1={selectedArea.x1}
                  x2={selectedArea.x2}
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          // Render a loading indicator if data is null
          <div>Loading...</div>
        )}
      </div>
    );
  }
}


function Card(props) {
  const card_type = props.card_type;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [arrayData, setArrayData] = useState([]);
  const [layoffData, setLayoffData] = useState([]);
  var flag = false
  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        let endpoint;

        if (card_type === '1') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/description/${props.query}`;
        } else if (card_type === '2') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/company/${props.query}`;
        } else if (card_type === '3') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/tweets/${props.query}`;
        } else if (card_type === '4') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/sentiment_analysis/${props.query}`;
        } else if (card_type === '5') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/history/${props.query}`;
        } else if (card_type === '6') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/location_scores/${props.query}`;
        } else if (card_type === '7') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/layoff/${props.query}`;
        } else if (card_type === '8') {
          endpoint = `https://flask-app-z7j2wggxkq-uc.a.run.app/fetch_reviews/${props.query}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (isSubscribed) {
          if (card_type==6 || card_type == 8){
            setArrayData(data);
          } 
          if (card_type == 7){
            setLayoffData(data);
          }
          setData(data);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [card_type, props.query]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrevClick = () => {
    setActiveIndex((activeIndex - 1 + data.length) % data.length);
  };

  const handleNextClick = () => {
    setActiveIndex((activeIndex + 1) % data.length);
  };
  const abc = data

  if (card_type === '1') {
    const source =JSON.stringify(data)
    const obj = JSON.parse(source);
    return (
      <div className="card" style={{width: "90%"}}>
        <div className="description-card">
        <h2>{props.query.charAt(0).toUpperCase() + props.query.slice(1)}</h2>
        <hr />
        {data && <p style={{overflowY: "auto"}}>{obj.description}</p>}
        </div>
      </div>
    ) 
  }  else if (card_type === '2') {
    if (error) {
      return (
        <div className="card other-cards" style={{width: '25%'}}>
          <h2>ERROR</h2>
          <p>{error.message}</p>
        </div>
      );
    } else if (data) {
      if (Array.isArray(data)) { // Will implement more to have a carousel, spent too much time on this already before getting the other functional
        const data_map=data.map((item, index) => (
          <div key={index}>
            <h2>{item.title}</h2>
            <p>{item.source.name} - {item.author}</p>
            <p>{item.description}</p>
            <p>Read more <a href={item.url}>here.</a></p>
          </div>
        ))
        return (
          <div className="card" style={{height: "390px"}}>
            <h2 style={{marginBottom: "0px"}}>News</h2>
            <hr />
            <div className="carousel-container" style={{height: "280px"}}>
              <div className="carousel">
                {data.map((item, index) => (
                  <div
                    key={item.id}
                    className={`slide ${index === activeIndex ? 'active' : ''}`}
                  >
                    <h2>{item.title}</h2>
                    <p>{item.content.slice(0,-13)}</p>
                    <p>Read more <a href={item.url}>here</a></p>
                  </div>
                ))}
              </div>
            </div>
            <div className="arrows">
                <span className="arrow prev" onClick={handlePrevClick} >
                  &#10094;
                </span>
                <span className="arrow next" onClick={handleNextClick}>
                  &#10095;
                </span>
              </div>
          </div>
        );
      } else {
        const data__ = JSON.stringify(data[0])
        const source = JSON.parse(data__)
        return (
          <div className="card other-cards" style={{width: '25%'}}>
            <h2>{source.title}</h2>
            <p>{source.source.name} - {source.author}</p>
            <p>{source.description}</p>
            <p>Read more <a href={source.url}>here.</a></p>
          </div>
        );
      }
    } else {
      return (
        <div className="card other-cards" style={{width: '25%'}}>
          <h2>Not Found</h2>
        </div>
      );
    }
  } else if (card_type === '3') {
    if (data) {
      return (
        <div className="tweets-card" >
          <h2 style={{ marginBottom: '0.5rem' }}>Tweets</h2>
          <hr />
          <div >
            {data.map((item, index) => (
              
                <div key={index} className="tweet-container" style={{overflowY: "auto"}}>
                <img src="https://static.cdnlogo.com/logos/t/96/twitter-icon.svg" alt="default-avatar" className="tweet-avatar" />
                <div className="tweet-text">
                  {item.hashtags.map((hashtag, index) => (
                    <p key={index} className="tweet-hashtag">{`#${hashtag}`}</p>
                  ))}
                  <a href={item.link} className="tweet-link">{item.description}</a>
                  <hr className="tweet-divider" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }
  
   else if (card_type === '4') {
    console.log(data)
    if (data && (data.Positive + data.Neutral + data.Negative) > 0) {
      const [Positive, Neutral, Negative] = [(data.Positive), parseFloat(data.Neutral), parseFloat(data.Negative)]
      return (
        <div className="card other-cards" style={{ width: '25%', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Analysis</h2>
          <hr />
          <PieChart
            animation
            animationDuration={500}
            animationEasing="ease-out"
            data={[            { title: 'Positive', value: Positive, color: '#5cb85c' },            { title: 'Neutral', value: Neutral, color: '#f0ad4e' },            { title: 'Negative', value: Negative, color: '#d9534f' },          ]}
            lineWidth={50}
            paddingAngle={3}
            radius={30}
          />
          <Legend
            wrapperStyle={{
              position: 'absolute',
              top: 90,
              right: 0,
              marginRight: '1rem',
              marginTop: '1rem',
              flexDirection: 'column',
            }}
            verticalAlign="top"
            iconSize={10}
            iconType="circle"
            formatter={(value, entry) => `${entry.title} (${(entry.value * 100).toFixed(2)}%)`}
            payload={[            { title: 'Positive', value: Positive, color: '#5cb85c' },            { title: 'Neutral', value: Neutral, color: '#f0ad4e' },            { title: 'Negative', value: Negative, color: '#d9534f' },          ]}
          />
        </div>
      );
    }
  }
  
  

 else if (card_type === '5') {
    return (
      <div>
        <h2>Error loading stocks</h2>
      </div>
    )
  } else if (card_type === '6') {
    if(arrayData.length===0){
      console.log('no city data')
    } else {
      return (
        <div className="card" style={{width: '90%'}}>
          <h2>City Details - Scores</h2> 
          {<CityDetails tbodyData={arrayData}/>}
        </div>
      );
    }

    
  } else if (card_type === '7') {
    return (
      <div className="card" style={{width: '70%'}}>
        <h2>Layoffs</h2> 
        {<Layoffs data={layoffData}/>}
      </div>
    );

  } else if (card_type === '8') {
    return (
      <div className="card other-cards" style={{width: '25%'}}>
        <h2>Employee Reviews</h2> 
        {<Reviews tbodyData={arrayData}/>}
      </div>
    );
  } else {
    return (
      <div className="card other-cards">
        <h2>Not Found</h2>
        <p>{card_type}</p>
      </div>
    );
  }
}


export default Results;
