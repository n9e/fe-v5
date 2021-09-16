FOLDER=src/Packages/
SUBFOLDER=$(ls $FOLDER)
cd $FOLDER
for i in $SUBFOLDER; do
    cd ${i}
    echo "install npm in ${i}"
    npm i
    cd ..
done