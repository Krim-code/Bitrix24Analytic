import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport, fetchReportFields, fetchEntityTypes } from '../services/api';
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

const CreateReport = () => {
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
      const entityResponse = await fetchEntityTypes();
      setEntityTypes(entityResponse.data);

      if (entityTypeId) {
        const fieldsResponse = await fetchReportFields(entityTypeId);
        setAvailableFields(fieldsResponse.data.fields);
      }
    }
    fetchData();
  }, [entityTypeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const report = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      fields,
      entity_type_id: entityTypeId,
    };
    try {
      await createReport(report);
      navigate('/');
    } catch (error) {
      console.error('Error creating report:', error);
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
          <Typography variant="h4">Создать отчет</Typography>
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
              Создать
            </Button>
          </Box>
        </form>
      </Container>
    </ThemeProvider>
  );
};

export default CreateReport;
