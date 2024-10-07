import React from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';


function DocumentItem({ document, onDelete, fetchDocuments, onView }) {
  // 環境変数を参照
  const apiUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.REACT_APP_API_URL_DEV
      : process.env.REACT_APP_API_URL_PROD;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/documents/${document.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(document.id);
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  return (
    <div className='mt-2 row' style={{ fontWeight: 'bold' }}>
      <div className='col-7'>{document && document.name ? (
        document.name
      ) : (
        document.id
      )}</div>
      <div className='col-5 d-flex' style={{ textAlign: 'right' }}>
        <button className='btn btn-secondary btn-sm' onClick={onView}>view</button>
        &nbsp;
        <button className='btn btn-danger btn-sm' onClick={handleDelete}>del</button>
      </div>
    </div>
  );
}

export default DocumentItem;
