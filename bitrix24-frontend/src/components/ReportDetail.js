import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchReportData } from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Container,
  Box,
  Typography,
  createTheme,
  ThemeProvider,
  CssBaseline,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  TextField,
} from '@mui/material';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';

const ReportDetail = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      const response = await fetchReportData(id);
      setReport(response.data);
      setSelectedFields(response.data.headers.filter((header) => header !== 'Дата'));
    }
    fetchData();
  }, [id]);

  const exportToExcel = () => {
    const processedRows = processMultipleFields(report.rows, report.headers);
    const worksheet = XLSX.utils.json_to_sheet(processedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'report.xlsx');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFieldChange = (event) => {
    setSelectedFields(event.target.value);
  };

  const handleAddChart = () => {
    setChartConfigs([...chartConfigs, { fields: selectedFields, type: chartType }]);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const processMultipleFields = (rows, headers) => {
    return rows.map((row) => {
      const processedRow = { ...row };
      headers.forEach((header) => {
        if (Array.isArray(processedRow[header])) {
          processedRow[header] = processedRow[header].join(', ');
        }
      });
      return processedRow;
    });
  };

  const filterRowsByDate = (rows) => {
    if (!startDate || !endDate) return rows;
    return rows.filter(
      (row) =>
        new Date(row['Дата']) >= new Date(startDate) &&
        new Date(row['Дата']) <= new Date(endDate)
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Typography variant="h4">Детали отчета</Typography>
          <Tooltip title="Toggle dark/light theme">
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
        {report && (
          <>
            <Box mb={2}>
              <Button variant="contained" color="primary" onClick={exportToExcel}>
                Экспорт в Excel
              </Button>
            </Box>
            <Box height={600} mb={4}>
              <DataGrid
                rows={processMultipleFields(filterRowsByDate(report.rows), report.headers).map(
                  (row, index) => ({
                    id: index,
                    ...row,
                  })
                )}
                columns={report.headers.map((header) => ({
                  field: header,
                  headerName: header,
                  width: 200,
                }))}
                pageSize={10}
                rowsPerPageOptions={[10, 20, 50]}
                checkboxSelection
              />
            </Box>
            <Box mb={4}>
              <FormControl fullWidth>
                <InputLabel>Поля для графика</InputLabel>
                <Select
                  multiple
                  value={selectedFields}
                  onChange={handleFieldChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {report.headers
                    .filter((header) => header !== 'Дата')
                    .map((header) => (
                      <MenuItem key={header} value={header}>
                        <Checkbox checked={selectedFields.indexOf(header) > -1} />
                        <ListItemText primary={header} />
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип графика</InputLabel>
                <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
                  <MenuItem value="line">Линейный</MenuItem>
                  <MenuItem value="bar">Столбчатый</MenuItem>
                  <MenuItem value="stackedBar">Столбчатый за весь период</MenuItem>
                </Select>
              </FormControl>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <TextField
                  label="Дата начала"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Дата окончания"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box mt={2}>
                <Button variant="contained" color="primary" onClick={handleAddChart}>
                  Добавить график
                </Button>
              </Box>
            </Box>
            {chartConfigs.map((config, index) => (
              <Box mb={4} key={index}>
                {config.type === 'line' && (
                  <LineChart width={800} height={400} data={filterRowsByDate(report.rows)}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="Дата" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {config.fields.map((field) => (
                      <Line key={field} type="monotone" dataKey={field} stroke="#8884d8" />
                    ))}
                  </LineChart>
                )}
                {config.type === 'bar' && (
                  <BarChart width={800} height={400} data={filterRowsByDate(report.rows)}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="Дата" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {config.fields.map((field) => (
                      <Bar key={field} dataKey={field} fill="#8884d8" />
                    ))}
                  </BarChart>
                )}
                {config.type === 'stackedBar' && (
                  <BarChart width={800} height={400} data={filterRowsByDate(report.rows)}>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis dataKey="Дата" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {config.fields.map((field) => (
                      <Bar key={field} stackId="a" dataKey={field} fill="#8884d8" />
                    ))}
                  </BarChart>
                )}
              </Box>
            ))}
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default ReportDetail;
