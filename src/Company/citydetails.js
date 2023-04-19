import React from 'react';
import './citydetails.css'

function cityDetails(tbodyData) {
   if (! tbodyData || tbodyData.length == 0) {
      return (<div>No cities found</div>);
   } else if (tbodyData.error) {
      return (<div>{tbodyData.error}</div>);
   }
   const theadData = Object.keys(tbodyData[0]);
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
      {tbodyData.map((row, index) => {
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

export default cityDetails;