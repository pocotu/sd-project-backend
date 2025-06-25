import express from 'express';
const router = express.Router();

// Rutas de categorías
router.get('/', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Endpoint en construcción'
  });
});

router.get('/:id', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Endpoint en construcción'
  });
});

router.post('/', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Endpoint en construcción'
  });
});

router.put('/:id', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Endpoint en construcción'
  });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'Endpoint en construcción'
  });
});

export default router; 