import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { COORDINATORS } from '../../types';

export function ForwardForm({ report, onSubmit, onCancel }) {
  const [selectedCoordinators, setSelectedCoordinators] = useState([]);

  const handleCoordinatorChange = (coordinator, checked) => {
    if (checked) {
      setSelectedCoordinators([...selectedCoordinators, coordinator]);
    } else {
      setSelectedCoordinators(selectedCoordinators.filter(c => c !== coordinator));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCoordinators.length === 0) {
      alert('Pilih minimal satu koordinator');
      return;
    }
    onSubmit({ coordinators: selectedCoordinators });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Teruskan Laporan
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-1">{report?.noSurat}</h3>
            <p className="text-sm text-gray-600">{report?.hal}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Koordinator:
              </label>
              <div className="space-y-2">
                {COORDINATORS.map(coordinator => (
                  <label key={coordinator} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCoordinators.includes(coordinator)}
                      onChange={(e) => handleCoordinatorChange(coordinator, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{coordinator}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Teruskan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
