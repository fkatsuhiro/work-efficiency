import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  // バリデーションチェック用
  const [emptyContentError, setEmptyContentError] = useState('');
  const [choiceStatusError, setChoiceStatusError] = useState('');
  const [emptyDeadlineError, setEmptyDeadlineError] = useState('');
  const [minDeadline, setMinDeadline] = useState('');

  useEffect(() => {
    fetchTasks();
    // ページロード時に最小日付を設定
    setMinDeadline(getCurrentDateTime());
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // 完了度100%のタスクを最後尾にし、それ以外は締め切り順にソート
      const sortedTasks = res.data.sort((a, b) => {
        if (a.status === 100 && b.status !== 100) return 1;
        if (a.status !== 100 && b.status === 100) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  // タスクを追加する
  const handleAddTask = async () => {
    // エラーメッセージをクリア
    setEmptyContentError('');
    setChoiceStatusError('');
    setEmptyDeadlineError('');

    // タスクの内容が空文字のバリデーション
    if (!newTaskContent.trim()) {
      // 完成率が0~100以外の数字が選択されている場合のバリデーション
      if (newTaskStatus < 0 || newTaskStatus > 100 || !newTaskStatus.trim()) {
        // 締め切り期限が選択されていない場合のバリデーション
        if (!newTaskDeadline.trim()) {
          setEmptyContentError('タスクの内容を入力してください。');
          setChoiceStatusError('0~100でタスクの完成率を入力してください。');
          setEmptyDeadlineError('タスクの締め切り時刻を入力してください。');
          return;
        }
        else {
          setEmptyContentError('タスクの内容を入力してください。');
          setChoiceStatusError('0~100でタスクの完成率を入力してください。');
          return;
        }
      } else {
        // 締め切り期限が選択されていない場合のバリデーション
        if (!newTaskDeadline.trim()) {
          setEmptyContentError('タスクの内容を入力してください。');
          setEmptyDeadlineError('タスクの締め切り時刻を入力してください。');
          return;
        }
        else {
          setEmptyContentError('タスクの内容を入力してください。');
          return;
        }
      }
    } else {
      // 完成率が0~100以外の数字が選択されている場合のバリデーション
      if (newTaskStatus < 0 || newTaskStatus > 100 || !newTaskStatus.trim()) {
        // 締め切り期限が選択されていない場合のバリデーション
        if (!newTaskDeadline.trim()) {
          setChoiceStatusError('0~100でタスクの完成率を入力してください。');
          setEmptyDeadlineError('タスクの締め切り時刻を入力してください。');
          return;
        }
        else {
          setChoiceStatusError('0~100でタスクの完成率を入力してください。');
          return;
        }
      } else {
        // 締め切り期限が選択されていない場合のバリデーション
        if (!newTaskDeadline.trim()) {
          setEmptyDeadlineError('タスクの締め切り時刻を入力してください。');
          return;
        }
      }
    }

    try {
      await axios.post('http://localhost:5000/tasks', {
        content: newTaskContent,
        status: newTaskStatus,
        deadline: newTaskDeadline
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewTaskContent('');
      setNewTaskStatus('');
      setNewTaskDeadline('');
      fetchTasks();
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  // 現在の日付と時間を取得して min 属性に使う
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDeleteTask = () => {
    fetchTasks();
  };

  const handleUpdateTask = () => {
    fetchTasks();
  };

  return (
    <div className='d-flex'>
      {/* タスク作成フォーム */}
      <div className='new-task-space'>
        <div className='new-task-form'>
          <h4 className='mt-3' style={{ textAlign: 'center' }}>Input Task</h4>
          <input
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            placeholder="タスクを入力してください"
            className='form-control mt-4'
          />
          {emptyContentError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyContentError}</p>} {/* エラーメッセージを表示 */}
          <input
            type="number"
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
            placeholder="現在の完了度を入力してください(0~100%)"
            className='form-control mt-3'
          />
          {choiceStatusError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{choiceStatusError}</p>} {/* エラーメッセージを表示 */}
          <input
            type="datetime-local"
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            className='form-control mt-3'
            min={minDeadline}
          />
          {emptyDeadlineError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyDeadlineError}</p>} {/* エラーメッセージを表示 */}
          <button onClick={handleAddTask} className='btn btn-primary mt-3'>追加する</button>
        </div>
      </div>

      {/* タスク一覧 */}
      <ul style={{ paddingBottom: '20px' }} className='all-tasks'>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            minDeadline={minDeadline}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            fetchTasks={fetchTasks}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
