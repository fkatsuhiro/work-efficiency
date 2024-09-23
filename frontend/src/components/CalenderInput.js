import React, { useState } from 'react';
import axios from 'axios';

function CalenderInput({ fetchEvents }) {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState(null);  // エラーメッセージの状態
    const [success, setSuccess] = useState(false);  // 成功時の状態

    const handleSubmit = async (event) => {
        event.preventDefault();  // フォーム送信のデフォルト動作を抑止
        
        if (!title || !startTime || !endTime) {
            setError('すべてのフィールドを入力してください');
            return;
        }

        const newSchedule = {
            title,
            start_time: startTime,
            end_time: endTime
        };

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/events',
                newSchedule,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccess(true);  // 成功メッセージ
            setError(null);    // エラーリセット
            console.log('リクエストを取得しました')

            // イベント再取得
            await fetchEvents();
            console.log('予定の追加に成功しました。');
            setTitle('');
            setStartTime('');
            setEndTime('');
        } catch (error) {
            setError('予定の追加に失敗しました');
            console.error('Failed to create event', error);
        }
    };

    return (
        <div>
            {/* フォーム */}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        value={title}
                        placeholder='予定を入力してください'
                        className='form-control mt-3'
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="datetime-local"
                        value={startTime}
                        className='form-control mt-3'
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                <p style={{ transform: 'rotate(90deg)', width: '16px', height: '16px', margin: '0 auto', fontWeight: 'bold' }} className='mt-3'>
                    ~~</p>
                <div>
                    <input
                        type="datetime-local"
                        className='form-control mt-3'
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button type="submit" className='btn btn-primary mt-3'>追加</button>
                </div>
            </form>

            {/* エラーメッセージの表示 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* 成功メッセージの表示 */}
            {success && <p style={{ color: 'green' }}>予定が追加されました！</p>}
        </div>
    );
}

export default CalenderInput;
