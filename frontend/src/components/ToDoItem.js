import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'react-bootstrap';

function ToDoItem({ todo, fetchTodos }) {
    // 編集モードの状態管理
    const [isEditing, setIsEditing] = useState(false);
    // 編集用のToDoの内容
    const [editedContent, setEditedContent] = useState(todo.content);
    // チェックボックスの状態を管理
    const [isCompleted, setIsCompleted] = useState(todo.completed);
    // バリデーションチェック用
    const [emptyContentError, setEmptyContentError] = useState('');

    // ToDoの完了状態を切り替える関数
    const handleToggleComplete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/todos/${todo.id}`, {
                content: todo.content,
                completed: !isCompleted, // 反転させる
                today_todo_status: todo.today_todo_status,
                tomorrow_todo_status: todo.tomorrow_todo_status,
                everyday_todo_status: todo.everyday_todo_status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsCompleted(!isCompleted); // フロントエンドでも状態を反転
            fetchTodos(); // ToDo一覧を再取得
        } catch (error) {
            console.error('ToDoの更新に失敗しました', error);
        }
    };

    // ToDoの編集を行う関数
    const handleUpdate = async () => {
        // エラーメッセージをクリア
        setEmptyContentError('');

        if (!editedContent.trim()) {
            setEmptyContentError('編集するToDoの内容を入力してください。');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/todos/${todo.id}`, {
                content: editedContent,
                completed: isCompleted,
                today_todo_status: todo.today_todo_status,
                tomorrow_todo_status: todo.tomorrow_todo_status,
                everyday_todo_status: todo.everyday_todo_status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTodos(); // ToDo一覧を再取得
            setIsEditing(false); // 編集モードを終了
        } catch (error) {
            console.error('ToDoの更新に失敗しました', error);
        }
    };

    // ToDoの削除を行う関数
    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/todos/${todo.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTodos(); // ToDo一覧を再取得
        } catch (error) {
            console.error('ToDoの削除に失敗しました', error);
        }
    };

    // モーダルを閉じる際に編集内容をリセット
    const handleClose = () => {
        // 元の内容にリセット
        setEditedContent(todo.content);
        // モーダルを閉じる
        setIsEditing(false);
    };

    return (
        <div className="todo-item">
            <div className='row'>
                <div className='col-7'>
                    <input
                        type="checkbox"
                        checked={isCompleted} // チェックボックスの状態
                        onChange={handleToggleComplete} // 状態を反映
                    />
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                    ) : (
                        <span>{todo.content}</span>
                    )}
                </div>
                <div className='col-5 d-flex'>
                    <button className='btn btn-secondary btn-sm' onClick={() => setIsEditing(true)}>編集</button>
                    &nbsp;
                    <button className='btn btn-danger btn-sm' onClick={handleDelete}>削除</button>
                </div>
            </div>

            {/* 編集用のモーダル */}
            <Modal show={isEditing} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>ToDoを編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="form-control"
                    />
                    {emptyContentError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyContentError}</p>} {/* エラーメッセージを表示 */}
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-secondary' onClick={handleClose}>
                        キャンセル
                    </button>
                    <button className='btn btn-primary' onClick={handleUpdate}>
                        保存
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ToDoItem;
