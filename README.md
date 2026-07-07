How to push Hostinger

1. Npm Run Build
2. rsync -avz --delete -e "ssh -i ~/.ssh/id_ed25519" dist/ root@31.97.228.184:/var/www/focasedu-react/
3. Enter VPS Password