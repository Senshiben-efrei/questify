import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

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
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 