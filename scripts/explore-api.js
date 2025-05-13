// Script to explore the MyDataHelps API
const MyDataHelps = require('@careevolution/mydatahelps-js');

console.log('MyDataHelps API methods and properties:');
console.log(Object.keys(MyDataHelps));

// Try to log some specific properties if they exist
console.log('\nMyDataHelps module structure:');
for (const key of Object.keys(MyDataHelps)) {
  const value = MyDataHelps[key];
  console.log(`- ${key}: ${typeof value}`);
  
  if (typeof value === 'object' && value !== null) {
    console.log(`  Sub-properties of ${key}:`);
    for (const subKey of Object.keys(value)) {
      console.log(`  - ${subKey}: ${typeof value[subKey]}`);
    }
  }
}
