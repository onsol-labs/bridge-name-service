use solana_program::{pubkey, pubkey::Pubkey};

pub const BNS_PREFIX: &str = "bridge_name_service";

// pub const ORIGIN_TLD_KEY: Pubkey = pubkey!("3mX9b4AZaQehNoQGfckVcmgmA6bkBoFcbLj9RMmMyNcU");
pub const ORIGIN_TLD_KEY: Pubkey = pubkey!("EzeAEs3QtU8BdbXL2AnMcP9Wbpd9YwbocqPj8hEujK6v");

pub const TLD_HOUSE_PREFIX: &str = "tld_house";

pub const TLD_HOUSE_PDA_SEED: &str = "tld_pda";

pub const NAME_HOUSE_PREFIX: &str = "name_house";
pub const NAME_HOUSE_NFT_RECORD_PREFIX: &str = "nft_record";

pub const COLLECTION_PREFIX: &str = "name_collection";

pub const TLD_HOUSE_TREASURY: &str = "treasury";
pub const MAIN_DOMAIN_PREFIX: &str = "main_domain";
pub const CLAIMABLE_DOMAIN_PREFIX: &str = "claimable";
pub const DOMAIN_PER_MINT: &str = "domain_per_mint";

pub const DEFAULT_FIXED_FEE: u64 = 100_000_000;

pub const MAX_TLD_LENGTH: usize = 10;
pub const MAX_CREATOR_LEN: usize = 32 + 4;
pub const MAX_CREATOR_LIMIT: usize = 5;
pub const TLD_HOUSE_SIZE: usize = 8 +                       // key
32 +                                                        // treasury manager
32 +                                                        // authority
32 +                                                        // tld_registry key
4 + MAX_TLD_LENGTH +                                        // u32 len + tld
1 +                                                         // is paused
1 +                                                         // bump
// settings
8 +                                                         // purchase fixed_fee
1 +                                                         // purchase basis  
1 + 32 +                                                    // optional verified creator 
1 + 32 +                                                    // optional collection mint 
1 +                                                         // is_renewable
1 + 4 + (MAX_CREATOR_LEN * MAX_CREATOR_LIMIT) +             // creators vector
210                                                         // padding
;

pub const TLD_STATE_SIZE: usize = 8 +                       // key
32 +                                                        // authority
32 +                                                        // tld_origin
32 +                                                        // funds_pubkey
32 +                                                        // token_mint
8 * 2 +                                                     // solana price u64 and token price u64
1 +                                                         // init is paused
1 +                                                         // buying is paused
126                                                         // padding
;

// REAL SOL ROOT DOMAIN ACCOUNT
pub const SOL_ROOT_DOMAIN_ACCOUNT: Pubkey = pubkey!("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx");
// TEST VALUE
//pub const SOL_ROOT_DOMAIN_ACCOUNT: Pubkey = pubkey!("92qi1tb3ThnffrCV7QVMXtP5GveHjzekgw7ymwUCfKX4");
