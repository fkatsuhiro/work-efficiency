// 新規ユーザー登録画面
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
  // パスワード表示/非表示用の状態を追加
  const [showPassword, setShowPassword] = useState(false);
  // useNavigateフックを使う
  const navigate = useNavigate();
  // 空文字チェック用のエラーメッセージ
  const [ validationNameError , setValidationNameError ] = useState('');
  const [ validationPasswordError, setValidationPasswordError ] = useState('');

  // 環境変数を参照
  const apiUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.REACT_APP_API_URL_DEV
      : process.env.REACT_APP_API_URL_PROD;

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${apiUrl}/register`, { username, password });
      // 成功メッセージを表示
      alert(response.data);
      // 登録成功後に /top に遷移
      navigate('/top');
      console.log('登録に成功しました');
    } catch (error) {
      // エラーメッセージを表示
      setError(error.response.data);
    }
  };

  // ユーザーネームにスペースは入力できないようにする
  const handleNotNullName = (e) => {
    const input = e.target.value;
    if (!input.includes(' ')) {
      // スペースが含まれていない場合のみセット
      setUsername(input);
    } else {
      // スペースが含まれている場合のエラーメッセージの表示
      setValidationNameError('登録するユーザーネームにスペースは利用できません。');
      return;
    }
  };

  // パスワードにスペースを入力できないようにする
  const handleNotNullPassword = (e) => {
    const input = e.target.value;

    if (!input.includes(' ')) {
      // スペースが含まれていない場合のみセット
      setPassword(input);
    } else {
      // スペースが含まれている場合のエラーメッセージの表示
      setValidationPasswordError('パスワードにスペースは利用できません。');
      return;
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
          onChange={handleNotNullName}
          required
        />
        {validationNameError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{validationNameError}</p>} {/* エラーメッセージを表示 */}
      </div>
      <div className="mb-3 inner-login-form">
        <div className="input-group">
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
        {validationPasswordError && <p style={{ color: 'red', fontSize: '0.8rem' }} className='mt-1'>{validationPasswordError}</p>} {/* エラーメッセージを表示 */}
      </div>
      <div className='mb-3 button-right-position inner-login-form'>
        <button onClick={handleRegister} className="btn btn-primary">Register</button>
      </div>
      <div className='button-right-position inner-login-form'>
        すでに登録済みの方は<Link to="/login">こちら</Link>
      </div>
    </div>
  </div>
  );
}

export default Register;

