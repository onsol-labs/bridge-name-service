const copydir = require("copy-dir");
copydir.sync("../../ethereum/build/contracts", "./contracts");
copydir.sync("../../ethereum/abi", "./abi");