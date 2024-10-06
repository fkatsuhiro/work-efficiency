import React, { useState } from 'react';
import axios from 'axios';
import { Chart, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

// ArcElementを登録
Chart.register(ArcElement);

// チャートの中央にテキストを追加
const centerTextPlugin = {
  id: 'centerText',
  afterDraw: function (chart) {
    const { ctx, chartArea: { width, height } } = chart;
    ctx.save();
    const labeltext = '完成率';
    const text = `${chart.config.data.datasets[0].data[0]}%`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(labeltext, width / 2, height / 2 - 10);
    ctx.font = 'bold 24px Arial';
    ctx.fillText(text, width / 2, height / 2 + 10);
    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

function TaskItem({ task, minDeadline, onDelete, onUpdate, fetchTasks }) {
  const [content, setContent] = useState(task.content);
  const [status, setStatus] = useState(task.status);
  const [deadline, setDeadline] = useState(task.deadline);
  const [editedContent, setEditedContent] = useState(task.content);
  const [editedStatus, setEditedStatus] = useState(task.status);
  const [editedDeadline, setEditedDeadline] = useState(task.deadline);
  const [showModal, setShowModal] = useState(false); // モーダル表示状態を管理
  // バリデーションチェック用
  const [ emptyContentError, setEmptyContentError ] = useState('');
  const [ muchContentError, setMuchContentError ] = useState('');
  const [ choiceStatusError, setChoiceStatusError ] = useState('');
  const [ emptyDeadlineError, setEmptyDeadlineError ] = useState('');

  // タスクを更新する関数
  const handleUpdate = async () => {
    setEmptyContentError('');
    setMuchContentError('');
    setChoiceStatusError('');
    setEmptyDeadlineError('');

    // タスクの内容が空文字のバリデーション
    if (!editedContent.trim()) {
      // 完成率が0~100以外の数字が選択されている場合のバリデーション
      if (editedStatus < 0 || editedStatus > 100 || isNaN(editedStatus)) {
          setEmptyContentError('タスクの内容を入力してください。');
          setChoiceStatusError('0~100でタスクの完成率を入力してください。');
          return;
      } else {
          setEmptyContentError('タスクの内容を入力してください。');
          return;
      }
    } else {
      // 字数制限超えのバリデーション
      if (editedContent.length > 40) {
        // 完成率が0~100以外の数字が選択されている場合のバリデーション
        if (editedStatus < 0 || editedStatus > 100 || isNaN(editedStatus) ) {
            setMuchContentError('40文字以内で入力してください。');
            setChoiceStatusError('0~100でタスクの完成率を入力してください。');
            return;
        } else {
            setMuchContentError('40文字以内で入力してください。');
            return;
        }
      } else {
        // 完成率が0~100以外の数字が選択されている場合のバリデーション
        if (editedStatus < 0 || editedStatus > 100 || isNaN(editedStatus)) {
            setChoiceStatusError('0~100でタスクの完成率を入力してください。');
            return;
        }
      }
    }

    try {
      if (!editedContent) {
        console.error('Content is required');
        return;
      }
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/tasks/${task.id}`,
        {
          content: editedContent,
          status: editedStatus,
          deadline: editedDeadline
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent(editedContent);
      setStatus(editedStatus);
      setDeadline(editedDeadline);
      onUpdate(task.id);
      setShowModal(false);
      // タスク一覧を再取得
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  // タスクを削除する関数
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(task.id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  // モーダルを閉じる際に編集内容をリセット
  const handleClose = () => {
    // 元の内容にリセット
    setEditedContent(task.content);
    setEditedStatus(task.status);
    setEditedDeadline(task.deadline);
    // モーダルを閉じる
    setShowModal(false);
  };

  // 完成率データ
  const chartData = {
    labels: ['Progress', 'Remaining'],
    datasets: [{
      // ステータスに基づいてチャートを更新
      data: [status, 100 - status],
      backgroundColor: ['#36A2EB', '#FF6384'],
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: { centerText: true }
  };

  return (
    <div>
      <div className='task-item d-flex mt-3' style={{ height: '180px', width: '80%', margin: '0 auto', backgroundColor: task.status === 100 ? '#e0e0e0' : 'white' }}>
        <div className='col-5'>
          <p className='mt-4' style={{ fontWeight: 'bold' }}>{content}</p>
          <p className='mt-5 task-deadline-text'><span style={{ fontWeight: 'bold', marginBottom: '0' }}>締め切り:</span>&nbsp; {deadline}</p>
        </div>
        <div className='col-5'>
          <Doughnut data={chartData} options={chartOptions} style={{ margin: '0 auto' }} />
        </div>
        <div className='col-2' style={{ paddingTop: '110px', paddingLeft: '10px' }}>
          <Button className='btn btn-secondary btn-sm' onClick={() => setShowModal(true)}>Edit</Button>
          &nbsp;
          <Button className='btn btn-danger btn-sm' onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {/* モーダル */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>タスクを編集する</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="タスクの内容を編集"
            className='form-control'
          />
          {emptyContentError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyContentError}</p>} {/* エラーメッセージを表示 */}
          {muchContentError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{muchContentError}</p>} {/* エラーメッセージを表示 */}
          <input
            type="number"
            value={editedStatus}
            onChange={(e) => setEditedStatus(parseInt(e.target.value))}
            placeholder="現在の完了度 (1-100)"
            className='form-control mt-2'
          />
          {choiceStatusError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{choiceStatusError}</p>} {/* エラーメッセージを表示 */}
          <input
            type="datetime-local"
            value={editedDeadline}
            onChange={(e) => setEditedDeadline(e.target.value)}
            className='form-control mt-2'
            min={minDeadline}
          />
          {emptyDeadlineError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{emptyDeadlineError}</p>} {/* エラーメッセージを表示 */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TaskItem;
