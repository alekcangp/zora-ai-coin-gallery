import formidable from 'formidable';
import fs from 'fs';

// Function to convert CIDv0 to CIDv1 (if needed)
function convertCidV0ToV1(cidV0) {
  // This is a simplified conversion - in production you might want to use a proper CID library
  // For now, we'll return the original CID and log that conversion might be needed
  console.log('CIDv0 detected, conversion to CIDv1 might be needed:', cidV0);
  return cidV0;
}

// Disable the default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Check if we have the required environment variables
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_API_SECRET;
    
    if (!pinataApiKey || !pinataSecretApiKey) {
      console.error('Pinata API keys not configured');
      res.status(500).json({
        success: false,
        error: 'IPFS service not configured'
      });
      return;
    }

    // Parse the form data
    const form = formidable({});
    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    
    if (!file) {
      res.status(400).json({
        success: false,
        error: 'No file provided'
      });
      return;
    }

    // Read the file
    const fileBuffer = fs.readFileSync(file.filepath);
    const fileName = file.originalFilename || 'file';

    // Create FormData for Pinata API with proper CIDv1 options
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer]), fileName);

    // Add pinataOptions for CIDv1
    const pinataOptions = {
      cidVersion: 1
    };
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    // Add metadata
    const metadata = {
      name: fileName,
      keyvalues: {
        uploadedAt: new Date().toISOString(),
        source: 'zora-ai-coin-gallery'
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Upload to Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      },
      body: formData
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error('Pinata API error:', pinataResponse.status, errorText);
      throw new Error(`Pinata API error: ${pinataResponse.status}`);
    }

    const pinataResult = await pinataResponse.json();
    
    // Check if we got CIDv1 format, if not, try to convert or use alternative approach
    let ipfsHash = pinataResult.IpfsHash;
    
    // If we got CIDv0 (starts with Qm), try to get CIDv1 from the response
    if (ipfsHash && ipfsHash.startsWith('Qm')) {
      console.log('Received CIDv0, attempting to get CIDv1...');
      
      // Try to get CIDv1 from the response if available
      if (pinataResult.IpfsHashV1) {
        ipfsHash = pinataResult.IpfsHashV1;
        console.log('Found CIDv1 in response:', ipfsHash);
      } else if (pinataResult.cid) {
        ipfsHash = pinataResult.cid;
        console.log('Found CID in response:', ipfsHash);
      } else {
        // Try to convert CIDv0 to CIDv1
        ipfsHash = convertCidV0ToV1(ipfsHash);
        console.log('Converted CID:', ipfsHash);
      }
    } else if (ipfsHash && ipfsHash.startsWith('bafy')) {
      console.log('Received CIDv1 directly:', ipfsHash);
    }
    
    // Return the IPFS URL
    const ipfsUrl = `ipfs://${ipfsHash}`;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    
    res.status(200).json({
      success: true,
      ipfsUrl: ipfsUrl,
      gatewayUrl: gatewayUrl,
      hash: ipfsHash,
      size: pinataResult.PinSize,
      cidVersion: ipfsHash.startsWith('bafy') ? 'v1' : 'v0'
    });
    
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload to IPFS'
    });
  }
}