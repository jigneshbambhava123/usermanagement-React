import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
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
import { getActiveUsersCount, getDailyResourceUsage } from '../api/dashboardApi';
import type { DailyResourceUsage } from '../api/dashboardApi';
import { getUserIdFromToken } from "../helpers/authHelpers";

const DashboardPage: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [days, setDays] = useState<number>(30);
  const [resourceUsage, setResourceUsage] = useState<DailyResourceUsage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  const userId = getUserIdFromToken();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const userStats = await getActiveUsersCount();
      const usage = await getDailyResourceUsage(userId ?? 0, days);
      setActiveUsers(userStats.activeUsersCount);
      setResourceUsage(usage);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [days]);

  const totalActiveQuantity = resourceUsage.reduce((sum, item) => sum + item.totalActiveQuantity, 0);
  const totalUsedQuantity = resourceUsage.reduce((sum, item) => sum + item.totalUsedQuantity, 0);
  const utilizationRate = totalActiveQuantity > 0 ? ((totalUsedQuantity / totalActiveQuantity) * 100).toFixed(1) : '0';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" fontWeight={600}>{`Date: ${label}`}</Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" color={entry.color}>{`${entry.name}: ${entry.value}`}</Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderChart = () => {
    const ChartComponent =
      chartType === 'line' ? LineChart : chartType === 'area' ? AreaChart : BarChart;

    return (
      <ChartComponent data={resourceUsage} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
        <XAxis
          dataKey="bookingDate"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {chartType === 'line' && (
          <>
            <Line type="monotone" dataKey="totalActiveQuantity" stroke="#4CAF50" name="Active" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="totalUsedQuantity" stroke="#FF9800" name="Used" strokeWidth={2} dot={false} />
          </>
        )}
        {chartType === 'area' && (
          <>
            <Area type="monotone" dataKey="totalActiveQuantity" stroke="#4CAF50" fill="#C8E6C9" name="Active" />
            <Area type="monotone" dataKey="totalUsedQuantity" stroke="#FF9800" fill="#FFE0B2" name="Used" />
          </>
        )}
        {chartType === 'bar' && (
          <>
            <Bar dataKey="totalActiveQuantity" fill="#4CAF50" name="Active" />
            <Bar dataKey="totalUsedQuantity" fill="#FF9800" name="Used" />
          </>
        )}
      </ChartComponent>
    );
  };

  return (
    <Box p={4} bgcolor="#f9f9f9" minHeight="100vh">
      <Typography variant="h4" fontWeight={700} color="primary" mb={2}>
        Dashboard Overview
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        Visualize system metrics and usage trends
      </Typography>

      <Grid container spacing={3} mb={4}>
        {[
          { label: 'Active Users', value: activeUsers, bg: '#3f51b5' },
          { label: 'Total Active', value: totalActiveQuantity, bg: '#009688' },
          { label: 'Total Used', value: totalUsedQuantity, bg: '#ff9800' },
          { label: 'Utilization Rate', value: `${utilizationRate}%`, bg: '#4caf50' },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ bgcolor: stat.bg, color: 'white', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2">{stat.label}</Typography>
                <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            mb={3}
          >
            <Typography variant="h6" fontWeight={600} color="primary">
              Resource Usage
            </Typography>
            <Stack direction="row" spacing={2}>
              <FormControl size="small">
                <InputLabel>Chart</InputLabel>
                <Select
                  value={chartType}
                  label="Chart"
                  onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'area')}
                >
                  <MenuItem value="bar">Bar</MenuItem>
                  <MenuItem value="line">Line</MenuItem>
                  <MenuItem value="area">Area</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Days</InputLabel>
                <Select value={days} label="Days" onChange={(e) => setDays(Number(e.target.value))}>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={60}>60</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
              <CircularProgress size={50} />
            </Box>
          ) : resourceUsage.length ? (
            <ResponsiveContainer width="100%" height={450}>
              {renderChart()}
            </ResponsiveContainer>
          ) : (
            <Box textAlign="center" py={10} color="text.secondary">
              <Typography variant="h6">No data available</Typography>
              <Typography variant="body2">Try adjusting the filters above</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
