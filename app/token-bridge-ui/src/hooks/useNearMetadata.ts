import { Account } from "near-api-js";
import { useEffect, useMemo, useState } from "react";
import { useNearContext } from "../contexts/NearWalletContext";
import { DataWrapper } from "../store/helpers";
import { makeNearAccount } from "../utils/near";
import { BaseMetadata } from "./useBaseMetadata";

export const fetchSingleMetadata = async (
  address: string,
  account: Account
): Promise<BaseMetadata> => {
  const assetInfo = await account.viewFunction(address, "ft_metadata");
  return {
    tokenName: assetInfo.name,
    symbol: assetInfo.symbol,
    decimals: assetInfo.decimals,
  };
};

const fetchNearMetadata = async (
  addresses: string[],
  nearAccountId: string
) => {
  const account = await makeNearAccount(nearAccountId);
  const promises: Promise<BaseMetadata>[] = [];
  addresses.forEach((address) => {
    promises.push(fetchSingleMetadata(address, account));
  });
  const resultsArray = await Promise.all(promises);
  const output = new Map<string, BaseMetadata>();
  addresses.forEach((address, index) => {
    output.set(address, resultsArray[index]);
  });

  return output;
};

function useNearMetadata(
  addresses: string[]
): DataWrapper<Map<string, BaseMetadata>> {
  const { accountId: nearAccountId } = useNearContext();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Map<string, BaseMetadata> | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (addresses.length && nearAccountId) {
      setIsFetching(true);
      setError("");
      setData(null);
      fetchNearMetadata(addresses, nearAccountId).then(
        (results) => {
          if (!cancelled) {
            setData(results);
            setIsFetching(false);
          }
        },
        () => {
          if (!cancelled) {
            setError("Could not retrieve contract metadata");
            setIsFetching(false);
          }
        }
      );
    }
    return () => {
      cancelled = true;
    };
  }, [addresses, nearAccountId]);

  return useMemo(
    () => ({
      data,
      isFetching,
      error,
      receivedAt: null,
    }),
    [data, isFetching, error]
  );
}

export default useNearMetadata;
