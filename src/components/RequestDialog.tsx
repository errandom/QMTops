import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeams, useSites, useFields, useRequests } from '@/hooks/use-data';
import { toast } from 'sonner';
import { Request } from '@/lib/types';

interface RequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'facility' | 'equipment';
}

export function RequestDialog({ open, onOpenChange, type }: RequestDialogProps) {
  const [teams] = useTeams();
  const [sites] = useSites();
  const [fields] = useFields();
  const [requests, setRequests] = useRequests();

  const [formData, setFormData] = useState({
    teamId: '',
    siteId: '',
    fieldId: '',
    requestedBy: '',
    requestedDate: '',
    description: ''
  });

  const availableFields = formData.siteId 
    ? fields?.filter(f => f.siteId === formData.siteId) || []
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      type,
      teamId: formData.teamId || undefined,
      requestedBy: formData.requestedBy,
      requestedDate: formData.requestedDate,
      description: formData.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      fieldId: type === 'facility' ? formData.fieldId : undefined,
      siteId: type === 'facility' ? formData.siteId : undefined
    };

    setRequests((current) => [...(current || []), newRequest]);
    toast.success(`${type === 'facility' ? 'Facility' : 'Equipment'} request submitted successfully`);
    
    setFormData({
      teamId: '',
      siteId: '',
      fieldId: '',
      requestedBy: '',
      requestedDate: '',
      description: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request {type === 'facility' ? 'Facility' : 'Equipment'}</DialogTitle>
          <DialogDescription>
            Submit a request for {type === 'facility' ? 'facility usage' : 'equipment'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestedBy">Your Name *</Label>
            <Input
              id="requestedBy"
              type="text"
              value={formData.requestedBy}
              onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamId">Team</Label>
            <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
              <SelectTrigger id="teamId">
                <SelectValue placeholder="Select team (optional)" />
              </SelectTrigger>
              <SelectContent>
                {teams?.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'facility' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="siteId">Site *</Label>
                <Select 
                  value={formData.siteId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, siteId: value, fieldId: '' }))}
                  required
                >
                  <SelectTrigger id="siteId">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites?.map(site => (
                      <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldId">Field *</Label>
                <Select 
                  value={formData.fieldId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, fieldId: value }))}
                  required
                  disabled={!formData.siteId}
                >
                  <SelectTrigger id="fieldId">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(field => (
                      <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="requestedDate">Requested Date *</Label>
            <Input
              id="requestedDate"
              type="date"
              value={formData.requestedDate}
              onChange={(e) => setFormData(prev => ({ ...prev, requestedDate: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={type === 'facility' ? 'Describe your facility needs...' : 'Describe the equipment you need...'}
              required
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
