import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchReports,
  deleteReport,
  exportReportToExcel,
  exportReportToImage,
} from '../services/api';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  IconButton,
  Tooltip,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchReports();
      setReports(response.data);
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    await deleteReport(id);
    setReports(reports.filter((report) => report.id !== id));
  };

  const handleExportExcel = async (id) => {
    const response = await exportReportToExcel(id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.xlsx');
    document.body.appendChild(link);
    link.click();
  };

  const handleExportImage = async (id) => {
    const response = await exportReportToImage(id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.png');
    document.body.appendChild(link);
    link.click();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const columns = [
    { field: 'title', headerName: 'Название', flex: 1 },
    { field: 'description', headerName: 'Описание', flex: 2 },
    {
      field: 'actions',
      headerName: 'Действия',
      flex: 2,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Просмотр">
            <IconButton
              component={Link}
              to={`/reports/${params.row.id}`}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Редактировать">
            <IconButton
              component={Link}
              to={`/edit/${params.row.id}`}
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              onClick={() => handleDelete(params.row.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспорт в Excel">
            <IconButton onClick={() => handleExportExcel(params.row.id)}>
              <GetAppIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Экспорт в Image">
            <IconButton onClick={() => handleExportImage(params.row.id)}>
              <GetAppIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Typography variant="h4">Список отчетов</Typography>
          <Box>
            <Button
              component={Link}
              to="/create"
              variant="contained"
              color="primary"
              sx={{ marginRight: 2 }}
            >
              Создать отчет
            </Button>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Box>
        <Paper style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={reports}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
            getRowId={(row) => row.id}
          />
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default ReportList;
