import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { jsPDF } from 'jspdf';
import axios from 'axios';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import DocumentItem from './DocumentItem';

function DocumentList() {
  const [markdown, setMarkdown] = useState('');
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [documentName, setDocumentName] = useState('');
  // ドキュメント名が空の場合
  const [emptyDocumentNameError, setEmptyDocumentNameError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/documents', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  /* プレビュー処理 */
  const handlePreview = () => {
    if (!markdown.trim()) {
      alert('文章を入力してください。');
    } else {
      const previewElement = document.getElementById('preview');
      previewElement.innerHTML = marked(markdown);
      previewElement.classList.add('preview-style');
    }
  };

  /* PDF出力処理 */
  const handlePDFExport = () => {
    if (!markdown.trim()) {
      alert('文書を入力してください。');
    } else {
      const pdf = new jsPDF();
      const previewElement = document.getElementById('preview');

      html2canvas(previewElement).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save('document.pdf');
      });
    }
  };

  // ドキュメントを追加する
  const handleAddDocument = async () => {
    if (!documentName.trim()) {
      setEmptyDocumentNameError('ドキュメント名を入力してください。');
      return;
    }

    try {
      await axios.post('http://localhost:5000/documents', {
        content: markdown,
        name: documentName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMarkdown('');
      setDocumentName('');
      setShowModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const loadDocument = async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/documents/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMarkdown(response.data.content);
  };

  // ドキュメントを削除した後にタスク一覧を更新
  const handleDeleteDocument = () => {
    fetchDocuments();
  };


  const openModal = () => {
    if (!markdown.trim()) {
      alert('文書を入力してください。');
    } else {
      setShowModal(true);
    }
  };

  return (
    <div style={{ paddingTop: '20px', width: '100%' }} className='row'>
      <div className='col-2'>
        <ul>
          {documents.map((doc) => (
            <li key={doc.id} style={{ listStyle: 'none' }}>
              <DocumentItem document={doc} onDelete={handleDeleteDocument} onView={() => loadDocument(doc.id)} />
            </li>
          ))}
        </ul>

      </div>
      <div className='col-5'>
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Markdownを入力..."
          style={{ width: '100%', height: '79vh' }}
        />
      </div>
      <div className='col-5'>
        <div className='d-flex justify-content-end'>
          <button onClick={handlePreview} className='btn btn-secondary'>プレビュー</button>
          &nbsp;
          <button onClick={handlePDFExport} className='btn btn-secondary'>PDF出力</button>
          &nbsp;
          <button onClick={openModal} className='btn btn-secondary'>ドキュメントを追加</button>
        </div>
        <div id="preview" className='preview-area'>
          {/* preview area */}
        </div>
      </div>

      {/* モーダル */}
      {showModal && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>ドキュメント名を入力してください</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="ドキュメント名"
              className='form-control'
            />
            {emptyDocumentNameError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyDocumentNameError}</p>} {/* エラーメッセージを表示 */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>キャンセル</Button>
            <Button variant="primary" onClick={handleAddDocument}>追加</Button>
          </Modal.Footer>
        </Modal>
      )}

    </div>
  );
}

export default DocumentList;
