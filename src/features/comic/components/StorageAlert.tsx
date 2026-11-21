interface StorageAlertProps {
  message: string;
}

export default function StorageAlert({ message }: StorageAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="status-message error-message" role="alert">
      {message}
    </p>
  );
}
