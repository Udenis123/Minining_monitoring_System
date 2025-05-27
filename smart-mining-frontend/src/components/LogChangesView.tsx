import React from "react";

interface LogChangesViewProps {
  oldValues: any;
  newValues: any;
}

const LogChangesView: React.FC<LogChangesViewProps> = ({
  oldValues,
  newValues,
}) => {
  // Format values for display
  const formatValues = (values: any) => {
    if (!values) return "{}";
    return JSON.stringify(values, null, 2);
  };

  // Helper to get all unique keys from both objects
  const getAllKeys = () => {
    const oldKeys = oldValues ? Object.keys(oldValues) : [];
    const newKeys = newValues ? Object.keys(newValues) : [];
    return [...new Set([...oldKeys, ...newKeys])].sort();
  };

  // Check if values are different
  const hasChanges = (key: string) => {
    const oldValue =
      oldValues && oldValues[key] !== undefined ? oldValues[key] : null;
    const newValue =
      newValues && newValues[key] !== undefined ? newValues[key] : null;

    // Handle objects by stringifying them
    if (
      typeof oldValue === "object" &&
      oldValue !== null &&
      typeof newValue === "object" &&
      newValue !== null
    ) {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    }

    return oldValue !== newValue;
  };

  // Format a single value for display
  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof value === "object") {
      return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
    }

    if (typeof value === "boolean") {
      return (
        <span className="text-purple-600">{value ? "true" : "false"}</span>
      );
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>;
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Field
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Previous Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              New Value
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {getAllKeys().map((key) => (
            <tr key={key} className={hasChanges(key) ? "bg-yellow-50" : ""}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {key}
              </td>
              <td
                className={`px-6 py-4 text-sm ${
                  hasChanges(key) ? "bg-red-50" : ""
                }`}
              >
                {oldValues && key in oldValues ? (
                  formatValue(oldValues[key])
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </td>
              <td
                className={`px-6 py-4 text-sm ${
                  hasChanges(key) ? "bg-green-50" : ""
                }`}
              >
                {newValues && key in newValues ? (
                  formatValue(newValues[key])
                ) : (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogChangesView;
