import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
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
import { Wilaya } from '@/types/location';
import { toast } from 'sonner';

interface WilayaSelectProps {
  value?: number;
  onValueChange: (wilayaId: number | undefined, wilaya?: Wilaya) => void;
  placeholder?: string;
  disabled?: boolean;
  showDeliveryCost?: boolean;
  className?: string;
}

export const WilayaSelect: React.FC<WilayaSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select wilaya...",
  disabled = false,
  showDeliveryCost = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedWilaya = wilayas.find((wilaya) => wilaya.id === value);

  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        setLoading(true);
        const response = await locationService.getWilayas();
        
        if (response.success && response.data) {
          setWilayas(response.data);
        } else {
          toast.error('Failed to load wilayas');
        }
      } catch (error) {
        console.error('Error fetching wilayas:', error);
        toast.error('Failed to load wilayas');
      } finally {
        setLoading(false);
      }
    };

    fetchWilayas();
  }, []);

  const filteredWilayas = wilayas.filter((wilaya) =>
    wilaya.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wilaya.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (wilayaId: number) => {
    const wilaya = wilayas.find((w) => w.id === wilayaId);
    onValueChange(wilayaId, wilaya);
    setOpen(false);
  };

  const handleClear = () => {
    onValueChange(undefined);
    setOpen(false);
  };

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
            !selectedWilaya && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {selectedWilaya ? (
                <div className="flex items-center space-x-2">
                  <span>{selectedWilaya.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedWilaya.code}
                  </Badge>
                  {showDeliveryCost && (
                    <Badge variant="outline" className="text-xs">
                      {selectedWilaya.deliveryBaseCost} DA
                    </Badge>
                  )}
                </div>
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
            placeholder="Search wilaya..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No wilaya found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {selectedWilaya && (
              <CommandItem
                onSelect={handleClear}
                className="text-muted-foreground"
              >
                Clear selection
              </CommandItem>
            )}
            {filteredWilayas.map((wilaya) => (
              <CommandItem
                key={wilaya.id}
                value={`${wilaya.name} ${wilaya.code}`}
                onSelect={() => handleSelect(wilaya.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedWilaya?.id === wilaya.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{wilaya.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {wilaya.code}
                    </Badge>
                  </div>
                  {showDeliveryCost && (
                    <Badge variant="outline" className="text-xs">
                      {wilaya.deliveryBaseCost} DA
                    </Badge>
                  )}
                </div>
                {wilaya._count && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {wilaya._count.baladiya} baladiya
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};