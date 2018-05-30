# test_partialreads

Testing partial file reads for dat-node and hyperdrive

This relates to the following issue: https://github.com/mafintosh/hyperdrive/issues/212
and the following pull request: https://github.com/mafintosh/hyperdrive/pull/218

Note that the following test assumes that a particular hard-coded archive is being hosted, which will probably not always be the case. 

Show that the new version works:
```
npm install
npm start
```

The output should end with "Passed the test".

Now, let's show that the old version fails:

```
rm -r temporary_storage # to be safe
npm remove dat-node
npm install dat-node
npm start
```

The test should now fail.

To restore to the new version do the following:

```
rm -r temporary_storage # to be safe
npm remove dat-node
git checkout package.json
npm install
npm start
```
