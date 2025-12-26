import LeBlad from '@dzcode-io/leblad';

console.log('Keys:', Object.keys(LeBlad));
// Try some potential functions if they exist on the default export or named exports
// Based on common patterns or user hint
try {
    // @ts-ignore
    console.log('Wilayas List:', LeBlad.wilayas ? LeBlad.wilayas.slice(0, 2) : 'No .wilayas');
} catch (e) { console.log(e) }

// User used require and getDairatsForWilaya, maybe it's a named export?
// Let's print all exports
import * as AllExports from '@dzcode-io/leblad';
console.log('All Exports:', Object.keys(AllExports));
