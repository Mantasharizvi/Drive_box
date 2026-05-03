import React, { useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, LinearProgress, Alert
} from '@mui/material';
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import axios from 'axios';

export default function UploadImageDialog({ open, onClose, folderId, onSuccess }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^/.]+$/, ''));
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) {
      setFile(f);
      if (!name) setName(f.name.replace(/\.[^/.]+$/, ''));
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Image name is required');
    if (!file) return setError('Please select an image');
    setLoading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('folder', folderId);
    formData.append('image', file);

    try {
      const res = await axios.post('/api/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      });
      onSuccess(res.data);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setName(''); setFile(null); setPreview(''); setError(''); setProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
      <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Upload Image</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <TextField
          fullWidth label="Image Name" value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2.5, ...darkInput }}
          required
        />

        <Box
          onClick={() => fileRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: `2px dashed ${preview ? '#667eea' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 3, p: 3, textAlign: 'center', cursor: 'pointer',
            background: preview ? 'rgba(102,126,234,0.05)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease',
            '&:hover': { borderColor: '#667eea', background: 'rgba(102,126,234,0.08)' }
          }}
        >
          <input type="file" accept="image/*" ref={fileRef} hidden onChange={handleFile} />
          {preview ? (
            <Box>
              <img src={preview} alt="preview"
                style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
              <Typography color="rgba(255,255,255,0.5)" mt={1} fontSize="0.8rem">
                {file?.name} ({(file?.size / 1024).toFixed(1)} KB)
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 1 }} />
              <Typography color="rgba(255,255,255,0.6)" fontWeight={500}>
                Click or drag & drop an image
              </Typography>
              <Typography color="rgba(255,255,255,0.3)" fontSize="0.8rem" mt={0.5}>
                JPG, PNG, GIF, WebP up to 10MB
              </Typography>
            </Box>
          )}
        </Box>

        {loading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} variant="determinate" value={progress} />}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)' }} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit} variant="contained" disabled={loading || !file}
          startIcon={<CloudUpload />}
          sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 2 }}
        >
          {loading ? `${progress}%` : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const darkInput = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#667eea' }
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
};
