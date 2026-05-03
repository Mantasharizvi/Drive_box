import React, { useState } from 'react';
import {
  Card, CardMedia, CardContent, Typography, IconButton,
  Box, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button
} from '@mui/material';
import { Delete, ZoomIn } from '@mui/icons-material';
import { formatFileSize, getImageUrl } from '../../utils/helpers';

export default function ImageCard({ image, onDelete }) {
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <Card sx={{
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          border: '1px solid rgba(102,126,234,0.3)'
        },
        '&:hover .image-actions': { opacity: 1 }
      }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={getImageUrl(image.url)}
            alt={image.name}
            sx={{ objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => setPreview(true)}
          />
          <Box className="image-actions" sx={{
            position: 'absolute', top: 8, right: 8,
            display: 'flex', gap: 0.5, opacity: 0,
            transition: 'opacity 0.2s ease'
          }}>
            <IconButton size="small" onClick={() => setPreview(true)}
              sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}>
              <ZoomIn fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setConfirmDelete(true)}
              sx={{ bgcolor: 'rgba(244,67,54,0.7)', color: 'white', '&:hover': { bgcolor: 'rgba(244,67,54,0.9)' } }}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Tooltip title={image.name}>
            <Typography fontWeight={600} color="white" noWrap sx={{ fontSize: '0.85rem' }}>
              {image.name}
            </Typography>
          </Tooltip>
          <Typography color="rgba(255,255,255,0.4)" sx={{ fontSize: '0.72rem' }}>
            {formatFileSize(image.size)}
          </Typography>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={preview} onClose={() => setPreview(false)} maxWidth="md"
        PaperProps={{ sx: { background: '#0f0c29', borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ position: 'relative' }}>
          <img
            src={getImageUrl(image.url)} alt={image.name}
            style={{ maxWidth: '90vw', maxHeight: '80vh', display: 'block', objectFit: 'contain' }}
          />
          <Typography sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            color: 'white', fontWeight: 600, fontSize: '0.9rem'
          }}>
            {image.name} • {formatFileSize(image.size)}
          </Typography>
        </Box>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}
        PaperProps={{ sx: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'white' }}>Delete Image?</DialogTitle>
        <DialogContent>
          <Typography color="rgba(255,255,255,0.6)">
            Are you sure you want to delete "<b style={{ color: 'white' }}>{image.name}</b>"? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConfirmDelete(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button
            onClick={() => { onDelete(image._id); setConfirmDelete(false); }}
            variant="contained" color="error" sx={{ borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
