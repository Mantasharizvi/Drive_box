import React, { useState } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Link,
  InputAdornment, IconButton, Alert, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, CloudQueue } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Paper elevation={0} sx={{
        p: { xs: 3, sm: 5 },
        borderRadius: 4,
        width: '100%',
        maxWidth: 420,
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{
            width: 60, height: 60, borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
            boxShadow: '0 8px 32px rgba(102,126,234,0.4)'
          }}>
            <CloudQueue sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Typography variant="h4" fontWeight={700} color="white" sx={{ letterSpacing: '-0.5px' }}>
            DriveBox
          </Typography>
          <Typography color="rgba(255,255,255,0.5)" mt={0.5}>Sign in to your account</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth label="Email" name="email" type="email"
            value={form.email} onChange={handleChange} required
            sx={{ mb: 2, ...darkInputStyle }}
          />
          <TextField
            fullWidth label="Password" name="password"
            type={showPass ? 'text' : 'password'}
            value={form.password} onChange={handleChange} required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass(!showPass)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 3, ...darkInputStyle }}
          />
          <Button
            fullWidth type="submit" variant="contained" disabled={loading}
            sx={{
              py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '1rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              boxShadow: '0 4px 20px rgba(102,126,234,0.5)',
              '&:hover': { background: 'linear-gradient(135deg, #5a72d4, #6a42a0)' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>

        <Typography color="rgba(255,255,255,0.5)" textAlign="center" mt={3}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" sx={{ color: '#667eea', fontWeight: 600 }}>
            Create one
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

const darkInputStyle = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#667eea' }
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
};
