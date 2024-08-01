import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReport, updateReport, fetchReportFields, fetchEntityTypes } from '../services/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Box,
  createTheme,
  ThemeProvider,
  CssBaseline,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';

const EditReport = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fields, setFields] = useState([]);
  const [availableFields, setAvailableFields] = useState({});
  const [entityTypeId, setEntityTypeId] = useState('');
  const [entityTypes, setEntityTypes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const reportResponse = await fetchReport(id);
      const report = reportResponse.data;
      setTitle(report.title);
      setDescription(report.description);
      setStartDate(report.start_date);
      setEndDate(report.end_date);
      setFields(report.fields);
      setEntityTypeId(report.entity_type_id);

      const entityResponse = await fetchEntityTypes();
      setEntityTypes(entityResponse.data);

      if (report.entity_type_id) {
        const fieldsResponse = await fetchReportFields(report.entity_type_id);
        setAvailableFields(fieldsResponse.data.fields);
      }
    }
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedReport = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      fields,
      entity_type_id: entityTypeId,
    };
    try {
      await updateReport(id, updatedReport);
      navigate('/');
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box display="flex" justifyContent="space-between" alignItems="center" my={4}>
          <Typography variant="h4">Редактировать отчет</Typography>
          <Tooltip title="Toggle dark/light theme">
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              label="Название"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              variant="outlined"
              multiline
              rows={4}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Дата начала"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Дата окончания"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          <Box mb={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Тип сущности</InputLabel>
              <Select
                value={entityTypeId}
                onChange={(e) => setEntityTypeId(e.target.value)}
                label="Тип сущности"
              >
                {entityTypes.map((type) => (
                  <MenuItem key={type.entityTypeId} value={type.entityTypeId}>
                    {type.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mb={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Поля</InputLabel>
              <Select
                multiple
                value={fields}
                onChange={(e) => setFields(e.target.value)}
                input={<OutlinedInput label="Поля" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {Object.entries(availableFields).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    <Checkbox checked={fields.indexOf(key) > -1} />
                    <ListItemText primary={value.title} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box mt={4}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Обновить
            </Button>
          </Box>
        </form>
      </Container>
    </ThemeProvider>
  );
};

export default EditReport;
