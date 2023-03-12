import {
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { NFTParsedTokenAccount } from "../../store/nftSlice";
import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
} from "@certusone/wormhole-sdk";
import SmartAddress from "../SmartAddress";
import ethIcon from "../../icons/eth.svg";
import solanaIcon from "../../icons/solana.svg";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

const safeIPFS = (uri: string) =>
  uri.startsWith("ipfs://ipfs/")
    ? uri.replace("ipfs://", "https://ipfs.io/")
    : uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
      : uri.startsWith("https://cloudflare-ipfs.com/ipfs/") // no CORS support?
        ? uri.replace("https://cloudflare-ipfs.com/ipfs/", "https://ipfs.io/ipfs/")
        : uri;

const LogoIcon = ({ chainId }: { chainId: ChainId }) =>
  chainId === CHAIN_ID_SOLANA ? (
    <Avatar
      style={{
        backgroundColor: "black",
        height: "1em",
        width: "1em",
        marginLeft: "4px",
        padding: "4px",
      }}
      src={solanaIcon}
      alt="Solana"
    />
  ) : chainId === CHAIN_ID_ETH ? (
    <Avatar
      style={{
        backgroundColor: "white",
        height: "1em",
        width: "1em",
        marginLeft: "4px",
      }}
      src={ethIcon}
      alt="Ethereum"
    />
  ) : null;

