import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function MemoItem({ memo, onUpdate, onDelete, fetchMemos }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(memo.content);

  const handleUpdate = async () => {
    try {
      if (!editedContent) {
        console.error('Content is required');
        return;
      }
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/memos/${memo.id}`,
        { content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(memo.id); // メモのIDを親コンポーネントに渡す
      await fetchMemos(); // メモリストを再取得
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
      console.log(response.data); // 成功時のメッセージを確認
      onDelete(memo.id); // メモのIDを親コンポーネントに渡す
      await fetchMemos(); // メモリストを再取得
    } catch (error) {
      console.error('Delete Error:', error.response ? error.response.data : error.message);
    }
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

      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <h3>メモを編集</h3>
            <input
              type="text"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Edit memo content"
              className="form-control mt-3"
            />
            <div className="d-flex mt-3 justify-content-end">
              <button onClick={handleUpdate} className="btn btn-primary">保存</button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">戻る</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 5px;
          max-width: 500px;
          width: 100%;
        }
        .sticky-note {
          position: relative;
          min-height: 150px;
        }
      `}</style>
    </div>
  );
}

export default MemoItem;
