import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import StorageIcon from '@mui/icons-material/Storage';
import { getActiveUsersCount, getDailyResourceUsage } from '../api/dashboardApi';
import type { DailyResourceUsage } from '../api/dashboardApi';
import { getUserIdFromToken } from "../helpers/authHelpers";
import Loader from '../components/Loader';
import useLanguage from '../hooks/useLanguage';

const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [days, setDays] = useState<number>(30);
  const [resourceUsage, setResourceUsage] = useState<DailyResourceUsage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  const userId = getUserIdFromToken();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchActiveUsers = async () => {
    try {
      const userStats = await getActiveUsersCount();
      setActiveUsers(userStats.activeUsersCount);
    } catch (error) {
      console.error("Error fetching active user count", error);
    }
  };

  const fetchResourceUsage = async () => {
    setLoading(true);
    try {
      const usage = await getDailyResourceUsage(userId ?? 0, days);
      await delay(800);
      setResourceUsage(usage);
    } catch (error) {
      console.error("Error fetching resource usage", error);
      await delay(500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveUsers(); 
  }, []);
  
  useEffect(() => {
    fetchResourceUsage(); 
  }, [days]);

  const totalActiveQuantity = resourceUsage.reduce((sum, item) => sum + item.totalActiveQuantity, 0);
  const totalUsedQuantity = resourceUsage.reduce((sum, item) => sum + item.totalUsedQuantity, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartData = resourceUsage.map(item => ({
    ...item,
    formattedDate: formatDate(item.bookingDate),
    bookingDate: item.bookingDate
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} mb={1}>
            {`Date: ${formatDate(label)}`}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 80 }
    };

    const xAxisProps = {
      dataKey: "formattedDate",
      tick: { fontSize: 11, angle: -45, textAnchor: 'end' },
      height: 80,
      interval: chartData.length > 20 ? Math.floor(chartData.length / 10) : 0
    };

    const yAxisProps = {
      tick: { fontSize: 12 },
      label: { 
        value: t('quantity'), 
        angle: -90, 
        position: 'insideLeft',
        style: { textAnchor: 'middle' }
      }
    };

    if (chartType === 'line') {
      return (
        <LineChart {...commonProps}>
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="totalActiveQuantity" 
            stroke="#4CAF50" 
            name="Active Resource" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#4CAF50" }}
            activeDot={{ r: 6, fill: "#4CAF50" }}
          />
          <Line 
            type="monotone" 
            dataKey="totalUsedQuantity" 
            stroke="#FF9800" 
            name="Used Resource" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#FF9800" }}
            activeDot={{ r: 6, fill: "#FF9800" }}
          />
        </LineChart>
      );
    }

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="totalActiveQuantity" 
            stroke="#4CAF50" 
            fill="#C8E6C9" 
            name="Active Resource"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="totalUsedQuantity" 
            stroke="#FF9800" 
            fill="#FFE0B2" 
            name="Used Resource"
            strokeWidth={2}
          />
        </AreaChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="totalActiveQuantity" 
          fill="#4CAF50" 
          name={t('activeResource')}
          radius={[2, 2, 0, 0]}
          barSize={50}
        />
        <Bar 
          dataKey="totalUsedQuantity" 
          fill="#FF9800" 
          name={t('usedResource')}
          radius={[2, 2, 0, 0]}
          barSize={50}
        />
      </BarChart>
    );
  };

  return (
    <Box p={4} bgcolor="#f9f9f9">
      <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
        {t('dashboard')}
      </Typography>

      <Box
        mb={4}
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        gap={3}
      >
        {[
          { label: t('activeUsers'), value: activeUsers, bg: '#8f9bdfff', icon: <PeopleIcon /> },
          { label: t('totalActiveResourceQuantity'), value: totalActiveQuantity, bg: '#4CAF50', icon: <StorageIcon /> },
          { label: t('totalUsedResourceQuantity'), value: totalUsedQuantity, bg: '#ff9800', icon: <AssignmentTurnedInIcon  /> },
        ].map((stat, idx) => (
          <Box
            key={idx}
            sx={{
              flex: {
                xs: '100%',
                sm: '100%',
                md: '30%',
                lg: '30%',
              },
            }}
          >
            <Card
              sx={{
                bgcolor: stat.bg,
                color: 'white',
                borderRadius: 3,
                height: '100%',
                boxShadow: 3,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ py: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={500}>
                    {stat.label}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight={700}>
                  {stat.value.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            mb={3}
          >
            <Typography  variant="h6" fontWeight={600} color="primary" sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 1 }} />
              {t('resourceUsageHistory')}
            </Typography>

            <Stack direction="row" spacing={2}>
              <FormControl size="small">
                <InputLabel>{t('chartType')}</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'area')}
                >
                  <MenuItem value="bar">{t('barChart')}</MenuItem>
                  <MenuItem value="line">{t('lineChart')}</MenuItem>
                  <MenuItem value="area">{t('areaChart')}</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>{t('timePeriod')}</InputLabel>
                <Select value={days} label="Time Period" onChange={(e) => setDays(Number(e.target.value))}>
                  <MenuItem value={10}>{t('last10Days')}</MenuItem>
                  <MenuItem value={30}>{t('last30Days')}</MenuItem>
                  <MenuItem value={60}>{t('last60Days')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {resourceUsage.length ? (
            <Box sx={{ bgcolor: '#fafafa', borderRadius: 2, p: 2 }}>
              <ResponsiveContainer width="100%" height={500}>
                {renderChart()}
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box textAlign="center" py={10} color="text.secondary">
              <Typography variant="h6" gutterBottom>{t('noDataAvailable')}</Typography>
              <Typography variant="body2">{t('tryAdjusting')}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Loader open={loading} />
    </Box>
  );
};

export default DashboardPage;