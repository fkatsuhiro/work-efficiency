import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './TopPage.css';

// 円グラフを使うために登録
Chart.register(ArcElement);

function TopPage() {
  const [tasks, setTasks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [memos, setMemos] = useState([]);
  const [currentMemoIndex, setCurrentMemoIndex] = useState(0);

  useEffect(() => {
    fetchTasks();
    fetchTodos();
    fetchMemos();
  }, []);

  // 締め切りが近いタスクを取得
  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const sortedTasks = res.data
        .filter((task) => task.deadline) // 期限が存在するタスクのみを対象
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3);
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };


  // 本日のToDoと毎日のToDoを取得する関数
  const fetchTodos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/todos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // 今日のToDo（today_todo_statusが1）と毎日のToDo（everyday_todo_statusが1）を取得
      const filteredToDos = res.data.filter(
        (todo) => todo.today_todo_status === 1 || todo.everyday_todo_status === 1
      );
      setTodos(filteredToDos);
    } catch (error) {
      console.error('Failed to fetch todos', error);
    }
  };

  // タスクの期限を表示する関数
  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    if (isNaN(date.getTime())) {
      return '期限なし'; // 無効な日付の場合
    }
    // 日本語形式にフォーマット
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  // メモを取得
  const fetchMemos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/memos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMemos(res.data);
    } catch (error) {
      console.error('Failed to fetch memos', error);
    }
  };

  // メモを次へ切り替える
  const handleNextMemo = () => {
    setCurrentMemoIndex((prevIndex) => (prevIndex + 1) % memos.length);
  };

  // 達成率の円グラフのデータ
  const getChartData = (task) => ({
    labels: ['達成率', '残り'],
    datasets: [
      {
        data: [task.status, 100 - task.status],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  });

  return (
    <div className="layout d-flex">
      <div className="left-side">
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className="top-task-item row mt-2">
              <div className='col-5'>
                <p style={{ fontSize: '0.9rem' }}>{task.content}</p>
                <p style={{ fontSize: '0.9rem' }}>期限: {formatDeadline(task.deadline)}</p>
              </div>
              <div className='col-7'>
                <Doughnut
                  data={getChartData(task)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '55%',
                  }}
                  style={{ width: '100px', height: '100px', margin: '0 auto' }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="right-side">
        <div>
          <h4 className='today-todo-title'>本日のToDo</h4>
          <div className="top-todos mt-3">
            <div className='inner-top-todos'>
              <ul>
                {todos.map((todo) => (
                  <li style={{ listStyle: 'circle' }} key={todo.id} className='mt-2'>{todo.content}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <h4 className='today-todo-title mt-3'>メモ</h4>
        <div className="top-memos">
          {memos.length > 0 && (
            <div className='sticky-note mt-2'>
              <div className='memo-text'>{memos[currentMemoIndex].content}</div>
            </div>
          )}
          <div style={{ width: '80%', margin: '0 auto' }}>
            <div style={{ textAlign: 'end' }}>
              <button className='btn btn-primary btn-sm mt-3' onClick={handleNextMemo}>次のメモへ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopPage;
