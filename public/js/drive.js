// js/drive.js

async function uploadFile(fileBuffer, fileName) {
    try {
      const auth = new google.accounts.OAuth2(
        'YOUR_CLIENT_ID',
        'YOUR_CLIENT_SECRET',
        'YOUR_REDIRECT_URI'
      );
      
      const drive = google.drive({ version: 'v3', auth });
  
      const fileMetadata = {
        name: fileName,
        parents: ['YOUR_DRIVE_FOLDER_ID'] 
      };
  
      const media = {
        mimeType: 'image/jpeg',
        body: fileBuffer
      };
  
      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      });
  
      return `https://drive.google.com/uc?id=${file.data.id}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }