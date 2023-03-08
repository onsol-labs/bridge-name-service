use crate::uint::U256;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use solana_program::{
    keccak, program::invoke, program::invoke_signed, program_pack::Pack, pubkey, system_instruction,
};
use spl_token::instruction::initialize_account2;
use tld_house::assert_keys_equal;

pub fn check_wormhole_mint_account(domain: &str, bns_mint_key: &Pubkey) -> Result<()> {
    let hashed_bns_name = keccak::hashv(&[(domain).as_bytes()]).as_ref().to_vec();
    let hex_encoded: String = hashed_bns_name
        .iter()
        .map(|b| format!("{:02x}", b).to_string())
        .collect::<Vec<String>>()
        .join("");
    let u256_result = hex_encoded.parse::<U256>().unwrap();
    let chain_id = 2_u16;

    // BNS in ETH
    // let token_address =
    //     hex::decode("000000000000000000000000Eefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD").unwrap();
    let token_address = vec![
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 238, 250, 83, 161, 77, 61, 143, 93, 162, 83, 240, 224,
        203, 207, 107, 102, 224, 127, 3, 253,
    ];
    let mut token_id = vec![0u8; 32];
    u256_result.to_big_endian(&mut token_id);

    let seeds = vec![
        String::from("wrapped").as_bytes().to_vec(),
        chain_id.to_be_bytes().to_vec(),
        token_address,
        token_id,
    ];
    let s: Vec<&[u8]> = seeds.iter().map(|item| item.as_slice()).collect();
    let seed_slice = s.as_slice();
    let nft_bridge = pubkey!("2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4");
    let (bns_mint_computed, _) = Pubkey::find_program_address(&seed_slice, &nft_bridge);

    assert_keys_equal(bns_mint_computed, *bns_mint_key)?;

    Ok(())
}

/// Create account almost from scratch, lifted from
/// <https://github.com/solana-labs/solana-program-library/blob/7d4873c61721aca25464d42cc5ef651a7923ca79/associated-token-account/program/src/processor.rs#L51-L98>
#[inline(always)]
pub fn create_or_allocate_account_raw<'a>(
    program_id: Pubkey,
    new_account_info: &AccountInfo<'a>,
    rent_sysvar_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    payer_info: &AccountInfo<'a>,
    size: usize,
    signer_seeds: &[&[u8]],
    new_acct_seeds: &[&[u8]],
) -> Result<()> {
    let rent = &Rent::from_account_info(rent_sysvar_info)?;
    let required_lamports = rent
        .minimum_balance(size)
        .max(1)
        .saturating_sub(new_account_info.lamports());

    if required_lamports > 0 {
        msg!("Transfer {} lamports to the new account", required_lamports);

        let as_arr = [signer_seeds];
        let seeds: &[&[&[u8]]] = if !signer_seeds.is_empty() {
            &as_arr
        } else {
            &[]
        };

        invoke_signed(
            &system_instruction::transfer(payer_info.key, new_account_info.key, required_lamports),
            &[
                payer_info.clone(),
                new_account_info.clone(),
                system_program_info.clone(),
            ],
            seeds,
        )?;
    }

    let accounts = &[new_account_info.clone(), system_program_info.clone()];

    msg!("Allocate space for the account {}", new_account_info.key);
    invoke_signed(
        &system_instruction::allocate(new_account_info.key, size.try_into().unwrap()),
        accounts,
        &[new_acct_seeds],
    )?;

    msg!("Assign the account to the owning program");
    invoke_signed(
        &system_instruction::assign(new_account_info.key, &program_id),
        accounts,
        &[new_acct_seeds],
    )?;
    msg!("Completed assignation!");

    Ok(())
}

pub fn create_program_token_account_if_not_present<'a>(
    vault_account_ata: &UncheckedAccount<'a>,
    system_program: &Program<'a, System>,
    fee_payer: &AccountInfo<'a>,
    token_program: &Program<'a, Token>,
    bns_mint: &Box<anchor_lang::prelude::Account<'a, Mint>>,
    owner: &AccountInfo<'a>,
    rent: &Sysvar<'a, Rent>,
    signer_seeds: &[&[u8]],
    fee_seeds: &[&[u8]],
) -> Result<()> {
    if vault_account_ata.data_is_empty() {
        create_or_allocate_account_raw(
            *token_program.key,
            &vault_account_ata.to_account_info(),
            &rent.to_account_info(),
            system_program,
            fee_payer,
            spl_token::state::Account::LEN,
            fee_seeds,
            signer_seeds,
        )?;
        invoke(
            &initialize_account2(
                token_program.key,
                &vault_account_ata.key(),
                &bns_mint.key(),
                &owner.key(),
            )
            .unwrap(),
            &[
                token_program.to_account_info(),
                bns_mint.to_account_info(),
                vault_account_ata.to_account_info(),
                rent.to_account_info(),
                owner.clone(),
            ],
        )?;
        msg!("Passes");
    }
    Ok(())
}
