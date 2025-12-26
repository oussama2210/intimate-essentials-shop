import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { locationService } from '@/services/locationService';
import { Baladiya } from '@/types/location';
import { toast } from 'sonner';

interface BaladiyaSelectProps {
  wilayaId?: number;
  value?: number;
  onValueChange: (baladiyaId: number | undefined, baladiya?: Baladiya) => void;
  placeholder?: string;
  disabled?: boolean;
  showPostalCode?: boolean;
  className?: string;
}

export const BaladiyaSelect: React.FC<BaladiyaSelectProps> = ({
  wilayaId,
  value,
  onValueChange,
  placeholder = "Select baladiya...",
  disabled = false,
  showPostalCode = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [baladiya, setBaladiya] = useState<Baladiya[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedBaladiya = baladiya.find((b) => b.id === value);

  useEffect(() => {
    if (!wilayaId) {
      setBaladiya([]);
      onValueChange(undefined);
      return;
    }

    const fetchBaladiya = async () => {
      try {
        setLoading(true);
        const response = await locationService.getBaladiyaByWilaya(wilayaId);
        
        if (response.success && response.data) {
          setBaladiya(response.data.baladiya);
        } else {
          toast.error('Failed to load baladiya');
          setBaladiya([]);
        }
      } catch (error) {
        console.error('Error fetching baladiya:', error);
        toast.error('Failed to load baladiya');
        setBaladiya([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBaladiya();
  }, [wilayaId, onValueChange]);

  // Clear selection if selected baladiya is not in current list
  useEffect(() => {
    if (value && !baladiya.find((b) => b.id === value)) {
      onValueChange(undefined);
    }
  }, [baladiya, value, onValueChange]);

  const filteredBaladiya = baladiya.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.postalCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (baladiyaId: number) => {
    const selectedBaladiya = baladiya.find((b) => b.id === baladiyaId);
    onValueChange(baladiyaId, selectedBaladiya);
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange(undefined);
    setOpen(false);
  };

  if (!wilayaId) {
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full justify-between text-muted-foreground",
          className
        )}
        disabled={true}
      >
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span>Select wilaya first</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (loading) {
    return <Skeleton className={cn("h-10 w-full", className)} />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedBaladiya && "text-muted-foreground",
            className
          )}
          disabled={disabled || baladiya.length === 0}
        >
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {selectedBaladiya ? (
                <div className="flex items-center space-x-2">
                  <span>{selectedBaladiya.name}</span>
                  {showPostalCode && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedBaladiya.postalCode}
                    </Badge>
                  )}
                </div>
              ) : baladiya.length === 0 ? (
                "No baladiya available"
              ) : (
                placeholder
              )}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search baladiya..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No baladiya found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {selectedBaladiya && (
              <CommandItem
                onSelect={handleClear}
                className="text-muted-foreground"
              >
                Clear selection
              </CommandItem>
            )}
            {filteredBaladiya.map((baladiya) => (
              <CommandItem
                key={baladiya.id}
                value={`${baladiya.name} ${baladiya.postalCode}`}
                onSelect={() => handleSelect(baladiya.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedBaladiya?.id === baladiya.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{baladiya.name}</span>
                    {showPostalCode && (
                      <Badge variant="secondary" className="text-xs">
                        {baladiya.postalCode}
                      </Badge>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};