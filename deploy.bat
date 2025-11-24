@echo off
echo Deploying to Netlify...
netlify deploy --prod --dir=dist --functions=netlify/functions
echo Deploy complete!
pause
