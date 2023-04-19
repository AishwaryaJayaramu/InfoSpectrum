import React from 'react';
import './citydetails.css'

function layoffs(tbodyData) {
    console.log('layoffs')
    console.log(tbodyData)
    console.log(tbodyData.data)
    if (! tbodyData || tbodyData.length == 0) {
        return (<div>No Layoffs</div>);
    }
   const theadData = Object.keys(tbodyData.data[0]);
   return (
   <table>
      <thead>
         <tr>
      {theadData.map(heading => {
         return <th key={heading}>{heading}</th>
      })}
      </tr>
      </thead>
      <tbody>
      {tbodyData.data.map((row, index) => {
      return <tr key={index}>
      {theadData.map((key, index) => {
      return <td key={index}>{row[key]}</td>
      })}
      </tr>;
      })}
      </tbody>
   </table>
   );
}

export default layoffs;