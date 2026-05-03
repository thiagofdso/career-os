import { createDb } from './db.js';
import { createApp } from './app.js';

const db = createDb(process.env.DB_PATH || 'career_os.db');
const app = createApp(db);
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`backend running on ${port}`));
