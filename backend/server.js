const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // ReactアプリケーションのURL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // 許可するHTTPメソッド
    credentials: true // クッキーや認証情報を許可する場合はtrueに設定
}));
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite');

// サーバー起動時にテーブルが存在しなければ作成する
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS memos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT,
      createdAt TEXT,
      pushButton TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    status INTEGER,
    deadline TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS document (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    `);
});

// ユーザー登録
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send('ユーザー登録が失敗しました。');
        }
        res.status(201).send('ユーザー登録が完了しました。');
    });
});

// ログイン
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user || !(await bcrypt.compare(password, user.password))) {
            console.log(err);
            return res.status(401).send('そのようなユーザーは存在しません');
        }
        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: '1h' });
        res.json({ token });
    });
});

// 認証用ミドルウェア
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// メモ一覧取得
app.get('/memos', authenticateToken, (req, res) => {
    db.all('SELECT * FROM memos WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching memos');
        }
        res.json(rows);
    });
});

// メモ追加
app.post('/memos', authenticateToken, (req, res) => {
    const { content } = req.body;
    db.run('INSERT INTO memos (user_id, content) VALUES (?, ?)', [req.user.id, content], function (err) {
        if (err) return res.status(500).send('Error adding memo');
        res.status(201).send('Memo added');
    });
});

// メモ更新
app.put('/memos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    db.run('UPDATE memos SET content = ? WHERE id = ? AND user_id = ?', [content, id, req.user.id], function (err) {
        if (err) {
            console.error(err); // エラーの詳細をコンソールに表示
            return res.status(500).send('Error updating memo');
        }
        if (this.changes === 0) {
            return res.status(404).send('Memo not found or not authorized');
        }
        res.send('Memo updated');
    });
});


// メモ削除
app.delete('/memos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    console.log(`Deleting memo with ID: ${id} for user: ${req.user.id}`); // 追加: リクエストIDとユーザーIDをログ出力

    db.run('DELETE FROM memos WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) {
            return res.status(500).send('Error deleting memo');
        }
        if (this.changes === 0) {
            return res.status(404).send('Memo not found or not authorized');
        }
        res.send('Memo deleted');
    });
});

// タスク一覧取得
app.get('/tasks', authenticateToken, (req, res) => {
    db.all('SELECT * FROM tasks WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching tasks');
        }
        res.json(rows);
    });
});

// タスク追加
app.post('/tasks', authenticateToken, (req, res) => {
    const { content, status, deadline } = req.body;
    db.run('INSERT INTO tasks (user_id, content, status, deadline) VALUES (?, ?, ?, ?)', [req.user.id, content, status || 0, deadline], function (err) {
        if (err) return res.status(500).send('Error adding task');
        res.status(201).send('Task added');
    });
});

// タスク更新
app.put('/tasks/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { content, status, deadline } = req.body;

    db.run('UPDATE tasks SET content = ?, status = ?, deadline = ? WHERE id = ? AND user_id = ?', [content, status, deadline, id, req.user.id], function (err) {
        if (err) {
            return res.status(500).send('Error updating task');
        }
        if (this.changes === 0) {
            return res.status(404).send('Task not found or not authorized');
        }
        res.send('Task updated');
    });
});

// タスク削除
app.delete('/tasks/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    console.log(`Deleting task with ID: ${id} for user: ${req.user.id}`); // ログ出力

    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) {
            return res.status(500).send('Error deleting task');
        }
        if (this.changes === 0) {
            return res.status(404).send('Task not found or not authorized');
        }
        res.send('Task deleted');
    });
});

// Express サーバー起動
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
