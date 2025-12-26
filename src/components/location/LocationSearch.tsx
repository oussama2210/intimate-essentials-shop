import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { locationService } from '@/services/locationService';
import { Wilaya, Baladiya, LocationSearchResult } from '@/types/location';

interface LocationSearchProps {
  onLocationSelect: (location: {
    type: 'wilaya' | 'baladiya';
    wilaya?: Wilaya;
    baladiya?: Baladiya;
  }) => void;
  placeholder?: string;
  className?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search wilayas and baladiya...",
  className,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Custom debounce implementation
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setResults(null);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const response = await locationService.searchLocations(searchQuery, 'all', 10);
        if (response.success && response.data) {
          setResults(response.data);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debouncedSearch]);

  const handleWilayaSelect = (wilaya: Wilaya) => {
    onLocationSelect({ type: 'wilaya', wilaya });
    setQuery(wilaya.name);
    setShowResults(false);
  };

  const handleBaladiyaSelect = (baladiya: Baladiya) => {
    onLocationSelect({ type: 'baladiya', baladiya });
    setQuery(`${baladiya.name}, ${baladiya.wilaya?.name}`);
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={clearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && results && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto">
          <CardContent className="p-0">
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && results.totalResults === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No locations found for "{results.query}"
              </div>
            )}

            {!loading && results.totalResults > 0 && (
              <div className="py-2">
                {/* Wilayas */}
                {results.wilayas.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Wilayas ({results.wilayas.length})
                    </div>
                    {results.wilayas.map((wilaya) => (
                      <button
                        key={`wilaya-${wilaya.id}`}
                        className="w-full px-4 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                        onClick={() => handleWilayaSelect(wilaya)}
                      >
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{wilaya.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {wilaya.code}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {wilaya.deliveryBaseCost} DA
                          </Badge>
                        </div>
                        {wilaya._count && (
                          <div className="text-xs text-muted-foreground mt-1 ml-6">
                            {wilaya._count.baladiya} baladiya available
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Separator */}
                {results.wilayas.length > 0 && results.baladiya.length > 0 && (
                  <Separator className="my-2" />
                )}

                {/* Baladiya */}
                {results.baladiya.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Baladiya ({results.baladiya.length})
                    </div>
                    {results.baladiya.map((baladiya) => (
                      <button
                        key={`baladiya-${baladiya.id}`}
                        className="w-full px-4 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                        onClick={() => handleBaladiyaSelect(baladiya)}
                      >
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{baladiya.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {baladiya.postalCode}
                          </Badge>
                        </div>
                        {baladiya.wilaya && (
                          <div className="text-xs text-muted-foreground mt-1 ml-6">
                            {baladiya.wilaya.name} ({baladiya.wilaya.code})
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close results */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};