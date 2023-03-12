import { ChainId, isEVMChain } from "@certusone/wormhole-sdk";

export default function SourceAssetWarning({
  sourceChain,
  sourceAsset,
}: {
  sourceChain?: ChainId;
  sourceAsset?: string;
  originChain?: ChainId;
  targetChain?: ChainId;
  targetAsset?: string;
}) {
  if (!(sourceChain && sourceAsset)) {
    return null;
  }

  const searchableAddress = isEVMChain(sourceChain)
    ? sourceAsset.toLowerCase()
    : sourceAsset;

  return (
    <>
      {null}
    </>
  );
}
