<div align="center">

  <h1 style="font-size: 48px; margin-bottom: 0px">.bridge</p>

  <p>
    <strong>by onsol labs</strong>
  </p>
  <p>
    Bridging .eth domains to Solana
  </p>
  <p>
    using ANS Protocol and Wormhole
  </p>

  <p>
    <a href="https://github.com/onsol-labs/bridge-name-service"><img alt="Tutorials" src="https://img.shields.io/badge/docs-tutorials-blueviolet" /></a>
    <a href="https://discord.gg/Rcrqhs7Bja"><img alt="Discord Chat" src="https://img.shields.io/badge/chat-discord-blueviolet" /></a>
  </p>
</div>

### Note

- The bridge is in active development.
- This code is unaudited. Use at your own risk.

# Table of contents:

- [Table of contents:](#table-of-contents)
  - [Problem](#problem)
  - [How this works](#how-this-works)
  - [Road Map](#road-map)
  - [Socials and Demo Links](#socials-and-demo-links)
  - [License](#license)


## Problem
The web 3 domain market on Solana is underdeveloped when compared to Ethereum
* Lower user adoption ( currently at less than 10% of .eth)
* No interoperability with .eth
* Low transaction volumes ( 1% of .eth) 

## How this works
1. Wormhole
- We deployed a new contract on Ethereum to wrap the domains and add the ERC 721 Metadata extension
- Using the cross chain interoperability provided by Wormhole we bridge the wrapped domain to Solana as an 1/1 NFT
- Wormhole keeps the metadata on the new emitted NFT
- The NFT is bridged to Solana and is passed to the ANS Protocol

2. ANS Protocol
- We deployed a new Solana program called Bridge Name Service
- The program uses ANS Protocol to emit a new .eth Solana domain
- In exchange for the bridged NFT the ANS Protocol mints a new one that represents ownership of the .eth domain on Solana
- The new domain uses all integrations provided by ANS Protocol

## Road Map
1.  Introduce .eth domain holders to Solana ecosystem 
2.  Complete the .bridge journey 
  - More Solana ecosystem integrations
  - Expand the bridge to other name services and get them on Solana
  - Bridge Solana ANS Protocol domains to Ethereum & other major blockchains
1.  Become the trusted provider for all domains that will be bridged via Wormhole to Solana 
2.  Raise public knowledge about domains to everyone on Solana

## Socials and Demo Links
- [Twitter](https://twitter.com/ANSProtocol)
- [Discord](http://discord.gg/Rcrqhs7Bja)
- [Demo](https://bridge.onsol.io)

## License

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion by you shall be licensed at the discretion of the repository maintainers without any additional terms or conditions.