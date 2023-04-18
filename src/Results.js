import React, {useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { FaCaretLeft } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import moment from 'moment';
import cityDetails from './Company/citydetails';

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
  //const [data_1, setData] = useState(null);
  //const [error_1, setError] = useState(null);
  //fetch(endpoint_1)
  //      .then(response => response.json())
  //      .then(data => setData(data))
  //      .catch(error => setError(error));
  
  return (
      <div>
        {/* Search bar at the top */}
        <div style={{backgroundColor: "#1A2237", borderColor: "#0ebaa6", height:'50px', width: '100%', display: "flex"}} className="search-bar">
                <button style={{backgroundColor: "#FE7748", borderRadius: '50%', borderColor: "#0ebaa6", height:'50px', width: '50px'}} onClick={() => {navigate('/search'); window.location.reload()}}>
                  <FaCaretLeft />
                </button>
                <div style={{marginLeft: "auto",top: '0', height: '50px'}} className="title">
                    <h3 style={{height: '50px', margin: '0', marginRight: '10px'}}>InfoSpectrum</h3>
                </div>
        </div>

        {/* Picture below search bar */}
        {/* As of writing API isn't working so random picture is served instead */}
        <img src="https://picsum.photos/800/200" alt="Random" style={{width: "100%"}}/>

        {/* Cards */}
        <div className="card-container">
          <Card query={query} card_type="1"/>
          <Card query={query} card_type="2"/>
          <Card query={query} card_type="3"/>
          <Card query={query} card_type="4"/>
          <Card query={query} card_type="5"/>
          <Card query={query} card_type="6"/>
          <Card query={query} card_type="7"/>
          <Card query={query} card_type="8"/>
        </div>
      </div>
  );
}

