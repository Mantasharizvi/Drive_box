import React, { useState } from 'react';
import {
  Card, CardContent, Typography, IconButton, Menu, MenuItem,
  Box, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button
} from '@mui/material';
import { Folder, MoreVert, DriveFileRenameOutline, Delete } from '@mui/icons-material';
import { formatFileSize } from '../../utils/helpers';

export default function FolderCard({ folder, onClick, onDelete, onRename }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleMenu = (e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); };
  const handleClose = () => setAnchorEl(null);

  const handleRename = () => {
    handleClose();
    setNewName(folder.name);
    setRenameOpen(true);
  };

  const submitRename = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename(folder._id, newName.trim());
    }
    setRenameOpen(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    handleClose();
    onDelete(folder._id, folder.name);
  };

  return (
    <>
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(102,126,234,0.12)',
            border: '1px solid rgba(102,126,234,0.4)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(102,126,234,0.2)'
          }
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Folder sx={{ color: '#667eea', fontSize: 24 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Tooltip title={folder.name}>
                  <Typography
                    fontWeight={600} color="white" noWrap
                    sx={{ fontSize: '0.9rem', maxWidth: 140 }}
                  >
                    {folder.name}
                  </Typography>
                </Tooltip>
                <Typography color="rgba(255,255,255,0.4)" sx={{ fontSize: '0.75rem' }}>
                  {formatFileSize(folder.totalSize)}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small" onClick={handleMenu}
              sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: 'white' }, flexShrink: 0 }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2, minWidth: 150
          }
        }}
      >
        <MenuItem onClick={handleRename} sx={{ color: 'white', gap: 1 }}>
          <DriveFileRenameOutline fontSize="small" /> Rename
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: '#f44336', gap: 1 }}>
          <Delete fontSize="small" /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}
        PaperProps={{ sx: { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: 'white' }}>Rename Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            sx={{ mt: 1, ...darkInput }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRenameOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button onClick={submitRename} variant="contained"
            sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 2 }}>
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const darkInput = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#667eea' }
  }
};
