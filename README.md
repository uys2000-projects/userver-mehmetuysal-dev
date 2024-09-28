
Run this code to with service.json.

```bash
cd /home/silienter/server/
yarn cache clean
git clone https://github.com/uys2000-projects/userver-mehmetuysal-dev 
cp service.json userver-mehmetuysal-dev/src/firebase/
cd userver-mehmetuysal-dev 
yarn
yarn build
cd ..
cp -r userver-mehmetuysal-dev/dist userver-mehmetuysal-dev-dist 
rm -rf userver-mehmetuysal-dev
yarn cache clean
node userver-mehmetuysal-dev-dist/main.cjs
```