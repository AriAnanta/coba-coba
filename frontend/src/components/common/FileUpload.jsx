import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as TextIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Archive as ArchiveIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

/**
 * Komponen FileUpload untuk mengunggah file dengan fitur drag and drop dan preview.
 * 
 * @param {Object} props - Props komponen
 * @param {function} props.onFileSelect - Fungsi yang dipanggil saat file dipilih
 * @param {function} props.onFileRemove - Fungsi yang dipanggil saat file dihapus
 * @param {Array} props.acceptedFileTypes - Jenis file yang diterima (contoh: ['image/*', '.pdf'])
 * @param {boolean} props.multiple - Apakah dapat mengunggah banyak file sekaligus
 * @param {number} props.maxFileSize - Ukuran maksimum file dalam bytes
 * @param {number} props.maxFiles - Jumlah maksimum file yang dapat diunggah
 * @param {Array} props.initialFiles - File awal yang sudah diunggah
 * @param {boolean} props.disabled - Status komponen dinonaktifkan
 * @param {boolean} props.loading - Status loading
 * @param {number} props.uploadProgress - Persentase progres unggahan (0-100)
 * @param {Object} props.sx - Style tambahan untuk komponen
 * @returns {JSX.Element} Komponen FileUpload
 */
const FileUpload = ({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = [],
  multiple = false,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  initialFiles = [],
  disabled = false,
  loading = false,
  uploadProgress = 0,
  sx = {},
}) => {
  const [files, setFiles] = useState(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Fungsi untuk menangani drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !loading) {
      setIsDragging(true);
    }
  };

  // Fungsi untuk menangani drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Fungsi untuk menangani drop file
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled || loading) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Fungsi untuk menangani pemilihan file
  const handleFileSelect = (e) => {
    if (disabled || loading) return;
    
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
    // Reset input value agar event change tetap terpicu jika memilih file yang sama
    e.target.value = '';
  };

  // Fungsi untuk memproses file yang dipilih
  const handleFiles = (selectedFiles) => {
    setError('');
    
    // Validasi jumlah file
    if (!multiple && selectedFiles.length > 1) {
      setError('Hanya satu file yang diperbolehkan');
      return;
    }
    
    if (multiple && files.length + selectedFiles.length > maxFiles) {
      setError(`Maksimal ${maxFiles} file yang diperbolehkan`);
      return;
    }
    
    // Validasi tipe dan ukuran file
    const validFiles = selectedFiles.filter(file => {
      // Validasi tipe file jika acceptedFileTypes tidak kosong
      if (acceptedFileTypes.length > 0) {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
        const isValidType = acceptedFileTypes.some(type => {
          if (type.startsWith('.')) {
            // Validasi berdasarkan ekstensi
            return fileExtension === type.toLowerCase();
          } else if (type.endsWith('/*')) {
            // Validasi berdasarkan kategori (image/*, video/*, etc)
            const category = type.split('/')[0];
            return fileType.startsWith(`${category}/`);
          } else {
            // Validasi berdasarkan tipe spesifik (image/png, application/pdf, etc)
            return fileType === type;
          }
        });
        
        if (!isValidType) {
          setError(`Tipe file tidak didukung. Tipe yang diterima: ${acceptedFileTypes.join(', ')}`);
          return false;
        }
      }
      
      // Validasi ukuran file
      if (file.size > maxFileSize) {
        setError(`Ukuran file terlalu besar. Maksimal ${formatFileSize(maxFileSize)}`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Update state files
    const newFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(newFiles);
    
    // Panggil callback onFileSelect
    if (onFileSelect) {
      onFileSelect(multiple ? newFiles : newFiles[0]);
    }
  };

  // Fungsi untuk menghapus file
  const handleRemoveFile = (index) => {
    if (disabled || loading) return;
    
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    // Panggil callback onFileRemove
    if (onFileRemove) {
      onFileRemove(index, multiple ? newFiles : newFiles[0] || null);
    }
  };

  // Fungsi untuk memformat ukuran file
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fungsi untuk mendapatkan icon berdasarkan tipe file
  const getFileIcon = (file) => {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (fileType === 'application/pdf') {
      return <PdfIcon />;
    } else if (fileType.startsWith('video/')) {
      return <VideoIcon />;
    } else if (fileType.startsWith('audio/')) {
      return <AudioIcon />;
    } else if (fileType.startsWith('text/')) {
      return <TextIcon />;
    } else if (fileType.includes('compressed') || fileType.includes('zip') || fileType.includes('archive')) {
      return <ArchiveIcon />;
    } else if (fileType.includes('code') || file.name.match(/\.(js|jsx|ts|tsx|html|css|json|xml|py|java|php|rb|go|c|cpp|h|cs)$/i)) {
      return <CodeIcon />;
    } else {
      return <FileIcon />;
    }
  };

  // Fungsi untuk mendapatkan preview file
  const getFilePreview = (file, index) => {
    const isImage = file.type.startsWith('image/');
    
    return (
      <ListItem key={index} divider={index < files.length - 1}>
        {isImage ? (
          <Box
            component="img"
            src={URL.createObjectURL(file)}
            alt={file.name}
            sx={{ width: 40, height: 40, mr: 2, objectFit: 'cover', borderRadius: 1 }}
          />
        ) : (
          <Box sx={{ mr: 2 }}>{getFileIcon(file)}</Box>
        )}
        <ListItemText
          primary={file.name}
          secondary={formatFileSize(file.size)}
          primaryTypographyProps={{ noWrap: true }}
        />
        <ListItemSecondaryAction>
          <Tooltip title="Hapus">
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleRemoveFile(index)}
              disabled={disabled || loading}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept={acceptedFileTypes.join(',')}
        multiple={multiple}
        disabled={disabled || loading}
      />
      
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
          borderStyle: isDragging ? 'dashed' : 'solid',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderWidth: isDragging ? 2 : 1,
          borderRadius: 2,
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.7 : 1,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !loading && fileInputRef.current.click()}
      >
        {loading ? (
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1">Mengunggah file...</Typography>
            {uploadProgress > 0 && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              {multiple ? 'Unggah File' : 'Unggah File'}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Seret & lepas file di sini, atau klik untuk memilih file
            </Typography>
            {acceptedFileTypes.length > 0 && (
              <Typography variant="caption" color="textSecondary" display="block">
                Tipe file yang diterima: {acceptedFileTypes.join(', ')}
              </Typography>
            )}
            <Typography variant="caption" color="textSecondary" display="block">
              Ukuran maksimum: {formatFileSize(maxFileSize)}
            </Typography>
            {multiple && (
              <Typography variant="caption" color="textSecondary" display="block">
                Maksimal {maxFiles} file
              </Typography>
            )}
          </>
        )}
      </Paper>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}
      
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {files.map((file, index) => getFilePreview(file, index))}
          </List>
        </Box>
      )}
      
      {files.length > 0 && !disabled && !loading && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => {
              setFiles([]);
              if (onFileRemove) onFileRemove(null, multiple ? [] : null);
            }}
            startIcon={<DeleteIcon />}
          >
            Hapus Semua
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;