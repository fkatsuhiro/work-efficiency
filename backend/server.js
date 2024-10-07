const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cron = require('cron');
const today = new Date().toISOString().split('T')[0]; // 今日の日付
const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]; // 明日の日付

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'https://work-efficiency.onrender.com'], // ReactアプリケーションのURL
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
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS memos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        createdAt TEXT,
        pushButton TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        status INTEGER,
        deadline TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        content TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        date TEXT,
        start_time DATETIME,
        end_time DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        today_todo_status INTEGER,
        tomorrow_todo_status INTEGER,
        everyday_todo_status INTEGER,
        completed INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
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
        res.status(201).send('ユーザー登録が完了しました。登録したユーザーでログインしてください。');
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

/* メモ画面 */

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

/* タスク管理画面 */

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
    const repaireDeadline = deadline.replace('T', '日 ').replace('-', '年').replace('-', '月');

    db.run('UPDATE tasks SET content = ?, status = ?, deadline = ? WHERE id = ? AND user_id = ?', [content, status, repaireDeadline, id, req.user.id], function (err) {
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

    console.log(`Deleting task with ID: ${id} for user: ${req.user.id}`);

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

/* ドキュメント作成画面 */

// ドキュメント追加
app.post('/documents', authenticateToken, (req, res) => {
    const { content, name } = req.body;

    // ドキュメントの挿入クエリ
    db.run('INSERT INTO documents (user_id, content, name) VALUES (?, ?, ?)', [req.user.id, content, name], function (err) {
        if (err) {
            console.error(err); // エラーログを出力
            return res.status(500).send('ドキュメントの保存に失敗しました');
        }
        // 挿入成功時、挿入されたIDを返す
        res.send({ id: this.lastID });
    });
});

// ドキュメント一覧取得
app.get('/documents', authenticateToken, (req, res) => {
    db.all('SELECT * FROM documents WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching documents');
        }
        res.json(rows);
    });
});

app.get('/documents/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get('SELECT * FROM documents WHERE id = ? AND user_id = ?', [id, userId], (err, row) => {
        if (err) {
            return res.status(500).send('Error fetching document');
        }
        if (!row) {
            return res.status(404).send('Document not found');
        }
        res.json(row);
    });
});

// ドキュメント削除
app.delete('/documents/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    console.log(`Deleting document with ID: ${id} for user: ${req.user.id}`);

    db.run('DELETE FROM documents WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) {
            return res.status(500).send('Error deleting document');
        }
        if (this.changes === 0) {
            return res.status(404).send('Documents not found or not authorized');
        }
        res.send('Documents deleted');
    });
});

/* スケジュール管理画面 */

// 一覧取得
app.get('/events', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM events WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).send('イベントの取得に失敗しました');
        res.json(rows);
    });
});

// 予定の追加
app.post('/events', authenticateToken, (req, res) => {
    const { title, start_time, end_time } = req.body;

    // バリデーション
    if (!title || !start_time || !end_time) {
        return res.status(400).send('タイトル、開始時刻、終了時刻は必須です');
    }

    db.run('INSERT INTO events ( user_id, title, start_time, end_time ) VALUES (?, ?, ?, ?)',
        [req.user.id, title, start_time, end_time], function (err) {
            if (err) {
                console.log('SQLエラー: ', err);
                return res.status(500).send('イベントの作成に失敗しました');
            }
            res.send({ id: this.lastID });
        });
});


// 予定の更新
app.put('/events/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, start_time, end_time } = req.body;
    db.run('UPDATE events SET title = ?, start_time = ?, end_time = ? WHERE id = ? AND user_id = ?',
        [title, start_time, end_time, id, req.user.id], function (err) {
            if (err) return res.status(500).send('イベントの更新に失敗しました');
            res.send('イベントが更新されました');
        });
});


// 予定の削除
app.delete('/events/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM events WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) return res.status(500).send('イベントの削除に失敗しました');
        res.send('イベントが削除されました');
    });
});

/* ToDo機能に関しての機能 */

// 日付が変わるタイミングでToDoを更新する処理
const resetToDos = new cron.CronJob('0 0 * * *', () => {
    // 今日のToDoを削除
    db.run(`DELETE FROM todos WHERE today_todo_status = 1`, (err) => {
        if (err) console.error('Error deleting today\'s todos', err);
    });

    // 明日のToDoを今日のToDoに移動
    db.run(`UPDATE todos SET today_todo_status = tomorrow_todo_status, tomorrow_todo_status = 0`, (err) => {
        if (err) console.error('Error moving tomorrow\'s todos to today', err);
    });

    console.log('ToDo lists updated for the new day');
});

resetToDos.start(); // スケジュールをスタート

// ToDo一覧取得エンドポイント
app.get('/todos', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.all('SELECT * FROM todos WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).send('ToDoの取得に失敗しました');
        }
        res.json(rows);
    });
});

// ToDoの更新
app.put('/todos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { content, completed, today_todo_status, tomorrow_todo_status, everyday_todo_status } = req.body;

    db.run('UPDATE todos SET content = ?, completed = ?, today_todo_status = ?, tomorrow_todo_status = ?, everyday_todo_status = ? WHERE id = ? AND user_id = ?',
        [content, completed, today_todo_status, tomorrow_todo_status, everyday_todo_status, id, req.user.id], function (err) {
            if (err) return res.status(500).send('ToDoの更新に失敗しました');
            res.send('ToDoが更新されました');
        });
});


// ToDoを追加する
app.post('/todos', authenticateToken, (req, res) => {
    const { content, today_todo_status, tomorrow_todo_status, everyday_todo_status } = req.body;
    const userId = req.user.id;

    db.run(
        'INSERT INTO todos (user_id, content, today_todo_status, tomorrow_todo_status, everyday_todo_status) VALUES (?, ?, ?, ?, ?)',
        [userId, content, today_todo_status, tomorrow_todo_status, everyday_todo_status],
        function (err) {
            if (err) {
                return res.status(500).send('ToDoの追加に失敗しました');
            }
            res.send({ id: this.lastID });
        }
    );
});

// ToDoを編集する
app.put('/todos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { content, today_todo_status, tomorrow_todo_status, everyday_todo_status } = req.body;

    db.run(
        `UPDATE todos SET content = ?, today_todo_status = ?, tomorrow_todo_status = ?, everyday_todo_status = ? WHERE id = ? AND user_id = ?`,
        [content, today_todo_status, tomorrow_todo_status, everyday_todo_status, id, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).send('ToDoの更新に失敗しました');
            }
            if (this.changes === 0) {
                return res.status(404).send('ToDoが見つかりませんでした');
            }
            res.send('ToDoが更新されました');
        }
    );
});

// ToDoを削除する
app.delete('/todos/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) {
            return res.status(500).send('ToDoの削除に失敗しました');
        }
        if (this.changes === 0) {
            return res.status(404).send('ToDoが見つかりませんでした');
        }
        res.send('ToDoが削除されました');
    });
});

// Express サーバー起動
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
