// contracts/BNS.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@ensdomains/ens-contracts/contracts/registry/ENS.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract BNS is ERC721URIStorage, ERC721Holder {
    // ENS public ens = ENS(0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85);
    mapping(bytes32 => bool) public wrappedTokens;

    constructor() ERC721("Bridge Name Service", "BNS") {}

    function wrapNFT(address token, string memory name) public payable {
        bytes32 ensTokenId = keccak256(
            abi.encodePacked(keccak256(bytes(name)))
        );
        require(
            token == 0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85,
            "This contract is specifically built for ENS NFTs"
        );

        require(!wrappedTokens[ensTokenId], "ENS domain is already wrapped");

        wrappedTokens[ensTokenId] = true;

        uint256 bnsTokenId = uint256(ensTokenId);
        _mint(msg.sender, bnsTokenId);

        IERC721(token).safeTransferFrom(msg.sender, address(this), bnsTokenId);
    }

    function unwrapNFT(address token, uint256 bnsTokenId) public {
        bytes32 tokenAddress = bytes32(uint256(uint160(bnsTokenId)));
        require(
            ownerOf(bnsTokenId) == msg.sender,
            "You must be the owner of the BNS token to unwrap it"
        );
        // require(
        //     ens.owner(bnsTokenId) == address(this),
        //     "The ENS token is not currently held in the contract"
        // );
        wrappedTokens[tokenAddress] = false;

        IERC721(token).safeTransferFrom(address(this), msg.sender, bnsTokenId);

        _burn(bnsTokenId);
    }

    // function onERC721Received(
    //     address operator,
    //     address,
    //     uint256,
    //     bytes calldata
    // ) external view returns (bytes4) {
    //     require(
    //         operator == address(this),
    //         "can only transfer tokens via wrapNFT method"
    //     );
    //     return type(IERC721Receiver).interfaceId;
    // }

    function tokenURI(uint256 bnsTokenId)
        public
        view
        override
        returns (string memory)
    {
        bytes32 tokenAddress = bytes32(uint256(uint160(bnsTokenId)));
        require(wrappedTokens[tokenAddress], "ENS domain is not wrapped");
        return
            string(
                abi.encodePacked(
                    "https://metadata.ens.domains/goerli/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/",
                    bnsTokenId
                )
            );
    }
}
