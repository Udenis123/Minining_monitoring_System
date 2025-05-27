import React from "react";
import { X } from "lucide-react";
import LogChangesView from "./LogChangesView";

interface LogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldValues: any;
  newValues: any;
  action: string;
  entityType: string;
  description: string;
}

const LogDetailsModal: React.FC<LogDetailsModalProps> = ({
  isOpen,
  onClose,
  oldValues,
  newValues,
  action,
  entityType,
  description,
}) => {
  if (!isOpen) return null;

  // Helper function to format JSON object for display
  const formatValues = (values: any) => {
    if (!values) return "{}";
    return JSON.stringify(values, null, 2);
  };

  // Determine what to display based on action type
  const shouldShowDiff =
    action.toLowerCase() === "update" && oldValues && newValues;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Activity Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {action.charAt(0).toUpperCase() + action.slice(1)} {entityType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-2">Description</h3>
          <p className="bg-gray-50 p-3 rounded-md text-gray-800">
            {description || `${action} operation on ${entityType}`}
          </p>
        </div>

        {shouldShowDiff ? (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Changes</h3>
            <div className="border rounded-md overflow-hidden">
              <LogChangesView oldValues={oldValues} newValues={newValues} />
            </div>
          </div>
        ) : (
          <>
            {oldValues && Object.keys(oldValues).length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  {action.toLowerCase() === "delete"
                    ? "Deleted Data"
                    : "Previous Values"}
                </h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                  {formatValues(oldValues)}
                </pre>
              </div>
            )}

            {newValues && Object.keys(newValues).length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  {action.toLowerCase() === "create"
                    ? "Created Data"
                    : "New Values"}
                </h3>
                <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                  {formatValues(newValues)}
                </pre>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDetailsModal;
