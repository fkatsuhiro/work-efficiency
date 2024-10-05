import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

function MemoItem({ memo, onUpdate, onDelete, fetchMemos }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(memo.content);
  // バリデーションチェック用
  const [emptyContentError, setEmptyContentError] = useState('');

  const handleUpdate = async () => {

    if (!editedContent.trim()) {
      setEmptyContentError('編集するメモの内容を入力してください。');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/memos/${memo.id}`,
        { content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(memo.id);
      await fetchMemos();
      setIsEditing(false);
    } catch (error) {
      console.error('Update Error:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/memos/${memo.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      onDelete(memo.id);
      await fetchMemos();
    } catch (error) {
      console.error('Delete Error:', error.response ? error.response.data : error.message);
    }
  };

  // モーダルを閉じる際に編集内容をリセット
  const handleClose = () => {
    setEditedContent(memo.content); // 元の内容にリセット
    setIsEditing(false); // モーダルを閉じる
  };

  return (
    <div className="container mt-3">
      <div className="sticky-note">
        <p className="memo-text">{memo.content}</p>
        <div className="d-flex justify-content-end position-absolute" style={{ bottom: '10px', right: '10px' }}>
          <p>{memo.createdAt}</p>
          <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm me-2">edit</button>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">del</button>
        </div>
      </div>

      {/* Bootstrapモーダルで編集機能を実装 */}
      <Modal show={isEditing} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>メモを編集</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Edit memo content"
            className="form-control"
          />
          {emptyContentError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyContentError}</p>} {/* エラーメッセージを表示 */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            保存
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .sticky-note {
          position: relative;
          min-height: 150px;
        }
      `}</style>
    </div>
  );
}

export default MemoItem;
