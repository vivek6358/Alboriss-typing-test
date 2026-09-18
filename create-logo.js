// Script to generate a clean, valid PNG for src/assets/alboriss-logo.png
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height) {
  // Simple uncompressed or deflate PNG
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  
  // Fill with professional deep navy blue (#0f172a) and an accent border/icon shape
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter type: None
    
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      
      // Check if pixel is within decorative logo mark (e.g. stylish diamond / letter A)
      const cx = 35;
      const cy = height / 2;
      const dist = Math.abs(x - cx) + Math.abs(y - cy);
      
      if (dist < 18 && dist > 14) {
        // Cyan accent diamond
        rawData[pixelOffset] = 14;     // R
        rawData[pixelOffset + 1] = 165; // G
        rawData[pixelOffset + 2] = 233; // B
        rawData[pixelOffset + 3] = 255; // Alpha
      } else if (dist <= 14) {
        // Deep blue inner
        rawData[pixelOffset] = 2;
        rawData[pixelOffset + 1] = 132;
        rawData[pixelOffset + 2] = 199;
        rawData[pixelOffset + 3] = 255;
      } else {
        // Transparent or dark background
        rawData[pixelOffset] = 15;
        rawData[pixelOffset + 1] = 23;
        rawData[pixelOffset + 2] = 42;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Helper for CRC32
  function crc32(buf) {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      table[n] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    const crcVal = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const dir = path.join(process.cwd(), 'src', 'assets');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const pngBuffer = createPNG(240, 60);
fs.writeFileSync(path.join(dir, 'alboriss-logo.png'), pngBuffer);
console.log('Created src/assets/alboriss-logo.png successfully');
