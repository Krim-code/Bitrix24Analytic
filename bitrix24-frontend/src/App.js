import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReportDetail from './components/ReportDetail';
import CreateReport from './components/CreateReport';
import EditReport from './components/EditReport';
import ReportList from './components/ReportList';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<ReportList />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/create" element={<CreateReport />} />
          <Route path="/edit/:id" element={<EditReport />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
