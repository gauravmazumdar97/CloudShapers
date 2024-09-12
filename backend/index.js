import express from 'express';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import bodyParser from 'body-parser';

const app = express();
const adapter = new FileSync('db.json');
const db = lowdb(adapter);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Initialize database with empty requests
db.defaults({ maintenanceRequests: [] }).write();

// API to submit a maintenance request (POST /api/maintenance-requests)
app.post('/api/maintenance-requests', (req, res) => {
  const newRequest = req.body;
  db.get('maintenanceRequests').push({ ...newRequest, status: 'open' }).write();
  res.status(201).send(newRequest);
});

// API for admin to get all open requests (GET /api/maintenance-requests)
app.get('/api/maintenance-requests', (req, res) => {
  const requests = db.get('maintenanceRequests').filter({ status: 'open' }).value();
  res.send(requests);
});

// API for admin to close a request (PUT /api/maintenance-requests/:id/close)
app.put('/api/maintenance-requests/:id/close', (req, res) => {
  const { id } = req.params;
  db.get('maintenanceRequests').find({ id })
    .assign({ status: 'closed' })
    .write();
  res.send({ message: 'Request closed' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
