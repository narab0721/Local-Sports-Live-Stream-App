const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Store active camera connections
const activeCameras = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register-camera', (data) => {
    activeCameras.set(data.cameraId, {
      socketId: socket.id,
      info: data
    });
    console.log('Camera registered:', data.cameraId);
    io.emit('camera-list-updated', Array.from(activeCameras.keys()));
  });

  socket.on('offer', (data) => {
    const targetCamera = activeCameras.get(data.target);
    if (targetCamera) {
      io.to(targetCamera.socketId).emit('offer', {
        offer: data.offer,
        from: socket.id
      });
    }
  });

  socket.on('answer', (data) => {
    io.to(data.target).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    const target = data.target;
    io.to(target).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  socket.on('disconnect', () => {
    // Remove camera from active list
    for (const [cameraId, camera] of activeCameras.entries()) {
      if (camera.socketId === socket.id) {
        activeCameras.delete(cameraId);
        io.emit('camera-list-updated', Array.from(activeCameras.keys()));
        break;
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', cameras: activeCameras.size });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
