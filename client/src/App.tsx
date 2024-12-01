import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const onDragEnd = () => {
    // This is required even if empty
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <DragDropContext onDragEnd={onDragEnd}>
            <Layout>
              <AppRoutes />
            </Layout>
          </DragDropContext>
          <ToastContainer />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 