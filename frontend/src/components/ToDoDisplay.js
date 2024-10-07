import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToDoItem from './ToDoItem';
// 円グラフのインポート
import { Doughnut } from 'react-chartjs-2';

function ToDoDisplay() {
    const [todos, setTodos] = useState([]);
    const [newTodoContent, setNewTodoContent] = useState('');
    // 新しいToDoのステータス ('today', 'tomorrow', 'everyday')
    const [newTodoStatus, setNewTodoStatus] = useState('today');
    // 円グラフ用の達成率
    const [completionRate, setCompletionRate] = useState(0);
    // バリデーションチェック用
    const [emptyContentError, setEmptyContentError] = useState('');

    // 環境変数を参照
    const apiUrl =
        process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_API_URL_DEV
            : process.env.REACT_APP_API_URL_PROD;

    // ToDo一覧を取得する関数
    const fetchTodos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${apiUrl}/todos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTodos(res.data);
            // ToDo取得後に達成率を計算
            calculateCompletionRate(res.data);
        } catch (error) {
            console.error('ToDoの取得に失敗しました', error);
        }
    };

    useEffect(() => {
        // 初回レンダリング時にToDo一覧を取得
        fetchTodos();
    }, []);

    // 新しいToDoを追加する関数
    const handleAddTodo = async () => {
        // エラーメッセージをクリア
        setEmptyContentError('');

        if (!newTodoContent.trim()) {
            setEmptyContentError('追加するToDoの内容を入力してください。');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const newTodo = {
                content: newTodoContent,
                today_todo_status: newTodoStatus === 'today' ? 1 : 0,
                tomorrow_todo_status: newTodoStatus === 'tomorrow' ? 1 : 0,
                everyday_todo_status: newTodoStatus === 'everyday' ? 1 : 0,
                completed: 0 // 新しいToDoは未完了
            };
            await axios.post(`${apiUrl}/todos`, newTodo, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewTodoContent(''); // フォームをクリア
            setNewTodoStatus('today'); // ステータスをリセット
            fetchTodos(); // ToDo一覧を再取得
        } catch (error) {
            console.error('ToDoの追加に失敗しました', error);
        }
    };

    // ToDo達成率を計算する関数
    const calculateCompletionRate = (todos) => {
        // 本日と毎日のToDoのみを計算対象にする
        const todayTodos = todos.filter(todo => todo.today_todo_status === 1 || todo.everyday_todo_status === 1);
        const totalTodos = todayTodos.length;
        const completedTodos = todayTodos.filter(todo => todo.completed === 1).length;
        const rate = totalTodos === 0 ? 0 : Math.round((completedTodos / totalTodos) * 100);
        setCompletionRate(rate);
    };

    // 円グラフのデータ
    const chartData = {
        labels: ['達成率', '未達成'],
        datasets: [{
            data: [completionRate, 100 - completionRate],
            backgroundColor: ['#36A2EB', '#FF6384'],
        }]
    };

    // 円グラフの表示の設定
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        // ドーナツチャートの中心部分の大きさ
        cutout: '50%',
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            },
        },
    };

    return (
        <div className='d-flex'>
            {/* タスク作成フォーム */}
            <div className='new-task-space'>
                <div className='new-task-form'>
                    <h4 className='mt-3' style={{ textAlign: 'center' }}>ToDoを追加</h4>
                    <input
                        type="text"
                        value={newTodoContent}
                        placeholder="新しいToDoを入力"
                        onChange={(e) => setNewTodoContent(e.target.value)}
                        className="form-control mt-3"
                    />
                    {emptyContentError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyContentError}</p>} {/* エラーメッセージを表示 */}
                    <select
                        value={newTodoStatus}
                        onChange={(e) => setNewTodoStatus(e.target.value)}
                        className="form-control mt-3"
                    >
                        <option value="today">今日のToDo</option>
                        <option value="tomorrow">明日のToDo</option>
                        <option value="everyday">毎日のToDo</option>
                    </select>
                    <div style={{ textAlign: 'end' }}>
                        <button onClick={handleAddTodo} className="btn btn-primary mt-3">追加</button>
                    </div>
                </div>
            </div>

            {/* ToDoの表示 */}
            <div className='all-todos'>
                <div className='today-todos'>
                    <div style={{ width: '85%', margin: '0 auto' }}>
                        <h4 className='mt-3'>本日のToDo</h4>
                    </div>
                    <div className='today-todo-list'>
                        <div style={{ width: '85%', margin: '0 auto' }}>
                            <ul style={{ listStyle: 'none' }}>
                                {todos.filter(todo => todo.everyday_todo_status === 1).map(todo => (
                                    <li key={todo.id} className='mt-3'>
                                        <ToDoItem todo={todo} fetchTodos={fetchTodos} />
                                    </li>
                                ))}
                                {todos.filter(todo => todo.today_todo_status === 1).map(todo => (
                                    <li key={todo.id} className='mt-3'>
                                        <ToDoItem todo={todo} fetchTodos={fetchTodos} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className='all-todos'>
                {/* 明日のToDo */}
                <div className='tomorrow-todos'>
                    {/* 円グラフを表示 */}
                    <div style={{ height: '32vh' }} className='mt-3'>
                        <h5 style={{ textAlign: 'center' }}>本日のToDo達成状況</h5>
                        <div style={{ width: '200px', margin: '0 auto', marginBottom: '20px' }}>
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>
                    <div style={{ width: '85%', margin: '0 auto' }}>
                        <h4 className='mt-3'>明日のToDo</h4>
                    </div>
                    <div className='tomorrow-todo-list'>
                        <div style={{ width: '85%', margin: '0 auto' }}>
                            <ul style={{ listStyle: 'none' }}>
                                {todos.filter(todo => todo.everyday_todo_status === 1).map(todo => (
                                    <li key={todo.id} className='mt-3'>
                                        <ToDoItem todo={todo} fetchTodos={fetchTodos} />
                                    </li>
                                ))}
                                {todos.filter(todo => todo.tomorrow_todo_status === 1).map(todo => (
                                    <li key={todo.id} className='mt-3'>
                                        <ToDoItem todo={todo} fetchTodos={fetchTodos} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ToDoDisplay;
