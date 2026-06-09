const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is up' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});