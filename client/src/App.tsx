import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DragDropContext } from 'react-beautiful-dnd';
import Layout from './components/Layout';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const onDragEnd = () => {
    // This is required even if empty
  };

  return (
    <AuthProvider>
      <Router>
        <DragDropContext onDragEnd={onDragEnd}>
          <Layout>
            <AppRoutes />
          </Layout>
        </DragDropContext>
      </Router>
    </AuthProvider>
  );
}

export default App; 