export default function NFTViewer({
  value,
  chainId,
}: {
  value: NFTParsedTokenAccount;
  chainId: ChainId;
}) {
  const uri = safeIPFS(value.uri || "");
  const [metadata, setMetadata] = useState({
    uri,
    image: value.image,
    animation_url: value.animation_url,
    nftName: value.nftName,
    description: value.description,
    isLoading: !!uri,
  });
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const onLoad = useCallback(() => {
    setIsMediaLoading(false);
  }, []);
  const isLoading = isMediaLoading || metadata.isLoading;
  useEffect(() => {
    setMetadata((m) =>
      m.uri === uri
        ? m
        : {
          uri,
          image: value.image,
          animation_url: value.animation_url,
          nftName: value.nftName,
          description: value.description,
          isLoading: !!uri,
        }
    );
  }, [value, uri]);
  useEffect(() => {
    if (uri) {
      let cancelled = false;
      (async () => {
        try {
          const result = await axios.get(uri);
          if (!cancelled && result && result.data) {
            // support returns with nested data (e.g. {status: 10000, result: {data: {...}}})
            const data = result.data.result?.data || result.data;
            setMetadata({
              uri,
              image:
                data.image ||
                data.image_url ||
                data.big_image ||
                data.small_image,
              animation_url: data.animation_url,
              nftName: data.nftName,
              description: data.description,
              isLoading: false,
            });
          } else if (!cancelled) {
            setMetadata((m) => ({ ...m, isLoading: false }));
          }
        } catch (e) {
          if (!cancelled) {
            setMetadata((m) => ({ ...m, isLoading: false }));
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [uri]);

  const animLower = metadata.animation_url?.toLowerCase();
  const hasVideo =
    !animLower?.startsWith("ipfs://") && // cloudflare ipfs doesn't support streaming video
    (animLower?.endsWith("webm") ||
      animLower?.endsWith("mp4") ||
      animLower?.endsWith("mov") ||
      animLower?.endsWith("m4v") ||
      animLower?.endsWith("ogv") ||
      animLower?.endsWith("ogg"));
  const hasAudio =
    animLower?.endsWith("mp3") ||
    animLower?.endsWith("flac") ||
    animLower?.endsWith("wav") ||
    animLower?.endsWith("oga");
  const hasImage = metadata.image;
  const copyTokenId = useCopyToClipboard(value.tokenId || "");
  const videoSrc = hasVideo && safeIPFS(metadata.animation_url || "");
  const imageSrc = hasImage && safeIPFS(metadata.image || "");
  const audioSrc = hasAudio && safeIPFS(metadata.animation_url || "");

  //set loading when the media src changes
  useLayoutEffect(() => {
    if (videoSrc || imageSrc || audioSrc) {
      setIsMediaLoading(true);
    } else {
      setIsMediaLoading(false);
    }
  }, [videoSrc, imageSrc, audioSrc]);

  const image = (
    <img
      src={imageSrc}
      alt={metadata.nftName || ""}
      style={{ maxWidth: "100%" }}
      onLoad={onLoad}
      onError={onLoad}
    />
  );
  const media = (
    <>
      {hasVideo ? (
        <video
          autoPlay
          controls
          loop
          style={{ maxWidth: "100%" }}
          onLoadedData={onLoad}
          onError={onLoad}
        >
          <source src={videoSrc || ""} />
          {image}
        </video>
      ) : hasImage ? (
        image
      ) : null}
      {hasAudio ? (
        <audio
          controls
          src={audioSrc || ""}
          onLoadedData={onLoad}
          onError={onLoad}
        />
      ) : null}
    </>
  );

  return (
    <>
      <Box sx={!isLoading ? { display: "none" } : {}}>
        {/* <ViewerLoader /> */}
      </Box>
      <Card
        sx={(theme) => ({
          ...{
            maxWidth: "100%",
            width: 400,
            margin: `${theme.spacing(1)} auto`,
            padding: "8px",
            position: "relative",
            zIndex: 1,
            transition: "background-position 1s, transform 0.25s",
            "&:hover": {
              backgroundPosition: "right center",
              transform: "scale(1.25)",
            },
            backgroundSize: "200% auto",
            backgroundColor: "#ffb347",
            background:
              "linear-gradient(to right, #ffb347 0%, #ffcc33  51%, #ffb347  100%)",
          },
          ...(chainId === CHAIN_ID_SOLANA && {
            backgroundColor: "#D9D8D6",
            backgroundSize: "200% auto",
            background:
              "linear-gradient(to bottom right, #757F9A 0%, #D7DDE8  51%, #757F9A  100%)",
            "&:hover": {
              backgroundPosition: "right center",
            }
          }),
          ...(isLoading && {
            display: "none"
          })
        })}
        elevation={10}
      >
        <Box
          sx={(theme) => ({
            ...(chainId === CHAIN_ID_ETH && {
              // colors from https://en.wikipedia.org/wiki/Ethereum#/media/File:Ethereum-icon-purple.svg
              backgroundColor: "rgb(69,74,117)",
              background:
                "linear-gradient(160deg, rgba(69,74,117,1) 0%, rgba(138,146,178,1) 33%, rgba(69,74,117,1) 66%, rgba(98,104,143,1) 100%)",
            }),
            ...(chainId === CHAIN_ID_SOLANA && {
              // colors from https://solana.com/branding/new/exchange/exchange-sq-black.svg
              backgroundColor: "rgb(153,69,255)",
              background:
                "linear-gradient(45deg, rgba(153,69,255,1) 0%, rgba(121,98,231,1) 20%, rgba(0,209,140,1) 100%)",
            })
          })}
        >
          <CardContent sx={{
            background: "transparent",
            paddingTop: 2,
            paddingBottom: 1,
            display: "flex",
          }}>
            {metadata.nftName ? (
              <Typography sx={{ flex: 1 }}>
                {metadata.nftName}
              </Typography>
            ) : (
              <Box sx={{ flex: 1 }} />
            )}
            <SmartAddress
              chainId={chainId}
              parsedTokenAccount={value}
              noGutter
              noUnderline
            />
            <LogoIcon chainId={chainId} />
          </CardContent>
          <CardMedia
            sx={(theme) => ({
              ...{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                margin: theme.spacing(0, 2),
                "& > img, & > video": {
                  border: "1px solid #ffb347",
                }
              },
              ...(chainId === CHAIN_ID_SOLANA && {
                "& > img, & > video": {
                  borderColor: "#D7DDE8",
                },
              })
            })}
          >
            {media}
          </CardMedia>
          <CardContent sx={{
            background: "transparent",
            paddingTop: 2,
            paddingBottom: 1,
            "&:last-child": {
              //override rule
              paddingBottom: 2,
            },
          }}>
            {metadata.description ? (
              <Typography variant="body2" sx={{
                pt: 0.5,
                px: 0,
                pb: 1
              }}>
                {metadata.description}
              </Typography>
            ) : null}
            {value.tokenId ? (
              <Typography sx={{ fontSize: "8px" }} align="right">
                <Tooltip title="Copy" arrow>
                  <span onClick={copyTokenId}>
                    {value.tokenId.length > 18
                      ? `#${value.tokenId.substr(0, 16)}...`
                      : `#${value.tokenId}`}
                  </span>
                </Tooltip>
              </Typography>
            ) : null}
          </CardContent>
        </Box>
      </Card>
    </>
  );
}
