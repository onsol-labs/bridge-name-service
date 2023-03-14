const path = require('path');
const programDir = path.join(__dirname, '..', '../programs/bridge-name-service');
const idlDir = path.join(__dirname, 'idl');
const sdkDir = path.join(__dirname, 'src', 'generated');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
  idlGenerator: 'anchor',
  programName: 'bridge_name_service',
  programId: 'BNSwwSqW7HkAviEjNYhkMKws9jRerzMwb6yvKyYHPeqT',
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
};