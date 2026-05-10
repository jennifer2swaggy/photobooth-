# Photo Upload Setup Guide

## How It Works
1. Browser captures photos → stored as base64 images
2. Browser sends images to your Node.js backend server
3. Backend server receives images via HTTP POST
4. Backend connects to Ubuntu server (10.6.0.66) via SSH/SFTP
5. Backend uploads files to the Ubuntu server

## Setup Steps

### 1. Install Node.js
Download from https://nodejs.org (LTS version recommended)

### 2. Install Dependencies
Open PowerShell in the `c:\Jennifer` folder and run:
```powershell
npm install
```

### 3. Setup SSH Keys on Your Ubuntu Server
SSH is already running on your server. You need to generate SSH keys:

**On your Windows machine** (PowerShell):
```powershell
# Generate a new SSH key
ssh-keygen -t rsa -b 4096

# When prompted:
# - Save in: C:\Users\YourUsername\.ssh\id_rsa
# - Passphrase: (press Enter for no passphrase, or create one)
```

**Copy the key to Ubuntu server** (PowerShell):
```powershell
# Replace 'your_username' and 'your_password' with your actual Ubuntu credentials
$key = Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
ssh your_username@10.6.0.66 "mkdir -p ~/.ssh && echo '$key' >> ~/.ssh/authorized_keys"
```

### 4. Configure the .env File
Copy `.env.example` to `.env` and fill in your details:
```
REMOTE_HOST=10.6.0.66
REMOTE_PORT=22
REMOTE_USER=your_ubuntu_username
REMOTE_DIR=/home/your_ubuntu_username/photos
SSH_KEY_PATH=C:\Users\YourUsername\.ssh\id_rsa
SSH_PASSPHRASE=
PORT=3000
```

### 5. Create Upload Directory on Ubuntu Server
SSH into your Ubuntu server and create the upload directory:
```bash
mkdir -p ~/photos
chmod 755 ~/photos
```

### 6. Start the Backend Server
In PowerShell (in the `c:\Jennifer` folder):
```powershell
npm start
```

You should see: `Server running on http://localhost:3000`

### 7. Update Your HTML Files
Add this to the end of your `<script>` section in `captureYellowFrame.html`:

```html
<script src="../uploadHelper.js"></script>
<script>
  // After capturing a photo, upload it:
  function capturePhoto() {
    // ... existing capture code ...
    
    // Add this after the photo is captured:
    uploadImageToServer(canvas);
  }
</script>
```

## Testing
1. Open http://localhost:3000 in your browser
2. Capture a photo
3. Check the PowerShell console for upload messages
4. Verify the file appears on your Ubuntu server:
   ```bash
   ls ~/photos
   ```

## Troubleshooting

**"Cannot find module 'ssh2'"**
→ Run `npm install` again

**"Connection refused"**
→ Check that your Ubuntu server IP (10.6.0.66) is correct and SSH is running

**"SSH key permission denied"**
→ Make sure you copied the public key to the Ubuntu server correctly

**"No such file or directory"**
→ Create the upload directory on Ubuntu: `mkdir -p ~/photos`

## Security Note
- Never commit `.env` file to version control
- Keep your SSH private key secure
- Use a strong passphrase for your SSH key
