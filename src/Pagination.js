import React from 'react';

const Pagination = ({ transactionsPerPage, totalTransactions, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalTransactions / transactionsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div style={{ marginTop: '10px', textAlign: 'center' }}>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center' }}>
        {pageNumbers.map(number => (
          <li key={number} style={{ margin: '0 5px' }}>
            <button onClick={() => paginate(number)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: currentPage === number ? '#007bff' : '#fff', color: currentPage === number ? '#fff' : '#000', border: '1px solid #007bff', borderRadius: '5px' }}>
              {number}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pagination;
