import { getWilayaList } from '@dzcode-io/leblad';

const wilayas = getWilayaList();
const adrar = wilayas[0]; // Adrar

console.log('Wilaya Structure:', JSON.stringify(adrar, null, 2).slice(0, 500)); // First 500 chars

if (adrar.dairats && adrar.dairats.length > 0) {
    const firstDaira = adrar.dairats[0];
    console.log('Daira Structure:', JSON.stringify(firstDaira, null, 2));

    if (firstDaira.baladyiats && firstDaira.baladyiats.length > 0) {
        console.log('Baladiya Structure:', JSON.stringify(firstDaira.baladyiats[0], null, 2));
    } else {
        console.log('No baladyiats in first Daira');
    }
} else {
    console.log('No dairats in Wilaya');
}
