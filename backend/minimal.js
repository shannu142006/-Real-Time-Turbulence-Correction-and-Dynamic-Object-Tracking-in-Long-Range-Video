import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Backend is running'));
app.listen(5000, () => console.log('Minimal Backend on port 5000'));
