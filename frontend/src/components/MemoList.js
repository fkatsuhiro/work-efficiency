import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MemoItem from './MemoItem';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap'; // Bootstrapのモーダルをインポート

function MemoList() {
  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState('');
  // 編集中のメモのIDを管理
  const [editMemoId, setEditMemoId] = useState(null);
  const [error, setError] = useState(null);
  // モーダルの表示/非表示を管理
  const [showModal, setShowModal] = useState(false);
  // 空文字チェック用のエラーメッセージ
  const [emptyContentError, setEmptyContentError] = useState('');
  // 文字数チェックのバリデーション(65文字まで)
  const [ muchContentError, setMuchContentError] = useState('');
  const navigate = useNavigate();

  const fetchMemos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Token not found");
      }

      const response = await axios.get('http://localhost:5000/memos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMemos(response.data);
    } catch (error) {
      console.error(error);
      setError(error.response?.data || "An error occurred");
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  // メモを追加する関数
  const addMemo = async () => {
    // アラートを初期状態に戻す
    setEmptyContentError('');
    setMuchContentError('');

    // 空文字の場合はエラーメッセージをセット
    if (!newMemo.trim()) {
      setEmptyContentError('メモの内容を入力してください。'); 
      return;
    }

    // 字数制限超えのバリデーション
    if (newMemo.length > 65 ) {
      setMuchContentError('65文字以内で入力してください。');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const time = new Date().toISOString(); // 現在の時刻を取得
      await axios.post(
        'http://localhost:5000/memos',
        { content: newMemo, createdAt: time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMemo('');
      setEmptyContentError('');
      setShowModal(false);
      await fetchMemos();
    } catch (error) {
      console.error(error);
      setError(error.response?.data || "Error adding memo");
    }
  };

  // メモを編集する関数
  const editMemo = async () => {
    // アラートを初期状態に戻す
    setEmptyContentError('');
    setMuchContentError('');

    // 空文字のバリデーション
    if (!newMemo.trim()) {
      setEmptyContentError('メモの内容を入力してください。');
    }

    // 字数超えのバリデーション
    if (newMemo.length > 65 ) {
      setMuchContentError('65文字以内で入力してください。');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/memos/${editMemoId}`,
        { content: newMemo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMemo('');
      setEmptyContentError('');
      setEditMemoId(null);
      setShowModal(false);
      await fetchMemos();
    } catch (error) {
      console.error(error);
      setError(error.response?.data || "Error editing memo");
    }
  };

  const handleEdit = (memo) => {
    setEditMemoId(memo.id);
    setNewMemo(memo.content); 
    setEmptyContentError(''); 
    setShowModal(true);
  };

  const handleDeleteMemo = async (memoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/memos/${memoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Memo deleted successfully');
      await fetchMemos();
    } catch (error) {
      console.error('Delete Error:', error.response ? error.response.data : error.message);
    }
  };

  // モーダルを閉じる際にエラーメッセージをリセット
  const handleCloseModal = () => {
    setEmptyContentError('');
    setShowModal(false);
  };

  return (
    <div>
      <h3 className='memo-title'>メモ一覧</h3>
      <div className='memo-area'>
        <div className='d-flex justify-content-end' style={{ paddingRight: '15px' }}>
          <Button onClick={() => { setNewMemo(''); setEditMemoId(null); setShowModal(true); }}>メモを追加</Button>
        </div>
      </div>

      <div className='outer-memo-area mt-3'>
        <div className='memo-area row'>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {/* メモリストの表示 */}
          {memos.map((memo) => (
            <div key={memo.id} className='col-md-3'>
              <MemoItem memo={memo} onEdit={() => handleEdit(memo)} onDelete={handleDeleteMemo} fetchMemos={fetchMemos} onUpdate={fetchMemos} />
            </div>
          ))}
        </div>
      </div>

      {/* Bootstrapのモーダルを使用 */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMemoId ? 'メモを編集' : 'メモを追加'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            value={newMemo}
            onChange={(e) => setNewMemo(e.target.value)}
            placeholder="メモを入力してください"
            className="form-control mt-3"
          />
          {emptyContentError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyContentError}</p>} {/* エラーメッセージを表示 */}
          {muchContentError && <p style={{ color: 'red', fontSize: '0.8rem'}} className='mt-1'>{muchContentError}</p>} {/* エラーメッセージを表示 */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>戻る</Button>
          {editMemoId ? (
            <Button variant="primary" onClick={editMemo}>保存</Button> // 編集モードの場合
          ) : (
            <Button variant="primary" onClick={addMemo}>追加</Button> // 追加モードの場合
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MemoList;
