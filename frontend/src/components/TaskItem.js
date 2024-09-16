import React, { useState } from 'react';
import axios from 'axios';
import { Chart, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

// ArcElementを登録
Chart.register(ArcElement);

// カスタムプラグインで中央にテキストを描画
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

function TaskItem({ task, onDelete, onUpdate, fetchTasks }) {
  const [content, setContent] = useState(task.content);
  const [status, setStatus] = useState(task.status);
  const [deadline, setDeadline] = useState(task.deadline);
  const [editedContent, setEditedContent] = useState(task.content);
  const [editedStatus, setEditedStatus] = useState(task.status);
  const [editedDeadline, setEditedDeadline] = useState(task.deadline);
  const [showModal, setShowModal] = useState(false); // モーダル表示状態を管理

  const handleUpdate = async () => {
    try {
      if (!editedContent) {
        console.error('Content is required');
        return;
      }
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/tasks/${task.id}`,
        { content: editedContent,
          status: editedStatus,
          deadline: editedDeadline },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(task.id);
      await fetchTasks();
      console.log('complete fetch');
      setShowModal(false);
      console.log('complete close modal');
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete(task.id);
      await fetchTasks(); // メモリストを再取得
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const chartData = {
    labels: ['Progress', 'Remaining'],
    datasets: [{
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
    <div className='task-item d-flex mt-3' style={{ height: '180px', width: '80%', margin: '0 auto' }}>
      <div className='col-5'>
        <p className='mt-4' style={{fontWeight: 'bold'}}>{task.content}</p>
        <p className='mt-5 task-deadline-text'><span style={{fontWeight: 'bold', marginBottom: '0'}}>締め切り:</span>&nbsp; {task.deadline}</p>
      </div>
      <div className='col-5'>
        <Doughnut data={chartData} options={chartOptions} style={{margin: '0 auto'}} />
      </div>
      <div className='col-2' style={{ paddingTop: '110px', paddingLeft: '10px' }}>
        <Button className='btn btn-secondary btn-sm' onClick={() => setShowModal(true)}>Edit</Button>
        &nbsp;
        <Button className='btn btn-danger btn-sm' onClick={handleDelete}>Delete</Button>
      </div>

      {/* モーダル */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
          <input
            type="number"
            value={editedStatus}
            onChange={(e) => setEditedStatus(parseInt(e.target.value))}
            placeholder="現在の完了度 (1-100)"
            className='form-control mt-2'
          />
          <input
            type="datetime-local"
            value={editedDeadline}
            onChange={(e) => setEditedDeadline(e.target.value)}
            className='form-control mt-2'
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TaskItem;
