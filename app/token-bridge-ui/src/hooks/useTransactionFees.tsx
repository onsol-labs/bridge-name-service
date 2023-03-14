import {
  ChainId,
  CHAIN_ID_SOLANA,
  isEVMChain,
} from "@certusone/wormhole-sdk";
import { Provider } from "@ethersproject/abstract-provider";
import { formatUnits } from "@ethersproject/units";
import { Typography } from "@mui/material";
import { LocalGasStation } from "@mui/icons-material";
import { Connection, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import {
  getDefaultNativeCurrencySymbol,
  SOLANA_HOST,
} from "../utils/consts";
import { getMultipleAccountsRPC } from "../utils/solana";
import useIsWalletReady from "./useIsWalletReady";
import { setGasPrice } from "../store/transferSlice";
import { useDispatch } from "react-redux";

export type GasEstimate = {
  currentGasPrice: string;
  lowEstimate: string;
  highEstimate: string;
};

export type MethodType = "nft" | "createWrapped" | "transfer";

//It's difficult to project how many fees the user will accrue during the
//workflow, as a variable number of transactions can be sent, and different
//execution paths can be hit in the smart contracts, altering gas used.
//As such, for the moment it is best to just check for a reasonable 'low balance' threshold.
//Still it would be good to calculate a reasonable value at runtime based off current gas prices,
//rather than a hardcoded value.
const SOLANA_THRESHOLD_LAMPORTS: bigint = BigInt(300000);
const ETHEREUM_THRESHOLD_WEI: bigint = BigInt(35000000000000000);

const isSufficientBalance = (
  chainId: ChainId,
  balance: bigint | undefined,
) => {
  if (balance === undefined || !chainId) {
    return true;
  }
  if (CHAIN_ID_SOLANA === chainId) {
    return balance > SOLANA_THRESHOLD_LAMPORTS;
  }
  if (isEVMChain(chainId)) {
    return balance > ETHEREUM_THRESHOLD_WEI;
  }

  return true;
};

//TODO move to more generic location
const getBalanceSolana = async (walletAddress: string) => {
  const connection = new Connection(SOLANA_HOST);
  return getMultipleAccountsRPC(connection, [
    new PublicKey(walletAddress),
  ]).then(
    (results) => {
      if (results.length && results[0]) {
        return BigInt(results[0].lamports);
      }
    },
    (error) => {
      return BigInt(0);
    }
  );
};

const getBalanceEvm = async (walletAddress: string, provider: Provider) => {
  return provider.getBalance(walletAddress).then((result) => result.toBigInt());
};

const toBalanceString = (balance: bigint | undefined, chainId: ChainId) => {
  if (!chainId || balance === undefined) {
    return "";
  }
  if (isEVMChain(chainId)) {
    return formatUnits(balance, 18); //wei decimals
  } else if (chainId === CHAIN_ID_SOLANA) {
    return formatUnits(balance, 9); //lamports to sol decimals
  }
};

export default function useTransactionFees(chainId: ChainId) {
  const { walletAddress, isReady } = useIsWalletReady(chainId);
  const { provider } = useEthereumProvider();
  const [balance, setBalance] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStart = useCallback(() => {
    setBalance(undefined);
    setIsLoading(true);
    setError("");
  }, []);

  useEffect(() => {
    if (chainId === CHAIN_ID_SOLANA && isReady && walletAddress) {
      loadStart();
      getBalanceSolana(walletAddress).then(
        (result) => {
          const adjustedresult =
            result === undefined || result === null ? BigInt(0) : result;
          setIsLoading(false);
          setBalance(adjustedresult);
        },
        (error) => {
          setIsLoading(false);
          setError("Cannot load wallet balance");
        }
      );
    } else if (isEVMChain(chainId) && isReady && walletAddress) {
      if (provider) {
        loadStart();
        getBalanceEvm(walletAddress, provider).then(
          (result) => {
            const adjustedresult =
              result === undefined || result === null ? BigInt(0) : result;
            setIsLoading(false);
            setBalance(adjustedresult);
          },
          (error) => {
            setIsLoading(false);
            setError("Cannot load wallet balance");
          }
        );
      }
    }
  }, [provider, walletAddress, isReady, chainId, loadStart]);

  const results = useMemo(() => {
    return {
      isSufficientBalance: isSufficientBalance(chainId, balance),
      balance,
      balanceString: toBalanceString(balance, chainId),
      isLoading,
      error,
    };
  }, [balance, chainId, isLoading, error]);

  return results;
}

export function useEthereumGasPrice(contract: MethodType, chainId: ChainId) {
  const { provider } = useEthereumProvider();
  const { isReady } = useIsWalletReady(chainId);
  const [estimateResults, setEstimateResults] = useState<GasEstimate | null>(
    null
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (provider && isReady && !estimateResults) {
      getGasEstimates(provider, contract).then(
        (results) => {
          setEstimateResults(results);
          if (results?.currentGasPrice) {
            const gasPrice =
              (results?.currentGasPrice &&
                parseFloat(results.currentGasPrice)) ||
              undefined;
            dispatch(setGasPrice(gasPrice)); //This is so the relayer hook can pull this from the state rather than remount this hook.
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }, [provider, isReady, estimateResults, contract, dispatch]);

  const results = useMemo(() => estimateResults, [estimateResults]);
  return results;
}

function EthGasEstimateSummary({
  methodType,
  chainId,
  priceQuote,
}: {
  methodType: MethodType;
  chainId: ChainId;
  priceQuote?: number;
}) {
  const estimate = useEthereumGasPrice(methodType, chainId);
  if (!estimate) {
    return null;
  }
  const lowUsd = priceQuote
    ? (priceQuote * parseFloat(estimate.lowEstimate)).toFixed(2)
    : null;
  const highUsd = priceQuote
    ? (priceQuote * parseFloat(estimate.highEstimate)).toFixed(2)
    : null;

  return (
    <Typography
      component="div"
      style={{
        display: "flex",
        alignItems: "center",
        marginTop: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginRight: 32 }}>
        <LocalGasStation fontSize="inherit" />
        &nbsp;{estimate.currentGasPrice}
      </div>
      <div>
        Est. Fees: {estimate.lowEstimate} - {estimate.highEstimate}{" "}
        {getDefaultNativeCurrencySymbol(chainId)}
        {priceQuote ? <div>{`($${lowUsd} - $${highUsd})`}</div> : null}
      </div>
    </Typography>
  );
}

export const evmEstimatesByContract = {
  transfer: {
    lowGasEstimate: BigInt(250000),
    highGasEstimate: BigInt(280000),
  },
  nft: {
    lowGasEstimate: BigInt(350000),
    highGasEstimate: BigInt(500000),
  },
  createWrapped: {
    lowGasEstimate: BigInt(450000),
    highGasEstimate: BigInt(700000),
  },
};

export async function getGasEstimates(
  provider: Provider,
  contract: MethodType
): Promise<GasEstimate | null> {
  const lowEstimateGasAmount = evmEstimatesByContract[contract].lowGasEstimate;
  const highEstimateGasAmount =
    evmEstimatesByContract[contract].highGasEstimate;

  let lowEstimate;
  let highEstimate;
  let currentGasPrice;
  if (provider) {
    const priceInWei = await provider.getGasPrice();
    if (priceInWei) {
      lowEstimate = parseFloat(
        formatUnits(lowEstimateGasAmount * priceInWei.toBigInt(), "ether")
      ).toFixed(4);
      highEstimate = parseFloat(
        formatUnits(highEstimateGasAmount * priceInWei.toBigInt(), "ether")
      ).toFixed(4);
      const gasPriceNum = parseFloat(formatUnits(priceInWei, "gwei"));
      currentGasPrice = gasPriceNum.toFixed(0);
    }
  }

  const output =
    currentGasPrice && highEstimate && lowEstimate
      ? {
        currentGasPrice,
        lowEstimate,
        highEstimate,
      }
      : null;

  return output;
}

export function GasEstimateSummary({
  methodType,
  chainId,
  priceQuote, //this is a hack, should refactor to unify the fee selector and this file
}: {
  methodType: MethodType;
  chainId: ChainId;
  priceQuote?: number;
}) {
  if (isEVMChain(chainId)) {
    return (
      <EthGasEstimateSummary
        chainId={chainId}
        methodType={methodType}
        priceQuote={priceQuote}
      />
    );
  } else {
    return null;
  }
}
