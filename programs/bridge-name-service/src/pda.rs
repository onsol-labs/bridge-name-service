// use crate::{constants::*, id, state::*};
// use anchor_lang::prelude::Pubkey;
// use primitive_types::U256;

// pub fn find_name_house(tld_house: &Pubkey) -> (Pubkey, u8) {
//     let tld_house_bytes = tld_house.to_bytes();
//     let name_house_seeds = &[NAME_HOUSE_PREFIX.as_bytes(), tld_house_bytes.as_ref()];
//     Pubkey::find_program_address(name_house_seeds, &id())
// }

// pub fn find_bns_mint(token_id: &Pubkey, name_house_account: &Pubkey) -> (Pubkey, u8) {
//     let name_house_account_bytes = name_house_account.to_bytes();
//     let name_account_bytes = name_account.to_bytes();
//     let nft_record_seeds = &[
//         NftRecord::PREFIX,
//         name_house_account_bytes.as_ref(),
//         name_account_bytes.as_ref(),
//     ];
//     Pubkey::find_program_address(nft_record_seeds, &id())
// }

// pub fn find_mint_address(name_account: &Pubkey, name_house_account: &Pubkey) -> (Pubkey, u8) {
//     let name_house_account_bytes = name_house_account.to_bytes();
//     let name_account_bytes = name_account.to_bytes();
//     let mint_address_seeds = &[
//         NAME_HOUSE_PREFIX.as_bytes(),
//         name_house_account_bytes.as_ref(),
//         name_account_bytes.as_ref(),
//     ];
//     Pubkey::find_program_address(mint_address_seeds, &id())
// }

// pub fn find_collection_mint_address(tld_house: &Pubkey) -> (Pubkey, u8) {
//     let tld_house_bytes = tld_house.to_bytes();
//     let collection_mint_address_seeds = &[COLLECTION_PREFIX.as_bytes(), tld_house_bytes.as_ref()];
//     Pubkey::find_program_address(collection_mint_address_seeds, &id())
// }

// pub fn find_renewable_mint_address(
//     name_account: &Pubkey,
//     name_house_account: &Pubkey,
//     expires_at: u64,
// ) -> (Pubkey, u8) {
//     let name_house_account_bytes = name_house_account.to_bytes();
//     let name_account_bytes = name_account.to_bytes();
//     let mint_address_seeds = &[
//         NAME_HOUSE_PREFIX.as_bytes(),
//         name_house_account_bytes.as_ref(),
//         name_account_bytes.as_ref(),
//         &expires_at.to_le_bytes(),
//     ];
//     Pubkey::find_program_address(mint_address_seeds, &id())
// }

// pub fn find_sub_collection_config(
//     name_house_account: &Pubkey,
//     sub_collection_type: &SubCollectionType,
// ) -> (Pubkey, u8) {
//     let name_house_account_bytes = name_house_account.to_bytes();
//     let sub_collection_type_bytes =
//         get_sub_collection_type_value(sub_collection_type).to_le_bytes();
//     let sub_collection_config = &[
//         NAME_HOUSE_PREFIX.as_bytes(),
//         name_house_account_bytes.as_ref(),
//         &sub_collection_type_bytes,
//     ];
//     Pubkey::find_program_address(sub_collection_config, &id())
// }
