import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, IconButton, Typography, Box, TableSortLabel, Button,
   Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getActiveBookings, getBookingHistory, createBooking }from '../api/bookingApi';
import type { CreateBookingPayload } from '../api/bookingApi';
import { getUserIdFromToken } from "../helpers/authHelpers";
import { toast } from "react-toastify";
import { debounce } from 'lodash';
import BookingFormDialog from '../components/BookingFormDialog';
import dayjs from "dayjs";

interface Booking {
  id: number;
  resourceId: number;
  userId: number;
  resourceName: string;
  quantity: number;
  fromDate: string;
  toDate: string;
}

type SortColumn = 'resourceName' | 'quantity' | 'fromDate' | 'toDate';
type DateFilter = 'allTime' | 'today' | 'thisWeek' | 'thisMonth';

const MyResourcePage: React.FC = () => {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortColumn, setSortColumn] = useState<SortColumn>('fromDate'); 
  const [dateFilter, setDateFilter] = useState<DateFilter>('allTime');

  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);

  const userId = getUserIdFromToken();

  const calculateDateRange = (filter: DateFilter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (filter) {
      case 'today':
        startDate = today;
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisWeek':
        startDate = new Date(today.setDate(today.getDate() - today.getDay())); 
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 6); 
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); 
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'allTime':
      default:
        break;
    }
    return { startDate, endDate };
  };

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      setTotalBookings(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data =
        tab === 'active'
          ? await getActiveBookings(userId)
          : await getBookingHistory(userId);

      if (Array.isArray(data)) {
        let filtered = data.filter((booking) =>
          booking.resourceName?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const { startDate, endDate } = calculateDateRange(dateFilter);
        if (startDate && endDate) {
          filtered = filtered.filter(booking => {
            const bookingFromDate = new Date(booking.fromDate);
            bookingFromDate.setHours(0, 0, 0, 0);
            return bookingFromDate >= startDate && bookingFromDate <= endDate;
          });
        }

        filtered.sort((a, b) => {
          let valA: string | number;
          let valB: string | number;

          if (sortColumn === 'resourceName') {
            valA = a.resourceName.toLowerCase();
            valB = b.resourceName.toLowerCase();
          } else if (sortColumn === 'quantity') {
            valA = a.quantity;
            valB = b.quantity;
          } else if (sortColumn === 'fromDate') {
            valA = new Date(a.fromDate).getTime();
            valB = new Date(b.fromDate).getTime();
          } else if (sortColumn === 'toDate') {
            valA = new Date(a.toDate).getTime();
            valB = new Date(b.toDate).getTime();
          } else {
            valA = '';
            valB = '';
          }

          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
        console.log(filtered)

        const paged = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        setBookings(paged);
        setTotalBookings(filtered.length);
      } else {
        setBookings([]);
        setTotalBookings(0);
      }
    } catch (error) {
      toast.error("Failed to fetch bookings.");
      setBookings([]);
      setTotalBookings(0);
    } finally {
      setLoading(false);
    }
  }, [tab, userId, page, rowsPerPage, searchQuery, sortColumn, sortDirection,dateFilter]);

  useEffect(() => {
    const debouncedFetch = debounce(() => {
      fetchBookings();
    }, 500);

    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [tab, page, rowsPerPage, searchQuery, sortColumn, sortDirection,dateFilter, fetchBookings]);

  const handleSortClick = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateFilterChange = (event: any) => {
    setDateFilter(event.target.value as DateFilter);
    setPage(0); 
  };

  const handleAddBooking = () => {
    setIsBookingFormOpen(true);
  };

  const handleBookingFormSubmit = async (formData: CreateBookingPayload) => {
    if (!userId) {
      toast.error("User not authenticated.");
      return;
    }
    try {
      // Ensure fromDate and toDate are not null before sending
      if (!formData.fromDate || !formData.toDate) {
        toast.error("Both 'From Date' and 'To Date' are required.");
        return;
      }

      await createBooking(formData); 
      toast.success("Booking added successfully!");
      fetchBookings(); // Refresh the list
      setIsBookingFormOpen(false);
    } catch (error) {
      toast.error("Failed to add booking.");
      console.error("Booking submission error:", error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            padding: 2,
            gap: 2
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            My Resources
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              gap: 2,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            <input
              type="text"
              placeholder="Search resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
              }}
            />
            <FormControl sx={{ minWidth: 130 }}>
              <Select
                labelId="date-filter-label"
                id="date-filter-select"
                value={dateFilter}
                onChange={handleDateFilterChange}
                sx={{ height: '42px' }}
              >
                <MenuItem value="allTime">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="thisWeek">This Week</MenuItem>
                <MenuItem value="thisMonth">This Month</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBooking}
              sx={{ height: '42px', width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap', overflow: 'hidden', minWidth: '160px' }}
            >
              Book Resource
            </Button>
          </Box>
        </Box>

        <Box sx={{ padding: 2, display: 'flex', gap: 1 }}>
          <Button
            variant={tab === 'active' ? 'contained' : 'outlined'}
            startIcon={<EventAvailableIcon />}
            onClick={() => { setTab('active'); setPage(0); }}
          >
            Active Resource
          </Button>
          <Button
            variant={tab === 'history' ? 'contained' : 'outlined'}
            startIcon={<HistoryIcon />}
            onClick={() => { setTab('history'); setPage(0); }}
          >
            Resource History
          </Button>
        </Box>

        <TableContainer>
          <Table stickyHeader aria-label="booking table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 150 }} sortDirection={sortColumn === 'resourceName' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'resourceName'}
                    direction={sortColumn === 'resourceName' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('resourceName')}
                  >
                    Resource
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortColumn === 'quantity' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'quantity'}
                    direction={sortColumn === 'quantity' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('quantity')}
                  >
                    Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }} sortDirection={sortColumn === 'fromDate' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'fromDate'}
                    direction={sortColumn === 'fromDate' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('fromDate')}
                  >
                    From Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }} sortDirection={sortColumn === 'toDate' ? sortDirection : false}>
                  <TableSortLabel
                    active={sortColumn === 'toDate'}
                    direction={sortColumn === 'toDate' ? sortDirection : 'asc'}
                    onClick={() => handleSortClick('toDate')}
                  >
                    To Date
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow hover key={booking.id}>
                    <TableCell>{booking.resourceName}</TableCell>
                    <TableCell>{booking.quantity}</TableCell>
                    <TableCell>{new Date(booking.fromDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(booking.toDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tab === 'active' ? 6 : 5} align="center">
                    {loading ? "Loading..." : "No bookings found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalBookings}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* Booking Form Dialog */}
      <BookingFormDialog
        open={isBookingFormOpen}
        onClose={() => setIsBookingFormOpen(false)}
        onSubmit={(formData) => {
          if (!userId) {
            toast.error("User not authenticated.");
            return;
          }

          // Convert BookingFormData to CreateBookingPayload
          const payload: CreateBookingPayload = {
            resourceId: formData.resourceId as number,
            quantity: Number(formData.quantity),
            fromDate: dayjs(formData.fromDate).format("YYYY-MM-DD"),
            toDate: dayjs(formData.toDate).format("YYYY-MM-DD"),
            userId: userId,
          };
          console.log("payload",payload)

          handleBookingFormSubmit(payload);
        }}
      />
    </Box>
  );
};

export default MyResourcePage;