function Card(props) {
  const card_type = props.card_type;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [arrayData, setArrayData] = useState([]);
  var flag = false
  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        let endpoint;

        if (card_type === '1') {
          endpoint = `http://localhost:8000/description/${props.query}`;
        } else if (card_type === '2') {
          endpoint = `http://localhost:8000/company/${props.query}`;
        } else if (card_type === '5') {
          endpoint = `http://localhost:8000/history/${props.query}`;
        }else if (card_type === '6') {
          endpoint = `http://localhost:8000/location_scores/${props.query}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();

        if (isSubscribed) {
          if (card_type==6){
            setArrayData(data);
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
        <h2>{props.query}</h2>
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
          <div className="card" style={{height: "300px"}}>
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
    return (
      <div className="card other-cards" style={{width: '25%'}}>
        <h2>Tweets</h2> 
        <p>Not implemented</p>
      </div>
    );
  } else if (card_type === '4') {
    return (
      <div className="card other-cards" style={{width: '25%'}}>
        <h2>Sentiment Analysis</h2> 
        <p>Not implemented</p>
      </div>
    );
  } else if (card_type === '5') {
    var data_pristine
    if (! abc) {
      data_pristine = [
        // additional data points go here
      ];
    
    const [data, setData] = React.useState(data_pristine);
    const formatXAxisTick = (tickItem) => {
      return moment(tickItem).format('D MMM');
    }
    const [selectedArea, setSelectedArea] = useState({});
    const [domain, setDomain] = useState([0, data.length - 1]);

    const handleAreaSelect = (e) => {
      if (typeof(e.e) != 'undefined') {
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
    return (
      <div className="card other-cards" style={{width: '90%',height: '500px'}}>
        
        <h2 style={{ textAlign: 'center' }}>Stock Price</h2>
        <button onClick={resetAreaSelect}style={{backgroundColor: "#FE7748", borderRadius: '5%', height:'50px', width: '100d0px'}}>Load data</button>
      </div>
    );
          }
          data_pristine = [
            { date: '2022-01-01', Price: 10 },
            { date: '2022-01-02', Price: 15 },
            { date: '2022-01-03', Price: 20 },
            { date: '2022-01-04', Price: 15 },
            { date: '2022-01-05', Price: 10 },
            { date: '2022-01-06', Price: 10 },
            { date: '2022-01-07', Price: 15 },
            { date: '2022-01-08', Price: 20 },
            { date: '2022-01-09', Price: 15 },
            { date: '2022-01-10', Price: 10 },
            { date: '2022-01-11', Price: 10 },
            { date: '2022-01-12', Price: 10 },
            { date: '2022-01-13', Price: 30 },
            { date: '2022-01-14', Price: 5 },
            { date: '2022-01-15', Price: 10 },
            { date: '2022-01-16', Price: 10 },
            { date: '2022-01-17', Price: 15 },
            { date: '2022-01-18', Price: 20 },
            { date: '2022-01-19', Price: 15 },
            { date: '2022-01-20', Price: 10 },
            { date: '2022-01-21', Price: 10 },
            { date: '2022-01-22', Price: 15 },
            { date: '2022-01-23', Price: 20 },
            { date: '2022-01-24', Price: 15 },
            { date: '2022-01-25', Price: 10 },
            { date: '2022-01-26', Price: 10 },
            { date: '2022-01-27', Price: 15 },
            { date: '2022-01-28', Price: 20 },
            { date: '2022-01-29', Price: 15 },
            { date: '2022-01-30', Price: 10 },
            { date: '2022-02-01', Price: 10 },
            { date: '2022-02-02', Price: 10 },
            { date: '2022-02-03', Price: 30 },
            { date: '2022-02-04', Price: 5 },
            { date: '2022-02-05', Price: 10 },
            { date: '2022-02-06', Price: 10 },
            { date: '2022-02-07', Price: 15 },
            { date: '2022-02-08', Price: 20 },
            { date: '2022-02-09', Price: 15 },
            { date: '2022-02-10', Price: 10 },
            // additional data points go here
          ];
        const source = JSON.parse(abc).Open
        const dates = {};
        for (const epoch in source) {
          const date = new Date(parseInt(epoch));
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          dates[dateString] = source[epoch];
        }
        data_pristine = Object.entries(dates).map(([date, Price]) => ({ date, Price }));
        const [data_1, setData_1] = React.useState(data_pristine);
        const formatXAxisTick = (tickItem) => {
          return moment(tickItem).format('D MMM');
        }
        const [selectedArea, setSelectedArea] = useState({});
        const [domain, setDomain] = useState([0, data_1.length - 1]);
    
        const handleAreaSelect = (e) => {
          if (typeof(e.e) != 'undefined') {
            setDomain([e.e.dataIndex1, e.e.dataIndex2]);
            setData_1(data_pristine.slice(Math.min( e.e.dataIndex1, e.e.dataIndex2),Math.max( e.e.dataIndex1, e.e.dataIndex2)));
            setSelectedArea({});
          } else {
            setSelectedArea({});
          }
        };
        const resetAreaSelect = () => {
          setData_1(data_pristine);
          setSelectedArea({});
        }
        return (
          <div className="card other-cards" style={{width: '90%',height: '500px'}}>
            
            <h2 style={{ textAlign: 'center' }}>Stock Price</h2>
            <button onClick={resetAreaSelect}style={{backgroundColor: "#FE7748", borderRadius: '5%', height:'50px', width: '100d0px'}}>Load New Data</button>
            <ResponsiveContainer width="95%" height="85%">
             <LineChart width={1000} height={300} data={data_1} onMouseDown={(e) => {setSelectedArea({ x1: e.activeLabel }); console.log('onMouseDown')}} onMouseMove={(e) => selectedArea.x1 && setSelectedArea({ ...selectedArea, x2: e.activeLabel })} onMouseUp={(e) => {
                  const dataIndex1 = data_1.findIndex((d) => d.date === selectedArea.x1);
                  const dataIndex2 = data_1.findIndex((d) => d.date === selectedArea.x2);
                  handleAreaSelect({e: {dataIndex1, dataIndex2}})}}>
              <XAxis dataKey="date" stroke="#000" tickFormatter={formatXAxisTick}domain={[domain[0], domain[1]]} />
              <YAxis stroke="#000" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dot={false} dataKey="Price" stroke="#5BDC95" strokeWidth={6}/>
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
          </div>
        );
  } else if (card_type === '6') {
    if(arrayData.length===0){
      return (
        <div className="card other-cards" style={{width: '60%'}}>
          <h2>City Details</h2> 
          <p>Loading...</p>
        </div>
      );
    }
    return (
      <div className="card other-cards" style={{width: '90%'}}>
        <h2>City Details - Scores</h2> 
        {cityDetails(arrayData)}
      </div>
    );
  } else if (card_type === '7') {
    return (
      <div className="card other-cards" style={{width: '25%'}}>
        <h2>Layoffs</h2> 
        <p>Not implemented</p>
      </div>
    );
  } else if (card_type === '8') {
    return (
      <div className="card other-cards" style={{width: '60%'}}>
        <h2>Employee Reviews</h2> 
        <p>Not implemented</p>
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
