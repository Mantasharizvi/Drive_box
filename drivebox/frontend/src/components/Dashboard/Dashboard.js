import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Breadcrumbs, Link,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Snackbar, CircularProgress, Fab, Tooltip,
  AppBar, Toolbar, Avatar, Menu, MenuItem, Divider, IconButton,
  Dialog as ConfirmDialog
} from '@mui/material';
import {
  CreateNewFolder, CloudUpload, Home, NavigateNext,
  Logout, Person, CloudQueue, Add, FolderOpen, Image as ImageIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FolderCard from '../Folder/FolderCard';
import ImageCard from '../Image/ImageCard';
import UploadImageDialog from '../Image/UploadImageDialog';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Feedback
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [formError, setFormError] = useState('');

  // User menu
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const loadContent = useCallback(async (folderId = null) => {
    setLoading(true);
    try {
      const foldersRes = await axios.get('/api/folders', {
        params: { parent: folderId || '' }
      });
      setFolders(foldersRes.data);

      if (folderId) {
        const imagesRes = await axios.get('/api/images', { params: { folder: folderId } });
        setImages(imagesRes.data);
        const breadRes = await axios.get(`/api/folders/${folderId}/breadcrumb`);
        setBreadcrumb(breadRes.data);
      } else {
        setImages([]);
        setBreadcrumb([]);
      }
    } catch (err) {
      showSnack('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContent(currentFolder); }, [currentFolder, loadContent]);

  const openFolder = (folder) => setCurrentFolder(folder._id);

  const navigateBreadcrumb = (id) => {
    setCurrentFolder(id);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return setFormError('Folder name is required');
    setFormError('');
    try {
      const res = await axios.post('/api/folders', {
        name: newFolderName.trim(),
        parent: currentFolder || null
      });
      setFolders(prev => [res.data, ...prev]);
      setCreateFolderOpen(false);
      setNewFolderName('');
      showSnack('Folder created!');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`/api/folders/${deleteConfirm.id}`);
      setFolders(prev => prev.filter(f => f._id !== deleteConfirm.id));
      setDeleteConfirm(null);
      showSnack('Folder deleted');
    } catch (err) {
      showSnack('Failed to delete folder', 'error');
    }
  };

  const handleRenameFolder = async (id, name) => {
    try {
      const res = await axios.put(`/api/folders/${id}`, { name });
      setFolders(prev => prev.map(f => f._id === id ? { ...f, name: res.data.name } : f));
      showSnack('Folder renamed');
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to rename', 'error');
    }
  };

  const handleDeleteImage = async (id) => {
    try {
      await axios.delete(`/api/images/${id}`);
      setImages(prev => prev.filter(i => i._id !== id));
      showSnack('Image deleted');
    } catch (err) {
      showSnack('Failed to delete image', 'error');
    }
  };

  const handleUploadSuccess = (image) => {
    setImages(prev => [image, ...prev]);
    showSnack('Image uploaded successfully!');
    loadContent(currentFolder); // Refresh to update folder sizes
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
      {/* Navbar */}
      <AppBar position="sticky" elevation={0} sx={{
        background: 'rgba(15,12,41,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CloudQueue sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="white" sx={{ letterSpacing: '-0.5px' }}>
              DriveBox
            </Typography>
          </Box>

          <IconButton onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar sx={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              fontSize: '0.9rem', fontWeight: 700
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={() => setUserMenuAnchor(null)}
            PaperProps={{
              sx: {
                background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2, minWidth: 200, mt: 1
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography color="white" fontWeight={600}>{user?.name}</Typography>
              <Typography color="rgba(255,255,255,0.4)" fontSize="0.8rem">{user?.email}</Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <MenuItem onClick={logout} sx={{ color: '#f44336', gap: 1, mt: 0.5 }}>
              <Logout fontSize="small" /> Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        {/* Header & Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            {/* Breadcrumb */}
            <Breadcrumbs
              separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(255,255,255,0.3)' }} />}
              sx={{ mb: 0.5 }}
            >
              <Link
                component="button"
                onClick={() => setCurrentFolder(null)}
                sx={{
                  color: currentFolder ? 'rgba(255,255,255,0.5)' : 'white',
                  fontWeight: 600, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
                  '&:hover': { color: '#667eea' }
                }}
              >
                <Home sx={{ fontSize: 18 }} /> My Drive
              </Link>
              {breadcrumb.map((crumb, i) => (
                <Link
                  key={crumb.id}
                  component="button"
                  onClick={() => navigateBreadcrumb(crumb.id)}
                  sx={{
                    color: i === breadcrumb.length - 1 ? 'white' : 'rgba(255,255,255,0.5)',
                    fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
                    '&:hover': { color: '#667eea' }
                  }}
                >
                  {crumb.name}
                </Link>
              ))}
            </Breadcrumbs>
            <Typography color="rgba(255,255,255,0.4)" fontSize="0.8rem">
              {folders.length} folder{folders.length !== 1 ? 's' : ''}
              {currentFolder ? `, ${images.length} image${images.length !== 1 ? 's' : ''}` : ''}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined" startIcon={<CreateNewFolder />}
              onClick={() => { setCreateFolderOpen(true); setFormError(''); setNewFolderName(''); }}
              sx={{
                color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: 2, '&:hover': { borderColor: '#667eea', color: '#667eea' }
              }}
            >
              New Folder
            </Button>
            {currentFolder && (
              <Button
                variant="contained" startIcon={<CloudUpload />}
                onClick={() => setUploadOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: 2, boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
                  '&:hover': { background: 'linear-gradient(135deg, #5a72d4, #6a42a0)' }
                }}
              >
                Upload Image
              </Button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#667eea' }} />
          </Box>
        ) : (
          <>
            {/* Folders Section */}
            {folders.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography color="rgba(255,255,255,0.5)" fontWeight={600} fontSize="0.75rem"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 2 }}>
                  Folders
                </Typography>
                <Grid container spacing={2}>
                  {folders.map(folder => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={folder._id}>
                      <FolderCard
                        folder={folder}
                        onClick={() => openFolder(folder)}
                        onDelete={(id, name) => setDeleteConfirm({ id, name })}
                        onRename={handleRenameFolder}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Images Section */}
            {currentFolder && images.length > 0 && (
              <Box>
                <Typography color="rgba(255,255,255,0.5)" fontWeight={600} fontSize="0.75rem"
                  sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 2 }}>
                  Images
                </Typography>
                <Grid container spacing={2}>
                  {images.map(image => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={image._id}>
                      <ImageCard image={image} onDelete={handleDeleteImage} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Empty State */}
            {folders.length === 0 && images.length === 0 && (
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', py: 12, gap: 2
              }}>
                <Box sx={{
                  width: 80, height: 80, borderRadius: 4,
                  background: 'rgba(102,126,234,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {currentFolder ? (
                    <ImageIcon sx={{ fontSize: 40, color: 'rgba(102,126,234,0.5)' }} />
                  ) : (
                    <FolderOpen sx={{ fontSize: 40, color: 'rgba(102,126,234,0.5)' }} />
                  )}
                </Box>
                <Typography color="white" fontWeight={600} fontSize="1.1rem">
                  {currentFolder ? 'This folder is empty' : 'No folders yet'}
                </Typography>
                <Typography color="rgba(255,255,255,0.4)" textAlign="center">
                  {currentFolder
                    ? 'Upload images to get started'
                    : 'Create a folder to organize your images'}
                </Typography>
                {currentFolder && (
                  <Button
                    variant="contained" startIcon={<CloudUpload />}
                    onClick={() => setUploadOpen(true)}
                    sx={{
                      mt: 1, background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: 2
                    }}
                  >
                    Upload Image
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)}
        PaperProps={{ sx: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>Create New Folder</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <TextField
            autoFocus fullWidth label="Folder Name" value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            sx={{ mt: 1, ...darkInput }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateFolderOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 2 }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'white' }}>Delete Folder?</DialogTitle>
        <DialogContent>
          <Typography color="rgba(255,255,255,0.6)">
            Deleting <b style={{ color: 'white' }}>"{deleteConfirm?.name}"</b> will permanently remove
            all nested folders and images inside it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button onClick={handleDeleteFolder} variant="contained" color="error" sx={{ borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      {currentFolder && (
        <UploadImageDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          folderId={currentFolder}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
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
