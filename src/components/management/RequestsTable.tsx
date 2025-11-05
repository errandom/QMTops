import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash, Check, X } from '@phosphor-icons/react';
import { useRequests, useTeams, useSites, useFields } from '@/hooks/use-data';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getTeamById, getSiteById, getFieldById } from '@/lib/data-helpers';

export function RequestsTable() {
  const [requests, setRequests] = useRequests();
  const [teams] = useTeams();
  const [sites] = useSites();
  const [fields] = useFields();

  const handleApprove = (id: string) => {
    setRequests((current) =>
      (current || []).map(r =>
        r.id === id ? { ...r, status: 'approved' } : r
      )
    );
    toast.success('Request approved');
  };

  const handleReject = (id: string) => {
    setRequests((current) =>
      (current || []).map(r =>
        r.id === id ? { ...r, status: 'rejected' } : r
      )
    );
    toast.success('Request rejected');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      setRequests((current) => (current || []).filter(r => r.id !== id));
      toast.success('Request deleted successfully');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Requests</CardTitle>
            <CardDescription>Manage facility and equipment requests</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests && requests.length > 0 ? (
              requests
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(request => {
                  const team = request.teamId ? getTeamById(teams || [], request.teamId) : undefined;
                  const site = request.siteId ? getSiteById(sites || [], request.siteId) : undefined;
                  const field = request.fieldId ? getFieldById(fields || [], request.fieldId) : undefined;
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Badge variant={request.type === 'facility' ? 'default' : 'secondary'}>
                          {request.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{request.requestedBy}</TableCell>
                      <TableCell>{team?.name || '-'}</TableCell>
                      <TableCell>
                        {request.type === 'facility' && site && field 
                          ? `${site.name} - ${field.name}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{format(new Date(request.requestedDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            request.status === 'approved' 
                              ? 'default'
                              : request.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                className="gap-1 text-green-600 hover:text-green-700"
                              >
                                <Check size={16} />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                className="gap-1 text-red-600 hover:text-red-700"
                              >
                                <X size={16} />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            className="gap-1"
                          >
                            <Trash size={16} />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
