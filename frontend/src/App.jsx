import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Navbar from './components/Navbar';
import ComplaintForm from './components/ComplaintForm';
import RiskAssessmentCard from './components/RiskAssessmentCard';
import DuplicateDetectionCard from './components/DuplicateDetectionCard';
import CopilotAssistant from './components/CopilotAssistant';
import ComplaintsList from './components/ComplaintsList';
import AnalyticsDashboard from './components/AnalyticsDashboard';

function AppContent() {
  const [activeView, setActiveView] = useState('ingest');

  return (
    <div className="app-container">
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        {activeView === 'ingest' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: Customer Complaint Form & Risk Assessment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ComplaintForm />
              <RiskAssessmentCard />
              <DuplicateDetectionCard />
            </div>

            {/* RIGHT COLUMN: AIVOA Co-Pilot AI Assistant (Mandatory 3 Tools) */}
            <div style={{ position: 'sticky', top: '1rem' }}>
              <CopilotAssistant />
            </div>

          </div>
        )}

        {activeView === 'list' && (
          <ComplaintsList />
        )}

        {activeView === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
