// ログイン画面
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // エラーステートを追加
  const [error, setError] = useState(null);
  // パスワード表示/非表示用の状態を追加
  const [showPassword, setShowPassword] = useState(false);
  // useNavigateフックを使う
  const navigate = useNavigate();
  // 空文字チェック用のエラーメッセージ
  const [validationError, setValidationError] = useState('');
  // 環境変数を参照
  const apiUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.REACT_APP_API_URL_DEV
      : process.env.REACT_APP_API_URL_PROD;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ユーザーネームのスペースを削除
    const trimmedUsername = username.trim();

    try {
      const res = await axios.post(`${apiUrl}/login`, { username: trimmedUsername, password });
      localStorage.setItem('token', res.data.token); // トークンをローカルストレージに保存
      console.log('Login successful');
      setIsLoggedIn(true); // ログイン状態を更新
      navigate('/top'); // ログイン成功後に /memos に遷移
    } catch (error) {
      const message = error.response?.data || 'Invalid credentials';
      setError(message); // エラーメッセージを設定
      alert(message); // エラーをアラートで表示
    }
  };

  // パスワードにスペースを入力できないようにする
  const handleNotNullPassword = (e) => {
    const input = e.target.value;
    if (!input.includes(' ')) {
      setPassword(input); // スペースが含まれていない場合のみセット
    } else {
      // スペースが含まれている場合のエラーメッセージの表示
      setValidationError('パスワードにスペースは利用できません。');
      return;
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className='login-form'>
        <h4 className='login-title'>ログイン</h4>
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
          <div className='input-group'>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={handleNotNullPassword}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "非表示" : "表示"} {/* ボタンのテキストを切り替え */}
            </button>
          </div>
          {validationError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{validationError}</p>} {/* エラーメッセージを表示 */}
        </div>
        <div className='mb-3 button-right-position inner-login-form'>
          <button type="submit" className="btn btn-primary">Login</button>
        </div>
        <div className='button-right-position inner-login-form'>登録がまだの方は<Link to="/register">こちら</Link></div>
      </form>
    </div>
  );
}

export default Login;
