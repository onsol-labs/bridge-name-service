use anchor_lang::prelude::*;

#[error_code]
pub enum BridgeNameServiceError {
    // 0x1770 - 6000
    #[msg("PublicKeyMismatch")]
    PublicKeyMismatch,
    // 0x1771 - 6001
    #[msg("Invalid hash name seed length")]
    InvalidSeed,
    // 0x1772 - 6002
    #[msg("Wrong name account")]
    WrongNameAccount,
    // 0x1773 - 6003
    #[msg("Wrong account owner")]
    WrongAccountOwner,
    // 0x1774 - 6004
    #[msg("NotRentExempt")]
    NotRentExempt,
    // 0x1775 - 6005
    #[msg("Metadata does not exist")]
    MetadataDoesntExist,
    // 0x1776 - 6006
    #[msg("Uninitialized Account")]
    UninitializedAccount,
    // 0x1777 - 6007
    #[msg("Invalid Derived Key")]
    DerivedKeyInvalid,
    // 0x1778 - 6008
    #[msg("Invalid Account Data")]
    InvalidAccountData,
    // 0x1779 - 6009
    #[msg("NFT Mint Mismatch")]
    MintMismatch,
    // 0x1780 - 6010
    #[msg("Invalid NFT Amount")]
    InvalidNFTAmount,
    // 0x1781 - 6011
    #[msg("Collection Already Created")]
    CollectionAlreadyCreated,
    // 0x1782 - 6012
    #[msg("Data type mismatch")]
    DataTypeMismatch,
    // 0x1783 - 6013
    #[msg("NFT record inactive")]
    NFTRecordInactive,
    // 0x1784 - 6014
    #[msg("Fee payer is not an authority")]
    InvalidFeePayer,
}
