import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, Typography, Box, TableSortLabel, Button,
   Select, MenuItem, FormControl,IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { getActiveBookings, getBookingHistory, createBooking }from '../api/bookingApi';
import type { CreateBookingPayload } from '../api/bookingApi';
import { getUserIdFromToken } from "../helpers/authHelpers";
import { toast } from "react-toastify";
import { debounce } from 'lodash';
import BookingFormDialog from '../components/BookingFormDialog';
import dayjs from "dayjs";
import Loader from '../components/Loader';
import EditToDateDialog from '../components/EditToDateDialog';
import useLanguage from '../hooks/useLanguage';

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
type DateFilter = 'allTime' | 'today' | 'thisweek' | 'thismonth';

const MyResourcePage: React.FC = () => {
  const {t} = useLanguage();
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
  const [editBooking, setEditBooking] = useState<Booking | null>(null);

  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isEditToDateOpen, setIsEditToDateOpen] = useState(false);

  const userId = getUserIdFromToken();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchBookings = useCallback(async () => {
      if (!userId) {
        setBookings([]);
        setTotalBookings(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const commonParams = {
          userId,
          search: searchQuery,
          sortColumn,
          sortDirection,
          pageNumber: page + 1, 
          pageSize: rowsPerPage,
          timeFilter: dateFilter, 
        };

        const [data] = await Promise.all([
          tab === 'active'
            ? getActiveBookings(commonParams)
            : getBookingHistory(commonParams),
          delay(800) 
        ]);

          setBookings(data.data.data);
          setTotalBookings(data.data.totalCount);
        
      } catch (error) {
        toast.error(t('failedToFetchBookings'));
        setBookings([]);
        setTotalBookings(0);
        await delay(500);
      } finally {
        setLoading(false);
      }
    }, [tab,userId,page,rowsPerPage,searchQuery,sortColumn,sortDirection,dateFilter]);

  useEffect(() => {
    const debouncedFetch = debounce(() => {
      fetchBookings();
    }, 300);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0); 
  };

  const handleDateFilterChange = (event: any) => {
    setDateFilter(event.target.value as DateFilter);
    setPage(0); 
  };

  const handleAddBooking = () => {
    setIsBookingFormOpen(true);
  };

  const handleEditToDate = (booking: Booking) => {
    setEditBooking(booking);
    setIsEditToDateOpen(true);
  };

  const handleCloseEditToDate = () => {
    setEditBooking(null);
    setIsEditToDateOpen(false);
  };

  const handleBookingFormSubmit = async (formData: CreateBookingPayload) => {
    if (!userId) {
      toast.error(t('userNotAuthenticated'));
      return;
    }
    try {
      // Ensure fromDate and toDate are not null before sending
      if (!formData.fromDate || !formData.toDate) {
        toast.error(t('fromToDateRequired'));
        return;
      }

      await createBooking(formData); 
      toast.success(t('bookingAddedSuccess'));
      fetchBookings(); // Refresh the list
      setIsBookingFormOpen(false);
    } catch (error) {
      toast.error(t('failedToAddBooking'));
    }
  };

  return (
    <Box sx={{ width: '100%',p: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column',sm: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-start', md: 'center' },
            pb:3,
            gap: 2
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            sx={{
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {t('myResources')}
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
              placeholder={t('searchResourcePlaceholder')}
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
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
                <MenuItem value="allTime">{t('allTime')}</MenuItem>
                <MenuItem value="today">{t('today')}</MenuItem>
                <MenuItem value="thisweek">{t('thisWeek')}</MenuItem>
                <MenuItem value="thismonth">{t('thisMonth')}</MenuItem>
              </Select>
            </FormControl>
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBooking}
              sx={{ height: '42px', width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap', overflow: 'hidden', minWidth: '160px' }}
            >
              {t('bookResource')}
            </Button>
          </Box>
        </Box>

        <Box sx={{ pb:3, display: 'flex', gap: 1 }}>
          <Button
            variant={tab === 'active' ? 'contained' : 'outlined'}
            startIcon={<StorageIcon />}
            onClick={() => {  if (tab !== 'active') {setLoading(true); setTab('active'); setPage(0); }}}
          >
            {t('activeResource')}
          </Button>
          <Button
            variant={tab === 'history' ? 'contained' : 'outlined'}
            startIcon={<HistoryIcon />}
            onClick={() => {  if (tab !== 'history') {setLoading(true);setTab('history'); setPage(0); }}}
          >
            {t('resourceHistory')}
          </Button>
        </Box>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                      {t('resource')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortColumn === 'quantity' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'quantity'}
                      direction={sortColumn === 'quantity' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('quantity')}
                    >
                      {t('quantity')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }} sortDirection={sortColumn === 'fromDate' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'fromDate'}
                      direction={sortColumn === 'fromDate' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('fromDate')}
                    >
                      {t('fromDate')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 120 }} sortDirection={sortColumn === 'toDate' ? sortDirection : false}>
                    <TableSortLabel
                      active={sortColumn === 'toDate'}
                      direction={sortColumn === 'toDate' ? sortDirection : 'asc'}
                      onClick={() => handleSortClick('toDate')}
                    >
                      {t('toDate')}
                    </TableSortLabel>
                  </TableCell>
                  {tab === 'active' && <TableCell>{t("actions")}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && bookings?.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow hover key={booking.id}>
                      <TableCell>{booking.resourceName}</TableCell>
                      <TableCell>{booking.quantity}</TableCell>
                      <TableCell>{new Date(booking.fromDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.toDate).toLocaleDateString()}</TableCell>
                      {tab === 'active' && (
                        <TableCell align="center">
                          <IconButton onClick={() =>  handleEditToDate(booking)} color="primary" >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  !loading && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {t('noResourcesFound')}
                      </TableCell>
                    </TableRow>
                  )
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
            toast.error(t('userNotAuthenticated'));
            return;
          }

          const payload: CreateBookingPayload = {
            resourceId: formData.resourceId as number,
            quantity: Number(formData.quantity),
            fromDate: dayjs(formData.fromDate).format("YYYY-MM-DD"),
            toDate: dayjs(formData.toDate).format("YYYY-MM-DD"),
            userId: userId,
          };

          handleBookingFormSubmit(payload);
        }}
      />

      <EditToDateDialog
        open={isEditToDateOpen}
        currentToDate={editBooking?.toDate || ''}
        bookingId={editBooking?.id || 0}
        onClose={handleCloseEditToDate}
        onSuccess={() => fetchBookings()} 
      />

      <Loader open={loading} />
    </Box>
  );
};

export default MyResourcePage;