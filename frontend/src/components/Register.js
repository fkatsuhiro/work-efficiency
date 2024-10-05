/*import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigateフックを使う

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password
      });
      alert(response.data);  // 成功メッセージを表示
      navigate('/memos');    // 登録成功後に /memos に遷移
    } catch (error) {
      setError(error.response.data);  // エラーメッセージを表示
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input 
        type="text" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        placeholder="Username"
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button onClick={handleRegister}>Register</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;*/

// 新規登録画面のコンポーネント
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function Register(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigateフックを使う

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', { username, password });
      alert(response.data);  // 成功メッセージを表示
      navigate('/memos');    // 登録成功後に /memos に遷移
    } catch (error) {
      setError(error.response.data);  // エラーメッセージを表示
    }
  };

  return (
      <div className="container mt-5">
        <div className='login-form'>
          <h4 className='login-title'>新規登録</h4>
          <div className="mb-3 inner-login-form">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 inner-login-form">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className='mb-3 button-right-position inner-login-form'>
            <button onClick={handleRegister} className="btn btn-primary">Register</button>
          </div>
          <div className='button-right-position inner-login-form'>すでに登録済みの方は<Link to="/login">こちら</Link></div>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>} {/* エラーメッセージの表示 */}
      </div>
  );
}

export default Register;

