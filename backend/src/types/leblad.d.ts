declare module '@dzcode-io/leblad' {
    export interface Baladiya {
        code: number;
        name: string;
        name_ar: string;
        name_en: string;
    }

    export interface Daira {
        code: number;
        name: string;
        name_ar: string;
        name_en: string;
        baladyiats: Baladiya[];
    }

    export interface Wilaya {
        mattricule: number;
        name: string;
        name_ar: string;
        name_en: string;
        phoneCodes: number[];
        postalCodes: number[];
        dairats: Daira[];
        adjacentWilayas: number[];
    }

    export function getWilayaList(): Wilaya[];
    export function getBaladyiatsForWilaya(wilayaCode: string): Baladiya[] | undefined;
    // Add other functions if needed
}
