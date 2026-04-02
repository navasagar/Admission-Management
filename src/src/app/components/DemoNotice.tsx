import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Info } from 'lucide-react';

export function DemoNotice() {
  return (
    <Alert className="mb-6">
      <Info className="h-4 w-4" />
      <AlertTitle>Demo Mode</AlertTitle>
      <AlertDescription>
        This is a demonstration system with sample data. All data is stored in memory
        and will reset on page refresh. For production use, integrate with a backend
        database.
      </AlertDescription>
    </Alert>
  );
}
