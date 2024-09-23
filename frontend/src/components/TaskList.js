import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskItem from './TaskItem';

/* 画面左側にタスク作成のためのスペースを作成　タスク欄は幅90%で作成 */

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState(0);
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      /* タスク締め切りの期限でソートするための処理 */
      const sortedTasks = res.data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  // タスクを追加する
  const handleAddTask = async () => {
    try {
      await axios.post('http://localhost:5000/tasks', {
        content: newTaskContent,
        status: newTaskStatus,
        deadline: newTaskDeadline
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewTaskContent('');
      setNewTaskStatus(0);
      setNewTaskDeadline('');
      fetchTasks();
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  // タスクを削除した後にタスク一覧を更新
  const handleDeleteTask = () => {
    fetchTasks();
  };

  // タスク更新後にタスク一覧を取得
  const handleUpdateTask = () => {
    fetchTasks();
  };

  return (
    <div className='d-flex' >
      {/* タスク作成フォーム */}
      <div className='new-task-space'>
        <div className='new-task-form'>
          <h4 className='mt-3' style={{textAlign: 'center'}}>Input Task</h4>
          <input
            type="text"
            value={newTaskContent}
            onChange={(e) => setNewTaskContent(e.target.value)}
            placeholder="タスクを入力してください"
            className='form-control mt-4'
          />
          <input
            type="number"
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
            placeholder="現在の完了度を入力してください(0~100%)"
            className='form-control mt-3'
          />
          <input
            type="datetime-local"
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            className='form-control mt-3'
          />
          <button onClick={handleAddTask} className='btn btn-primary mt-3'>追加する</button>
        </div>
      </div>

      {/* タスク一覧 */}
      <ul style={{ paddingBottom: '20px'}} className='all-tasks'>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
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
