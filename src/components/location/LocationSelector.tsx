import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { WilayaSelect } from './WilayaSelect';
import { BaladiyaSelect } from './BaladiyaSelect';
import { locationService } from '@/services/locationService';
import { Wilaya, Baladiya, DeliveryCostCalculation } from '@/types/location';
import { toast } from 'sonner';

interface LocationSelectorProps {
  wilayaId?: number;
  baladiyaId?: number;
  onLocationChange: (location: {
    wilayaId?: number;
    baladiyaId?: number;
    wilaya?: Wilaya;
    baladiya?: Baladiya;
  }) => void;
  showDeliveryCalculator?: boolean;
  orderTotal?: number;
  className?: string;
  title?: string;
  description?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  wilayaId,
  baladiyaId,
  onLocationChange,
  showDeliveryCalculator = false,
  orderTotal = 0,
  className,
  title = "Delivery Location",
  description = "Select your wilaya and baladiya for delivery",
}) => {
  const [selectedWilayaId, setSelectedWilayaId] = useState<number | undefined>(wilayaId);
  const [selectedBaladiyaId, setSelectedBaladiyaId] = useState<number | undefined>(baladiyaId);
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | undefined>();
  const [selectedBaladiya, setSelectedBaladiya] = useState<Baladiya | undefined>();
  const [deliveryCost, setDeliveryCost] = useState<DeliveryCostCalculation | null>(null);
  const [calculatingCost, setCalculatingCost] = useState(false);

  // Update internal state when props change
  useEffect(() => {
    setSelectedWilayaId(wilayaId);
    setSelectedBaladiyaId(baladiyaId);
  }, [wilayaId, baladiyaId]);

  const handleWilayaChange = (newWilayaId: number | undefined, wilaya?: Wilaya) => {
    setSelectedWilayaId(newWilayaId);
    setSelectedWilaya(wilaya);
    setSelectedBaladiyaId(undefined); // Reset baladiya when wilaya changes
    setSelectedBaladiya(undefined);
    setDeliveryCost(null); // Reset delivery cost

    onLocationChange({
      wilayaId: newWilayaId,
      baladiyaId: undefined,
      wilaya,
      baladiya: undefined,
    });
  };

  const handleBaladiyaChange = (newBaladiyaId: number | undefined, baladiya?: Baladiya) => {
    setSelectedBaladiyaId(newBaladiyaId);
    setSelectedBaladiya(baladiya);

    onLocationChange({
      wilayaId: selectedWilayaId,
      baladiyaId: newBaladiyaId,
      wilaya: selectedWilaya,
      baladiya,
    });
  };

  const calculateDeliveryCost = async () => {
    if (!selectedWilayaId || !orderTotal) return;

    setCalculatingCost(true);
    try {
      const response = await locationService.calculateDeliveryCost({
        wilayaId: selectedWilayaId,
        totalAmount: orderTotal,
      });

      if (response.success && response.data) {
        setDeliveryCost(response.data);
      } else {
        toast.error('Failed to calculate delivery cost');
      }
    } catch (error) {
      console.error('Error calculating delivery cost:', error);
      toast.error('Failed to calculate delivery cost');
    } finally {
      setCalculatingCost(false);
    }
  };

  // Auto-calculate delivery cost when wilaya and order total are available
  useEffect(() => {
    if (showDeliveryCalculator && selectedWilayaId && orderTotal > 0) {
      calculateDeliveryCost();
    }
  }, [selectedWilayaId, orderTotal, showDeliveryCalculator]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wilaya">Wilaya</Label>
            <WilayaSelect
              value={selectedWilayaId}
              onValueChange={handleWilayaChange}
              showDeliveryCost={showDeliveryCalculator}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baladiya">Baladiya</Label>
            <BaladiyaSelect
              wilayaId={selectedWilayaId}
              value={selectedBaladiyaId}
              onValueChange={handleBaladiyaChange}
            />
          </div>
        </div>

        {/* Location Summary */}
        {(selectedWilaya || selectedBaladiya) && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Selected Location:</span>
            </div>
            <div className="mt-2 space-y-1">
              {selectedWilaya && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedWilaya.code}</Badge>
                  <span className="text-sm">{selectedWilaya.name}</span>
                </div>
              )}
              {selectedBaladiya && (
                <div className="flex items-center space-x-2 ml-6">
                  <Badge variant="outline" className="text-xs">
                    {selectedBaladiya.postalCode}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedBaladiya.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Cost Calculator */}
        {showDeliveryCalculator && selectedWilayaId && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4" />
                  <span className="font-medium">Delivery Information</span>
                </div>
                {orderTotal > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={calculateDeliveryCost}
                    disabled={calculatingCost}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {calculatingCost ? 'Calculating...' : 'Recalculate'}
                  </Button>
                )}
              </div>

              {deliveryCost && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delivery Cost:</span>
                    <div className="flex items-center space-x-2">
                      {deliveryCost.freeDelivery ? (
                        <Badge variant="default" className="bg-green-500">
                          FREE
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {deliveryCost.deliveryCost} DA
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estimated Delivery:</span>
                    <Badge variant="secondary">
                      {deliveryCost.estimatedDays} {deliveryCost.estimatedDays === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>

                  {deliveryCost.isRemoteArea && (
                    <div className="text-xs text-muted-foreground">
                      * Remote area - Free delivery not available
                    </div>
                  )}

                  {!deliveryCost.freeDelivery && orderTotal > 0 && orderTotal < deliveryCost.freeDeliveryThreshold && (
                    <div className="text-xs text-muted-foreground">
                      Add {deliveryCost.freeDeliveryThreshold - orderTotal} DA more for free delivery
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};