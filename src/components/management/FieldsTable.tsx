import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { useFields, useSites, useSchedule } from '@/hooks/use-data';
import { Field, SportType } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { getSiteById } from '@/lib/data-helpers';

export function FieldsTable() {
  const [fields, setFields] = useFields();
  const [sites] = useSites();
  const [schedule] = useSchedule();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    siteId: '',
    sportType: 'tackle' as SportType,
    capacity: ''
  });

  const handleOpenDialog = (field?: Field) => {
    if (field) {
      setEditingField(field);
      setFormData({
        name: field.name,
        siteId: field.siteId,
        sportType: field.sportType,
        capacity: field.capacity?.toString() || ''
      });
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        siteId: '',
        sportType: 'tackle',
        capacity: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingField) {
      setFields((current) =>
        (current || []).map(f =>
          f.id === editingField.id
            ? { ...f, ...formData, capacity: formData.capacity ? parseInt(formData.capacity) : undefined }
            : f
        )
      );
      toast.success('Field updated successfully');
    } else {
      const newField: Field = {
        id: `field-${Date.now()}`,
        name: formData.name,
        siteId: formData.siteId,
        sportType: formData.sportType,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined
      };
      setFields((current) => [...(current || []), newField]);
      toast.success('Field created successfully');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const hasSchedule = schedule?.some(s => s.fieldId === id);
    if (hasSchedule) {
      toast.error('Cannot delete field with scheduled events');
      return;
    }
    
    if (confirm('Are you sure you want to delete this field?')) {
      setFields((current) => (current || []).filter(f => f.id !== id));
      toast.success('Field deleted successfully');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fields</CardTitle>
              <CardDescription>Manage playing fields</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={18} />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Sport Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields && fields.length > 0 ? (
                fields.map(field => {
                  const site = getSiteById(sites || [], field.siteId);
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.name}</TableCell>
                      <TableCell>{site?.name || 'Unknown Site'}</TableCell>
                      <TableCell>
                        <Badge variant={field.sportType === 'tackle' ? 'default' : 'secondary'}>
                          {field.sportType}
                        </Badge>
                      </TableCell>
                      <TableCell>{field.capacity || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(field)}
                            className="gap-1"
                          >
                            <PencilSimple size={16} />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(field.id)}
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No fields found. Click "Add Field" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Field' : 'Add New Field'}</DialogTitle>
            <DialogDescription>
              {editingField ? 'Update field information' : 'Create a new field'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Field Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteId">Site *</Label>
              <Select value={formData.siteId} onValueChange={(value) => setFormData(prev => ({ ...prev, siteId: value }))} required>
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
              <Label htmlFor="sportType">Sport Type *</Label>
              <Select value={formData.sportType} onValueChange={(value: SportType) => setFormData(prev => ({ ...prev, sportType: value }))}>
                <SelectTrigger id="sportType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tackle">Tackle</SelectItem>
                  <SelectItem value="flag">Flag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingField ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
