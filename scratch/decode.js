const part = 'GgsKB2RvY1R5cGUQARoPCgtmZWNoYUV2ZW50bxACGgwKCF9fbmFtZV9fEAI';
const buf = Buffer.from(part, 'base64');
console.log('Hex:', buf.toString('hex'));
console.log('ASCII:', buf.toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
console.log('UTF-8:', buf.toString('utf8'));
