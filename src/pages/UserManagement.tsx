import React, { useState, useEffect } from 'react';
import { User, UserPlus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// ... (previous imports and interfaces)

const UserManagement: React.FC = () => {
  // ... (previous state declarations)

  const [complianceIssues, setComplianceIssues] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchUsers();
    fetchComplianceIssues();
  }, []);

  // ... (previous functions remain)

  const fetchComplianceIssues = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/compliance/issues', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setComplianceIssues(response.data);
    } catch (err) {
      console.error('Failed to fetch compliance issues:', err);
    }
  };

  // ... (rest of the component remains similar)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... (previous JSX) */}
      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full">
          <thead>
            {/* ... (previous table headers) */}
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Compliance Status
            </th>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                {/* ... (previous table cells) */}
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {complianceIssues[user.id] ? (
                    <span className="flex items-center text-red-500">
                      <AlertTriangle size={16} className="mr-1" />
                      {complianceIssues[user.id]}
                    </span>
                  ) : (
                    <span className="text-green-500">Compliant</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;