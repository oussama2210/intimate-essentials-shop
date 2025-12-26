import { useState, useEffect } from 'react';
import { locationService } from '@/services/locationService';
import { Wilaya, Baladiya, DeliveryCostCalculation } from '@/types/location';
import { toast } from 'sonner';

interface UseLocationOptions {
  autoCalculateDelivery?: boolean;
  orderTotal?: number;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const { autoCalculateDelivery = false, orderTotal = 0 } = options;

  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [selectedBaladiya, setSelectedBaladiya] = useState<Baladiya | null>(null);
  const [baladiyaList, setBaladiyaList] = useState<Baladiya[]>([]);
  const [deliveryCost, setDeliveryCost] = useState<DeliveryCostCalculation | null>(null);
  const [loading, setLoading] = useState({
    wilayas: false,
    baladiya: false,
    deliveryCost: false,
  });

  // Load wilayas on mount
  useEffect(() => {
    const loadWilayas = async () => {
      setLoading(prev => ({ ...prev, wilayas: true }));
      try {
        const response = await locationService.getWilayas();
        if (response.success && response.data) {
          setWilayas(response.data);
        } else {
          toast.error('Failed to load wilayas');
        }
      } catch (error) {
        console.error('Error loading wilayas:', error);
        toast.error('Failed to load wilayas');
      } finally {
        setLoading(prev => ({ ...prev, wilayas: false }));
      }
    };

    loadWilayas();
  }, []);

  // Load baladiya when wilaya changes
  useEffect(() => {
    if (!selectedWilaya) {
      setBaladiyaList([]);
      setSelectedBaladiya(null);
      return;
    }

    const loadBaladiya = async () => {
      setLoading(prev => ({ ...prev, baladiya: true }));
      try {
        const response = await locationService.getBaladiyaByWilaya(selectedWilaya.id);
        if (response.success && response.data) {
          setBaladiyaList(response.data.baladiya);
        } else {
          toast.error('Failed to load baladiya');
          setBaladiyaList([]);
        }
      } catch (error) {
        console.error('Error loading baladiya:', error);
        toast.error('Failed to load baladiya');
        setBaladiyaList([]);
      } finally {
        setLoading(prev => ({ ...prev, baladiya: false }));
      }
    };

    loadBaladiya();
  }, [selectedWilaya]);

  // Auto-calculate delivery cost
  useEffect(() => {
    if (!autoCalculateDelivery || !selectedWilaya || !orderTotal) {
      setDeliveryCost(null);
      return;
    }

    const calculateCost = async () => {
      setLoading(prev => ({ ...prev, deliveryCost: true }));
      try {
        const response = await locationService.calculateDeliveryCost({
          wilayaId: selectedWilaya.id,
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
        setLoading(prev => ({ ...prev, deliveryCost: false }));
      }
    };

    calculateCost();
  }, [selectedWilaya, orderTotal, autoCalculateDelivery]);

  const selectWilaya = (wilaya: Wilaya | null) => {
    setSelectedWilaya(wilaya);
    setSelectedBaladiya(null); // Reset baladiya when wilaya changes
  };

  const selectBaladiya = (baladiya: Baladiya | null) => {
    setSelectedBaladiya(baladiya);
  };

  const calculateDeliveryCostManually = async (customOrderTotal?: number) => {
    if (!selectedWilaya) return null;

    const total = customOrderTotal ?? orderTotal;
    if (!total) return null;

    setLoading(prev => ({ ...prev, deliveryCost: true }));
    try {
      const response = await locationService.calculateDeliveryCost({
        wilayaId: selectedWilaya.id,
        totalAmount: total,
      });
      if (response.success && response.data) {
        setDeliveryCost(response.data);
        return response.data;
      } else {
        toast.error('Failed to calculate delivery cost');
        return null;
      }
    } catch (error) {
      console.error('Error calculating delivery cost:', error);
      toast.error('Failed to calculate delivery cost');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, deliveryCost: false }));
    }
  };

  const reset = () => {
    setSelectedWilaya(null);
    setSelectedBaladiya(null);
    setBaladiyaList([]);
    setDeliveryCost(null);
  };

  const isLocationComplete = selectedWilaya && selectedBaladiya;

  return {
    // Data
    wilayas,
    selectedWilaya,
    selectedBaladiya,
    baladiyaList,
    deliveryCost,
    
    // Loading states
    loading,
    
    // Actions
    selectWilaya,
    selectBaladiya,
    calculateDeliveryCostManually,
    reset,
    
    // Computed
    isLocationComplete,
  };
};