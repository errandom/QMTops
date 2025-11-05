import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import { useSites, useFields } from '@/hooks/use-data';
import { Site } from '@/lib/types';
import { toast } from 'sonner';

export function SitesTable() {
  const [sites, setSites] = useSites();
  const [fields] = useFields();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleOpenDialog = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setFormData({
        name: site.name,
        address: site.address,
        city: site.city,
        state: site.state,
        zipCode: site.zipCode
      });
    } else {
      setEditingSite(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSite) {
      setSites((current) =>
        (current || []).map(s =>
          s.id === editingSite.id
            ? { ...s, ...formData }
            : s
        )
      );
      toast.success('Site updated successfully');
    } else {
      const newSite: Site = {
        id: `site-${Date.now()}`,
        ...formData
      };
      setSites((current) => [...(current || []), newSite]);
      toast.success('Site created successfully');
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const hasFields = fields?.some(f => f.siteId === id);
    if (hasFields) {
      toast.error('Cannot delete site with associated fields');
      return;
    }
    
    if (confirm('Are you sure you want to delete this site?')) {
      setSites((current) => (current || []).filter(s => s.id !== id));
      toast.success('Site deleted successfully');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sites</CardTitle>
              <CardDescription>Manage facility locations</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={18} />
              Add Site
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Zip Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites && sites.length > 0 ? (
                sites.map(site => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell>{site.address}</TableCell>
                    <TableCell>{site.city}</TableCell>
                    <TableCell>{site.state}</TableCell>
                    <TableCell>{site.zipCode}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(site)}
                          className="gap-1"
                        >
                          <PencilSimple size={16} />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(site.id)}
                          className="gap-1"
                        >
                          <Trash size={16} />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No sites found. Click "Add Site" to create one.
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
            <DialogTitle>{editingSite ? 'Edit Site' : 'Add New Site'}</DialogTitle>
            <DialogDescription>
              {editingSite ? 'Update site information' : 'Create a new site'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Site Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  required
                  maxLength={2}
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                required
                maxLength={10}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSite ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
