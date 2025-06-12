// Simple test file to check if POST endpoint works
import express from 'express';

const app = express();

app.post('/test', async (req, res) => {
  res.json({ success: true });
});

console.log('Test file compiled successfully');
