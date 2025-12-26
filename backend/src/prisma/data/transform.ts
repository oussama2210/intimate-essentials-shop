// Transform raw Algeria commune data to the format expected by our database

interface RawCommuneData {
  id: number;
  commune_name: string;
  daira_name: string;
  wilaya_code: string;
  wilaya_name: string;
}

interface TransformedBaladiyaData {
  name: string;
  wilayaId: number;
  postalCode: string;
}

/**
 * Transform raw commune data to baladiya format
 */
export function transformBaladiyaData(rawData: RawCommuneData[][]): TransformedBaladiyaData[] {
  const transformed: TransformedBaladiyaData[] = [];
  
  // Flatten the nested array structure
  const flatData = rawData.flat();
  
  for (const commune of flatData) {
    // Convert wilaya_code to wilayaId (remove leading zeros and convert to number)
    const wilayaId = parseInt(commune.wilaya_code, 10);
    
    // Generate postal code based on wilaya code and commune id
    const postalCode = `${commune.wilaya_code}${commune.id.toString().padStart(3, '0')}`;
    
    transformed.push({
      name: commune.commune_name,
      wilayaId: wilayaId,
      postalCode: postalCode,
    });
  }
  
  return transformed;
}

/**
 * Get unique wilayas from commune data
 */
export function extractWilayasFromCommunes(rawData: RawCommuneData[][]): Array<{
  id: number;
  name: string;
  code: string;
}> {
  const flatData = rawData.flat();
  const wilayaMap = new Map<number, { id: number; name: string; code: string }>();
  
  for (const commune of flatData) {
    const wilayaId = parseInt(commune.wilaya_code, 10);
    
    if (!wilayaMap.has(wilayaId)) {
      wilayaMap.set(wilayaId, {
        id: wilayaId,
        name: commune.wilaya_name.trim(),
        code: commune.wilaya_code,
      });
    }
  }
  
  return Array.from(wilayaMap.values()).sort((a, b) => a.id - b.id);
}

/**
 * Get statistics about the commune data
 */
export function getDataStatistics(rawData: RawCommuneData[][]): {
  totalCommunes: number;
  communesByWilaya: { [wilayaCode: string]: number };
  uniqueWilayas: number;
} {
  const flatData = rawData.flat();
  const communesByWilaya: { [wilayaCode: string]: number } = {};
  
  for (const commune of flatData) {
    communesByWilaya[commune.wilaya_code] = (communesByWilaya[commune.wilaya_code] || 0) + 1;
  }
  
  return {
    totalCommunes: flatData.length,
    communesByWilaya,
    uniqueWilayas: Object.keys(communesByWilaya).length,
  };
}