import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MemoItem from './MemoItem'; // MemoItemのインポート
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


function MemoList() {
  const [memos, setMemos] = useState([]);
  const [newMemo, setNewMemo] = useState('');
  const [editMemoId, setEditMemoId] = useState(null); // 編集中のメモのIDを管理
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // モーダルの表示/非表示を管理
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(null); // currentTimeを状態として管理

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
    try {
      const token = localStorage.getItem('token');
      const time = new Date().toISOString(); // 現在の時刻を取得
      await axios.post(
        'http://localhost:5000/memos',
        { content: newMemo, createdAt: time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMemo('');
      setShowModal(false); // メモを追加したらモーダルを閉じる
      await fetchMemos();
    } catch (error) {
      console.error(error);
      setError(error.response?.data || "Error adding memo");
    }
  };

  // メモを編集する関数
  const editMemo = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/memos/${editMemoId}`,
        { content: newMemo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMemo('');
      setEditMemoId(null);
      setShowModal(false);
      await fetchMemos();
    } catch (error) {
      console.error(error);
      setError(error.response?.data || "Error editing memo");
    }
  };

  const handleEdit = (memo) => {
    /*setNewMemo(memo.content); // 編集するメモの内容をテキストボックスにセット*/
    setEditMemoId(memo.id);   // 編集するメモのIDをセット
    setShowModal(true);       // モーダルを表示
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // トークンを削除
    navigate('/login'); // ログインページにリダイレクト
  };

  const handleDeleteMemo = async (memoId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/memos/${memoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Memo deleted successfully');
      //alert('Memo deleted successfully'); // 成功時に通知
      await fetchMemos(); // メモリストを再取得
    } catch (error) {
      console.error('Delete Error:', error.response ? error.response.data : error.message);
    }
  };


  return (
    <div>
      <h3 className='memo-title'>メモ一覧</h3>
      <div className='memo-area'>
        <div className='d-flex justify-content-end' style={{ paddingRight: '15px' }}>
          <button className='btn btn-primary' style={{ marginRight: '10px' }} onClick={() => { setNewMemo(''); setEditMemoId(null); setShowModal(true); }}>メモを追加</button>
          <button className='btn btn-primary' onClick={handleLogout}>ログアウト</button>
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
        <div className='mt-5'></div>
      </div>

      {/* モーダル表示部分 */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3 className='mt-3'>{editMemoId ? 'メモを編集' : 'メモを追加'}</h3>
            <input
              type="text"
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
              placeholder="メモを入力してください"
              className='mt-3 form-control'
            />
            <div className='d-flex mt-3 justify-content-end'>
              {editMemoId ? (
                <button onClick={editMemo} className='btn btn-primary'>保存</button> // 編集モードの場合
              ) : (
                <button onClick={addMemo} className='btn btn-primary'>追加</button> // 追加モードの場合
              )}
              <button onClick={() => setShowModal(false)} className='btn btn-secondary'>戻る</button>
            </div>
          </div>
        </div>
      )}

      {/* モーダル用の簡易CSS */}
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
      `}</style>
    </div>
  );
}

export default MemoList;
