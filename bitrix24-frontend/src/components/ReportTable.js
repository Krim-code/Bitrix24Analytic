import React from 'react';

function ReportTable({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const headers = Object.keys(data[0]);

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-2">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="bg-gray-100">
            {headers.map((header) => (
              <td key={header} className="border px-4 py-2">{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ReportTable;
