import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Part } from './types';
import { getParts, saveParts, loadPartsFromStorage } from './api';
import { PartForm } from './components/PartForm';
import PartList from './components/PartList';

function App() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load initial parts data on component mount
  useEffect(() => {
    const loadParts = async () => {
      try {
        setLoading(true);

        // Try to load from localStorage first
        const savedParts = loadPartsFromStorage();
        if (savedParts.length > 0) {
          setParts(savedParts);
        } else {
          // Fall back to initial data if no saved parts
          const initialParts = await getParts();
          setParts(initialParts);
        }
      } catch (error) {
        toast.error('Failed to load parts data');
        console.error('Error loading parts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParts();
  }, []);

  // Generate unique ID for new parts
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Add new part to the list
  const handleAddPart = (newPart: Omit<Part, 'id'>) => {
    const partWithId: Part = {
      ...newPart,
      id: generateId()
    };

    setParts(prevParts => [...prevParts, partWithId]);
    toast.success(`Added "${newPart.name}" to inventory`);
  };

  // Delete multiple parts from list
  const handleDeleteParts = (partIds: string[]) => {
    setParts(prevParts => prevParts.filter(part => !partIds.includes(part.id)));
    toast.success(`Deleted "${partIds.length}" parts from inventory`);
  };

  // Save parts data to localStorage
  const handleSaveParts = async () => {
    try {
      setSaving(true);
      await saveParts(parts);
      //await saveParts('string');
      toast.success('Save successful!');
    } catch (error) {
      toast.error('Failed to save parts data');
      console.error('Error saving parts:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Loading parts inventory...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Parts Inventory Management</h1>
        <p>Manage your parts inventory with ease</p>
      </header>

      <div className="main-content flex justify-between items-start">
        <div className="flex-1">
          <PartForm onAddPart={handleAddPart} />
        </div>
        <div className="flex-1">
          <PartList parts={parts} onDeleteParts={handleDeleteParts} />
        </div>
      </div>

      <div className="save-section">
        <button
          onClick={handleSaveParts}
          disabled={saving}
          className="btn btn-success"
          style={{ fontSize: '18px', padding: '15px 30px' }}
        >
          {saving ? 'Saving...' : 'Save Inventory'}
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
