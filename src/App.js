import { Alchemy, Network } from 'alchemy-sdk';
import React, { useEffect, useState } from 'react';
import {utils} from 'ethers';
import 'react-data-grid/lib/styles.css';
import Pagination from './Pagination';
// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface

const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blockTransactions, setBlockTransactions] = useState([]);
  const [transactionSelected, setTransactionSelected] = useState("");

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }

    getBlockNumber();
  },[]);

  useEffect(() => {
    async function setTransactions() {
      try {
        const { transactions } = await alchemy.core.getBlockWithTransactions(blockNumber)
      
        setBlockTransactions(transactions);
      } catch (error) {
        setBlockTransactions([]);
      }
    }

    setTransactions();
  },[blockNumber]);

  const calcFee = (transaction, toFixed) => {
    const gasFee = transaction.gasLimit * transaction.gasPrice

    if(gasFee.toString() === "NaN") return "0";
    
    return parseFloat(utils.formatEther(gasFee.toString())).toFixed(toFixed)
  }

  const previousBlock = () => {
    const actualBlocknumber = blockNumber - 1 < 0 ? 0 : blockNumber - 1 
    setBlockNumber(actualBlocknumber)
  }

  const nextBlock = () => {
    const actualBlocknumber = blockNumber + 1 
    setBlockNumber(actualBlocknumber)
  }

  const getSubstring = (data, index) => {
    try {
      return `${data.substring(0,index)}...`
    } catch (error) {
      return ''
    }
  }

  const getTransaction = (hash) => {
    const transactions = [...blockTransactions];
    const index = transactions.findIndex(tx => tx.hash === hash)
    if(index >= 0) return transactions[index];

    return {};
  }

  const Block = () => {
    return (
      <>
        <div style={{
            display: "flex", 
            justifyContent: "center", 
            marginTop: 24, 
            fontSize: 24,
          }}>
          <b>Block Details</b>
        </div>
        <div style={{
            display: "flex", 
            justifyContent: "center", 
            marginTop: 24
          }}>
          <button 
            style={{ marginRight: 24, padding: "8px 16px", fontSize: 16, borderRadius: 8, background: "#007bff", color: "white", border: "none", cursor: "pointer" }} 
            onClick={() => previousBlock()}
          >
            Previous Block
          </button>
          <p style={{ fontSize: 20, fontWeight: "bold", margin: 0 }}>
            {`Block Number: ${blockNumber}`}
          </p>
          <button 
            style={{ marginLeft: 24, padding: "8px 16px", fontSize: 16, borderRadius: 8, background: "#007bff", color: "white", border: "none", cursor: "pointer" }} 
            onClick={() => nextBlock()}
          >
            Next Block
          </button>
        </div>
      </>
    );
  }

  const Transactions = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]); // Track selected rows
    const transactionsPerPage = 5; // Adjust this value as needed
    const maxPageNumbers = 10; // Maximum number of page numbers to display
    const totalPages = Math.ceil(blockTransactions.length / transactionsPerPage);

    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = blockTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    // Logic to display page numbers
    const pageNumbers = [];
    for (let i = Math.max(1, currentPage - Math.floor(maxPageNumbers / 2)); i <= Math.min(totalPages, currentPage + Math.floor(maxPageNumbers / 2)); i++) {
        pageNumbers.push(i);
    }

    // Function to handle row selection
    const handleSelectTransaction = (hash, index) => {
        
        const newSelectedRows = [...selectedRows];
        const selectedIndex = newSelectedRows.indexOf(index);
        if (selectedIndex === -1) {
            newSelectedRows.push(index);
        } else {
            newSelectedRows.splice(selectedIndex, 1);
        }
        setSelectedRows(newSelectedRows);

        if(blockTransactions.length === 0) 
          setTransactionSelected('');
        else 
          setTransactionSelected(hash);

    };

    return (
        <div style={{ padding: "0 20px" }}>
            <div style={{ marginTop: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc", borderRadius: "8px" }}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "white" }}>
                        <tr>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>Transaction Hash</th>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>Block</th>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>From</th>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>To</th>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>Confirmations</th>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>Value</th>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>Transaction Fee</th>
                            <th style={{ backgroundColor: "#f2f2f2", padding: "8px" }}>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTransactions.map((transaction, index) => (
                            <tr key={transaction.hash} onClick={() => handleSelectTransaction(transaction.hash, index)} style={{ backgroundColor: selectedRows.includes(index) ? "#007bff" : (index % 2 === 0 ? "#ffffff" : "#f2f2f2") }}>
                                <td style={{ padding: "8px" }}>{getSubstring(transaction.hash, 15)}</td>
                                <td style={{ padding: "8px" }}>{transaction.blockNumber}</td>
                                <td style={{ padding: "8px" }}>{getSubstring(transaction.from, 15)}</td>
                                <td style={{ padding: "8px" }}>{getSubstring(transaction.to, 15)}</td>
                                <td style={{ padding: "8px" }}>{transaction.confirmations}</td>
                                <td style={{ padding: "8px" }}>{parseFloat(utils.formatEther(transaction.value.toString())).toFixed(12)}</td>
                                <td style={{ padding: "8px" }}>{calcFee(transaction, 5)}</td>
                                <td style={{ padding: "8px" }}>{getSubstring(transaction.data, 15)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div style={{ textAlign: "right", marginTop: 10, padding: "8px"  }}>
                    {pageNumbers.map(number => (
                        <button key={number} onClick={() => paginate(number)} style={{ margin: "2px", padding: "5px 10px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "5px", background: currentPage === number ? "#007bff" : "#ffffff", color: currentPage === number ? "#ffffff" : "#000000" }}>
                            {number}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

  const Detail = (props) => {
    return (
      <div style={{
        display:"flex", 
        flexDirection: "row",
        justifyContent:"flex-start", 
        marginLeft: 24, 
        fontSize: 14,
      }}>
        <p style={{marginLeft: 10, marginRight: 10, fontWeight: "bold"}}>{props.name}:</p>
        <p>{props.value}</p>
      </div>
    )
  }

  const TransactionDetail = (props) => {
    const hasData = Object.values(props.transaction).some(val => val !== undefined && val !== null && val !== '');
    
    return (
        <div style={{ padding: "0 20px" }}>
            <div style={{ marginTop: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>Transaction Details</h1>

                <div style={{ marginTop: 20 }}>
                    {hasData ? (
                        <table style={{ width: "100%", maxWidth: "1200px", margin: "auto", border: "1px solid #ccc", borderRadius: "8px" }}>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>Transaction Hash:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>{props.transaction.hash}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>Block:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>{props.transaction.blockNumber}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>From:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>{props.transaction.from}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>To:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>{props.transaction.to}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>Confirmations:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>{props.transaction.confirmations}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>Value:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>{(props.transaction?.value !== undefined && props.transaction?.value !== null) ? parseFloat(utils.formatEther(props.transaction?.value.toString())) : "No data found"}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>Transaction Fee:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>{calcFee(props.transaction, 18) || "No data found"}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold", textAlign: "right", paddingRight: "10px", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px" }}>Data:</td>
                                    <td style={{ textAlign: "left", paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px", wordBreak: 'break-all' }}>{props.transaction.data || "No data found"}</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ textAlign: "center" }}>No data available</p>
                    )}
                </div>
            </div>
        </div>
    )
}

  return (
    <>
      <Block />
      <Transactions />
      <TransactionDetail transaction={getTransaction(transactionSelected)}/>
    </>
  );
} export default App;