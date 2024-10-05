import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import MemoList from './components/MemoList';
import Top from './components/Top';
import DocumentList from './components/DocumentList';
import TaskList from './components/TaskList';
import CalenderPage from './components/CalenderPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import icon from './images/icon.jpg';
import ToDoDisplay from './components/ToDoDisplay';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // ローカルストレージからトークンを取得し、ログイン状態を更新
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // トークンを削除
    setIsLoggedIn(false); // ログアウト
  };

  return (
    <Router>
      {isLoggedIn && (  // isLoggedIn が true の場合のみヘッダーを表示
        <header style={{height: '13vh'}}>
          <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
            <div className="container-fluid">
              <Link className="navbar-brand" to="/top">
                <img src={icon} alt='icon' className='circle-icon' />
              </Link>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link className="nav-link" to="/top">Top</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/documents">Documents</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/todos">ToDos</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/tasks">Tasks</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/memos">Memos</Link>
                  </li>
                  {/*<li className="nav-item">
                    <Link className="nav-link" to="/events">Calender</Link>
                  </li>*/}
                  <li className="nav-item">
                    <button className="nav-link btn" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </header>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/memos" element={isLoggedIn ? <MemoList /> : <Navigate to="/login" />} />
        <Route path="/top" element={isLoggedIn ? <Top /> : <Navigate to="/login" />} />
        <Route path="/documents" element={isLoggedIn ? <DocumentList /> : <Navigate to="/login" />} />
        <Route path="/tasks" element={isLoggedIn ? <TaskList /> : <Navigate to="/login" />} />
        <Route path="/events" element={isLoggedIn ? <CalenderPage /> : <Navigate to="/login" />} />
        <Route path="/todos" element={isLoggedIn ? <ToDoDisplay /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
