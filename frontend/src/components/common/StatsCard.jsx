import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

/**
 * Komponen StatsCard untuk menampilkan statistik dalam bentuk kartu.
 * 
 * @param {Object} props - Props komponen
 * @param {string} props.title - Judul statistik
 * @param {string|number} props.value - Nilai statistik
 * @param {string} props.subtitle - Subjudul statistik
 * @param {ReactNode} props.icon - Ikon statistik
 * @param {string} props.iconColor - Warna ikon
 * @param {string} props.iconBgColor - Warna latar belakang ikon
 * @param {string} props.trend - Tren statistik (up, down, neutral)
 * @param {string|number} props.trendValue - Nilai tren
 * @param {string} props.trendLabel - Label tren
 * @param {boolean} props.loading - Status loading
 * @param {string} props.tooltipText - Teks tooltip
 * @param {function} props.onClick - Fungsi yang dipanggil saat kartu diklik
 * @param {Object} props.sx - Style tambahan untuk kartu
 * @returns {JSX.Element} Komponen StatsCard
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'primary.main',
  iconBgColor = 'primary.lighter',
  trend,
  trendValue,
  trendLabel,
  loading = false,
  tooltipText,
  onClick,
  sx = {},
}) => {
  // Menentukan warna tren
  const getTrendColor = () => {
    if (trend === 'up') return 'success.main';
    if (trend === 'down') return 'error.main';
    return 'text.secondary';
  };

  // Menentukan ikon tren
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'none',
          boxShadow: onClick ? 3 : 1,
        },
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {loading ? <Skeleton width={100} /> : title}
              {tooltipText && (
                <Tooltip title={tooltipText} arrow placement="top">
                  <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                    <InfoIcon fontSize="inherit" color="disabled" />
                  </IconButton>
                </Tooltip>
              )}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
              {loading ? <Skeleton width={80} /> : value}
            </Typography>
          </Box>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: iconBgColor,
                color: iconColor,
              }}
            >
              {loading ? <Skeleton variant="circular" width={32} height={32} /> : icon}
            </Box>
          )}
        </Box>

        {(subtitle || trendValue) && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {loading ? <Skeleton width={120} /> : subtitle}
              </Typography>
            )}
            {trendValue && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loading ? (
                  <Skeleton width={60} />
                ) : (
                  <>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getTrendColor(),
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 'medium',
                      }}
                    >
                      {getTrendIcon()} {trendValue}
                    </Typography>
                    {trendLabel && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        {trendLabel}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;